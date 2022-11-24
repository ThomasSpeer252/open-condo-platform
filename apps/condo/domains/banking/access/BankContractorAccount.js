// @ts-nocheck
/**
 * Generated by `createschema banking.BankContractorAccount 'name:Text; organization:Relationship:Organization:CASCADE; costItem?:Relationship:BankCostItem:SET_NULL; tin:Text; country:Text; routingNumber:Text; number:Text; currencyCode:Text; importId?:Text; territoryCode?:Text; bankName?:Text; meta?:Json; tinMeta?:Json; routingNumberMeta?:Json'`
 */

const get = require('lodash/get')
const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const {
    queryOrganizationEmployeeFor,
    queryOrganizationEmployeeFromRelatedOrganizationFor,
} = require('@condo/domains/organization/utils/accessSchema')
const { checkPermissionInUserOrganizationOrRelatedOrganization } = require('@condo/domains/organization/utils/accessSchema')

async function canReadBankContractorAccounts ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin || user.isSupport) return true

    return {
        OR: [
            { organization: queryOrganizationEmployeeFor(user.id) },
            { organization: queryOrganizationEmployeeFromRelatedOrganizationFor(user.id) },
        ],
    }
}

async function canManageBankContractorAccounts ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    const organizationId = get(originalInput, ['organization', 'connect', 'id'])
    const can = await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, organizationId, 'canManageBankContractorAccounts')
    if (can) return true

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadBankContractorAccounts,
    canManageBankContractorAccounts,
}
