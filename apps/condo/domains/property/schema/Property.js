/** 
 * Generated by `createschema property.Property 'organization:Text; name:Text; address:Text; addressMeta:Json; type:Select:building,village; map?:Json'`
 */

const { Text, Select, Virtual } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/property/access/Property')
const { ORGANIZATION_OWNED_FIELD } = require('../../../schema/_common')
const { hasRequestAndDbFields } = require('@condo/domains/common/utils/validation.utils')
const { DV_UNKNOWN_VERSION_ERROR, JSON_UNKNOWN_VERSION_ERROR, JSON_SCHEMA_VALIDATION_ERROR, REQUIRED_NO_VALUE_ERROR, JSON_EXPECT_OBJECT_ERROR } = require('@condo/domains/common/constants/errors')
const { GET_TICKET_INWORK_COUNT_BY_PROPERTY_ID_QUERY, GET_TICKET_CLOSED_COUNT_BY_PROPERTY_ID_QUERY } = require('../gql')
const MapSchemaJSON = require('@condo/domains/property/components/panels/Builder/MapJsonSchema.json')
const Ajv = require('ajv')
const ajv = new Ajv()
const jsonMapValidator = ajv.compile(MapSchemaJSON)


// ORGANIZATION_OWNED_FIELD
const Property = new GQLListSchema('Property', {
    schemaDoc: 'Common property. The property is divided into separate `unit` parts, each of which can be owned by an independent owner. Community farm, residential buildings, or a cottage settlement',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        organization: ORGANIZATION_OWNED_FIELD,

        name: {
            schemaDoc: 'Client understandable Property name. A well-known property name for the client',
            type: Text,
            isRequired: false,
        },

        address: {
            schemaDoc: 'Normalized address',
            type: Text,
            isRequired: true,
        },

        addressMeta: {
            schemaDoc: 'Property address components',
            type: Json,
            isRequired: true,
            kmigratorOptions: { null: false },
            hooks: {
                validateInput: ({ resolvedData, fieldPath, addFieldValidationError }) => {
                    if (!resolvedData.hasOwnProperty(fieldPath)) return addFieldValidationError(`${REQUIRED_NO_VALUE_ERROR}${fieldPath}] Value is required`)
                    const value = resolvedData[fieldPath]
                    if (typeof value !== 'object' || value === null) { return addFieldValidationError(`${JSON_EXPECT_OBJECT_ERROR}${fieldPath}] ${fieldPath} field type error. We expect JSON Object`) }
                    const { dv } = value
                    if (dv === 1) {
                        // TODO(pahaz): need to checkIt!
                    } else {
                        // TODO(zuch): Turn on error after finishing add property
                        console.error(`${JSON_UNKNOWN_VERSION_ERROR}${fieldPath}] Unknown \`dv\` attr inside JSON Object`)
                        // return addFieldValidationError(`${JSON_UNKNOWN_VERSION_ERROR}${fieldPath}] Unknown \`dv\` attr inside JSON Object`)
                    }
                },
            },
        },

        type: {
            schemaDoc: 'Common property type',
            type: Select,
            options: 'building,village',
            isRequired: true,
        },

        map: {
            schemaDoc: 'Property map/schema',
            type: Json,
            isRequired: false,
            hooks: {
                validateInput: ({ resolvedData, fieldPath, addFieldValidationError }) => {
                    if (!resolvedData.hasOwnProperty(fieldPath)) return // skip if on value
                    const value = resolvedData[fieldPath]
                    if (value === null) return // null is OK
                    if (typeof value !== 'object') { return addFieldValidationError(`${JSON_EXPECT_OBJECT_ERROR}${fieldPath}] ${fieldPath} field type error. We expect JSON Object`) }
                    const { dv } = value
                    if (dv === 1) {
                        if (!jsonMapValidator(value)){
                            // console.log(JSON.stringify(jsonMapValidator.errors, null, 2))
                            return addFieldValidationError(`${JSON_SCHEMA_VALIDATION_ERROR}] invalid json structure`)    
                        }
                    } else {
                        return addFieldValidationError(`${JSON_UNKNOWN_VERSION_ERROR}${fieldPath}] Unknown \`dv\` attr inside JSON Object`)
                    }
                },
            },
        },
        unitsCount: {
            schemaDoc: 'A number of parts in the property. The number of flats for property.type = house. The number of garden houses for property.type = village.',
            type: Virtual,
            resolver: async (item) => {
                let count = 0
                if (item.map) {
                    try {
                        count = item.map.sections
                            .map(section => section.floors
                                .map(floor => floor.units.length))
                            .flat()
                            .reduce((acc, current) => acc + current, 0)
                    } catch (e) {
                        // TODO(zuch): Rewrite to PropertyUnit count
                        console.error('Error while fetching virtual field unitsCount', e)
                    }
                }
                return count
            },
        },

        ticketsClosed: {
            schemaDoc: 'Counter for closed tickets',
            type: Virtual,
            resolver: async (item, _, context) => {
                const { data, errors } = await context.executeGraphQL({
                    query: GET_TICKET_CLOSED_COUNT_BY_PROPERTY_ID_QUERY,
                    variables: {
                        propertyId: item.id,
                    },
                })
                if (errors) {
                    console.error('Error while fetching virtual field ticketsClosed', errors)
                    return 0
                }
                return data.closed.count
            },
        },
        
        ticketsInWork: {
            schemaDoc: 'Counter for not closed tickets',
            type: Virtual,
            resolver: async (item, _, context) => {
                const { data, errors } = await context.executeGraphQL({
                    query: GET_TICKET_INWORK_COUNT_BY_PROPERTY_ID_QUERY,
                    variables: {
                        propertyId: item.id,
                    },
                })
                if (errors) {
                    console.error('Error while fetching virtual field ticketsInWork', errors)
                    return 0
                }
                return data.inwork.count
            },
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadProperties,
        create: access.canManageProperties,
        update: access.canManageProperties,
        delete: false,
        auth: true,
    },
    hooks: {
        validateInput: ({ resolvedData, existingItem, addValidationError }) => {
            if (!hasRequestAndDbFields(['dv', 'sender'], ['organization', 'type', 'address', 'addressMeta'], resolvedData, existingItem, addValidationError)) return
            const { dv } = resolvedData
            if (dv === 1) {
                // NOTE: version 1 specific translations. Don't optimize this logic
            } else {
                return addValidationError(`${DV_UNKNOWN_VERSION_ERROR}dv] Unknown \`dv\``)
            }
        },
    },
})

module.exports = {
    Property,
}