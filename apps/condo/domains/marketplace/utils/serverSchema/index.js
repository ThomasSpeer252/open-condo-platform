/**
 * Generated by `createschema marketplace.InvoiceContext 'organization:Relationship:Organization:PROTECT; recipient:Json; email:Text; settings:Json; state:Json;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateServerUtils, execGqlWithoutAccess } = require('@open-condo/codegen/generate.server.utils')

const { InvoiceContext: InvoiceContextGQL } = require('@condo/domains/marketplace/gql')
const { MarketCategory: MarketCategoryGQL } = require('@condo/domains/marketplace/gql')
const { MarketItem: MarketItemGQL } = require('@condo/domains/marketplace/gql')
const { Invoice: InvoiceGQL } = require('@condo/domains/marketplace/gql')
const { MarketItemFile: MarketItemFileGQL } = require('@condo/domains/marketplace/gql')
const { MarketItemPrice: MarketItemPriceGQL } = require('@condo/domains/marketplace/gql')
const { MarketPriceScope: MarketPriceScopeGQL } = require('@condo/domains/marketplace/gql')
const { REGISTER_INVOICE_MUTATION } = require('@condo/domains/marketplace/gql')
const { GET_INVOICE_BY_USER_MUTATION } = require('@condo/domains/marketplace/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const InvoiceContext = generateServerUtils(InvoiceContextGQL)
const MarketCategory = generateServerUtils(MarketCategoryGQL)
const MarketItem = generateServerUtils(MarketItemGQL)
const Invoice = generateServerUtils(InvoiceGQL)
const MarketItemFile = generateServerUtils(MarketItemFileGQL)
const MarketItemPrice = generateServerUtils(MarketItemPriceGQL)
const MarketPriceScope = generateServerUtils(MarketPriceScopeGQL)

async function registerInvoice (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: REGISTER_INVOICE_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to registerInvoice',
        dataPath: 'obj',
    })
}

async function getInvoiceByUser (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: GET_INVOICE_BY_USER_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to getInvoiceByUser',
        dataPath: 'obj',
    })
}

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    InvoiceContext,
    MarketCategory,
    MarketItem,
    Invoice,
    MarketItemFile,
    MarketItemPrice,
    MarketPriceScope,
    registerInvoice,
    getInvoiceByUser,
/* AUTOGENERATE MARKER <EXPORTS> */
}
