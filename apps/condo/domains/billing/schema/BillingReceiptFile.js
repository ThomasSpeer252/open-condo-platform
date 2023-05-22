/**
 * Generated by `createschema billing.BillingReceiptFile 'file:File;context:Relationship:BillingIntegrationOrganizationContext:CASCADE;receipt:Relationship:BillingReceipt:CASCADE;controlSum:Text'`
 */

const { Text, Relationship, File } = require('@keystonejs/fields')

const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema, getById } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/billing/access/BillingReceiptFile')
const { UNEQUAL_CONTEXT_ERROR } = require('@condo/domains/common/constants/errors')
const FileAdapter = require('@condo/domains/common/utils/fileAdapter')

const BILLING_RECEIPT_FILE_FOLDER_NAME = 'billing-receipt-pdf'
const Adapter = new FileAdapter(BILLING_RECEIPT_FILE_FOLDER_NAME)


const BillingReceiptFile = new GQLListSchema('BillingReceiptFile', {
    schemaDoc: 'File for billing receipt',
    fields: {

        file: {
            schemaDoc: 'File object with meta information about the receipt',
            type: File,
            adapter: Adapter,
            isRequired: true,
        },

        context: {
            schemaDoc: 'Link to Context',
            type: Relationship,
            ref: 'BillingIntegrationOrganizationContext',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        receipt: {
            schemaDoc: 'Link to Billing Receipt',
            type: Relationship,
            ref: 'BillingReceipt',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        controlSum: {
            schemaDoc: 'Meta information about the file',
            type: Text,
            isRequired: true,
        },

        importId: {
            schemaDoc: 'Unique import id for each file',
            type: Text,
            isRequired: false,
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadBillingReceiptFiles,
        create: access.canManageBillingReceiptFiles,
        update: access.canManageBillingReceiptFiles,
        delete: false,
        auth: true,
    },
    hooks: {
        validateInput: async ({ resolvedData, addValidationError, existingItem }) => {
            const newItem = { ...existingItem, ...resolvedData }
            const { context: contextId, receipt: receiptId } = newItem
            const receipt = await getById('BillingReceipt', receiptId)
            const { context: receiptContextId } = receipt

            if (contextId !== receiptContextId) {
                return addValidationError(`${UNEQUAL_CONTEXT_ERROR}:receipt:context] Context is not equal to receipt.context`)
            }
        },
    },
})

module.exports = {
    BillingReceiptFile,
}
