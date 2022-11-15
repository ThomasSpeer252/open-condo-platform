/**
 * Generated by `createschema banking.BankCategory 'name:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateServerUtils, execGqlWithoutAccess } = require('@open-condo/codegen/generate.server.utils')

const { BankAccount: BankAccountGQL } = require('@condo/domains/banking/gql')
const { BankCategory: BankCategoryGQL } = require('@condo/domains/banking/gql')
const { BankCostItem: BankCostItemGQL } = require('@condo/domains/banking/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const BankAccount = generateServerUtils(BankAccountGQL)
const BankCategory = generateServerUtils(BankCategoryGQL)
const BankCostItem = generateServerUtils(BankCostItemGQL)
/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    BankAccount,
    BankCategory,
    BankCostItem,
/* AUTOGENERATE MARKER <EXPORTS> */
}
