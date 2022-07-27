/**
 * Generated by `createschema resident.ServiceConsumer 'resident:Relationship:Resident:CASCADE; billingAccount?:Relationship:BillingAccount:SET_NULL; accountNumber:Text;'`
 */

const { pick, get } = require('lodash')

const { Text, Relationship, Virtual } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')

const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { getById } = require('@core/keystone/schema')

const access = require('@condo/domains/resident/access/ServiceConsumer')

const { RESIDENT_ORGANIZATION_FIELD } = require('./fields')
const { ORGANIZATION_OWNED_FIELD } = require(
    '@condo/domains/organization/schema/fields')
const { dvAndSender } = require('../../common/schema/plugins/dvAndSender')


const ServiceConsumer = new GQLListSchema('ServiceConsumer', {
    schemaDoc: 'Service Consumer object. Existence of this object means that the resident is willing to pay for certain services',
    fields: {
        paymentCategory: {
            schemaDoc: 'A payment category for this resident',
            type: Text,
            isRequired: false,
        },

        resident: {
            schemaDoc: 'Resident object',
            type: Relationship,
            ref: 'Resident',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        billingAccount: {
            schemaDoc: '[DEPRECATED] Billing account, that will allow this resident to pay for certain service',
            type: Relationship,
            ref: 'BillingAccount',
            isRequired: false,
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },

        // todo(@toplenboren) DOMA-1701 Make this deprecated and add mobile an ability to move away from these fields
        // The reason for this field is to avoid adding check for resident user into global BillingAccount read access.
        // This field have specific use case for mobile client.
        residentBillingAccount: {
            schemaDoc: 'BillingAccount id, that is returned for current serviceConsumer in mobile client',
            type: Virtual,
            extendGraphQLTypes: ['type ResidentBillingAccount { id: ID! }'],
            graphQLReturnType: 'ResidentBillingAccount',
            resolver: async (item) => {
                if (!item.billingAccount) { return null }
                const billingAccount = await getById('BillingAccount', item.billingAccount)
                return pick(billingAccount, ['id'])
            },
            access: true,
        },

        billingIntegrationContext: {
            schemaDoc: 'Billing integration context, that this serviceConsumer is connected to',
            type: Relationship,
            ref: 'BillingIntegrationOrganizationContext',
            isRequired: false,
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },

        acquiringIntegrationContext: {
            schemaDoc: 'Acquiring integration context, that this serviceConsumer is connected to',
            type: Relationship,
            ref: 'AcquiringIntegrationContext',
            isRequired: false,
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },

        // todo(@toplenboren) DOMA-1701 Make this deprecated and add mobile an ability to move away from these fields
        // The reason for this field is to avoid adding check for resident user into global AcquiringIntegrationContext read access.
        // This field have specific use case for mobile client.
        residentAcquiringIntegrationContext: {
            schemaDoc: 'AcquiringIntegration, that is returned for current serviceConsumer in mobile client',
            type: Virtual,
            extendGraphQLTypes: ['type ResidentAcquiringIntegrationContext { id: ID!, integration: AcquiringIntegration }'],
            graphQLReturnType: 'ResidentAcquiringIntegrationContext',
            resolver: async (item) => {
                if (!item.acquiringIntegrationContext) { return null }
                const acquiringIntegrationContext = await getById('AcquiringIntegrationContext', item.acquiringIntegrationContext)
                const acquiringIntegration = await getById('AcquiringIntegration', get(acquiringIntegrationContext, 'integration'))

                const result = pick(acquiringIntegrationContext, ['id', 'integration'])
                result.integration = acquiringIntegration

                return result
            },
            access: true,
        },

        accountNumber: {
            schemaDoc: 'Account number taken from resident. This is what resident think his account number is',
            type: Text,
            isRequired: true,
        },

        organization: ORGANIZATION_OWNED_FIELD,

        // todo(@toplenboren) DOMA-1701 Make this deprecated and add mobile an ability to move away from these fields
        // The reason for this field is to avoid adding check for resident user into global Organization read access.
        // This field have specific use case for mobile client.
        residentOrganization: {
            ...RESIDENT_ORGANIZATION_FIELD,
            schemaDoc: 'Organization data, that is returned for current resident in mobile client',
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadServiceConsumers,
        create: access.canManageServiceConsumers,
        update: access.canManageServiceConsumers,
        delete: false,
        auth: true,
    },
})

module.exports = {
    ServiceConsumer,
}
