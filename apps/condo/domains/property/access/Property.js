/**
 * Generated by `createschema property.Property 'organization:Text; name:Text; address:Text; addressMeta:Json; type:Select:building,village; map?:Json'`
 */
const get = require('lodash/get')
const uniq = require('lodash/uniq')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getById, find } = require('@open-condo/keystone/schema')

const {
    canManageObjectsAsB2BAppServiceUser,
    canReadObjectsAsB2BAppServiceUser,
} = require('@condo/domains/miniapp/utils/b2bAppServiceUserAccess')
const {
    checkPermissionsInEmployedOrganizations,
    getEmployedOrRelatedOrganizationsByPermissions,
} = require('@condo/domains/organization/utils/accessSchema')
const { RESIDENT, SERVICE } = require('@condo/domains/user/constants/common')


async function canReadProperties (args) {
    const { authentication: { item: user }, context } = args

    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isSupport || user.isAdmin) return {}

    if (user.type === RESIDENT) {
        const residents = await find('Resident', { user: { id: user.id }, deletedAt: null })
        const addressKeys = residents.map(resident => resident.addressKey).filter(Boolean)

        return {
            addressKey_in: uniq(addressKeys),
        }
    }

    if (user.type === SERVICE) {
        return await canReadObjectsAsB2BAppServiceUser(args)
    }

    const permittedOrganizations = await getEmployedOrRelatedOrganizationsByPermissions(context, user, 'canReadProperties')

    return {
        organization: {
            id_in: permittedOrganizations,
        },
    }
}

async function canManageProperties (args) {
    const { authentication: { item: user }, originalInput, operation, itemId, context } = args

    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin || user.isSupport) return true

    if (user.type === SERVICE) {
        return await canManageObjectsAsB2BAppServiceUser(args)
    }

    if (operation === 'create') {
        const organizationId = get(originalInput, ['organization', 'connect', 'id'])
        if (!organizationId) return false

        return await checkPermissionsInEmployedOrganizations(context, user, organizationId, 'canManageProperties')
    } else if (operation === 'update' && itemId) {
        const property = await getById('Property', itemId)
        if (!property) return false
        const { organization: organizationId } = property

        if (!organizationId) return false

        return await checkPermissionsInEmployedOrganizations(context, user, organizationId, 'canManageProperties')
    }

    return false
}

async function canManageIsApprovedField ({ authentication: { item: user }, originalInput }) {
    if (user.isAdmin || user.isSupport) return true

    // If user is not support, then he only can drop isApproved field
    if (!get(originalInput, 'isApproved')) {
        return true
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadProperties,
    canManageProperties,
    canManageIsApprovedField,
}