/**
 * Generated by `createschema billing.BillingMeterResource 'name:Text'`
 */

const { get } = require('lodash')
const { getById } = require('@core/keystone/schema')
const { checkBillingIntegrationAccessRight } = require('@condo/domains/billing/utils/accessSchema')
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { USER_SCHEMA_NAME } = require('@condo/domains/common/constants/utils')

async function canReadBillingMeterResources ({ authentication: { item, listKey } }) {
    if (!listKey || !item) return throwAuthenticationError()
    if (item.deletedAt) return false

    return {}
}

async function canManageBillingMeterResources ({ authentication: { item, listKey }, originalInput, operation, itemId  }) {
    if (!listKey || !item) return throwAuthenticationError()
    if (item.deletedAt) return false

    if (listKey === USER_SCHEMA_NAME) {
        if (item.isSupport || item.isAdmin) return true

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

        return await checkBillingIntegrationAccessRight(item.id, integrationId)
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadBillingMeterResources,
    canManageBillingMeterResources,
}
