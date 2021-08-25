/**
 * Generated by `createservice ticket.TicketAnalyticsReportService`
 */

const { GQLCustomSchema, getByCondition } = require('@core/keystone/schema')
const access = require('@condo/domains/ticket/access/TicketAnalyticsReportService')
const moment = require('moment')
const { sortStatusesByType, TicketGqlToKnexAdapter, aggregateData } = require('@condo/domains/ticket/utils/serverSchema/analytics.helper')
const { DATE_DISPLAY_FORMAT } = require('@condo/domains/ticket/constants/common')
const { Property: PropertyServerUtils } = require('@condo/domains/property/utils/serverSchema')
const { TicketStatus: TicketStatusServerUtils, Ticket } = require('@condo/domains/ticket/utils/serverSchema')
const isEmpty = require('lodash/isEmpty')
const get = require('lodash/get')
const { createExportFile } = require('@condo/domains/common/utils/createExportFile')
const propertySummaryDataMapper = require('@condo/domains/ticket/utils/serverSchema/propertySummaryDataMapper')
const propertySingleDataMapper = require('@condo/domains/ticket/utils/serverSchema/propertySingleDataMapper')
const dayGroupDataMapper = require('@condo/domains/ticket/utils/serverSchema/dayGroupDataMapper')

const createPropertyRange = async (context, organizationWhereInput) => {
    const properties = await PropertyServerUtils.getAll(context, { organization:  organizationWhereInput  })
    return properties.map( property => ({ label: property.address, value: property.id }))
}

const createStatusRange = async (context, organizationWhereInput, labelKey = 'name') => {
    const statuses = await TicketStatusServerUtils.getAll(context, { OR: [
        { organization: organizationWhereInput },
        { organization_is_null: true },
    ] })
    // We use organization specific statuses if they exists
    // or default if there is no organization specific status with a same type
    const allStatuses = statuses.filter(status => {
        if (!status.organization) {
            return true
        }
        return !statuses
            .find(organizationStatus => organizationStatus.organization !== null && organizationStatus.type === status.type)
    })
    return sortStatusesByType(allStatuses).map(status => ({ label: status[labelKey], value: status.id }))
}

const getTicketCounts = async (context, where, groupBy, extraLabels = {}) => {
    const ticketGqlToKnexAdapter = new TicketGqlToKnexAdapter(where, groupBy)
    await ticketGqlToKnexAdapter.loadData()

    const translates = {}
    for (const group of groupBy) {
        switch (group) {
            case 'property':
                translates[group] = await createPropertyRange(context, where.organization)
                break
            case 'status':
                translates[group] = await createStatusRange(
                    context, where.organization, isEmpty(extraLabels) ? 'name' :  extraLabels[group]
                )
                break
            default:
                break
        }
    }
    return ticketGqlToKnexAdapter
        .getResult(({ count, dayGroup, ...searchResult }) =>
        {
            if (!isEmpty(translates)) {
                Object.entries(searchResult).forEach(([groupName, value]) => {
                    const translateMapping = get(translates, groupName, false)
                    if (translateMapping) {
                        const translation = translateMapping.find(translate => translate.value === value)
                        searchResult[groupName] = translation.label
                    }
                })
                return {
                    ...searchResult,
                    dayGroup: moment(dayGroup).format(DATE_DISPLAY_FORMAT),
                    count: parseInt(count),
                }
            }
            return {
                ...searchResult,
                dayGroup: moment(dayGroup).format(DATE_DISPLAY_FORMAT),
                count:parseInt(count),
            }
        }).sort((a, b) =>
            moment(a.dayGroup, DATE_DISPLAY_FORMAT).format('X') - moment(b.dayGroup, DATE_DISPLAY_FORMAT).format('X'))
}

const TicketAnalyticsReportService = new GQLCustomSchema('TicketAnalyticsReportService', {
    types: [
        {
            access: true,
            type: 'enum TicketAnalyticsGroupBy { day week month status property }',
        },
        {
            access: true,
            type: 'input TicketAnalyticsReportInput { where: TicketWhereInput!, groupBy: [TicketAnalyticsGroupBy!] }',
        },
        {
            access: true,
            type: 'type TicketAnalyticsReportOutput { groups: [TicketGroupedCounter!] }',
        },
        {
            access: true,
            type: 'type TicketGroupedCounter { count: Int!, status: String, property: String, dayGroup: String!  }',
        },
        {
            access: true,
            type: 'input ExportTicketAnalyticsToExcelInput { where: TicketWhereInput!, groupBy: [TicketAnalyticsGroupBy!], translates: JSON }',
        },
        {
            access: true,
            type: 'type ExportTicketAnalyticsToExcelOutput { link: String! }',
        },
    ],
    queries: [
        {
            access: access.canReadTicketAnalyticsReport,
            schema: 'ticketAnalyticsReport(data: TicketAnalyticsReportInput): TicketAnalyticsReportOutput',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { data: { where = {}, groupBy = [] } } = args
                const groups = await getTicketCounts(context, where, groupBy)
                return { groups }
            },
        },
        {
            access: access.canReadExportTicketAnalyticsToExcel,
            schema: 'exportTicketAnalyticsToExcel(data: ExportTicketAnalyticsToExcelInput): ExportTicketAnalyticsToExcelOutput',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { data: { where = {}, groupBy = [], translates = {} } } = args
                const ticketCounts = await getTicketCounts(context, where, groupBy, { status: 'type' })
                const { result, groupKeys } = aggregateData(ticketCounts, groupBy)
                const ticketAccessCheck = await Ticket.getAll(context, where, { first: 1 })
                const [groupBy1, groupBy2] = groupKeys

                // TODO(sitozzz): find way to collect organization locale without additional request
                const organization = await getByCondition('Organization', {
                    id: where.organization.id,
                })

                let rowColumns = []
                const groupByToken = groupBy.join('-')
                let address = get(translates, 'property')

                switch (groupByToken) {
                    case 'status-day':
                    case 'status-week':
                        rowColumns = [...new Set(Object.values(result).flatMap(e => Object.keys(e)))]
                        break
                    case 'status-property':
                        rowColumns = address.includes('@') ? address.split('@') : []
                        break
                    default:
                        throw new Error('unsupported filter')
                }

                const tickets = []
                if (rowColumns.length === 0) {
                    const tableColumns = {}
                    Object.entries(result).forEach(([ticketType, dataObject]) => {
                        const { rows } = propertySummaryDataMapper({ row: dataObject, constants: { address } })
                        tableColumns[ticketType] = rows[ticketType]()
                        tableColumns.address = rows.address()
                    })
                    tickets.push(tableColumns)
                } else {
                    switch (groupBy[1]) {
                        case 'property':
                            rowColumns.forEach((rowAddress) => {
                                const tableRow = {}
                                Object.entries(result).forEach(([ticketType, dataObject]) => {
                                    const { rows } = propertySingleDataMapper(
                                        { row: dataObject, constants: { address: rowAddress } }
                                    )
                                    tableRow[ticketType] = rows[ticketType]()
                                    tableRow.address = rows.address()
                                })
                                tickets.push(tableRow)
                            })
                            break
                        case 'day':
                        case 'week':
                            rowColumns.forEach((date) => {
                                const tableColumns = {}
                                let addressRow = ''
                                let dateRow = ''
                                Object.keys(result).forEach(ticketType => {
                                    const { rows } = dayGroupDataMapper({ row: result, constants: { date, address } })
                                    tableColumns[ticketType] = rows[ticketType]()
                                    addressRow = rows.address()
                                    dateRow = rows.date()
                                })
                                tickets.push({ address: addressRow, date: dateRow, ...tableColumns })
                            })
                            break
                        default:
                            throw new Error('unsupported filter')
                    }
                }

                const link = await createExportFile({
                    fileName: `ticket_analytics_${moment().format('DD_MM')}.xlsx`,
                    templatePath: `./domains/ticket/templates/${organization.country}/TicketAnalyticsExportTemplate[${groupBy1}_${groupBy2}].xlsx`,
                    replaces: { tickets },
                    meta: {
                        listkey: 'Ticket',
                        id: ticketAccessCheck[0].id,
                    },
                })
                return { link }
            },
        },
    ],
})

module.exports = {
    TicketAnalyticsReportService,
}
