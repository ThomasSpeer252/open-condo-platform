/**
 * Generated by `createservice ticket.UpdateResidentTicketService --type mutations`
 */
const { Ticket } = require('../utils/serverSchema')
const { GQLCustomSchema } = require('@core/keystone/schema')
const access = require('@condo/domains/ticket/access/UpdateResidentTicketService')
const { NOT_FOUND_ERROR } = require('@condo/domains/common/constants/errors')
const { get } = require('lodash')

const UpdateResidentTicketService = new GQLCustomSchema('UpdateResidentTicketService', {
    types: [
        {
            access: true,
            type: 'input ResidentTicketUpdateInput { dv: Int!, sender: SenderFieldInput!, details: String }',
        },
    ],
    
    mutations: [
        {
            access: access.canUpdateResidentTicket,
            schema: 'updateResidentTicket(id: ID, data: ResidentTicketUpdateInput): ResidentTicketOutput',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { id: ticketId, data } = args
                const { dv: newTicketDv, sender: newTicketSender, details } = data
                const user = get(context, ['req', 'user'])

                if (!user.isAdmin) {
                    const [residentTicket] = await Ticket.getAll(context, { id: ticketId, client: { id: user.id } })
                    if (!residentTicket) throw Error(`${NOT_FOUND_ERROR}ticket] no ticket was found with this id for this user`)
                }

                return await Ticket.update(context, ticketId, {
                    dv: newTicketDv,
                    sender: newTicketSender,
                    details,
                })
            },
        },
    ],
    
})

module.exports = {
    UpdateResidentTicketService,
}
