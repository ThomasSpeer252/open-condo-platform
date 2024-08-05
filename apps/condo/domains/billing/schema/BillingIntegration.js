/**
 * Generated by `createschema billing.BillingIntegration name:Text;`
 */

const { get } = require('lodash')

const { getFileMetaAfterChange } = require('@open-condo/keystone/fileAdapter/fileAdapter')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/billing/access/BillingIntegration')
const { DEFAULT_BILLING_INTEGRATION_GROUP } = require('@condo/domains/billing/constants/constants')
const {
    BILLING_INTEGRATION_WRONG_GROUP_FORMAT_ERROR,
    BILLING_INTEGRATION_EXTENDS_NO_APP_URL_ERROR,
    BILLING_INTEGRATION_SINGLE_CONNECT_WAY_ERROR,
} = require('@condo/domains/billing/constants/errors')
const { LINEAR_GRADIENT_REGEXP, HEX_CODE_REGEXP } = require('@condo/domains/common/constants/regexps')
const { CURRENCY_CODE_FIELD } = require('@condo/domains/common/schema/fields')
const { PROMO_BLOCK_TEXT_VARIANTS, PROMO_BLOCK_DARK_TEXT_VARIANT } = require('@condo/domains/miniapp/constants')
const {
    SHORT_DESCRIPTION_FIELD,
    APP_DETAILS_FIELD,
    IFRAME_URL_FIELD,
    IS_HIDDEN_FIELD,
    CONTEXT_DEFAULT_STATUS_FIELD,
} = require('@condo/domains/miniapp/schema/fields/integration')

const { DATA_FORMAT_FIELD } = require('./fields/BillingIntegration/DataFormat')
const { STATIC_FILE_FIELD, BILLING_FILE_ADAPTER } = require('./fields/common')

const logoMetaAfterChange = getFileMetaAfterChange(BILLING_FILE_ADAPTER, 'logo')
const bannerPromoMetaAfterChange = getFileMetaAfterChange(BILLING_FILE_ADAPTER, 'bannerPromoImage')

const BillingIntegration = new GQLListSchema('BillingIntegration', {
    schemaDoc: 'Identification of the `integration component` which responsible for getting data from the `billing data source` and delivering the data to `this API`. Examples: tap-1c, ... ',
    fields: {
        name: {
            schemaDoc: 'The name of the `integration component` that the developer remembers',
            type: 'Text',
            isRequired: true,
        },

        logo: {
            schemaDoc: 'Logo of integration\'s company or integration itself',
            ...STATIC_FILE_FIELD,
        },

        shortDescription: {
            adminDoc: 'Appears on the integration card',
            ...SHORT_DESCRIPTION_FIELD,
        },

        targetDescription: {
            adminDoc: 'Short text describing integration target group. Like The type of organization for which this integration is best suited. Appears in banner under the title in the integration modal',
            schemaDoc: 'Short text describing integration target group. Like The type of organization for which this integration is best suited.',
            type: 'Text',
            isRequired: true,
        },

        bannerTextColor: {
            schemaDoc: 'Controls text appearance in the integration banner',
            type: 'Select',
            options: PROMO_BLOCK_TEXT_VARIANTS,
            defaultValue: PROMO_BLOCK_DARK_TEXT_VARIANT,
            isRequired: true,
        },

        bannerColor: {
            schemaDoc: 'Background color of banner in the integration modal. Can be hex code or linear gradient.',
            type: 'Text',
            isRequired: true,
            hooks: {
                validateInput: ({ resolvedData, fieldPath, addFieldValidationError }) => {
                    if (typeof resolvedData[fieldPath] === 'string' &&
                        !LINEAR_GRADIENT_REGEXP.test(resolvedData[fieldPath]) &&
                        !HEX_CODE_REGEXP.test(resolvedData[fieldPath])) {
                        return addFieldValidationError('Invalid color specified. Color must be valid hex or linear gradient!')
                    }
                },
            },
        },

        bannerPromoImage: {
            schemaDoc: 'Image shown in the integration banner',
            ...STATIC_FILE_FIELD,
        },

        receiptsLoadingTime: {
            schemaDoc: 'A short sentence describing how long it usually takes for integration to upload receipts. Appears under correlated title in the integration modal',
            type: 'Text',
            isRequired: true,
        },

        detailedDescription: {
            adminDoc: 'Appears under the banner in the integration modal',
            ...APP_DETAILS_FIELD,
        },

        setupUrl: {
            schemaDoc: 'Url to app page, which will be opened during app connection to setup the integration. One of setupUrl and instruction fields must be filled',
            type: 'Url',
            isRequired: false,
        },

        checkAccountNumberUrl: {
            schemaDoc: 'Online request for validation of the account number',
            type: 'Url',
            isRequired: false,
        },

        checkAddressUrl: {
            schemaDoc: 'Online request to search organizations for the address',
            type: 'Url',
            isRequired: false,
        },

        instruction: {
            adminDoc: 'Short instruction for connecting the service written in markdown. One of setupUrl and instruction fields must be filled',
            schemaDoc: 'Short instruction for connecting the service written in markdown. Used in cases where integration has no frontend',
            type: 'Markdown',
            isRequired: false,
        },

        instructionExtraLink: {
            adminDoc: 'Used in cases when integration need to link external instruction or article. Shown under "View the manual" button during billing setup step',
            schemaDoc: 'Used in cases when integration need to link external instruction or article.',
            type: 'Text',
            isRequired: false,
        },

        appUrl: {
            ...IFRAME_URL_FIELD,
            schemaDoc: 'Url to the application page that extends the "Accruals and Payments" section and opens in an iframe inside an additional tab named from the "billingPageTitle" or "name" field and controlled by "extendsBillingPage" flag',
        },

        extendsBillingPage: {
            schemaDoc: 'If this flag is set to true, then in the "Accruals and Payments" section will appear an additional tab with the "billingPageTitle" or "name" field and iframe from "appUrl" inside',
            type: 'Checkbox',
            defaultValue: false,
            isRequired: true,
        },

        billingPageTitle: {
            adminDoc: 'Title is used in "Accruals and Payments" section to override name of app tab',
            schemaDoc: 'Used in billing section to override name of app tab',
            type: 'Text',
            isRequired: false,
        },

        group: {
            adminDoc: 'Any number of billings can have the same billing group. Validations: Should be a sequence of lowercase latin characters.',
            schemaDoc: 'Billing group which this billing is part of. Used to restrict certain billings from certain acquirings"',
            type: 'Text',
            isRequired: true,
            defaultValue: DEFAULT_BILLING_INTEGRATION_GROUP,
            hooks: {
                validateInput: async ({ operation, resolvedData, addFieldValidationError }) => {
                    const group = get(resolvedData, 'group')

                    if (operation === 'update' && group === undefined) { return }

                    if (/[^a-z]/.test(group) || group === '') {
                        return addFieldValidationError(BILLING_INTEGRATION_WRONG_GROUP_FORMAT_ERROR)
                    }
                },
            },
        },

        connectedMessage: {
            schemaDoc: 'The message shown to the user after the integration is connected before the first receipts are downloaded. Appeared while lastReport field of context is null',
            type: 'Text',
            isRequired: false,
        },

        uploadUrl: {
            schemaDoc: 'If specified, billing app will have a call-to-action button, which opens iframe with specified url to start receipts-uploading process. Text of a button can be overridden via "uploadMessage"',
            type: 'Url',
            isRequired: false,
        },

        uploadMessage: {
            schemaDoc: 'Overrides default "Upload receipts" message on call-to-action button',
            type: 'Text',
            isRequired: false,
        },

        contextDefaultStatus: CONTEXT_DEFAULT_STATUS_FIELD,

        dataFormat: DATA_FORMAT_FIELD,

        currencyCode: {
            ...CURRENCY_CODE_FIELD,
            schemaDoc: 'Currency which this billing uses',
            isRequired: true,
        },

        // settings data structure config (settings field for BillingIntegrationOrganizationContext)
        // state data structure config (state field for BillingIntegrationOrganizationContext)
        accessRights: {
            type: 'Relationship',
            ref: 'BillingIntegrationAccessRight.integration',
            many: true,
            access: { create: false, update: false },
        },

        isTrustedBankAccountSource: {
            schemaDoc: 'If checked, then bank account objects created by this billing are automatically approved. E.g government-controlled billing',
            type: 'Checkbox',
            isRequired: true,
            defaultValue: false,
        },

        isHidden: IS_HIDDEN_FIELD,

        skipNoAccountNotifications: {
            schemaDoc: 'If checked, then this integration\'s contexts\' billing receipts will be skipped for BILLING_RECEIPT_AVAILABLE_NO_ACCOUNT_TYPE notifications handling logic',
            type: 'Checkbox',
            isRequired: false,
            defaultValue: false,
            knexOptions: { isNotNullable: false },
        },
    },
    hooks: {
        afterChange: async (args) => {
            await logoMetaAfterChange(args)
            await bannerPromoMetaAfterChange(args)
        },
        validateInput: ({ resolvedData, addValidationError, existingItem }) => {
            const newItem = { ...existingItem, ...resolvedData }
            if ((newItem['instruction'] && newItem['setupUrl']) ||
                (!newItem['instruction'] && !newItem['setupUrl'])) {
                addValidationError(BILLING_INTEGRATION_SINGLE_CONNECT_WAY_ERROR)
            }

            if (newItem['extendsBillingPage'] && !newItem['appUrl']) {
                addValidationError(BILLING_INTEGRATION_EXTENDS_NO_APP_URL_ERROR)
            }
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadBillingIntegrations,
        create: access.canManageBillingIntegrations,
        update: access.canManageBillingIntegrations,
        delete: false,
        auth: true,
    },
})

module.exports = {
    BillingIntegration,
}
