/**
 * Generated by `createschema banking.BankCostItem 'name:Text;category:Relationship:BankCategory:SET_NULL'`
 */

const { Relationship } = require('@keystonejs/fields')

const { LocalizedText } = require('@open-condo/keystone/fields')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/banking/access/BankCostItem')


const BankCostItem = new GQLListSchema('BankCostItem', {
    schemaDoc: 'Expenses classification item for BankTransaction. Will be determined by automatic classification feature for each transaction',
    fields: {
        name: {
            schemaDoc: 'Name of expenses item as key for i18n',
            type: LocalizedText,
            template: 'banking.category.*.name',
            isRequired: true,
        },
        category: {
            schemaDoc: 'Used only for grouping to display in UI. Does not used in automatic classification feature',
            type: Relationship,
            ref: 'BankCategory',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.PROTECT' },
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadBankCostItems,
        create: access.canManageBankCostItems,
        update: access.canManageBankCostItems,
        delete: false,
        auth: true,
    },
})

module.exports = {
    BankCostItem,
}
