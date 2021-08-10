/**
 * Generated by `createservice billing.BillingReceiptsService --type queries`
 */

const { ServiceConsumer, Resident } = require('@condo/domains/resident/utils/serverSchema')

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')

async function canGetBillingReceiptsForServiceConsumerService (args) {
    const { context, authentication: { item: user }, args: { data: { serviceConsumerId: serviceConsumerId } } } = args
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true

    const [serviceConsumer] = await ServiceConsumer.getAll(context, { id: serviceConsumerId })
    if (!serviceConsumer) {
        return false
    }

    const [resident] = await Resident.getAll(context, { id: serviceConsumer.resident.id } )
    return !!(resident && resident.user.id === user.id)
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canGetBillingReceiptsForServiceConsumerService,
}