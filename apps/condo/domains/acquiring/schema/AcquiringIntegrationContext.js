/**
 * Generated by `createschema acquiring.AcquiringIntegrationContext 'integration:Relationship:AcquiringIntegration:PROTECT; organization:Relationship:Organization:PROTECT; settings:Json; state:Json;' --force`
 */

const { Relationship } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/acquiring/access/AcquiringIntegrationContext')
const { hasValidJsonStructure } = require('@condo/domains/common/utils/validation.utils')


const AcquiringIntegrationContext = new GQLListSchema('AcquiringIntegrationContext', {
    schemaDoc: 'Object, which links `acquiring integration` with `service provider`, and stores additional data for it\'s proper work',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        integration: {
            schemaDoc: 'Acquiring integration',
            type: Relationship,
            ref: 'AcquiringIntegration',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
        },

        organization: {
            schemaDoc: 'Service provider (organization)',
            type: Relationship,
            ref: 'Organization.acquiringContext',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
        },

        settings: {
            schemaDoc: 'Settings that are required for acquiring to work properly. The data structure depends on the integration and defined here',
            type: Json,
            isRequired: true,
            hooks: {
                validateInput: (args) => {
                    hasValidJsonStructure(args, true, 1, {})
                },
            },
        },

        state: {
            schemaDoc: 'The current state of the integration process. Some integration need to store past state here, additional data and etc.',
            type: Json,
            isRequired: true,
            hooks: {
                validateInput: (args) => {
                    hasValidJsonStructure(args, true, 1, {})
                },
            },
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadAcquiringIntegrationContexts,
        create: access.canManageAcquiringIntegrationContexts,
        update: access.canManageAcquiringIntegrationContexts,
        delete: false,
        auth: true,
    },
})

module.exports = {
    AcquiringIntegrationContext,
}
