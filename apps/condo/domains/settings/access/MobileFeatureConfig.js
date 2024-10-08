/**
 * Generated by `createschema settings.MobileFeatureConfig 'organization:Relationship:Organization:CASCADE; emergencyPhone:Text; commonPhone:Text; onlyGreaterThanPreviousMeterReadingIsEnabled:Checkbox; meta:Json; ticketSubmittingIsEnabled:Checkbox'`
 */

const get = require('lodash/get')
const uniq = require('lodash/uniq')

const { throwAuthenticationError } = require('@open-condo/keystone/apolloErrorFormatter')
const { getById } = require('@open-condo/keystone/schema')

const {
    getEmployedOrRelatedOrganizationsByPermissions,
    checkPermissionsInEmployedOrRelatedOrganizations,
} = require('@condo/domains/organization/utils/accessSchema')
const { getUserResidents, getUserServiceConsumers } = require('@condo/domains/resident/utils/accessSchema')
const { RESIDENT } = require('@condo/domains/user/constants/common')

async function canReadMobileFeatureConfigs ({ authentication: { item: user }, context }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin || user.isSupport) return {}

    if (user.type === RESIDENT) {
        // NOTE: We're currently not sure, how to read organization-related models
        // (like MobileFeatureConfig / Organization / MeterReportingPeriod and etc) for service providers
        // We have 2 have of doing it:
        // 1. Match by addressKey of resident and addressKey of some org Property
        // 2. Match by ServiceConsumer.Organization
        // Currently temporary decided to go with option, since it fit well in Meter / Billing domains,
        // but we might switch to first one after thinking about news / ticket domain.
        // (or improve consumers logic to cover these domains as well)
        // TODO(pahaz): Figure out from stakeholders the correct approach
        const residents = await getUserResidents(context, user)
        const consumers = await getUserServiceConsumers(context, user)

        // NOTE: used to keep non-consumer domains alive (like tickets)
        const managingCompanies = residents.map(resident => resident.organization).filter(Boolean)
        const consumerCompanies = consumers.map(consumer => consumer.organization).filter(Boolean)

        const organizationIds = uniq([...managingCompanies, ...consumerCompanies])

        return {
            organization: {
                id_in: organizationIds,
                deletedAt: null,
            },
            deletedAt: null,
        }
    }

    const permittedOrganizations = await getEmployedOrRelatedOrganizationsByPermissions(context, user, [])

    return {
        organization: {
            id_in: permittedOrganizations,
        },
    }
}

async function canManageMobileFeatureConfigs (attrs) {
    const { authentication: { item: user }, originalInput, operation, itemId, context } = attrs
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.type === RESIDENT) return false
    if (user.isAdmin || user.isSupport) return true

    let organizationId
    if (operation === 'create') {
        organizationId = get(originalInput, 'organization.connect.id')
    }
    if ( operation === 'update') {
        if (!itemId) return false

        const foundConfig = await getById('MobileFeatureConfig', itemId)
        if (!foundConfig) return false

        organizationId = get(foundConfig, 'organization')
    }

    if (!organizationId) return false

    return await checkPermissionsInEmployedOrRelatedOrganizations(context, user, organizationId, 'canManageMobileFeatureConfigs')
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadMobileFeatureConfigs,
    canManageMobileFeatureConfigs,
}

