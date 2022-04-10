/**
 * Generated by `createschema ticket.Ticket organization:Text; statusReopenedCounter:Integer; statusReason?:Text; status:Relationship:TicketStatus:PROTECT; number?:Integer; client?:Relationship:User:SET_NULL; clientName:Text; clientEmail:Text; clientPhone:Text; operator:Relationship:User:SET_NULL; assignee?:Relationship:User:SET_NULL; classifier:Relationship:TicketClassifier:PROTECT; details:Text; meta?:Json;`
 */

const isNull = require('lodash/isNull')
const get = require('lodash/get')

const { triggersManager } = require('@core/triggers')
const { Text, Relationship, Integer, DateTimeUtc, Checkbox, Select } = require('@keystonejs/fields')
const { GQLListSchema, getByCondition } = require('@core/keystone/schema')
const { Json, AutoIncrementInteger } = require('@core/keystone/fields')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')

const {
    PROPERTY_REQUIRED_ERROR,
    JSON_EXPECT_OBJECT_ERROR,
    DV_UNKNOWN_VERSION_ERROR,
    STATUS_UPDATED_AT_ERROR,
    JSON_UNKNOWN_VERSION_ERROR,
} = require('@condo/domains/common/constants/errors')
const {
    SENDER_FIELD,
    DV_FIELD,
    CLIENT_PHONE_LANDLINE_FIELD,
    CLIENT_EMAIL_FIELD,
    CLIENT_NAME_FIELD,
    CONTACT_FIELD,
    CLIENT_FIELD,
    ADDRESS_META_FIELD,
    UNIT_TYPE_FIELD,
} = require('@condo/domains/common/schema/fields')
const { normalizeText } = require('@condo/domains/common/utils/text')
const { buildSetOfFieldsToTrackFrom, storeChangesIfUpdated } = require('@condo/domains/common/utils/serverSchema/changeTrackable')
const { hasDbFields, hasDvAndSenderFields } = require('@condo/domains/common/utils/validation.utils')

const { Contact } = require('@condo/domains/contact/utils/serverSchema')

const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')

const access = require('@condo/domains/ticket/access/Ticket')
const {
    calculateTicketOrder, calculateReopenedCounter, createContactIfNotExists,
    setSectionAndFloorFieldsByDataFromPropertyMap, setClientNamePhoneEmailFieldsByDataFromUser,
    overrideTicketFieldsForResidentUserType, setClientIfContactPhoneAndTicketAddressMatchesResidentFields,
} = require('@condo/domains/ticket/utils/serverSchema/resolveHelpers')

const { RESIDENT } = require('@condo/domains/user/constants/common')

const { createTicketChange, ticketChangeDisplayNameResolversForSingleRelations, relatedManyToManyResolvers } = require('../utils/serverSchema/TicketChange')
const { sendTicketNotifications } = require('../utils/handlers')
const { OMIT_TICKET_CHANGE_TRACKABLE_FIELDS, REVIEW_VALUES } = require('../constants')

const Ticket = new GQLListSchema('Ticket', {
    schemaDoc: 'Users request or contact with the user',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        // TODO(pahaz): no needed to check organization access!
        organization: ORGANIZATION_OWNED_FIELD,

        // statusDeadline
        // statusDeferredDate
        // statusDeferredBy
        // TODO(pahaz): server side autogen
        statusReopenedCounter: {
            schemaDoc: 'Counter showing the number of changes `status` to `new_or_reopened`',
            type: Integer,
            isRequired: true,
            defaultValue: 0,
            access: {
                read: true,
                update: false,
                create: false,
            },
        },
        reviewValue: {
            schemaDoc: 'Review of the ticket by a resident on a 2-point scale. 0 – ticket returned, 1 – bad review, 2 – good review',
            type: Select,
            options: Object.values(REVIEW_VALUES).join(','),
        },
        reviewComment: {
            schemaDoc: 'Resident\'s comment on ticket review',
            type: Text,
        },
        // TODO(Dimitreee): server side auto generation
        statusUpdatedAt: {
            schemaDoc: 'Status updated at time',
            type: DateTimeUtc,
        },
        statusReason: {
            schemaDoc: 'Text reason for status changes. Sometimes you should describe the reason why you change the `status`',
            type: Text,
        },
        status: {
            schemaDoc: 'Status is the step of the ticket processing workflow. Companies may have different ticket processing workflows',
            type: Relationship,
            ref: 'TicketStatus',
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
        },
        deadline: {
            schemaDoc: 'Time after which the ticket must be completed',
            type: DateTimeUtc,
        },
        order: {
            schemaDoc: 'Field required for specific sorting of model objects',
            type: Integer,
            kmigratorOptions: { db_index: true },
        },
        number: {
            schemaDoc: 'Autogenerated ticket human readable ID',
            type: AutoIncrementInteger,
            isRequired: false,
            kmigratorOptions: { unique: true, null: false },
        },

        client: CLIENT_FIELD,
        contact: CONTACT_FIELD,
        clientName: CLIENT_NAME_FIELD,
        clientEmail:  CLIENT_EMAIL_FIELD,
        clientPhone: CLIENT_PHONE_LANDLINE_FIELD,

        operator: {
            schemaDoc: 'Staff/person who created the issue (submitter). This may be a call center operator or an employee who speaks to a inhabitant/client and filled out an issue for him',
            type: Relationship,
            ref: 'User',
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },
        // operatorMeta: {
        //     type: Json,
        //     schemaDoc: 'For external analytics about the operator who created the issue. Example: geolocation, contact type, ...',
        // },

        // Integrations!?
        // hookStatus
        // hookResult

        // department?
        // who close
        // who accept

        assignee: {
            schemaDoc: 'Assignee/responsible employee/user who must ensure that the issue is fulfilled',
            type: Relationship,
            ref: 'User',
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },
        executor: {
            schemaDoc: 'Executor employee/user who perform the issue',
            type: Relationship,
            ref: 'User',
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },
        watchers: {
            schemaDoc: 'Staff/person who want to watch ticket changes',
            type: Relationship,
            ref: 'User',
            many: true,
        },
        classifier: {
            schemaDoc: '[DEPRECATED] Old classifier will be removed after migration of existed data',
            type: Relationship,
            ref: 'TicketClassifier',
            // Classifier can be null because mobile app users don't pass it when creating a Ticket
            isRequired: false,
            knexOptions: { isNotNullable: false }, // Required relationship only!
            kmigratorOptions: { null: true, on_delete: 'models.PROTECT' },
        },
        // TODO(zuch): make it required
        placeClassifier: {
            schemaDoc: 'Describe where incident took place',
            type: Relationship,
            ref: 'TicketPlaceClassifier',
            isRequired: false,
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true, on_delete: 'models.PROTECT' },
        },
        // TODO(zuch): make it required
        categoryClassifier: {
            schemaDoc: 'Describe type of work needed',
            type: Relationship,
            ref: 'TicketCategoryClassifier',
            isRequired: false,
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true, on_delete: 'models.PROTECT' },
        },
        problemClassifier: {
            schemaDoc: 'Details of incident',
            type: Relationship,
            ref: 'TicketProblemClassifier',
            isRequired: false,
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true, on_delete: 'models.PROTECT' },
        },
        // TODO(zuch): make it required
        classifierRule: {
            schemaDoc: 'Valid combination of 3 classifiers',
            type: Relationship,
            ref: 'TicketClassifierRule',
            isRequired: false,
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true, on_delete: 'models.PROTECT' },
        },
        // description / title
        details: {
            schemaDoc: 'Text description of the issue. Maybe written by a user or an operator',
            type: Text,
            isRequired: true,
            hooks: {
                resolveInput: async ({ resolvedData }) => {
                    return normalizeText(resolvedData['details'])
                },
            },
        },
        related: {
            schemaDoc: 'Sometimes, it is important for us to show related issues. For example, to show related issues',
            type: Relationship,
            ref: 'Ticket',
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },
        isPaid: {
            schemaDoc: 'Indicates the ticket is paid',
            type: Checkbox,
            defaultValue: false,
            isRequired: true,
        },
        isEmergency: {
            schemaDoc: 'Indicates the ticket is emergency',
            type: Checkbox,
            defaultValue: false,
            isRequired: true,
        },
        isWarranty: {
            schemaDoc: 'Indicates the ticket is warranty',
            type: Checkbox,
            defaultValue: false,
            isRequired: true,
        },
        canReadByResident: {
            schemaDoc: 'Determines if a resident in the mobile app can see the ticket created in crm',
            type: Checkbox,
            defaultValue: false,
            isRequired: true,
        },
        meta: {
            schemaDoc: 'Extra analytics not related to remote system',
            type: Json,
            isRequired: false,
            hooks: {
                validateInput: ({ resolvedData, fieldPath, addFieldValidationError }) => {
                    if (!resolvedData.hasOwnProperty(fieldPath)) return // skip if on value
                    const value = resolvedData[fieldPath]
                    if (value === null) return // null is OK
                    if (typeof value !== 'object') {return addFieldValidationError(`${JSON_EXPECT_OBJECT_ERROR}${fieldPath}] ${fieldPath} field type error. We expect JSON Object`)}
                    const { dv } = value
                    if (dv === 1) {
                        // TODO(pahaz): need to checkIt!
                    } else {
                        return addFieldValidationError(`${JSON_UNKNOWN_VERSION_ERROR}${fieldPath}] Unknown \`dv\` attr inside JSON Object`)
                    }
                },
            },
        },
        // Where?
        // building/community
        // entrance/section
        // floor
        // premise/unit
        // placeDetail (behind the radiator, on the fifth step of the stairs)
        // Intercom code

        property: {
            schemaDoc: 'Property related to the Ticket',
            type: Relationship,
            ref: 'Property',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
        },
        propertyAddress: {
            schemaDoc: 'Address of property, which synced with property and displayed, if property is deleted',
            type: Text,
            isRequired: true,
            // USED TO REMOVE FIELDS FROM SCHEMA DOC FOR CREATE / UPDATE OPERATIONS
            access: {
                create: false,
                read: true,
                update: false,
                delete: false,
            },
        },
        propertyAddressMeta: {
            ...ADDRESS_META_FIELD,
            schemaDoc: 'Address meta of property, which synced with property and used to form view of address, if property is deleted',
            isRequired: true,
            // USED TO REMOVE FIELDS FROM SCHEMA DOC FOR CREATE / UPDATE OPERATIONS
            access: {
                create: false,
                read: true,
                update: false,
                delete: false,
            },
        },

        sectionName: {
            schemaDoc: 'Section name/number of an apartment building (property). You need to take from Property.map',
            type: Text,
        },
        floorName: {
            schemaDoc: 'Floor of an apartment building (property). You need to take from Property.map',
            type: Text,
        },
        // TODO(pahaz): make a link to property domain fields
        unitName: {
            schemaDoc: 'Flat number / door number of an apartment building (property). You need to take from Property.map',
            type: Text,
        },
        unitType: UNIT_TYPE_FIELD,
        source: {
            schemaDoc: 'Ticket source channel/system. Examples: call, email, visit, ...',
            type: Relationship,
            ref: 'TicketSource',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
        },
        sourceMeta: {
            schemaDoc: 'In the case of remote system sync, you can store some extra analytics. Examples: email, name, phone, ...',
            type: Json,
        },
        lastResidentCommentAt: {
            schemaDoc: 'Time of last resident comment in this ticket',
            type: DateTimeUtc,
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    hooks: {
        resolveInput: async ({ operation, listKey, context, resolvedData, existingItem }) => {
            await triggersManager.executeTrigger({ operation, data: { resolvedData, existingItem }, listKey, context }, context)
            // NOTE(pahaz): can be undefined if you use it on worker or inside the scripts
            const user = get(context, ['req', 'user'])
            const userType = get(user, 'type')
            const resolvedStatusId = get(resolvedData, 'status')
            const client = get(resolvedData, 'client', null)

            if (resolvedStatusId) {
                calculateTicketOrder(resolvedData, resolvedStatusId)
                await calculateReopenedCounter(context, existingItem, resolvedData)
            }

            // When creating ticket or updating ticket address,
            // if client is not passed in resolvedData,
            // we find a registered user with a phone number that matches the contact's phone number
            // and an address that matches the ticket address.
            if (userType !== RESIDENT && isNull(client)) {
                const contactId = get(resolvedData, 'contact', null)
                const propertyId = get(resolvedData, 'property', null)
                const unitName = get(resolvedData, 'unitName', null)

                if (!isNull(contactId) || !isNull(propertyId) || !isNull(unitName)) {
                    await setClientIfContactPhoneAndTicketAddressMatchesResidentFields(operation, resolvedData, existingItem)
                }
            }

            if (userType === RESIDENT && operation === 'create') {
                await createContactIfNotExists(context, resolvedData)
                await setSectionAndFloorFieldsByDataFromPropertyMap(context, resolvedData)
                setClientNamePhoneEmailFieldsByDataFromUser(get(context, ['req', 'user']), resolvedData)
                overrideTicketFieldsForResidentUserType(context, resolvedData)
            }

            const newItem = { ...existingItem, ...resolvedData }
            const propertyId = get(newItem, 'property', null)
            if (!propertyId) {
                throw new Error(`${PROPERTY_REQUIRED_ERROR}] empty property for ticket`)
            }
            const property = await getByCondition('Property', {
                id: propertyId,
                deletedAt: null,
            })
            // If property was soft- or hard-deleted = keep existing data = don't modify propertyAddress and propertyAddressMeta
            if (property) {
                resolvedData.propertyAddress = property.address
                resolvedData.propertyAddressMeta = property.addressMeta
            }

            if (resolvedData.contact) {
                const contact = await Contact.getOne(context, { id: resolvedData.contact })

                if (!resolvedData.clientName) resolvedData.clientName = contact.name
                if (!resolvedData.clientEmail) resolvedData.clientEmail = contact.email
                if (!resolvedData.clientPhone) resolvedData.clientPhone = contact.phone
            }

            return resolvedData
        },
        validateInput: async ({ resolvedData, existingItem, addValidationError, context }) => {
            // Todo(zuch): add placeClassifier, categoryClassifier and classifierRule
            if (!hasDbFields(['organization', 'source', 'status', 'details'], resolvedData, existingItem, context, addValidationError)) return
            if (!hasDvAndSenderFields(resolvedData, context, addValidationError)) return
            const { dv } = resolvedData
            if (dv === 1) {
                // NOTE: version 1 specific translations. Don't optimize this logic
                if (resolvedData.statusUpdatedAt) {
                    if (existingItem.statusUpdatedAt) {
                        if (new Date(resolvedData.statusUpdatedAt) <= new Date(existingItem.statusUpdatedAt)) {
                            return addValidationError(`${ STATUS_UPDATED_AT_ERROR }statusUpdatedAt] Incorrect \`statusUpdatedAt\``)
                        }
                    } else {
                        if (new Date(resolvedData.statusUpdatedAt) <= new Date(existingItem.createdAt)) {
                            return addValidationError(`${ STATUS_UPDATED_AT_ERROR }statusUpdatedAt] Incorrect \`statusUpdatedAt\``)
                        }
                    }
                }
            } else {
                return addValidationError(`${ DV_UNKNOWN_VERSION_ERROR }dv] Unknown \`dv\``)
            }
        },
        // `beforeChange` cannot be used, because data can be manipulated during updating process somewhere inside a ticket
        // We need a final result after update
        afterChange: async (...args) => {
            /**
             * Creates a new TicketChange item.
             * 👉 When a new "single" or "many" relation field will be added to Ticket,
             * new resolver should be implemented in `ticketChangeDisplayNameResolversForSingleRelations` and `relatedManyToManyResolvers`
             */
            const { property, unitName, placeClassifier, categoryClassifier, problemClassifier } = Ticket.schema.fields

            await storeChangesIfUpdated(
                buildSetOfFieldsToTrackFrom(Ticket.schema, { except: OMIT_TICKET_CHANGE_TRACKABLE_FIELDS }),
                createTicketChange,
                ticketChangeDisplayNameResolversForSingleRelations,
                relatedManyToManyResolvers,
                [{ property, unitName }, { placeClassifier, categoryClassifier, problemClassifier }]
            )(...args)

            const [requestData] = args
            /* NOTE: this sends different kinds of notifications on ticket create/update */
            await sendTicketNotifications(requestData)
        },
    },
    access: {
        read: access.canReadTickets,
        create: access.canManageTickets,
        update: access.canManageTickets,
        delete: false,
        auth: true,
    },
})

module.exports = {
    Ticket,
}
