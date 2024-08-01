/**
 * Generated by `createschema meter.MeterReading 'number:Integer; date:DateTimeUtc; account?:Relationship:BillingAccount:SET_NULL; billingAccountMeter?:Relationship:BillingAccountMeter:SET_NULL; meter:Relationship:Meter:CASCADE; property:Relationship:Property:CASCADE; organization:Relationship:Organization:CASCADE; value:Integer; sectionName?:Text; floorName?:Text; unitName?:Text; client?:Relationship:User:SET_NULL; clientName?:Text; clientEmail?:Text; clientPhone?:Text; contact?:Relationship:Contact:SET_NULL; source:Relationship:MeterSource:PROTECT'`
 */
const dayjs = require('dayjs')
const { get, isEmpty, isNil } = require('lodash')

const conf = require('@open-condo/config')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema, getById } = require('@open-condo/keystone/schema')
const { extractReqLocale } = require('@open-condo/locales/extractReqLocale')
const { i18n } = require('@open-condo/locales/loader')

const { CONTACT_FIELD, CLIENT_EMAIL_FIELD, CLIENT_NAME_FIELD, CLIENT_PHONE_LANDLINE_FIELD, CLIENT_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/meter/access/MeterReading')
const { METER_READING_MAX_VALUES_COUNT } = require('@condo/domains/meter/constants/constants')
const { METER_READING_DATE_IN_FUTURE, METER_READING_FEW_VALUES, METER_READING_EXTRA_VALUES } = require('@condo/domains/meter/constants/errors')
const { Meter } = require('@condo/domains/meter/utils/serverSchema')
const { connectContactToMeterReading } = require('@condo/domains/meter/utils/serverSchema/resolveHelpers')
const { addClientInfoToResidentMeterReading } = require('@condo/domains/meter/utils/serverSchema/resolveHelpers')
const { addOrganizationFieldPlugin } = require('@condo/domains/organization/schema/plugins/addOrganizationFieldPlugin')
const { RESIDENT } = require('@condo/domains/user/constants/common')

const ERRORS = {
    METER_READING_DATE_IN_FUTURE: (givenDate) => ({
        code: BAD_USER_INPUT,
        type: METER_READING_DATE_IN_FUTURE,
        message: 'Meter reading date can not be from the future',
        messageForUser: 'api.meterReading.METER_READING_DATE_IN_FUTURE',
        messageInterpolation: { givenDate },
    }),
    METER_READING_FEW_VALUES: (meterNumber, numberOfTariffs, fieldsNames) => ({
        code: BAD_USER_INPUT,
        type: METER_READING_FEW_VALUES,
        message: 'Wrong values count: few values',
        messageForUser: 'api.meterReading.METER_READING_FEW_VALUES',
        messageInterpolation: { meterNumber, numberOfTariffs, fieldsNames },
    }),
    METER_READING_EXTRA_VALUES: (meterNumber, numberOfTariffs, fieldsNames) => ({
        code: BAD_USER_INPUT,
        type: METER_READING_EXTRA_VALUES,
        message: 'Wrong values count: extra values',
        messageForUser: 'api.meterReading.METER_READING_EXTRA_VALUES',
        messageInterpolation: { meterNumber, numberOfTariffs, fieldsNames },
    }),
}

const MeterReading = new GQLListSchema('MeterReading', {
    schemaDoc: 'Meter reading taken from a client or billing',
    fields: {
        date: {
            schemaDoc: 'Date when the readings were taken',
            type: 'DateTimeUtc',
            hooks: {
                validateInput: async ({ context, operation, existingItem, resolvedData, fieldPath }) => {
                    const date = get(resolvedData, fieldPath)
                    if (date) {
                        const now = dayjs()
                        const readingDate = dayjs(date)
                        if (readingDate.isAfter(now)) {
                            throw new GQLError(ERRORS.METER_READING_DATE_IN_FUTURE(date), context)
                        }
                    }
                },
            },
        },

        meter: {
            schemaDoc: 'Meter from which readings were taken',
            type: 'Relationship',
            ref: 'Meter',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        value1: {
            schemaDoc: 'If the meter is single-tariff, then only this value will be filled in;' +
                'If multi-tariff, then the value of the first tariff will be in this field',
            type: 'Decimal',
        },

        value2: {
            schemaDoc: 'If the meter is multi-tariff, then the value of the second tariff is stored here',
            type: 'Decimal',
        },

        value3: {
            schemaDoc: 'If the meter is multi-tariff, then the value of the third tariff is stored here',
            type: 'Decimal',
        },

        value4: {
            schemaDoc: 'If the meter is multi-tariff, then the value of the fourth tariff is stored here',
            type: 'Decimal',
        },

        client: CLIENT_FIELD,
        contact: CONTACT_FIELD,
        clientName: CLIENT_NAME_FIELD,
        clientEmail: CLIENT_EMAIL_FIELD,
        clientPhone: CLIENT_PHONE_LANDLINE_FIELD,

        source: {
            schemaDoc: 'Meter reading source channel/system. Examples: call, mobile_app, billing, ...',
            type: 'Relationship',
            ref: 'MeterReadingSource',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
        },

    },
    hooks: {
        resolveInput: async ({ operation, context, resolvedData, existingItem }) => {
            // since request can come not only from transport layer - we have to use fallback auth detection
            const user = get(context, ['req', 'user']) || get(context, ['authedItem'])

            if (operation === 'create' && isEmpty(resolvedData['date'])) {
                resolvedData['date'] = new Date().toISOString()
            }

            if (operation === 'create' && user.type === RESIDENT) {
                addClientInfoToResidentMeterReading(context, resolvedData)
            }

            const meter = await Meter.getOne(context, {
                id: get(resolvedData, 'meter', null),
            })
            if (meter && resolvedData.clientName && resolvedData.clientPhone) {
                const contactCreationData = {
                    ...resolvedData,
                    organization: get(meter, ['organization', 'id']),
                    property: get(meter, ['property', 'id']),
                    unitName: get(meter, 'unitName'),
                    unitType: get(meter, 'unitType'),
                }

                resolvedData.contact = await connectContactToMeterReading(context, contactCreationData, existingItem)
            }

            return resolvedData
        },
        validateInput: async ({ context, resolvedData, existingItem }) => {
            const newItem = { ...existingItem, ...resolvedData }
            const locale = extractReqLocale(context.req) || conf.DEFAULT_LOCALE

            const meterId = get(newItem, 'meter')

            const meter = await getById('Meter', meterId)

            const emptyFieldsNames = []
            for (let i = 1; i <= meter.numberOfTariffs; i++) {
                if (isNil(get(newItem, `value${i}`))) {
                    emptyFieldsNames.push(`value${i}`)
                }
            }
            if (emptyFieldsNames.length > 0) {
                const localizedFieldsNames = emptyFieldsNames.map((fieldName) => i18n(`meter.import.column.${fieldName}`, { locale }))
                throw new GQLError(ERRORS.METER_READING_FEW_VALUES(meter.number, meter.numberOfTariffs, localizedFieldsNames.join(', ')), context)
            }

            const extraFieldsNames = []
            for (let i = meter.numberOfTariffs + 1; i <= METER_READING_MAX_VALUES_COUNT; i++) {
                const value = get(newItem, `value${i}`)
                if (!isNil(value) && !isEmpty(value)) {
                    extraFieldsNames.push(`value${i}`)
                }
            }
            if (extraFieldsNames.length > 0) {
                const localizedFieldsNames = extraFieldsNames.map((fieldName) => i18n(`meter.import.column.${fieldName}`, { locale }))
                throw new GQLError(ERRORS.METER_READING_EXTRA_VALUES(meter.number, meter.numberOfTariffs, localizedFieldsNames.join(', ')), context)
            }
        },
    },
    plugins: [
        addOrganizationFieldPlugin({ fromField: 'meter', isRequired: true }),
        uuided(),
        versioned(),
        tracked(),
        softDeleted(),
        dvAndSender(),
        historical(),
    ],
    access: {
        read: access.canReadMeterReadings,
        create: access.canManageMeterReadings,
        update: access.canManageMeterReadings,
        delete: false,
        auth: true,
    },
})

module.exports = {
    MeterReading,
}
