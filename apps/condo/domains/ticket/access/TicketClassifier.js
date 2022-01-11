/**
 * Generated by `createschema ticket.TicketClassifier 'organization?:Relationship:Organization:CASCADE;name:Text;parent?:Relationship:TicketClassifier:PROTECT;'`
 */

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { USER_SCHEMA_NAME } = require('@condo/domains/common/constants/utils')

async function canReadTicketClassifiers ({ authentication: { item, listKey } }) {
    if (!listKey || !item) return throwAuthenticationError()
    if (item.deletedAt) return false

    if (listKey === USER_SCHEMA_NAME) {
        return {}
    }

    return false
}

async function canManageTicketClassifiers ({ authentication: { item, listKey } }) {
    if (!listKey || !item) return throwAuthenticationError()
    if (item.deletedAt) return false

    if (listKey === USER_SCHEMA_NAME) {
        return !!(item.isSupport || item.isAdmin)
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTicketClassifiers,
    canManageTicketClassifiers,
}
