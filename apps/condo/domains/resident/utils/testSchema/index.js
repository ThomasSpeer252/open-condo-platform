/**
 * Generated by `createschema resident.Resident 'user:Relationship:User:CASCADE; organization:Relationship:Organization:PROTECT; property:Relationship:Property:PROTECT; billingAccount?:Relationship:BillingAccount:SET_NULL; unitName:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')
const { get } = require('lodash')
// TODO (savelevMatthew): Fix this
const { buildFakeAddressMeta } = require('@condo/domains/common/utils/testSchema/factories')

const { generateServerUtils, execGqlWithoutAccess } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')

const { generateGQLTestUtils, throwIfError } = require('@condo/domains/common/utils/codegeneration/generate.test.utils')

const { Resident: ResidentGQL } = require('@condo/domains/resident/gql')
const { REGISTER_RESIDENT_MUTATION } = require('@condo/domains/resident/gql')
const { ServiceConsumer: ServiceConsumerGQL } = require('@condo/domains/resident/gql')
const { REGISTER_CONSUMER_SERVICE_MUTATION } = require('@condo/domains/resident/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { createTestBillingAccount, createTestBillingProperty, makeContextWithOrganizationAndIntegrationAsAdmin } = require('@condo/domains/billing/utils/testSchema')
const { makeLoggedInAdminClient } = require('@core/keystone/test.utils')

const Resident = generateGQLTestUtils(ResidentGQL)
const ServiceConsumer = generateGQLTestUtils(ServiceConsumerGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createTestResident (client, user, organization, property, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!user || !user.id) throw new Error('no user.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const address = extraAttrs.address || get(property, 'address')
    const addressMeta = extraAttrs.addressMeta || get(property, 'addressMeta')

    const attrs = {
        dv: 1,
        sender,
        user: { connect: { id: user.id } },
        unitName: faker.random.alphaNumeric(3),
        address,
        addressMeta,
        ...extraAttrs,
    }
    if (organization) {
        attrs.organization = { connect: { id: organization.id } }
    }
    if (property) {
        attrs.property = { connect: { id: property.id } }
    }
    const obj = await Resident.create(client, attrs)
    return [obj, attrs]
}

async function updateTestResident (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await Resident.update(client, id, attrs)
    return [obj, attrs]
}

async function registerResidentByTestClient(client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const address = faker.address.streetAddress(true)
    const unitName = faker.random.alphaNumeric(3)

    const attrs = {
        dv: 1,
        sender,
        address,
        addressMeta: buildFakeAddressMeta(address),
        unitName,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(REGISTER_RESIDENT_MUTATION, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function createTestServiceConsumer (client, resident, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!resident || !resident.id) throw new Error('no resident.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        resident: { connect: { id: resident.id } },
        accountNumber: faker.random.alphaNumeric(8)
    }
    const obj = await ServiceConsumer.create(client, attrs)
    return [obj, attrs]
}

async function updateTestServiceConsumer (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestServiceConsumer logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await ServiceConsumer.update(client, id, attrs)
    return [obj, attrs]
}

async function registerConsumerServiceByTestClient(client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(REGISTER_CONSUMER_SERVICE_MUTATION, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}
/* AUTOGENERATE MARKER <FACTORY> */

async function createTestServiceConsumerForUserAsAdmin() {
    const userClient = await makeClientWithProperty()
    const adminClient = await makeLoggedInAdminClient()

    const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
    const [billingProperty] = await createTestBillingProperty(adminClient, context)
    const [billingAccount] = await createTestBillingAccount(adminClient, context, billingProperty)

    const fields = {
        billingAccount: { connect: { id: billingAccount.id } },
    }

    const [resident] = await createTestResident(adminClient, userClient.user, userClient.organization, userClient.property, fields)
    const [consumer] = await createTestServiceConsumer(adminClient, resident)

    return [consumer, userClient, adminClient]
}

module.exports = {
    Resident, createTestResident, updateTestResident,
    registerResidentByTestClient,
    ServiceConsumer, createTestServiceConsumer, updateTestServiceConsumer,
    createTestServiceConsumerForUserAsAdmin,
registerConsumerServiceByTestClient
/* AUTOGENERATE MARKER <EXPORTS> */
}
