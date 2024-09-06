/**
 * Generated by `createservice acquiring.CalculateFeeForReceiptService --type queries`
 */
const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

const { RESIDENT } = require('@condo/domains/user/constants/common')

async function canCalculateFeeForReceipt ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    return user.isAdmin || user.isSupport || user.type === RESIDENT
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canCalculateFeeForReceipt,
}