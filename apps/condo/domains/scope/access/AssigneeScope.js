/**
 * Generated by `createschema scope.AssigneeScope 'user:Relationship:User:CASCADE; ticket:Relationship:Ticket:CASCADE;'`
 */

const { throwAuthenticationError } = require('@condo/keystone/apolloErrorFormatter')

async function canReadAssigneeScopes ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin) return {}

    return { user: { id: user.id } }
}

async function canManageAssigneeScopes ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadAssigneeScopes,
    canManageAssigneeScopes,
}
