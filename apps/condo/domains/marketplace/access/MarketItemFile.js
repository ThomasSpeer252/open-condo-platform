/**
 * Generated by `createschema marketplace.MarketItemFile 'marketItem:Relationship:MarketItem:CASCADE; file:File;'`
 */

const { get, uniq, compact } = require('lodash')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getById, find } = require('@open-condo/keystone/schema')

const { checkPermissionInUserOrganizationOrRelatedOrganization, queryOrganizationEmployeeFor, queryOrganizationEmployeeFromRelatedOrganizationFor } = require('@condo/domains/organization/utils/accessSchema')
const { RESIDENT } = require('@condo/domains/user/constants/common')
const { STAFF } = require('@condo/domains/user/constants/common')

async function canReadMarketItemFiles ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return {}
    if (user.type === RESIDENT) {
        // TODO (DOMA-7503) use PriceScope to check access
        const userResidents = await find('Resident', { user: { id: user.id }, deletedAt: null })
        if (!userResidents.length) return false
        const residentOrganizationsIds = compact(userResidents.map(resident => get(resident, 'organization')))
        const residentsIds = userResidents.map(resident => resident.id)
        const userServiceConsumers = await find('ServiceConsumer', {
            resident: { id_in: residentsIds },
            deletedAt: null,
        })
        const serviceConsumerOrganizationIds = userServiceConsumers.map(sc => sc.organization)
        const organizationIds = [...residentOrganizationsIds, ...serviceConsumerOrganizationIds]
        if (organizationIds.length) {
            return {
                marketItem: {
                    organization: { id_in: uniq(organizationIds) },
                },
            }
        }
        return false
    }

    return {
        marketItem: {
            organization: {
                OR: [
                    queryOrganizationEmployeeFor(user.id, 'canReadMarketItems'),
                    queryOrganizationEmployeeFromRelatedOrganizationFor(user.id, 'canReadMarketItems'),
                ],
                deletedAt: null,
            },
        },
    }
}

async function canManageMarketItemFiles ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    if (user.type === RESIDENT) return false

    if (user.type === STAFF) {
        let marketItem
        if (operation === 'create') {
            const marketItemId = get(originalInput, ['marketItem', 'connect', 'id'], null)
            if (marketItemId) {
                marketItem = await getById('MarketItem', marketItemId)
            }
        } else if (operation === 'update') {
            const marketItemFile = await getById('MarketItemFile', itemId)
            if (marketItemFile) {
                marketItem = await getById('MarketItem', marketItemFile.marketItem)
            }
        }

        const organizationId = get(marketItem, 'organization', null)
        if (!organizationId) return false

        return await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, organizationId, 'canManageMarketItems')
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadMarketItemFiles,
    canManageMarketItemFiles,
}
