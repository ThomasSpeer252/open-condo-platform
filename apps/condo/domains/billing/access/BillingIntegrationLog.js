/**
 * Generated by `createschema billing.BillingIntegrationLog 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; type:Text; message:Text; meta:Json'`
 */
const { get } = require('lodash')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getById } = require('@open-condo/keystone/schema')

const { checkBillingIntegrationsAccessRights } = require('../utils/accessSchema')

async function canReadBillingIntegrationLogs ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return {}

    return {
        context: {
            OR: [
                { organization: { employees_some: { user: { id: user.id }, role: { canManageIntegrations: true }, deletedAt: null, isBlocked: false } } },
                { integration: { accessRights_some: { user: { id: user.id }, deletedAt: null } } },
            ],
        },
    }
}

async function canManageBillingIntegrationLogs ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    let contextId

    if (operation === 'create') {
        // NOTE: can create only by the integration account
        contextId = get(originalInput, ['context', 'connect', 'id'])
    } else if (operation === 'update') {
        // NOTE: can update only by the integration account
        if (!itemId) return false
        const log = await getById('BillingIntegrationLog', itemId)
        if (!log) return false
        contextId = log.context
    }

    if (!contextId) return false
    const context = await getById('BillingIntegrationOrganizationContext', contextId)
    if (!context) return false
    const { integration: integrationId } = context

    return await checkBillingIntegrationsAccessRights(user.id, [integrationId])
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadBillingIntegrationLogs,
    canManageBillingIntegrationLogs,
}
