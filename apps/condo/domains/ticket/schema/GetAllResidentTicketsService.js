/**
 * Generated by `createservice ticket.GetAllResidentTicketsService --type queries`
 */
const { Ticket } = require('../utils/serverSchema')
const { GQLCustomSchema } = require('@core/keystone/schema')
const access = require('@condo/domains/ticket/access/GetAllResidentTicketsService')
const { generateQuerySortBy } = require('@condo/domains/common/utils/codegeneration/generate.gql')
const { generateQueryWhereInput } = require('@condo/domains/common/utils/codegeneration/generate.gql')
const { get } = require('lodash')

const fieldsObj = {
    id: 'ID',
    number: 'Int',
    property: 'Property',
    unitName: 'String',
    status: 'TicketStatus',
    source: 'TicketSource',
    classifier: 'TicketClassifier',
    isEmergency: 'Boolean',
    isWarranty: 'Boolean',
    isPaid: 'Boolean',
    details: 'String',
    createdAt: 'String',
    updatedAt: 'String',
}

const GetAllResidentTicketsService = new GQLCustomSchema('GetAllResidentTicketsService', {
    types: [
        {
            access: true,
            type: generateQueryWhereInput('ResidentTicket', fieldsObj),
        },
        {
            access: true,
            type: generateQuerySortBy('ResidentTicket', Object.keys(fieldsObj)),
        },
    ],
    queries: [
        {
            access: access.canGetAllResidentTickets,
            schema: 'allResidentTickets(where: ResidentTicketWhereInput, first: Int, skip: Int, sortBy: [SortResidentTicketsBy!]): [ResidentTicketOutput]',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { where, first, skip, sortBy } = args
                const user = get(context, ['req', 'user'])
                const userId = get(user, 'id')

                // admin can read all resident tickets
                const ticketsQuery = user.isAdmin ? { ...where } : { ...where, client: { id: userId } }

                return await Ticket.getAll(context, ticketsQuery, {
                    sortBy,
                    first,
                    skip,
                })
            },
        },
    ],
})

module.exports = {
    GetAllResidentTicketsService,
}