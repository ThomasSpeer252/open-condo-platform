/**
 * Generated by `createschema ticket.IncidentProperty 'incident:Relationship:Incident:CASCADE; property:Relationship:Property:PROTECT; propertyAddress:Text; propertyAddressMeta;'`
 */
const get = require('lodash/get')

const { GQLError } = require('@open-condo/keystone/errors')
const { GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema, getByCondition } = require('@open-condo/keystone/schema')

const { WRONG_VALUE } = require('@condo/domains/common/constants/errors')
const { ADDRESS_META_FIELD } = require('@condo/domains/common/schema/fields')
const { addOrganizationFieldPlugin } = require('@condo/domains/organization/schema/plugins/addOrganizationFieldPlugin')
const access = require('@condo/domains/ticket/access/IncidentProperty')


const ERRORS = {
    DIFFERENT_ORGANIZATIONS: {
        code: BAD_USER_INPUT,
        type: WRONG_VALUE,
        message: 'Incident and property belong to different organizations',
    },
}

const IncidentProperty = new GQLListSchema('IncidentProperty', {
    schemaDoc: 'Many-to-many relationship between Incident and Property',
    fields: {

        incident: {
            schemaDoc: 'Incident which has a property',
            type: 'Relationship',
            ref: 'Incident',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        property: {
            schemaDoc: 'A property which is in the incident entry',
            type: 'Relationship',
            ref: 'Property',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
        },

        propertyAddress: {
            schemaDoc: 'Address of property, which synced with property and displayed, if property is deleted',
            type: 'Text',
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
    },
    hooks: {
        resolveInput: async ({ resolvedData }) => {
            const propertyId = get(resolvedData, 'property')
            if (propertyId) {
                const property = await getByCondition('Property', {
                    id: propertyId,
                    deletedAt: null,
                })
                if (property) {
                    resolvedData.propertyAddress = property.address
                    resolvedData.propertyAddressMeta = property.addressMeta
                }
            }

            return resolvedData
        },
        validateInput: async ({ resolvedData, operation, context }) => {
            if (operation === 'create') {
                const propertyId = get(resolvedData, 'property')
                const incidentId = get(resolvedData, 'incident')

                const property = await getByCondition('Property', {
                    id: propertyId,
                    deletedAt: null,
                })
                const incident = await getByCondition('Incident', {
                    id: incidentId,
                    deletedAt: null,
                })

                const propertyOrganizationId = get(property, 'organization')
                const incidentOrganizationId = get(incident, 'organization')
                if (property && incident && propertyOrganizationId !== incidentOrganizationId) {
                    throw new GQLError(ERRORS.DIFFERENT_ORGANIZATIONS, context)
                }
            }
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['incident', 'property'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'incident_property_unique_incident_and_property',
            },
        ],
    },
    plugins: [
        addOrganizationFieldPlugin({ fromField: 'incident', isRequired: true }),
        uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical(),
    ],
    access: {
        read: access.canReadIncidentProperties,
        create: access.canManageIncidentProperties,
        update: access.canManageIncidentProperties,
        delete: false,
        auth: true,
    },
})

module.exports = {
    IncidentProperty,
    ERRORS,
}
