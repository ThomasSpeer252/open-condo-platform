/**
 * Generated by `createschema billing.BillingCategory 'name:Text'`
 */

const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const access = require('@condo/domains/billing/access/BillingCategory')
const { LocalizedText } = require('@core/keystone/fields')
const { dvAndSender } = require('../../common/schema/plugins/dvAndSender')


const BillingCategory = new GQLListSchema('BillingCategory', {
    schemaDoc: 'Payment category - used primarily in display purposes',
    fields: {
        name: {
            schemaDoc: 'Localized name of billing category: Hot water, Cold water, Housing Services',
            type: LocalizedText,
            isRequired: true,
            template: 'billing.category.*.name',
        },
    },
    labelResolver: item => item.id,
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadBillingCategories,
        create: access.canManageBillingCategories,
        update: access.canManageBillingCategories,
        delete: false,
        auth: true,
    },
    escapeSearch: true,
})

module.exports = {
    BillingCategory,
}
