/**
 * Generated by `createschema property.Property 'organization:Text; name:Text; address:Text; addressMeta:Json; type:Select:building,village; map?:Json'`
 */

const { Text, Select, Virtual, Integer } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/property/access/Property')
const userAccess = require('@condo/domains/user/access/User')
const get = require('lodash/get')
const { ORGANIZATION_OWNED_FIELD } = require('../../../schema/_common')
const { hasDbFields, hasRequestFields } = require('@condo/domains/common/utils/validation.utils')
const { DV_UNKNOWN_VERSION_ERROR, JSON_UNKNOWN_VERSION_ERROR, JSON_SCHEMA_VALIDATION_ERROR, REQUIRED_NO_VALUE_ERROR, JSON_EXPECT_OBJECT_ERROR } = require('@condo/domains/common/constants/errors')
const { GET_TICKET_INWORK_COUNT_BY_PROPERTY_ID_QUERY, GET_TICKET_CLOSED_COUNT_BY_PROPERTY_ID_QUERY } = require('../gql')
const MapSchemaJSON = require('@condo/domains/property/components/panels/Builder/MapJsonSchema.json')
const Ajv = require('ajv')
const { UNIQUE_ALREADY_EXISTS_ERROR } = require('@condo/domains/common/constants/errors')
const { Property: PropertyAPI } = require('../utils/serverSchema')
const { ADDRESS_META_FIELD } = require('@condo/domains/common/schema/fields')
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
            access: userAccess.canAccessToStaffUserField,
        },

        address: {
            schemaDoc: 'Normalized address',
            type: Text,
            isRequired: true,
            hooks: {
                validateInput: async ({ resolvedData, fieldPath, addFieldValidationError, context, existingItem, operation }) => {
                    const value = resolvedData[fieldPath]
                    // if we create a property or update a property address to another
                    if (operation === 'create' || (operation === 'update' && resolvedData.address !== existingItem.address)) {
                        const [propertyWithSameAddressInOrganization] = await PropertyAPI.getAll(context, { address: value })
                        if (propertyWithSameAddressInOrganization) {
                            addFieldValidationError(`${UNIQUE_ALREADY_EXISTS_ERROR}${fieldPath}] Property with same address exist in current organization`)
                        }
                    }
                },
            },
        },

        addressMeta: ADDRESS_META_FIELD,

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
            access: userAccess.canAccessToStaffUserField,
        },
        unitsCount: {
            schemaDoc: 'A number of parts in the property. The number of flats for property.type = house. The number of garden houses for property.type = village.',
            type: Integer,
            isRequired: true,
            defaultValue: 0,
            hooks: {
                resolveInput: async ({ operation, existingItem, resolvedData }) => {
                    const getTotalUnitsCount = (map) => {
                        return get(map, 'sections', [])
                            .map((section) => get(section, 'floors', [])
                                .map(floor => get(floor, 'units', []).length))
                            .flat()
                            .reduce((total, unitsOnFloor) => total + unitsOnFloor, 0)

                    }

                    let unitsCount = 0

                    if (operation === 'create') {
                        const map = get(resolvedData, 'map')

                        if (map) {
                            unitsCount = getTotalUnitsCount(map)
                        }
                    }

                    if (operation === 'update') {
                        const existingMap = get(existingItem, 'map')
                        const updatedMap = get(resolvedData, 'map')

                        const isMapDeleted = existingMap && !updatedMap

                        if (isMapDeleted) {
                            unitsCount = 0
                        } else if (updatedMap) {
                            unitsCount = getTotalUnitsCount(updatedMap)
                        }
                    }

                    return unitsCount
                },
            },
            access: userAccess.canAccessToStaffUserField,
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
            access: userAccess.canAccessToStaffUserField,
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
            access: userAccess.canAccessToStaffUserField,
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        auth: true,
        delete: false,
        read: access.canReadProperties,
        create: access.canManageProperties,
        update: access.canManageProperties,
    },
    hooks: {
        validateInput: ({ resolvedData, existingItem, context, addValidationError }) => {
            if (!hasRequestFields(['dv', 'sender'], resolvedData, context, addValidationError)) return
            if (!hasDbFields(['organization', 'type', 'address', 'addressMeta'], resolvedData, existingItem, context, addValidationError)) return
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
