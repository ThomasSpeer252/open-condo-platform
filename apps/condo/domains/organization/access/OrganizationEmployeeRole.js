/**
 * Generated by `createschema organization.OrganizationEmployeeRole 'organization:Relationship:Organization:CASCADE; user:Relationship:User:SET_NULL; name:Text; statusTransitions:Json; canManageOrganization:Checkbox; canManageEmployees:Checkbox; canManageRoles:Checkbox; canManageIntegrations:Checkbox; canManageProperties:Checkbox; canManageTickets:Checkbox;' --force`
 */
const get = require('lodash/get')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getByCondition, getById } = require('@open-condo/keystone/schema')

const { queryOrganizationEmployeeFromRelatedOrganizationFor } = require('@condo/domains/organization/utils/accessSchema')
const { queryOrganizationEmployeeFor } = require('@condo/domains/organization/utils/accessSchema')


async function canReadOrganizationEmployeeRoles ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isSupport || user.isAdmin) return {}

    return {
        organization: {
            OR: [
                queryOrganizationEmployeeFor(user.id),
                queryOrganizationEmployeeFromRelatedOrganizationFor(user.id),
            ],
        },
    }
}

async function canManageOrganizationEmployeeRoles ({ authentication: { item: user }, operation, originalInput }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    if (operation === 'create') {
        const organizationId = get(originalInput, ['organization', 'connect', 'id'])

        // `GraphQLWhere` type cannot be used in case of `create` operation,
        // because we will get an error:
        // > Expected a Boolean for OrganizationEmployeeRole.access.create(), but got Object
        // In https://www.keystonejs.com/api/access-control#list-level-access-control it states:
        // > For `create` operations, an `AccessDeniedError` is returned if the operation is set to / returns `false`
        // Actually, here we repeating the same logic, as declared for another operations
        const userEmployee = await getByCondition('OrganizationEmployee', {
            organization: { id: organizationId },
            user: { id: user.id },
            deletedAt: null,
            isBlocked: false,
        })
        if (!userEmployee) return false

        const employeeRole = await getById('OrganizationEmployeeRole', userEmployee.role)
        if (!employeeRole) return false

        return employeeRole.canManageRoles
    }

    return {
        organization: { employees_some: { user: { id: user.id }, role: { canManageRoles: true }, isBlocked: false } },
    }
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadOrganizationEmployeeRoles,
    canManageOrganizationEmployeeRoles,
}
