/**
 * Generated by `createschema billing.BillingOrganization 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; tin:Text; iec:Text; bic:Text; checkNumber:Text;'`
 */

const { canManageBillingEntityWithContext, canReadBillingEntity } = require('../utils/accessSchema')

async function canReadBillingOrganizations ({ authentication }) {
    return await canReadBillingEntity(authentication)
}

async function canManageBillingOrganizations ({ authentication, originalInput, operation, itemId, listKey }) {
    return await canManageBillingEntityWithContext({
        authentication,
        operation,
        itemId,
        originalInput,
        schemaWithContextName: listKey,
    })
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadBillingOrganizations,
    canManageBillingOrganizations,
}
