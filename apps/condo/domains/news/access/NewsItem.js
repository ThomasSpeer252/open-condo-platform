/**
 * Generated by `createschema news.OrganizationNewsItem 'organization:Relationship:Organization:CASCADE; title:Text; body:Text; type:Select:common,emergency'`
 */

const { compact, get, isEmpty, uniq } = require('lodash')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { find, getById } = require('@open-condo/keystone/schema')

const { queryFindNewsItemsScopesByResidents } = require('@condo/domains/news/utils/accessSchema')
const {
    queryOrganizationEmployeeFor,
    queryOrganizationEmployeeFromRelatedOrganizationFor,
    checkPermissionInUserOrganizationOrRelatedOrganization,
} = require('@condo/domains/organization/utils/accessSchema')
const { RESIDENT } = require('@condo/domains/user/constants/common')

async function canReadNewsItems ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin || user.isSupport) return {}

    if (user.type === RESIDENT) {
        const residents = await find('Resident', { user: { id: user.id }, deletedAt: null })

        if (isEmpty(residents)) return false

        const scopesConditions = queryFindNewsItemsScopesByResidents(residents)
        const newsItemsScopes = await find('NewsItemScope', scopesConditions)
        const scopedNewsItemsIds = uniq(compact(newsItemsScopes.map((newsItemScope) => get(newsItemScope, 'newsItem'))))

        const organizationsIds = uniq(compact(residents.map((resident) => get(resident, 'organization'))))

        return {
            id_in: scopedNewsItemsIds,
            organization: { id_in: organizationsIds },
        }
    }

    // access for stuff
    return {
        organization: {
            OR: [
                queryOrganizationEmployeeFor(user.id),
                queryOrganizationEmployeeFromRelatedOrganizationFor(user.id),
            ],
            deletedAt: null,
        },
    }
}

async function canManageNewsItems ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true
    if (user.type === RESIDENT) return false

    let organizationId

    if (operation === 'create') {
        organizationId = get(originalInput, ['organization', 'connect', 'id'])
    } else if (operation === 'update') {
        if (!itemId) return false
        const newsItem = await getById('NewsItem', itemId)
        organizationId = get(newsItem, 'organization', null)
    }

    if (!organizationId) return false

    return await checkPermissionInUserOrganizationOrRelatedOrganization(user.id, organizationId, 'canManageNewsItems')
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadNewsItems,
    canManageNewsItems,
}
