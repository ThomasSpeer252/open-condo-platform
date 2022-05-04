// @ts-nocheck
/**
 * Generated by `createschema ticket.TicketCommentsTime 'organization:Relationship:Organization:CASCADE; ticket:Relationship:Ticket:CASCADE; lastCommentAt:DateTimeUtc; lastResidentCommentAt:DateTimeUtc;'`
 */

const get = require('lodash/get')

const { getById, getByCondition } = require('@core/keystone/schema')

const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')
const { queryOrganizationEmployeeFor, queryOrganizationEmployeeFromRelatedOrganizationFor } = require('@condo/domains/organization/utils/accessSchema')
const { RESIDENT } = require('@condo/domains/user/constants/common')

async function canReadTicketCommentsTimes ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false

    if (user.isAdmin || user.isSupport) return {}

    if (user.type === RESIDENT) {
        return { ticket: { client: { id: user.id }, canReadByResident: true } }
    }

    return {
        organization: {
            OR: [
                queryOrganizationEmployeeFor(user.id),
                queryOrganizationEmployeeFromRelatedOrganizationFor(user.id),
            ],
        },
    }
}

async function canManageTicketCommentsTimes ({ authentication: { item: user }, originalInput, operation, itemId }) {
    if (!user) return throwAuthenticationError()
    if (user.deletedAt) return false
    if (user.isAdmin) return true

    if (user.type !== RESIDENT) {
        let organizationId

        if (operation === 'create') {
            organizationId = get(originalInput, ['connect', 'organization'])
            const ticketId = get(originalInput, ['connect', 'ticket'])
            const ticket = getById('Ticket', ticketId)

            if (!ticket || ticket.organization !== organizationId) return false
        }

        if (operation === 'update' && itemId) {
            const ticketCommentsTime = getById('TicketCommentsTime', itemId)
            if (!ticketCommentsTime) return false

            organizationId = get(ticketCommentsTime, 'organization')
        }

        const organizationEmployee = await getByCondition('OrganizationEmployee', {
            organization: {
                id: organizationId,
                OR: [
                    queryOrganizationEmployeeFor(user.id),
                    queryOrganizationEmployeeFromRelatedOrganizationFor(user.id),
                ],
            },
            user: { id: user.id },
        })

        if (organizationEmployee) return true
    }

    if (user.type === RESIDENT) {
        let organizationId
        organizationId = get(originalInput, ['connect', 'organization'])
        const ticketId = get(originalInput, ['connect', 'ticket'])
        const ticket = getById('Ticket', ticketId)

        if (!ticket || ticket.organization !== organizationId) return false

        return ticket.client === user.id
    }
}

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadTicketCommentsTimes,
    canManageTicketCommentsTimes,
}
