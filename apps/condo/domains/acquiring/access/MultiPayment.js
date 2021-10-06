/**
 * Generated by `createschema acquiring.MultiPayment 'amount:Decimal; commission?:Decimal; time:DateTimeUtc; cardNumber:Text; serviceCategory:Text;'`
 */

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { Resident } = require('@condo/domains/resident/utils/serverSchema')
const { RESIDENT } = require('@condo/domains/user/constants/common')
const { AcquiringIntegration } = require('@condo/domains/acquiring/utils/serverSchema')
const { getById } = require('@core/keystone/schema')
const get = require('lodash/get')


async function canReadMultiPayments ({ authentication: { item: user }, context }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin || user.isSupport) return {}
    const userId = user.id
    // Resident can get only it's own MultiPayments
    if (user.type === RESIDENT) {
        const residents = await Resident.getAll(context, { user: { id: userId } })
        const resident_ids = residents.map(resident => resident.id)
        return {
            resident: { id_in: resident_ids },
        }
    }
    // Acquiring integration account can get only MultiPayments linked to this integration
    return {
        integration: { accessRights_some: { user: { id: userId } } },
    }
}

async function canManageMultiPayments ({ authentication: { item: user }, operation, itemId, context }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true
    // Can be created only through custom mutation or by admin, can be modified by acquiring integration account
    if (operation === 'create') {
        return false
    } else if (operation === 'update') {
        if (!itemId) return
        const availableIntegrations = await AcquiringIntegration.getAll(context, {
            accessRights_some: { user: { id: user.id } },
        })
        const availableIntegrationsIds = availableIntegrations.map(integration => integration.id)
        const multiPayment = await getById('MultiPayment', itemId)
        const integrationId = get(multiPayment, ['integration'])
        if (availableIntegrationsIds.includes(integrationId)) return true
    }
    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadMultiPayments,
    canManageMultiPayments,
}
