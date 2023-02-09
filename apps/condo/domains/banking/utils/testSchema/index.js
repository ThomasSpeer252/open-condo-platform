/**
 * Generated by `createschema banking.BankCategory 'name:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')
const dayjs = require('dayjs')

const { createValidRuBankAccount } = require('@condo/domains/banking/utils/testSchema/bankAccount')
const { RUSSIA_COUNTRY } = require('@condo/domains/common/constants/countries')
const { generateGQLTestUtils, throwIfError } = require('@open-condo/codegen/generate.test.utils')
const { BankCategory: BankCategoryGQL } = require('@condo/domains/banking/gql')
const { BankCostItem: BankCostItemGQL } = require('@condo/domains/banking/gql')
const { BankAccount: BankAccountGQL } = require('@condo/domains/banking/gql')
const { BankContractorAccount: BankContractorAccountGQL } = require('@condo/domains/banking/gql')
const { BankIntegration: BankIntegrationGQL, CREATE_BANK_ACCOUNT_REQUEST_MUTATION } = require('@condo/domains/banking/gql')
const { BankIntegrationContext: BankIntegrationContextGQL } = require('@condo/domains/banking/gql')
const { BankTransaction: BankTransactionGQL } = require('@condo/domains/banking/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const BankCategory = generateGQLTestUtils(BankCategoryGQL)
const BankCostItem = generateGQLTestUtils(BankCostItemGQL)
const BankAccount = generateGQLTestUtils(BankAccountGQL)
const BankContractorAccount = generateGQLTestUtils(BankContractorAccountGQL)

const BankIntegration = generateGQLTestUtils(BankIntegrationGQL)
const BankIntegrationContext = generateGQLTestUtils(BankIntegrationContextGQL)
const BankTransaction = generateGQLTestUtils(BankTransactionGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createTestBankCategory (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        name: faker.lorem.word(),
        ...extraAttrs,
    }
    const obj = await BankCategory.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankCategory (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        name: faker.lorem.word(),
        ...extraAttrs,
    }
    const obj = await BankCategory.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBankCostItem (client, category, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!category || !category.id) throw new Error('no category.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        category: { connect: { id: category.id } },
        isOutcome: faker.random.boolean(),
        name: faker.lorem.word(),
        ...extraAttrs,
    }
    const obj = await BankCostItem.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankCostItem (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        name: faker.lorem.word(),
        ...extraAttrs,
    }
    const obj = await BankCostItem.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBankAccount (client, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization')

    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const bankAccount = createValidRuBankAccount()
    const attrs = {
        dv: 1,
        sender,
        organization: { connect: { id: organization.id } },
        importId: faker.datatype.uuid(),
        ...bankAccount,
        ...extraAttrs,
    }
    const obj = await BankAccount.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankAccount (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BankAccount.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBankContractorAccount (client, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        organization: { connect: { id: organization.id } },
        name: faker.lorem.word(),
        tin: String(faker.datatype.number()),
        country: RUSSIA_COUNTRY,
        routingNumber: '044525256',
        number: 'n1',
        currencyCode: 'RUB',
        importId: faker.random.alphaNumeric(24),
        territoryCode: faker.datatype.number().toString(),
        bankName: faker.lorem.word(),
        ...extraAttrs,
    }
    const obj = await BankContractorAccount.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankContractorAccount (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        name: faker.lorem.word(),
        tin: String(faker.datatype.number()),
        country: RUSSIA_COUNTRY,
        importId: faker.random.alphaNumeric(24),
        territoryCode: faker.datatype.number().toString(),
        bankName: faker.lorem.word(),
        ...extraAttrs,
    }
    const obj = await BankContractorAccount.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBankIntegration (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BankIntegration.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankIntegration (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BankIntegration.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBankIntegrationContext (client, integration, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!integration || !integration.id) throw new Error('no integration.id')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        integration: { connect: { id: integration.id } },
        organization: { connect: { id: organization.id } },
        ...extraAttrs,
    }
    const obj = await BankIntegrationContext.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankIntegrationContext (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await BankIntegrationContext.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestBankTransaction (client, account, contractorAccount, integrationContext, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!account || !account.id) throw new Error('no account.id')
    if (!contractorAccount || !contractorAccount.id) throw new Error('no contractorAccount.id')
    if (!integrationContext || !integrationContext.id) throw new Error('no integrationContext.id')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        account: { connect: { id: account.id } },
        contractorAccount: { connect: { id: contractorAccount.id } },
        integrationContext: { connect: { id: integrationContext.id } },
        organization: { connect: { id: organization.id } },
        number: faker.random.number().toString(),
        date: dayjs(faker.date.recent()).format('YYYY-MM-DD'),
        amount: faker.datatype.float({ precision: 0.01 }).toString(),
        isOutcome: faker.random.boolean(),
        currencyCode: 'RUB',
        purpose: faker.lorem.word(),
        importId: faker.datatype.uuid(),
        importRemoteSystem: faker.lorem.word(),
        meta: { someVendor: { v: '1', data: {} } },
        ...extraAttrs,
    }
    const obj = await BankTransaction.create(client, attrs)
    return [obj, attrs]
}

async function updateTestBankTransaction (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }

    const obj = await BankTransaction.update(client, id, attrs)
    return [obj, attrs]
}

async function createBankAccountRequestByTestClient(client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(CREATE_BANK_ACCOUNT_REQUEST_MUTATION, { data: attrs })
    throwIfError(data, errors, {query: CREATE_BANK_ACCOUNT_REQUEST_MUTATION, variables: { data: attrs }})
    return [data.result, attrs]
}
/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    BankCategory, createTestBankCategory, updateTestBankCategory,
    BankCostItem, createTestBankCostItem, updateTestBankCostItem,
    BankAccount, createTestBankAccount, updateTestBankAccount,
    BankContractorAccount, createTestBankContractorAccount, updateTestBankContractorAccount,
    BankIntegration, createTestBankIntegration, updateTestBankIntegration,
    BankIntegrationContext, createTestBankIntegrationContext, updateTestBankIntegrationContext,
    createBankAccountRequestByTestClient,
    BankTransaction, createTestBankTransaction, updateTestBankTransaction,
/* AUTOGENERATE MARKER <EXPORTS> */
}
