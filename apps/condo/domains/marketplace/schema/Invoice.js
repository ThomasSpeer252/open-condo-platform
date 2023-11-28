/**
 * Generated by `createschema marketplace.Invoice 'number:Integer; property:Relationship:Property:PROTECT; unitType:Text; unitName:Text; accountNumber:Text; toPay:Decimal; items:Json; contact?:Relationship:Contact:SET_NULL; client?:Relationship:User:SET_NULL; clientName?:Text; clientPhone?:Text; clientEmail?:Text'`
 */
const { get, set } = require('lodash')
const isEmpty = require('lodash/isEmpty')
const isEqual = require('lodash/isEqual')
const omit = require('lodash/omit')
const omitBy = require('lodash/omitBy')
const pick = require('lodash/pick')
const pickBy = require('lodash/pickBy')

const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema, getById, getByCondition } = require('@open-condo/keystone/schema')

const { MONEY_AMOUNT_FIELD, UNIT_TYPE_FIELD } = require('@condo/domains/common/schema/fields')
const { CLIENT_NAME_FIELD, CLIENT_PHONE_LANDLINE_FIELD } = require('@condo/domains/common/schema/fields')
const { Contact } = require('@condo/domains/contact/utils/serverSchema')
const access = require('@condo/domains/marketplace/access/Invoice')
const {
    ERROR_INVOICE_ALREADY_PAID,
    ERROR_INVOICE_ALREADY_CANCELED,
    INVOICE_STATUSES,
    INVOICE_STATUS_DRAFT,
    INVOICE_STATUS_PAID,
    INVOICE_STATUS_PUBLISHED,
    INVOICE_STATUS_CANCELED,
    ERROR_INVOICE_EMPTY_ROWS,
    ERROR_INVOICE_ROW_WRONG_COUNT,
    ERROR_INVOICE_ROW_WRONG_PRICE,
    INVOICE_PAYMENT_TYPES,
    INVOICE_PAYMENT_TYPE_ONLINE,
    INVOICE_CONTEXT_STATUS_FINISHED,
    ERROR_NO_FINISHED_INVOICE_CONTEXT,
    ERROR_FORBID_EDIT_PUBLISHED,
    ERROR_CLIENT_DATA_DOES_NOT_MATCH_TICKET,
    ERROR_FORBID_UPDATE_TICKET, CLIENT_DATA_FIELDS, COMMON_RESOLVED_FIELDS,
} = require('@condo/domains/marketplace/constants')
const { INVOICE_ROWS_FIELD } = require('@condo/domains/marketplace/schema/fields/invoiceRows')
const { RESIDENT } = require('@condo/domains/user/constants/common')


const ERRORS = {
    ALREADY_PAID: {
        code: BAD_USER_INPUT,
        type: ERROR_INVOICE_ALREADY_PAID,
        message: 'Changing of paid invoice is forbidden',
        messageForUser: 'api.marketplace.invoice.error.alreadyPaid',
    },
    ALREADY_CANCELED: {
        code: BAD_USER_INPUT,
        type: ERROR_INVOICE_ALREADY_CANCELED,
        message: 'Changing of canceled invoice is forbidden',
        messageForUser: 'api.marketplace.invoice.error.alreadyCanceled',
    },
    EMPTY_ROWS: {
        code: BAD_USER_INPUT,
        type: ERROR_INVOICE_EMPTY_ROWS,
        message: 'The invoice contains no rows',
        messageForUser: 'api.marketplace.invoice.error.emptyRows',
    },
    WRONG_COUNT: (rowNumber) => ({
        code: BAD_USER_INPUT,
        type: ERROR_INVOICE_ROW_WRONG_COUNT,
        message: `Count at line ${rowNumber} can't be less than 1`,
        messageForUser: 'api.marketplace.invoice.error.rows.count',
        messageInterpolation: { rowNumber },
    }),
    WRONG_PRICE: (rowNumber) => ({
        code: BAD_USER_INPUT,
        type: ERROR_INVOICE_ROW_WRONG_PRICE,
        message: `Price at line ${rowNumber} can't be less than 0`,
        messageForUser: 'api.marketplace.invoice.error.rows.toPay',
        messageInterpolation: { rowNumber },
    }),
    NO_FINISHED_INVOICE_CONTEXT: {
        code: BAD_USER_INPUT,
        type: ERROR_NO_FINISHED_INVOICE_CONTEXT,
        message: 'The organization has no InvoiceContext in finished status',
        messageForUser: 'api.marketplace.invoice.error.NoFinishedInvoiceContext',
    },
    FORBID_EDIT_PUBLISHED: {
        code: BAD_USER_INPUT,
        type: ERROR_FORBID_EDIT_PUBLISHED,
        message: `Only the status ${INVOICE_STATUS_CANCELED} and ${INVOICE_STATUS_PAID} can be updated by the published invoice`,
        messageForUser: 'api.marketplace.invoice.error.editPublishedForbidden',
    },
    CLIENT_DATA_DOES_NOT_MATCH_TICKET: {
        code: BAD_USER_INPUT,
        type: ERROR_CLIENT_DATA_DOES_NOT_MATCH_TICKET,
        message: `Fields ${CLIENT_DATA_FIELDS.join(', ')} must match same fields in connected ticket`,
        messageForUser: 'api.marketplace.invoice.error.clientDataDoesNotMatchTicket',
    },
    FORBID_UPDATE_TICKET: {
        code: BAD_USER_INPUT,
        type: ERROR_FORBID_UPDATE_TICKET,
        message: 'You cannot update ticket in invoice that is already linked to the ticket',
        messageForUser: 'api.marketplace.invoice.error.forbidUpdateTicket',
    },
}

const Invoice = new GQLListSchema('Invoice', {
    schemaDoc: 'Invoice model contains information about paid items and payer',
    fields: {

        context: {
            schemaDoc: 'The invoice context the invoice was created for',
            type: 'Relationship',
            ref: 'InvoiceContext',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
        },

        number: {
            schemaDoc: 'The invoice number within organization',
            type: 'AutoIncrementInteger',
            isRequired: true,
            autoIncrementScopeFields: ['context.organization'],
        },

        property: {
            schemaDoc: 'The payer\'s property',
            type: 'Relationship',
            ref: 'Property',
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },

        unitType: {
            ...UNIT_TYPE_FIELD,
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true },
            defaultValue: null,
        },

        unitName: {
            schemaDoc: 'The payer\'s unitName',
            type: 'Text',
        },

        accountNumber: {
            schemaDoc: 'The payer\'s accountNumber within organization',
            type: 'Text',
        },

        toPay: MONEY_AMOUNT_FIELD,

        rows: INVOICE_ROWS_FIELD,

        ticket: {
            schemaDoc: 'The ticket related to this invoice',
            type: 'Relationship',
            ref: 'Ticket',
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },

        contact: {
            schemaDoc: 'The contact the invoice created for. Fill by organization',
            type: 'Relationship',
            ref: 'Contact',
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },

        client: {
            schemaDoc: 'The user who sees the invoice. Must filled with the user of corresponding resident.',
            type: 'Relationship',
            ref: 'User',
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },

        clientName: CLIENT_NAME_FIELD,

        clientPhone: CLIENT_PHONE_LANDLINE_FIELD,

        status: {
            schemaDoc: 'Invoice status affects which invoices can be read by residents and which invoices can be managed',
            isRequired: true,
            type: 'Select',
            dataType: 'string',
            options: INVOICE_STATUSES,
            defaultValue: INVOICE_STATUS_DRAFT,
        },

        paymentType: {
            schemaDoc: 'Shows which payment type chosen: online or cash or something else',
            isRequired: true,
            type: 'Select',
            dataType: 'string',
            options: INVOICE_PAYMENT_TYPES,
            defaultValue: INVOICE_PAYMENT_TYPE_ONLINE,
        },

    },
    hooks: {
        validateInput: async ({ resolvedData, operation, existingItem, context }) => {
            const nextData = { ...existingItem, ...resolvedData }
            const isUpdate = operation === 'update'
            const isConnectClientDataOp = Object.keys(resolvedData).some(key => CLIENT_DATA_FIELDS.includes(key))
            const connectedTicketId = get(nextData, 'ticket')
            const existingTicketId = get(existingItem, 'ticket')
            const resolvedTicketId = get(resolvedData, 'ticket')
            const isUpdateClientDataFromTicketOp = connectedTicketId && isConnectClientDataOp &&
                isEmpty(omit(resolvedData, [...COMMON_RESOLVED_FIELDS, ...CLIENT_DATA_FIELDS]))

            if (existingTicketId && resolvedTicketId && existingTicketId !== resolvedTicketId) {
                throw new GQLError(ERRORS.FORBID_UPDATE_TICKET, context)
            }

            if (connectedTicketId && isConnectClientDataOp) {
                const ticket = await getById('Ticket', connectedTicketId)
                const notEmptyTicketClientData = pickBy(pick(ticket, CLIENT_DATA_FIELDS), Boolean)
                const notEmptyInvoiceClientData = pickBy(pick(nextData, CLIENT_DATA_FIELDS), Boolean)

                if (!isEqual(notEmptyTicketClientData, notEmptyInvoiceClientData)) {
                    throw new GQLError(ERRORS.CLIENT_DATA_DOES_NOT_MATCH_TICKET, context)
                }
            }

            if (isUpdate && get(existingItem, 'status') === INVOICE_STATUS_PUBLISHED && !connectedTicketId) {
                const resolvedStatus = get(resolvedData, 'status')
                const otherResolvedFields = omit(resolvedData, [...COMMON_RESOLVED_FIELDS, 'status'])
                const changedFields = omitBy(otherResolvedFields, (value, key) => {
                    if (key === 'toPay') {
                        return Number(value) === Number(get(existingItem, key))
                    }

                    return isEqual(value, get(existingItem, key))
                })

                const hasAccessToUpdateStatus = resolvedStatus ?
                    [INVOICE_STATUS_CANCELED, INVOICE_STATUS_PAID, INVOICE_STATUS_PUBLISHED].includes(resolvedStatus) : true

                if (!isEmpty(changedFields) || !hasAccessToUpdateStatus) {
                    throw new GQLError(ERRORS.FORBID_EDIT_PUBLISHED, context)
                }
            }

            if (isUpdate && existingItem.status === INVOICE_STATUS_CANCELED && !isUpdateClientDataFromTicketOp) {
                throw new GQLError(ERRORS.ALREADY_CANCELED, context)
            }

            if (
                isUpdate &&
                existingItem.status === INVOICE_STATUS_PAID &&
                existingItem.paymentType === INVOICE_PAYMENT_TYPE_ONLINE &&
                !isUpdateClientDataFromTicketOp
            ) {
                throw new GQLError(ERRORS.ALREADY_PAID, context)
            }

            const nextContextId = get(nextData, 'context')
            const invoiceContext = await getByCondition('InvoiceContext', {
                id: nextContextId,
                status: INVOICE_CONTEXT_STATUS_FINISHED,
                deletedAt: null,
            })

            if (!invoiceContext) {
                throw new GQLError(ERRORS.NO_FINISHED_INVOICE_CONTEXT, context)
            }

            if (get(resolvedData, 'status') === INVOICE_STATUS_PUBLISHED && get(nextData, 'rows', []).length === 0) {
                throw new GQLError(ERRORS.EMPTY_ROWS, context)
            }

            // Check rows data
            const nextRows = get(nextData, 'rows', [])
            for (let i = 0; i < nextRows.length; i++) {
                if (Number(get(nextRows[i], 'count', null)) < 1) {
                    throw new GQLError(ERRORS.WRONG_COUNT(i + 1), context)
                }
                if (Number(get(nextRows[i], 'toPay', null)) < 0) {
                    throw new GQLError(ERRORS.WRONG_PRICE(i + 1), context)
                }
            }
        },

        resolveInput: async ({ context, operation, resolvedData, existingItem }) => {
            const user = get(context, ['req', 'user'])
            const userType = get(user, 'type')
            const userId = get(user, 'id')
            const resolvedContact = get(resolvedData, 'contact')
            const resolvedTicket = get(resolvedData, 'ticket')

            // Set client data from connected ticket
            if (resolvedTicket && get(existingItem, 'ticket') !== resolvedTicket) {
                const ticketWithInvoice = await getById('Ticket', resolvedTicket)

                resolvedData['property'] = ticketWithInvoice.property
                resolvedData['unitName'] = ticketWithInvoice.unitName
                resolvedData['unitType'] = ticketWithInvoice.unitType
                resolvedData['clientName'] = ticketWithInvoice.clientName
                resolvedData['clientPhone'] = ticketWithInvoice.clientPhone
                resolvedData['contact'] = ticketWithInvoice.contact
            }

            // Set contact by passed client data
            if (!resolvedContact) {
                const nextData = { ...existingItem, ...resolvedData }
                const resolvedClientName = get(resolvedData, 'clientName')
                const resolvedClientPhone = get(resolvedData, 'clientPhone')
                const propertyId = get(nextData, 'property')
                const unitName = get(nextData, 'unitName')
                const unitType = get(nextData, 'unitType')

                if (resolvedClientName && resolvedClientPhone && propertyId && unitName && unitType) {
                    const existedContact = await getByCondition('Contact', {
                        phone: resolvedClientPhone,
                        property: { id: propertyId },
                        unitName,
                        unitType,
                        deletedAt: null,
                    })

                    if (existedContact) {
                        set(resolvedData, 'contact', existedContact.id)
                    } else {
                        const property = await getById('Property', propertyId)
                        const organizationId = get(property, 'organization')

                        const newContact = await Contact.create(context, {
                            dv: get(nextData, 'dv'),
                            sender: get(nextData, 'sender'),
                            organization: { connect: { id: organizationId } },
                            property: { connect: { id: propertyId } },
                            unitName,
                            unitType,
                            phone: resolvedClientPhone,
                            name: resolvedClientName,
                        })

                        set(resolvedData, 'contact', newContact.id)
                    }
                }
            }

            const nextData = { ...existingItem, ...resolvedData }

            if (userType === RESIDENT) {
                if (operation === 'create') {
                    set(resolvedData, 'client', userId)
                }
            } else {
                const nextContactId = get(nextData, 'contact')
                if (nextContactId) {
                    const contact = await getById('Contact', nextContactId)
                    if (contact) {
                        const nextProperty = get(nextData, 'property')
                        const nextUnitType = get(nextData, 'unitType')
                        const nextUnitName = get(nextData, 'unitName')

                        const resident = await getByCondition('Resident', {
                            user: { phone: contact.phone },
                            property: { id: nextProperty },
                            unitType: nextUnitType,
                            unitName: nextUnitName,
                            deletedAt: null,
                        })

                        set(resolvedData, 'client', get(resident, 'user', null))
                    }
                }
            }

            return resolvedData
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadInvoices,
        create: access.canManageInvoices,
        update: access.canManageInvoices,
        delete: false,
        auth: true,
    },
})

module.exports = {
    Invoice,
}
