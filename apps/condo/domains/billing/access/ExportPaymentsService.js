/**
 * Generated by `createservice billing.ExportPaymentsService`
 */
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const get = require('lodash/get')
const { checkOrganizationPermission } = require('@condo/domains/organization/utils/accessSchema')
const { find } = require('@core/keystone/schema')
const { checkRelatedOrganizationPermission } = require('../../organization/utils/accessSchema')

async function canExportPaymentsToExcel ({ args: { data: { where } }, authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    const permissionToCheck = 'canReadPayments'

    const organizationId = get(where, ['organization', 'id'])
    if (organizationId) {
        return await checkOrganizationPermission(user.id, organizationId, permissionToCheck)
    }

    const organizationWhere = get(where, 'organization')
    if (!organizationWhere) {
        return false
    }

    const [organization] = await find('Organization', organizationWhere)
    if (!organization) {
        return false
    }

    return await checkRelatedOrganizationPermission(user.id, organization.id, permissionToCheck)
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canExportPaymentsToExcel,
}