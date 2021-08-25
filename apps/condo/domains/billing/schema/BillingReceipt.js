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
const { hasRequestFields } = require('@condo/domains/common/utils/validation.utils')
const { DV_UNKNOWN_VERSION_ERROR, WRONG_TEXT_FORMAT } = require('@condo/domains/common/constants/errors')
const { INTEGRATION_CONTEXT_FIELD, RAW_DATA_FIELD, BILLING_PROPERTY_FIELD, BILLING_ACCOUNT_FIELD, PERIOD_FIELD } = require('./fields')
const { get } = require('lodash')

const BillingReceipt = new GQLListSchema('BillingReceipt', {
    schemaDoc: 'Account monthly invoice document',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        context: INTEGRATION_CONTEXT_FIELD,
        property: BILLING_PROPERTY_FIELD,
        account: BILLING_ACCOUNT_FIELD,

        period: PERIOD_FIELD,

        // Refs migration: 20210823172647-0047_auto_20210823_1226.js
        importId: {
            schemaDoc: '`billing receipt` local object ID. Unique up to billing context. It is unique up to the context. ' +
                'The constrain is a combination of contextId and importId.',
            type: Text,
            isRequired: true,
            kmigratorOptions: { unique: true, null: false },
            hooks: {
                validateInput: async ({ resolvedData, addValidationError }) => {
                    const resolvedImportId = get(resolvedData, ['importId'])

                    if (!resolvedImportId || typeof resolvedImportId !== 'string' || resolvedImportId.length === 0) {
                        addValidationError(
                            `${WRONG_TEXT_FORMAT}importId] Cant mutate billing receipt with empty or null importId, found ${resolvedImportId}`)
                    }
                },
            },
        },

        printableNumber: {
            schemaDoc: 'A number to print on the payment document.',
            type: Text,
            isRequired: false,
        },

        raw: RAW_DATA_FIELD,

        /**
         * A note on toPay:
         *
         * We store all payment data as a string, with (.) as delimiter:
         * We store currency in BillingIntegration in this format. This information helps client to distinguish the partial part:
         *
         * refs: https://gist.github.com/Fluidbyte/2973986
         *
         * "RUB": {
         *		"symbol": "RUB",
         *		"name": "Russian Ruble",
         *		"symbol_native": "₽.",
         *		"decimal_digits": 2,
         * 		"rounding": 0,
         *		"code": "RUB",
         *		"name_plural": "Russian rubles"
         *	},
         *
         * 123.30 (for 123 Ruble and 30 Kopeck)
         * 6.20 (for 6$ and 20 Cents)
         *
         */
        toPay: {
            schemaDoc: 'Total sum to pay. Usually counts as the sum of all services. Stored like this: "123.30" Detail level 1.',
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
