// @ts-nocheck

/**
 * Generated by `createschema billing.BillingRecipient 'organization:Relationship:Organization:CASCADE; tin:Text; iec:Text; bic:Text; context?:Relationship:BillingIntegrationOrganizationContext:SET_NULL; bankAccount:Text; name?:Text; approved:Checkbox; meta?:Json;'`
 */

const { get } = require('lodash')

const { getById } = require('@core/keystone/schema')

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')

const { canReadBillingEntity, checkBillingIntegrationsAccessRights } = require('@condo/domains/billing/utils/accessSchema')


async function canReadBillingRecipients ({ authentication }) {
    return await canReadBillingEntity(authentication)
}

async function canManageBillingRecipients ({ authentication: { item: user }, operation, originalInput, itemId, listKey }) {

    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    let contextId

    if (operation === 'create') {
        contextId = get(originalInput, ['context', 'connect', 'id'])
    } else if (operation === 'update') {
        if (!itemId) return false
        const itemWithContext = await getById(listKey, itemId)
        contextId = get(itemWithContext, ['context'])
        if (!contextId) return false
    }

    const organizationContext = await getById('BillingIntegrationOrganizationContext', contextId)
    if (!organizationContext) return false

    const { integration: integrationId } = organizationContext

    return await checkBillingIntegrationsAccessRights(user.id, [integrationId])
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadBillingRecipients,
    canManageBillingRecipients,
}
