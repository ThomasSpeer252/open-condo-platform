/**
 * Generated by `createschema organization.Organization 'country:Select:ru,en; name:Text; description?:Text; avatar?:File; meta:Json; employees:Relationship:OrganizationEmployee:CASCADE; statusTransitions:Json; defaultEmployeeRoleStatusTransitions:Json' --force`
 */
const { get, uniq, compact } = require('lodash')

const access = require('@open-condo/keystone/access')
const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { find } = require('@open-condo/keystone/schema')

const { canReadObjectsAsB2BAppServiceUser } = require('@condo/domains/miniapp/utils/b2bAppServiceUserAccess')
const {
    getEmployedOrRelatedOrganizationsByPermissions,
    getInvitedOrganizations,
} = require('@condo/domains/organization/utils/accessSchema')
const { getUserResidents, getUserServiceConsumers } = require('@condo/domains/resident/utils/accessSchema')
const { RESIDENT, SERVICE } = require('@condo/domains/user/constants/common')
const { canDirectlyReadSchemaObjects, canDirectlyManageSchemaObjects } = require('@condo/domains/user/utils/directAccess')


async function canReadOrganizations (args) {
    const { authentication: { item: user }, listKey, context } = args

    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isSupport || user.isAdmin) return {}
    const hasDirectAccess = await canDirectlyReadSchemaObjects(user, listKey)
    if (hasDirectAccess) return true

    if (user.type === RESIDENT) {
        const userResidents = await getUserResidents(context, user)
        if (!userResidents.length) return false
        const residentOrganizations = compact(userResidents.map(resident => get(resident, 'organization')))
        const userServiceConsumers = await getUserServiceConsumers(context, user)
        const serviceConsumerOrganizations = userServiceConsumers.map(sc => sc.organization)
        const organizations = [...residentOrganizations, ...serviceConsumerOrganizations]
        if (organizations.length) {
            return {
                id_in: uniq(organizations),
            }
        }
        return false
    }

    const permittedOrganizations = await getEmployedOrRelatedOrganizationsByPermissions(context, user, [])
    // NOTE: Must be fast because of request context
    const invitedOrganizations = await getInvitedOrganizations(context, user)

    const accessConditions = [
        { id_in: permittedOrganizations },
        { id_in: invitedOrganizations },
    ]

    if (user.type === SERVICE) {
        // canReadObjectsAsB2BAppServiceUser may be return false or object (filter)
        const accessFilterForB2BAppServiceUser = await canReadObjectsAsB2BAppServiceUser(args)

        const billingContexts = await find('BillingIntegrationOrganizationContext', {
            integration: {
                accessRights_some: { user: { id: user.id }, deletedAt: null },
            },
            deletedAt: null,
        })
        const acquiringContexts = await find('AcquiringIntegrationContext', {
            integration: {
                accessRights_some: { user: { id: user.id }, deletedAt: null },
            },
            deletedAt: null,
        })
        const bankIntegrationOrganizationContext = await find('BankIntegrationOrganizationContext', {
            integration: {
                accessRights_some: {
                    user: { id: user.id },
                    deletedAt: null,
                },
                deletedAt: null,
            },
            deletedAt: null,
        })

        const serviceOrganizationIds = uniq(billingContexts
            .map(({ organization }) => organization )
            .concat(acquiringContexts.map(({ organization }) => organization )))
            .concat(bankIntegrationOrganizationContext.map(({ organization }) => organization))
            .concat(get(accessFilterForB2BAppServiceUser, 'id_in', []) || [])
        if (serviceOrganizationIds.length) {
            accessConditions.push({ id_in: serviceOrganizationIds })
        }
    }
    return { OR: accessConditions }
}

async function canManageOrganizations ({ authentication: { item: user }, operation, listKey, originalInput }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    // You should use "registerNewOrganization"
    if (operation === 'create') return false
    if (user.isSupport) return true

    const hasDirectAccess = await canDirectlyManageSchemaObjects(user, listKey, originalInput, operation)
    if (hasDirectAccess) return true

    // NOTE: The "isApproved" field can only be managed by the admin, support, users with special rights.
    if ('isApproved' in originalInput) return false

    // user is inside employee list and is not blocked
    return {
        employees_some: { user: { id: user.id }, role: { canManageOrganization: true }, isBlocked: false, deletedAt: null },
    }
}

const canAccessToImportField = {
    read: access.userIsNotResidentUser,
    create: access.userIsAdmin,
    update: access.userIsAdmin,
}

const canAccessOnlyAdminField = {
    read: access.userIsAdmin,
    create: access.userIsAdmin,
    update: access.userIsAdmin,
}

const canAccessTinField = {
    read: true,
    create: access.userIsNotResidentUser,
    update: access.userIsAdmin,
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadOrganizations,
    canManageOrganizations,
    canAccessToImportField,
    canAccessOnlyAdminField,
    canAccessTinField,
}
