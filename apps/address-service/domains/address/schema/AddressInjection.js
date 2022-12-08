/**
 * Generated by `createschema address.AddressInjection 'country:Text; region?:Text; area?:Text; city?:Text; settlement?:Text; street?:Text; building:Text; block?:Text; meta?:Json;'`
 */

const { Text } = require('@keystonejs/fields')
const { GQLListSchema } = require('@open-condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const access = require('@address-service/domains/address/access/AddressInjection')
const get = require('lodash/get')
const { Json, AddressPartWithType } = require('@open-condo/keystone/fields')
const { VALID_HOUSE_TYPES } = require('@condo/domains/property/constants/common')
const { KEYWORDS_SPECIAL_SYMBOLS_REGEX } = require('@address-service/domains/address/constants')

const readOnlyAccess = {
    read: true,
    create: false,
    update: false,
    delete: false,
}

const AddressInjection = new GQLListSchema('AddressInjection', {
    schemaDoc: 'Addresses that do not exist in external providers',
    labelResolver: ({ keywords }) => keywords,
    fields: {
        country: {
            schemaDoc: 'The country',
            type: Text,
            isRequired: true,
        },

        region: {
            schemaDoc: 'The region',
            type: AddressPartWithType,
        },

        area: {
            schemaDoc: 'Some area',
            type: AddressPartWithType,
        },

        city: {
            schemaDoc: 'The city name',
            type: AddressPartWithType,
        },

        cityDistrict: {
            schemaDoc: 'The district within the city name',
            type: AddressPartWithType,
        },

        settlement: {
            schemaDoc: 'The settlement name',
            type: AddressPartWithType,
        },

        street: {
            schemaDoc: 'The street name itself',
            type: AddressPartWithType,
            // The properties table will contain an empty string if there is no `street_with_type` field
            // So, I decided to make this field required.
            isRequired: true,
        },

        house: {
            schemaDoc: 'The number of the building',
            type: AddressPartWithType,
            isRequired: true,
            allowedValues: {
                typeFull: VALID_HOUSE_TYPES,
            },
        },

        block: {
            schemaDoc: 'Some part of the building',
            type: AddressPartWithType,
        },

        keywords: {
            schemaDoc: 'The autogenerated keywords for searching',
            type: Text,
            access: readOnlyAccess,
            adminConfig: {
                isReadOnly: true,
            },
        },

        meta: {
            schemaDoc: 'Additional data',
            type: Json,
        },

    },
    hooks: {
        resolveInput: async ({ resolvedData, existingItem }) => {
            return {
                // Actualize keywords on every data changing
                ...resolvedData,

                // I have to add full types for some address parts. To prevent loosing some search results.
                // For example:
                // If user finds address by string 'г Екатеринбург, улица Средняя, д 1', we don't know what is 'улица'.
                keywords: [
                    'country',
                    'region.typeFull',
                    'region.name',
                    'area.name',
                    'city.typeFull',
                    'city.name',
                    'cityDistrict.typeFull',
                    'cityDistrict.typeShort',
                    'cityDistrict.name',
                    'settlement.typeFull',
                    'settlement.typeShort',
                    'settlement.name',
                    'street.typeFull',
                    'street.typeShort',
                    'street.name',
                    'house.typeFull',
                    'house.typeShort',
                    'house.name',
                    'block.name',
                ]
                    .map((field) => get({ ...existingItem, ...resolvedData }, field))
                    .filter(Boolean)
                    .join(' ')
                    .replace(KEYWORDS_SPECIAL_SYMBOLS_REGEX, ''),
            }
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadAddressInjections,
        create: access.canManageAddressInjections,
        update: access.canManageAddressInjections,
        delete: false,
        auth: true,
    },
})

module.exports = {
    AddressInjection,
}
