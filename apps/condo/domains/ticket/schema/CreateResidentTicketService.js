/**
 * Generated by `createservice ticket.CreateResidentTicketService --type mutations`
 */
const { Contact } = require('@condo/domains/contact/utils/serverSchema')
const { Property } = require('@condo/domains/property/utils/serverSchema')
const { Ticket, TicketSource } = require('@condo/domains/ticket/utils/serverSchema')
const { GQLCustomSchema } = require('@core/keystone/schema')
const access = require('@condo/domains/ticket/access/CreateResidentTicketService')
const { getSectionAndFloorByUnitName } = require('@condo/domains/ticket/utils/unit')
const { get } = require('lodash')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@core/keystone/errors')
const { NOT_FOUND } = require('@condo/domains/common/constants/errors')

const errors = {
    PROPERTY_NOT_FOUND: {
        mutation: 'createResidentTicket',
        variable: ['data', 'property'],
        code: BAD_USER_INPUT,
        type: NOT_FOUND,
        message: 'Cannot find Property by specified id',
    },
    TICKET_SOURCE_NOT_FOUND: {
        mutation: 'createResidentTicket',
        variable: ['data', 'source'],
        code: BAD_USER_INPUT,
        type: NOT_FOUND,
        message: 'Cannot find TicketSource by specified id',
    },
}

const CreateResidentTicketService = new GQLCustomSchema('CreateResidentTicketService', {
    types: [
        {
            access: true,
            type:
                'input ResidentTicketCreateInput { dv: Int!, sender: SenderFieldInput!, details: String!,' +
                'source: TicketSourceRelateToOneInput!, property: PropertyRelateToOneInput!, unitName: String,' +
                'placeClassifier: TicketPlaceClassifierRelateToOneInput, categoryClassifier: TicketCategoryClassifierRelateToOneInput,' +
                'problemClassifier: TicketProblemClassifierRelateToOneInput, classifier: TicketClassifierRuleRelateToOneInput }',
        },
        {
            access: true,
            type:
                'type ResidentTicketOutput { organization: Organization!, property: Property!, unitName: String,' +
                'sectionName: String, floorName: String, number: Int!, client: User, clientName: String,' +
                'clientEmail: String, clientPhone: String, details: String!, related: Ticket, isEmergency: Boolean, isWarranty: Boolean, status: TicketStatus!' +
                'isPaid: Boolean, source: TicketSource!, id: ID!, createdAt: String, updatedAt: String,' +
                'placeClassifier: TicketPlaceClassifier, problemClassifier: TicketProblemClassifier, classifier: TicketClassifierRule,' +
                'categoryClassifier: TicketCategoryClassifier, dv: Int, sender: SenderField, v: Int, deletedAt: String, newId: String }',
        },
    ],

    mutations: [
        {
            access: access.canCreateResidentTicket,
            schema: 'createResidentTicket(data: ResidentTicketCreateInput): ResidentTicketOutput',
            doc: {
                summary: 'Creates a new ticket for resident',
                description: 'Corresponding resident, to create the ticket for, is fetched from current logged in user',
                errors,
            },
            resolver: async (parent, args, context, info, extra = {}) => {
                const { data } = args
                const { dv: newTicketDv, sender: newTicketSender, details, source: SourceRelateToOneInput, property: PropertyRelateToOneInput, unitName } = data

                const { connect: { id: propertyId } } = PropertyRelateToOneInput
                const [property] = await Property.getAll(context, { id: propertyId })
                if (!property) throw new GQLError(errors.PROPERTY_NOT_FOUND, context)

                const { connect: { id: sourceId } } = SourceRelateToOneInput
                const [source] = await TicketSource.getAll(context, { id: sourceId })
                if (!source) throw new GQLError(errors.TICKET_SOURCE_NOT_FOUND, context)

                const organizationId = get(property, ['organization', 'id'])
                const { sectionName, floorName } = getSectionAndFloorByUnitName(property, unitName)

                const user = get(context, ['req', 'user'])

                const [contact] = await Contact.getAll(context, {
                    phone: user.phone, organization: { id: organizationId }, property: { id: propertyId },
                })
                if (!contact) {
                    await Contact.create(context, {
                        dv: newTicketDv,
                        sender: newTicketSender,
                        organization: { connect: { id: organizationId } },
                        property: PropertyRelateToOneInput,
                        unitName,
                        email: user.email,
                        phone: user.phone,
                        name: user.name,
                    })
                }

                return await Ticket.create(context, {
                    dv: newTicketDv,
                    sender: newTicketSender,
                    organization: { connect: { id: organizationId } },
                    client: { connect: { id: user.id } },
                    property: PropertyRelateToOneInput,
                    clientName: user.name,
                    clientPhone: user.phone,
                    clientEmail: user.email,
                    unitName,
                    sectionName,
                    floorName,
                    source: SourceRelateToOneInput,
                    details,
                })
            },
        },
    ],
})

module.exports = {
    CreateResidentTicketService,
}
