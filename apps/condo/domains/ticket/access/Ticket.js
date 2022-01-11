/**
 * Generated by `createschema ticket.Ticket organization:Text; statusReopenedCounter:Integer; statusReason?:Text; status:Relationship:TicketStatus:PROTECT; number?:Integer; client?:Relationship:User:SET_NULL; clientName:Text; clientEmail:Text; clientPhone:Text; operator:Relationship:User:SET_NULL; assignee?:Relationship:User:SET_NULL; classifier:Relationship:TicketClassifier:PROTECT; details:Text; meta?:Json;`
 */

const get = require('lodash/get')
const uniq = require('lodash/uniq')
const compact = require('lodash/compact')
const omit = require('lodash/omit')
const isEmpty = require('lodash/isEmpty')
const { queryOrganizationEmployeeFromRelatedOrganizationFor } = require('@condo/domains/organization/utils/accessSchema')
const { queryOrganizationEmployeeFor } = require('@condo/domains/organization/utils/accessSchema')
const { checkPermissionInUserOrganizationOrRelatedOrganization } = require('@condo/domains/organization/utils/accessSchema')
const { getById, find } = require('@core/keystone/schema')
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { USER_SCHEMA_NAME } = require('@condo/domains/common/constants/utils')
const { RESIDENT, STAFF } = require('@condo/domains/user/constants/common')

async function canReadTickets ({ authentication: { item, listKey } }) {
    if (!listKey || !item) return throwAuthenticationError()
    if (item.deletedAt) return false

    if (listKey === USER_SCHEMA_NAME) {
        if (item.isSupport || item.isAdmin) return {}
        const userId = item.id
        if (item.type === RESIDENT) {
            const residents = await find('Resident', { user: { id: userId }, deletedAt: null })
            const organizationsIds = compact(residents.map(resident => get(resident, 'organization')))

            return {
                organization: {
                    id_in: uniq(organizationsIds),
                    deletedAt: null,
                },
                createdBy: { id: userId },
                deletedAt: null,
            }
        }

        return {
            organization: {
                OR: [
                    queryOrganizationEmployeeFor(userId),
                    queryOrganizationEmployeeFromRelatedOrganizationFor(userId),
                ],
                deletedAt: null,
            },
        }
    }

    return false
}

async function canManageTickets ({ authentication: { item, listKey }, operation, itemId, originalInput }) {
    if (!listKey || !item) return throwAuthenticationError()
    if (item.deletedAt) return false

    if (listKey === USER_SCHEMA_NAME) {
        if (item.isAdmin) return true
        const userId = item.id
        if (item.type === RESIDENT) {
            let unitName
            let propertyId

            if (operation === 'create') {
                unitName = get(originalInput, 'unitName', null)
                propertyId = get(originalInput, ['property', 'connect', 'id'])
            } else if (operation === 'update') {
                if (!itemId) return false

                const inaccessibleUpdatedFields = omit(originalInput, ['dv', 'sender', 'details'])
                if (!isEmpty(inaccessibleUpdatedFields)) return false

                const ticket = await getById('Ticket', itemId)
                if (!ticket) return false
                if (ticket.createdBy !== userId) return false
                propertyId = get(ticket, 'property', null)
                unitName = get(ticket, 'unitName', null)
            }

            if (!unitName || !propertyId) return false

            const residents = await find('Resident', {
                user: { id: userId },
                property: { id: propertyId, deletedAt: null },
                unitName,
                deletedAt: null,
            })

            return residents.length > 0
        }
        if (item.type === STAFF) {
            let organizationId

            if (operation === 'create') {
                organizationId = get(originalInput, ['organization', 'connect', 'id'])
            } else if (operation === 'update') {
                if (!itemId) return false
                const ticket = await getById('Ticket', itemId)
                organizationId = get(ticket, 'organization', null)
            }

            const permission = await checkPermissionInUserOrganizationOrRelatedOrganization(userId, organizationId, 'canManageTickets')
            if (!permission) return false

            const propertyId = get(originalInput, ['property', 'connect', 'id'], null)
            if (propertyId) {
                const property = await getById('Property', propertyId)
                if (!property) return false

                return organizationId === get(property, 'organization')
            }

            return true
        }

        return false
    }

    return false
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTickets,
    canManageTickets,
}
