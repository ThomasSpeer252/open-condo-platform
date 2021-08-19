/**
 * Generated by `createschema billing.BillingReceipt 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; property:Relationship:BillingProperty:CASCADE; account:Relationship:BillingAccount:CASCADE; period:CalendarDay; raw:Json; toPay:Text; services:Json; meta:Json'`
 */

const { Text } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/billing/access/BillingReceipt')
const { validatePaymentDetails, validateServices, validateRecipient } = require('../utils/validation.utils')
const { hasDbFields, hasRequestFields } = require('@condo/domains/common/utils/validation.utils')
const { DV_UNKNOWN_VERSION_ERROR, WRONG_TEXT_FORMAT } = require('@condo/domains/common/constants/errors')
const { INTEGRATION_CONTEXT_FIELD, RAW_DATA_FIELD, BILLING_PROPERTY_FIELD, BILLING_ACCOUNT_FIELD, PERIOD_FIELD } = require('./fields')
const _ = require('lodash')

const BillingReceipt = new GQLListSchema('BillingReceipt', {
    schemaDoc: 'Account monthly invoice document',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        context: INTEGRATION_CONTEXT_FIELD,
        property: BILLING_PROPERTY_FIELD,
        account: BILLING_ACCOUNT_FIELD,

        period: PERIOD_FIELD,

        importId: {
            schemaDoc: '`billing receipt` local object ID. Unique up to billing context.' +
                ' It is made using template: <context_id>__<importId>',
            type: Text,
            isRequired: true,
            kmigratorOptions: { unique: true, null: false },
            hooks: {
                /**
                 * We make sure that you can not create two receipts with same importId in same billing integration organization context
                 */
                resolveInput: async ({ resolvedData, operation, existingItem }) => {
                    const contextId = resolvedData.context
                    const resolvedImportId = resolvedData.importId
                    const oldImportId = _.get(existingItem, ['importId'])

                    // If user try to create receipt without import id
                    if (operation === 'create' && (!resolvedImportId || resolvedImportId.length === 0)) {
                        throw `${WRONG_TEXT_FORMAT}importId] - Cant modify billing receipt without correct importId! Found ${resolvedImportId}`
                    }

                    // If user updates other fields we dont need to modify importId
                    if (operation === 'update' && !resolvedData.importId) {
                        return oldImportId
                    }

                    // If user already pre-formatter importId
                    if (resolvedImportId.startsWith(contextId + '__')) {
                        return resolvedImportId
                    }

                    return contextId + '__' + resolvedImportId
                },
            },
        },

        printableNumber: {
            schemaDoc: 'A number to print on the payment document.',
            type: Text,
            isRequired: false,
        },

        raw: RAW_DATA_FIELD,

        toPay: {
            schemaDoc: 'Total sum to pay. Usually counts as the sum of all services. Detail level 1.',
            type: Text,
            isRequired: true,
        },

        toPayDetails: {
            schemaDoc: 'Sum to pay details. Detail level 2',
            type: Json,
            isRequired: false,
            hooks: {
                validateInput: validatePaymentDetails,
            },
        },

        services: {
            schemaDoc: 'Services to pay for. Every service has id, name and toPay. Service may or may not have toPay detail. Detail level 3 and 4',
            type: Json,
            isRequired: false,
            hooks: {
                validateInput: validateServices,
            },
        },

        recipient: {
            schemaDoc: 'Billing account recipient. Should contain all meta information to identify the organization',
            type: Json,
            isRequired: true,
            hooks: {
                validateInput: validateRecipient,
            },
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadBillingReceipts,
        create: access.canManageBillingReceipts,
        update: access.canManageBillingReceipts,
        delete: false,
        auth: true,
    },
    hooks: {
        validateInput: ({ resolvedData, existingItem, context, addValidationError }) => {
            if (!hasRequestFields(['dv', 'sender'], resolvedData, context, addValidationError)) return
            const { dv } = resolvedData
            if (dv === 1) {
                // NOTE: version 1 specific translations. Don't optimize this logic
            } else {
                return addValidationError(`${DV_UNKNOWN_VERSION_ERROR}dv] Unknown \`dv\``)
            }
        },
    },
})

module.exports = {
    BillingReceipt,
}
