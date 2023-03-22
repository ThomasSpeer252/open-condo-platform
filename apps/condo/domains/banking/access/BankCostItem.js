/**
 * Generated by `createschema banking.BankCostItem 'name:Text;category:Relationship:BankCategory:SET_NULL'`
 */

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')


async function canReadBankCostItems ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin) return {}

    return {}
}

async function canManageBankCostItems ({ authentication: { item: user } }) {
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
    canReadBankCostItems,
    canManageBankCostItems,
}
