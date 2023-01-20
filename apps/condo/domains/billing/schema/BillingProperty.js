/**
 * Generated by `createschema billing.BillingProperty 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; bindingId:Text; address:Text; raw:Json; meta:Json'`
 */

const { Text } = require('@keystonejs/fields')
const { Virtual } = require('@keystonejs/fields')

const { Json } = require('@open-condo/keystone/fields')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')
const { find } = require('@open-condo/keystone/schema')
const { getById } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/billing/access/BillingProperty')
const { IMPORT_ID_FIELD } = require('@condo/domains/common/schema/fields')

const { RAW_DATA_FIELD } = require('./fields/common')
const { INTEGRATION_CONTEXT_FIELD } = require('./fields/relations')

const BillingProperty = new GQLListSchema('BillingProperty', {
    schemaDoc: 'All `property` objects from `billing data source`',
    fields: {
        context: INTEGRATION_CONTEXT_FIELD,

        importId: IMPORT_ID_FIELD,

        raw: RAW_DATA_FIELD,

        globalId: {
            schemaDoc: 'A well-known universal identifier that allows you to identify the same objects in different systems. It may differ in different countries. Example: for Russia, the FIAS ID is used',
            type: Text,
            isRequired: true,
            kmigratorOptions: {
                null: false,
            },
        },

        address: {
            schemaDoc: 'The non-modified address from the `billing data source`. Used in `receipt template`',
            type: Text,
            isRequired: true,
        },

        normalizedAddress: {
            schemaDoc: 'Normalized address from `billing data source`. Used to map Properties to BillingProperties',
            type: Text,
            isRequired: false,
        },

        meta: {
            schemaDoc: 'Structured metadata obtained from the `billing data source`. Some of this data is required for use in the `receipt template`. ' +
                'Examples of data keys: `total space of building`, `property beginning of exploitation year`, `has cultural heritage status`, `number of underground floors`, `number of above-ground floors`',
            // TODO(pahaz): research keys!
            type: Json,
            isRequired: true,
        },

        property: {
            schemaDoc: 'Link to the property model',
            type: Virtual,
            graphQLReturnType: 'Property',
            graphQLReturnFragment: '{ id address }',
            resolver: async (item) => {
                const billingContext = await getById('BillingIntegrationOrganizationContext', item.context)
                const organizationId = billingContext.organization

                const [ property ] = await find('Property', {
                    organization: { id: organizationId },
                    address_i: item.address,
                })

                return property
            },
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadBillingProperties,
        create: access.canManageBillingProperties,
        update: access.canManageBillingProperties,
        delete: false,
        auth: true,
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['context', 'globalId'],
                name: 'billingProperty_unique_context_globalId',
            },
        ],
    },
})

module.exports = {
    BillingProperty,
}
