/**
 * Generated by `createschema billing.BillingIntegrationOrganizationContext 'integration:Relationship:BillingIntegration:PROTECT; organization:Relationship:Organization:CASCADE; settings:Json; state:Json' --force`
 */

const dayjs = require('dayjs')
const get = require('lodash/get')
const { Relationship, Select, Text, Virtual, DateTimeUtc } = require('@keystonejs/fields')

const { Json } = require('@core/keystone/fields')
const { GQLListSchema, getById } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')

const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const access = require('@condo/domains/billing/access/BillingIntegrationOrganizationContext')
const { hasValidJsonStructure } = require('@condo/domains/common/utils/validation.utils')
const { validateReport } = require('@condo/domains/billing/utils/validation.utils')
const {
    BILLING_INTEGRATION_ORGANIZATION_CONTEXT_STATUSES,
    BILLING_INTEGRATION_ORGANIZATION_CONTEXT_IN_PROGRESS_STATUS,
} = require('@condo/domains/billing/constants/constants')
const {
    CONTEXT_NO_OPTION_PROVIDED,
    CONTEXT_REDUNDANT_OPTION,
    CONTEXT_OPTION_NAME_MATCH,
} = require('@condo/domains/billing/constants/errors')



const BillingIntegrationOrganizationContext = new GQLListSchema('BillingIntegrationOrganizationContext', {
    schemaDoc: 'Integration state and settings for all organizations. The existence of this object means that there is a configured integration between the `billing data source` and `this API`',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        integration: {
            schemaDoc: 'ID of the integration that is configured to receive data for the organization',
            type: Relationship,
            ref: 'BillingIntegration',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
        },

        organization: ORGANIZATION_OWNED_FIELD,

        settings: {
            schemaDoc: 'Settings that are required to get data from the `billing data source`. It can also contain fine-tuning optional integration settings. The data structure depends on the integration and defined there',
            type: Json,
            isRequired: true,
            hooks: {
                validateInput: (args) => {
                    hasValidJsonStructure(args, true, 1, {})
                },
            },
        },

        status: {
            schemaDoc: `Status of integration process. Can be: ${BILLING_INTEGRATION_ORGANIZATION_CONTEXT_STATUSES.join(', ')}`,
            type: Select,
            dataType: 'string',
            isRequired: true,
            options: BILLING_INTEGRATION_ORGANIZATION_CONTEXT_STATUSES,
            defaultValue: BILLING_INTEGRATION_ORGANIZATION_CONTEXT_IN_PROGRESS_STATUS,
        },

        state: {
            schemaDoc: 'The current state of the integration process. Some integration need to store past state or data related to cache files/folders for past state. The data structure depends on the integration and defined there',
            type: Json,
            isRequired: true,
            hooks: {
                validateInput: (args) => {
                    hasValidJsonStructure(args, true, 1, {})
                },
            },
        },

        lastReport: {
            schemaDoc: 'Information about last report, such as time of report, period of report, amount of loaded data and etc',
            type: Json,
            isRequired: false,
            hooks: {
                validateInput: validateReport,
            },
        },

        integrationOption: {
            schemaDoc: 'Name of billing integration option, if it has more than 1 variants. Example: registry format. Using "name" as unique identifier inside single billing',
            isRequired: false,
            type: Text,
        },

        paymentsAllowedFrom: {
            schemaDoc: 'Datetime from which receipts from this billing are able to be paid for',
            type: DateTimeUtc,
            isRequired: false,
        },

        paymentsAllowedTo: {
            schemaDoc: 'Datetime to which receipts from this billing are able to be paid for',
            type: DateTimeUtc,
            isRequired: false,
        },

        isPaymentsAllowed: {
            schemaDoc: 'A simply alias for paymentsAllowedFrom and paymentsAllowedTo logic: If now date is between these dates, returns true. Othervise returns false',
            type: Virtual,
            resolver: (item) => {
                const now = dayjs()
                const from = dayjs(get(item, 'paymentsAllowedFrom'))
                const to = dayjs(get(item, 'paymentsAllowedTo'))
                return from < now && now < to
            },
        },
    },

    hooks: {
        validateInput: async ({ existingItem, resolvedData, operation, addValidationError }) => {
            const integrationId = operation === 'create' ? resolvedData['integration'] : existingItem['integration']
            // NOTE: Item will always exist, since field "integration" is required and keystone does existence-checks automatically
            const integration = await getById('BillingIntegration', integrationId)
            const options = get(integration, ['availableOptions', 'options'], [])
            if (options.length) {
                const newItem = {
                    ...existingItem,
                    ...resolvedData,
                }
                const optionName = get(newItem, ['integrationOption'])
                if (!optionName) {
                    return addValidationError(CONTEXT_NO_OPTION_PROVIDED)
                }
                const matchingOptions = options
                    .filter(option => option.name === optionName)
                if (!matchingOptions.length) {
                    addValidationError(CONTEXT_OPTION_NAME_MATCH)
                }
                // NOTE: not lodash get, since "" is invalid input, but null / undefined is valid
            } else if (resolvedData.hasOwnProperty('integrationOption') && resolvedData['integrationOption'] !== null) {
                return addValidationError(CONTEXT_REDUNDANT_OPTION)
            }
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadBillingIntegrationOrganizationContexts,
        create: access.canManageBillingIntegrationOrganizationContexts,
        update: access.canManageBillingIntegrationOrganizationContexts,
        delete: false,
        auth: true,
    },
})

module.exports = {
    BillingIntegrationOrganizationContext,
}
