/**
 * Generated by `createschema acquiring.AcquiringIntegration 'name:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateServerUtils, execGqlWithoutAccess } = require('@open-condo/codegen/generate.server.utils')

const { AcquiringIntegration: AcquiringIntegrationGQL } = require('@condo/domains/acquiring/gql')
const { AcquiringIntegrationAccessRight: AcquiringIntegrationAccessRightGQL } = require('@condo/domains/acquiring/gql')
const { AcquiringIntegrationContext: AcquiringIntegrationContextGQL } = require('@condo/domains/acquiring/gql')
const { MultiPayment: MultiPaymentGQL } = require('@condo/domains/acquiring/gql')
const { Payment: PaymentGQL } = require('@condo/domains/acquiring/gql')
const { REGISTER_MULTI_PAYMENT_MUTATION } = require('@condo/domains/acquiring/gql')
const { PaymentsFilterTemplate: PaymentsFilterTemplateGQL } = require('@condo/domains/acquiring/gql')
const {
    REGISTER_MULTI_PAYMENT_FOR_ONE_RECEIPT_MUTATION,
    REGISTER_MULTI_PAYMENT_FOR_VIRTUAL_RECEIPT_MUTATION,
} = require('@condo/domains/acquiring/gql')
const { SUM_PAYMENTS_QUERY } = require('@condo/domains/acquiring/gql')
const { RecurrentPaymentContext: RecurrentPaymentContextGQL } = require('@condo/domains/acquiring/gql')
const { RecurrentPayment: RecurrentPaymentGQL } = require('@condo/domains/acquiring/gql')
const { PAYMENT_BY_LINK_MUTATION } = require('@condo/domains/acquiring/gql')
const { REGISTER_MULTI_PAYMENT_FOR_INVOICES_MUTATION } = require('@condo/domains/acquiring/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const AcquiringIntegration = generateServerUtils(AcquiringIntegrationGQL)
const AcquiringIntegrationAccessRight = generateServerUtils(AcquiringIntegrationAccessRightGQL)
const AcquiringIntegrationContext = generateServerUtils(AcquiringIntegrationContextGQL)
const MultiPayment = generateServerUtils(MultiPaymentGQL)
const Payment = generateServerUtils(PaymentGQL)
async function registerMultiPayment (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: REGISTER_MULTI_PAYMENT_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to registerMultiPayment',
        dataPath: 'result',
    })
}

const PaymentsFilterTemplate = generateServerUtils(PaymentsFilterTemplateGQL)

async function registerMultiPaymentForOneReceipt (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: REGISTER_MULTI_PAYMENT_FOR_ONE_RECEIPT_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to registerMultiPaymentForOneReceipt',
        dataPath: 'result',
    })
}

async function registerMultiPaymentForVirtualReceipt (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: REGISTER_MULTI_PAYMENT_FOR_VIRTUAL_RECEIPT_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to registerMultiPaymentForVirtualReceipt',
        dataPath: 'result',
    })
}

async function allPaymentsSum (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: SUM_PAYMENTS_QUERY,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to sum payments',
        dataPath: 'obj',
    })
}

const RecurrentPaymentContext = generateServerUtils(RecurrentPaymentContextGQL)
const RecurrentPayment = generateServerUtils(RecurrentPaymentGQL)

async function createPaymentByLink (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: PAYMENT_BY_LINK_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to createPaymentByLink',
        dataPath: 'obj',
    })
}

async function registerMultiPaymentForInvoices (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: REGISTER_MULTI_PAYMENT_FOR_INVOICES_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to registerMultiPaymentForInvoices',
        dataPath: 'result',
    })
}

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    AcquiringIntegration,
    AcquiringIntegrationAccessRight,
    AcquiringIntegrationContext,
    MultiPayment,
    Payment,
    registerMultiPayment,
    PaymentsFilterTemplate,
    registerMultiPaymentForOneReceipt,
    registerMultiPaymentForVirtualReceipt,
    allPaymentsSum,
    RecurrentPaymentContext,
    RecurrentPayment,
    createPaymentByLink,
    registerMultiPaymentForInvoices,
/* AUTOGENERATE MARKER <EXPORTS> */
}
