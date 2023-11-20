/**
 * Generated by `createservice acquiring.RegisterMultiPaymentForInvoicesService '--type=mutations' 'invoices:[InvoiceWhereUniqueInput!]!'`
 */
const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')

async function canRegisterMultiPaymentForInvoices ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    return user.isAdmin
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canRegisterMultiPaymentForInvoices,
}
