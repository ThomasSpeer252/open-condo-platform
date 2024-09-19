/**
 * Generated by `createschema billing.BillingIntegration name:Text;`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const Big = require('big.js')

const { generateServerUtils } = require('@open-condo/codegen/generate.server.utils')
const { execGqlWithoutAccess } = require('@open-condo/codegen/generate.server.utils')
const { find } = require('@open-condo/keystone/schema')

const { PAYMENT_DONE_STATUS, PAYMENT_WITHDRAWN_STATUS } = require('@condo/domains/acquiring/constants/payment')
const { BillingIntegration: BillingIntegrationGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationAccessRight: BillingIntegrationAccessRightGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationOrganizationContext: BillingIntegrationOrganizationContextGQL } = require('@condo/domains/billing/gql')
const { BillingIntegrationProblem: BillingIntegrationProblemGQL } = require('@condo/domains/billing/gql')
const { BillingProperty: BillingPropertyGQL } = require('@condo/domains/billing/gql')
const { BillingAccount: BillingAccountGQL } = require('@condo/domains/billing/gql')
const { BillingReceipt: BillingReceiptGQL } = require('@condo/domains/billing/gql')
const { BillingReceiptAdmin: BillingReceiptAdminGQL } = require('@condo/domains/billing/gql')
const { BillingReceiptIdOnly: BillingReceiptIdOnlyGQL } = require('@condo/domains/billing/gql')
const { ResidentBillingReceipt: ResidentBillingReceiptGQL } = require('@condo/domains/billing/gql')
const { ResidentBillingVirtualReceipt: ResidentBillingVirtualReceiptGQL } = require('@condo/domains/billing/gql')
const { BillingRecipient: BillingRecipientGQL } = require('@condo/domains/billing/gql')
const { BillingCategory: BillingCategoryGQL } = require('@condo/domains/billing/gql')
const { REGISTER_BILLING_RECEIPTS_MUTATION } = require('@condo/domains/billing/gql')
const { BillingReceiptFile: BillingReceiptFileGQL } = require('@condo/domains/billing/gql')
const { BillingReceiptFileIdOnly: BillingReceiptFileIdOnlyGQL } = require('@condo/domains/billing/gql')
const { VALIDATE_QRCODE_MUTATION } = require('@condo/domains/billing/gql')
const { SEND_NEW_BILLING_RECEIPT_FILES_NOTIFICATIONS_MUTATION } = require('@condo/domains/billing/gql')
const { REGISTER_BILLING_RECEIPT_FILE_MUTATION } = require('@condo/domains/billing/gql')
const { SUM_BILLING_RECEIPTS_QUERY } = require('@condo/domains/billing/gql')
const { SEND_RESIDENT_MESSAGE_MUTATION } = require('@condo/domains/resident/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const BillingIntegration = generateServerUtils(BillingIntegrationGQL)
const BillingIntegrationAccessRight = generateServerUtils(BillingIntegrationAccessRightGQL)
const BillingIntegrationOrganizationContext = generateServerUtils(BillingIntegrationOrganizationContextGQL)
const BillingIntegrationProblem = generateServerUtils(BillingIntegrationProblemGQL)
const BillingProperty = generateServerUtils(BillingPropertyGQL)
const BillingAccount = generateServerUtils(BillingAccountGQL)
const BillingReceipt = generateServerUtils(BillingReceiptGQL)
const BillingReceiptAdmin = generateServerUtils(BillingReceiptAdminGQL)
const BillingReceiptIdOnly = generateServerUtils(BillingReceiptIdOnlyGQL)
const ResidentBillingReceipt = generateServerUtils(ResidentBillingReceiptGQL)
const ResidentBillingVirtualReceipt = generateServerUtils(ResidentBillingVirtualReceiptGQL)
const BillingRecipient = generateServerUtils(BillingRecipientGQL)
const BillingCategory = generateServerUtils(BillingCategoryGQL)
const BillingReceiptFile = generateServerUtils(BillingReceiptFileGQL)
const BillingReceiptFileIdOnly = generateServerUtils(BillingReceiptFileIdOnlyGQL)

async function registerBillingReceipts (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: REGISTER_BILLING_RECEIPTS_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to registerBillingReceipts',
        dataPath: 'result',
    })
}

/**
 * Sums up all DONE or WITHDRAWN payments for billingReceipt, connected by receiptId
 * @param receiptId {string}
 * @return {Promise<*>}
 */
const getPaymentsSum = async (receiptId) => {
    const payments = await find('Payment', {
        AND: [
            { status_in: [PAYMENT_DONE_STATUS, PAYMENT_WITHDRAWN_STATUS] },
            { deletedAt: null },
            { receipt: { id: receiptId } },
        ],
    })
    return payments.reduce((total, current) => (Big(total).plus(current.amount)), 0).toFixed(8).toString()
}

/**
 *
 * @param context
 * @param data
 * @returns {Promise<*>}
 */
async function sendNewReceiptMessagesToResidentScopes (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: SEND_RESIDENT_MESSAGE_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to sendNewReceiptMessagesToResidentScopes',
        dataPath: 'result',
    })
}

async function validateQRCode (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: VALIDATE_QRCODE_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to validateQRCode',
        dataPath: 'result',
    })
}

async function sendNewBillingReceiptFilesNotifications (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: SEND_NEW_BILLING_RECEIPT_FILES_NOTIFICATIONS_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to sendNewBillingReceiptFilesNotifications',
        dataPath: 'result',
    })
}

async function registerBillingReceiptFile (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')
    return await execGqlWithoutAccess(context, {
        query: REGISTER_BILLING_RECEIPT_FILE_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to registerBillingReceiptFile',
        dataPath: 'obj',
    })
}

async function sumBillingReceipts (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: SUM_BILLING_RECEIPTS_QUERY,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to sumBillingReceipts',
        dataPath: 'obj',
    })
}

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    BillingIntegration,
    BillingIntegrationAccessRight,
    BillingIntegrationOrganizationContext,
    BillingIntegrationProblem,
    BillingProperty,
    BillingAccount,
    BillingReceipt,
    BillingReceiptAdmin,
    BillingReceiptIdOnly,
    ResidentBillingReceipt,
    ResidentBillingVirtualReceipt,
    BillingRecipient,
    BillingCategory,
    registerBillingReceipts,
    getPaymentsSum,
    sendNewReceiptMessagesToResidentScopes,
    BillingReceiptFile,
    BillingReceiptFileIdOnly,
    validateQRCode,
    sendNewBillingReceiptFilesNotifications,
    sumBillingReceipts,
    registerBillingReceiptFile,
/* AUTOGENERATE MARKER <EXPORTS> */
}
