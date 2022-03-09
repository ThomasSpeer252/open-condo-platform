/**
 * Generated by `createschema billing.BillingReceipt 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; property:Relationship:BillingProperty:CASCADE; account:Relationship:BillingAccount:CASCADE; period:CalendarDay; raw:Json; toPay:Text; services:Json; meta:Json'`
 */

const { get } = require('lodash')
const { Text, Relationship } = require('@keystonejs/fields')

const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')

const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/billing/access/BillingReceipt')
const { MONEY_AMOUNT_FIELD } = require('@condo/domains/common/schema/fields')
const { hasDvAndSenderFields } = require('@condo/domains/common/utils/validation.utils')
const { DV_UNKNOWN_VERSION_ERROR, WRONG_TEXT_FORMAT } = require('@condo/domains/common/constants/errors')

const { INTEGRATION_CONTEXT_FIELD, BILLING_PROPERTY_FIELD, BILLING_ACCOUNT_FIELD } = require('./fields/relations')
const { TO_PAY_DETAILS_FIELD } = require('./fields/BillingReceipt/ToPayDetailsField')
const { SERVICES_FIELD } = require('./fields/BillingReceipt/Services')
const { RECIPIENT_FIELD } = require('./fields/BillingReceipt/Recipient')
const { BillingRecipient } = require('../utils/serverSchema')
const { RAW_DATA_FIELD, PERIOD_FIELD } = require('./fields/common')


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

        toPay: {
            ...MONEY_AMOUNT_FIELD,
            schemaDoc: 'Total sum to pay. Usually counts as the sum of all services.',
            isRequired: true,
        },

        toPayDetails: TO_PAY_DETAILS_FIELD,

        services: SERVICES_FIELD,

        recipient: RECIPIENT_FIELD,

        // TODO @toplenboren (Doma-2241) make this not null!
        receiver: {
            schemaDoc: 'Integration context',
            type: Relationship,
            ref: 'BillingRecipient',
            isRequired: true,
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true, on_delete: 'models.CASCADE' },
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
        validateInput: ({ resolvedData, context, addValidationError }) => {
            if (!hasDvAndSenderFields( resolvedData, context, addValidationError)) return
            const { dv } = resolvedData
            if (dv === 1) {
                // NOTE: version 1 specific translations. Don't optimize this logic
            } else {
                return addValidationError(`${DV_UNKNOWN_VERSION_ERROR}dv] Unknown \`dv\``)
            }
        },
        beforeChange: async ({
            operation,
            existingItem,
            resolvedData,
            context,
        }) => {
            const { sender: { fingerprint } } = resolvedData

            if ('receiver' in resolvedData) {
                return
            }

            let contextId
            let recipient
            if (operation === 'create') {
                recipient = get(resolvedData, 'recipient')
                contextId = get(resolvedData, 'context')
            }
            if (operation === 'update') {
                recipient = get(resolvedData, 'recipient')
                if (!recipient) {
                    recipient = get(existingItem, 'recipient')
                }
                contextId = get(resolvedData, 'context')
                if (!contextId) {
                    contextId = get(existingItem, 'context')
                }
            }

            let receiverId
            const sameRecipient = await BillingRecipient.getOne(context, {
                tin: get(recipient, 'tin'),
                iec: get(recipient, 'iec'),
                bic: get(recipient, 'bic'),
                bankAccount: get(recipient, 'bankAccount'),
            })
            if (sameRecipient) {
                receiverId = sameRecipient.id
            } else {
                const createdRecipient = await BillingRecipient.create(context, {
                    dv: 1,
                    sender: { dv: 1, fingerprint: fingerprint },
                    context: { connect: { id: contextId } },
                    name: get(recipient, 'name'),
                    tin: get(recipient, 'tin'),
                    iec: get(recipient, 'iec'),
                    bic: get(recipient, 'bic'),
                    bankAccount: get(recipient, 'bankAccount'),
                })
                receiverId = createdRecipient.id
            }
            resolvedData.receiver = receiverId
        },
    },
})

module.exports = {
    BillingReceipt,
}
