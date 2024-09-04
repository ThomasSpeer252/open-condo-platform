/**
 * Generated by `createschema acquiring.AcquiringIntegration 'name:Text;'`
 */

const { get, has, uniq } = require('lodash')

const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema, find } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/acquiring/access/AcquiringIntegration')
const { CONTEXT_STATUSES, CONTEXT_IN_PROGRESS_STATUS } = require('@condo/domains/acquiring/constants/context')
const { SUPPORTED_BILLING_INTEGRATION_GROUP_DOESNT_EXIST_ERROR } = require('@condo/domains/acquiring/constants/errors')
const { FEE_DISTRIBUTION_SCHEMA_FIELD } = require('@condo/domains/acquiring/schema/fields/json/FeeDistribution')
const { DEFAULT_BILLING_INTEGRATION_GROUP } = require('@condo/domains/billing/constants/constants')
const { POSITIVE_MONEY_AMOUNT_FIELD } = require('@condo/domains/common/schema/fields')
const {
    IFRAME_URL_FIELD,
    IS_HIDDEN_FIELD,
    CONTEXT_DEFAULT_STATUS_FIELD,
} = require('@condo/domains/miniapp/schema/fields/integration')

const AcquiringIntegration = new GQLListSchema('AcquiringIntegration', {
    schemaDoc: 'Information about `acquiring component` which will generate `billing receipts` and `payments`',
    fields: {
        name: {
            schemaDoc: 'Name of `acquiring component`, which is set up by developer',
            type: 'Text',
            isRequired: true,
        },

        setupUrl: {
            ...IFRAME_URL_FIELD,
            schemaDoc: 'Url to setup page of acquiring integration',
            adminDoc: 'Url to setup page of acquiring integration',
        },

        isHidden: IS_HIDDEN_FIELD,

        accessRights: {
            type: 'Relationship',
            ref: 'AcquiringIntegrationAccessRight.integration',
            many: true,
            access: { create: false, update: false },
        },

        canGroupReceipts: {
            schemaDoc: 'Can multiple receipts be united through this acquiring',
            type: 'Checkbox',
            defaultValue: false,
            knexOptions: { isNotNullable: false },
            isRequired: true,
        },

        hostUrl: {
            schemaDoc: 'Url to acquiring integration service. Mobile devices will use it communicate with external acquiring. List of endpoints is the same for all of them.',
            type: 'Text',
            isRequired: true,
        },

        supportedBillingIntegrationsGroup: {
            adminDoc: 'To successfully complete the payment billing integration of the billing receipt should be supported by acquiring (supportedBillingIntegration should be the same as BillingReceipt.context.integration.group). Validations: Should equal any existing BillingIntegration.group.',
            schemaDoc: 'Supported billing integrations group. Useful when you need to restrict this acquiring to accept payment only from certain billing.',
            type: 'Text',
            isRequired: true,
            defaultValue: DEFAULT_BILLING_INTEGRATION_GROUP,
            hooks: {
                validateInput: async ({ resolvedData, addFieldValidationError }) => {
                    const resolvedGroup = get(resolvedData, ['supportedBillingIntegrationsGroup'])

                    const existingBillingIntegrations = await find('BillingIntegration', { group: resolvedGroup, deletedAt: null })

                    if (existingBillingIntegrations.length === 0) {
                        addFieldValidationError(SUPPORTED_BILLING_INTEGRATION_GROUP_DOESNT_EXIST_ERROR)
                    }
                },
            },
        },
        minimumPaymentAmount: {
            ...POSITIVE_MONEY_AMOUNT_FIELD,
            schemaDoc: 'The minimum payment amount that can be accepted',
        },
        explicitFeeDistributionSchema: {
            ...FEE_DISTRIBUTION_SCHEMA_FIELD,
            schemaDoc: 'Contains information about the default distribution of explicit fee. Each part is paid by the user on top of original amount if there is no part with the same name in the integration context. Otherwise, the part is ignored as it is paid by recipient',
        },
        contextDefaultStatus: {
            ...CONTEXT_DEFAULT_STATUS_FIELD,
            options: CONTEXT_STATUSES,
            defaultValue: CONTEXT_IN_PROGRESS_STATUS,
        },
        vatPercentOptions: {
            schemaDoc: 'Comma separated values of VAT. Set by system administrators.',
            adminDoc: 'For example: "0,10,20" is for RU',
            type: 'Text',
            isRequired: false,
            hooks: {
                resolveInput: async ({ resolvedData, fieldPath }) => {
                    if (has(resolvedData, fieldPath)) {
                        const values = get(resolvedData, fieldPath, '') || ''
                        return uniq(values.split(',').map(Number).filter((value) => !isNaN(value))).join(',')
                    }
                },
            },
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadAcquiringIntegrations,
        create: access.canManageAcquiringIntegrations,
        update: access.canManageAcquiringIntegrations,
        delete: false,
        auth: true,
    },
})

module.exports = {
    AcquiringIntegration,
}
