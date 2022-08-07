/**
 * Generated by `createservice meter.ExportMeterReadingsService --type queries`
 */
const { uniq, get } = require('lodash')
const dayjs = require('dayjs')

const { GQLCustomSchema } = require('@condo/keystone/schema')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@condo/keystone/errors')
const conf = require('@condo/config')

const { createExportFile } = require('@condo/domains/common/utils/createExportFile')
const { normalizeTimeZone } = require('@condo/domains/common/utils/timezone')
const { NOTHING_TO_EXPORT } = require('@condo/domains/common/constants/errors')
const { getHeadersTranslations, EXPORT_TYPE_METERS } = require('@condo/domains/common/utils/exportToExcel')
const { i18n } = require('@condo/domains/common/utils/localesLoader')
const { extractReqLocale } = require('@condo/domains/common/utils/locale')

const access = require('@condo/domains/meter/access/ExportMeterReadingsService')

const { DEFAULT_ORGANIZATION_TIMEZONE } = require('@condo/domains/organization/constants/common')

const {
    loadMeterReadingsForExcelExport,
    loadMetersForExcelExport,
    MeterResource,
    MeterReadingSource,
} = require('../utils/serverSchema')

const DATE_FORMAT = 'DD.MM.YYYY HH:mm'

const errors = {
    NOTHING_TO_EXPORT: {
        query: 'exportMeterReadings',
        code: BAD_USER_INPUT,
        type: NOTHING_TO_EXPORT,
        message: 'Could not found meter readings to export for specified organization',
        messageForUser: 'api.meter.exportMeterReadings.NOTHING_TO_EXPORT',
    },
}

const ExportMeterReadingsService = new GQLCustomSchema('ExportMeterReadingsService', {
    types: [
        {
            access: true,
            type: 'input ExportMeterReadingsInput { dv: Int!, sender: SenderFieldInput!, where: MeterReadingWhereInput!, sortBy: [SortMeterReadingsBy!], timeZone: String! }',
        },
        {
            access: true,
            type: 'type ExportMeterReadingsOutput { status: String!, linkToFile: String! }',
        },
    ],

    queries: [
        {
            access: access.canExportMeterReadings,
            schema: 'exportMeterReadings (data: ExportMeterReadingsInput!): ExportMeterReadingsOutput',
            resolver: async (parent, args, context) => {
                const { where, sortBy, timeZone: timeZoneFromUser } = args.data
                const timeZone = normalizeTimeZone(timeZoneFromUser) || DEFAULT_ORGANIZATION_TIMEZONE
                const formatDate = (date) => dayjs(date).tz(timeZone).format(DATE_FORMAT)
                const locale = extractReqLocale(context.req) || conf.DEFAULT_LOCALE
                const meterReadings = await loadMeterReadingsForExcelExport({ where, sortBy })

                if (meterReadings.length === 0) {
                    throw new GQLError(errors.NOTHING_TO_EXPORT, context)
                }

                const meterIds = uniq(meterReadings.map(meterReading => meterReading.meter))
                const meters = await loadMetersForExcelExport({ where: { id_in: meterIds } })
                const meterResources = await MeterResource.getAll(context, {})
                const meterReadingSources = await MeterReadingSource.getAll(context, {})

                const mappedMeterReadings = meterReadings.map(meterReading => {
                    const source = meterReadingSources.find(meterReadingSource => meterReadingSource.id === meterReading.source)
                    const sourceName = get(source, 'name')
                    const meter = meters.find(meter => meter.id === meterReading.meter)
                    if (!meter) return

                    const resource = meterResources.find(meterResource => meterResource.id === meter.resource)
                    const resourceName = get(resource, 'name')

                    meterReading.source = sourceName
                    meterReading.resource = resourceName
                    meterReading.unitName = meter.unitName
                    meterReading.unitType = meter.unitType
                    meterReading.accountNumber = meter.accountNumber
                    meterReading.number = meter.number
                    meterReading.place = meter.place
                    meterReading.address = meter.property

                    return meterReading
                }).filter(Boolean)

                const excelRows = mappedMeterReadings.map(meterReading => {
                    const unitType = meterReading.unitType ? i18n(`pages.condo.ticket.field.unitType.${meterReading.unitType}`, { locale }) : ''

                    return {
                        date: formatDate(meterReading.date),
                        address: meterReading.address,
                        unitName: meterReading.unitName,
                        unitType,
                        accountNumber: meterReading.accountNumber,
                        resource: meterReading.resource,
                        number: meterReading.number,
                        place: meterReading.place,
                        value1: meterReading.value1,
                        value2: meterReading.value2,
                        value3: meterReading.value3,
                        value4: meterReading.value4,
                        clientName: meterReading.clientName,
                        source: meterReading.source,
                    }
                })

                const { url: linkToFile } = await createExportFile({
                    fileName: `tickets_${dayjs().format('DD_MM')}.xlsx`,
                    templatePath: './domains/meter/templates/MeterReadingsExportTemplate.xlsx',
                    replaces: {
                        meter: excelRows,
                        i18n: {
                            ...getHeadersTranslations(EXPORT_TYPE_METERS, locale),
                            sheetName: i18n('menu.Meters', { locale }),
                        },
                    },
                    meta: {
                        listkey: 'MeterReading',
                        id: meterReadings[0].id,
                    },
                })
                return { status: 'ok', linkToFile }
            },
        },
    ],
})

module.exports = {
    ExportMeterReadingsService,
}
