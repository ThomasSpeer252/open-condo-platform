/**
 * Generated by `createschema resident.Resident 'user:Relationship:User:CASCADE; organization:Relationship:Organization:PROTECT; property:Relationship:Property:PROTECT; billingAccount?:Relationship:BillingAccount:SET_NULL; unitName:Text;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const { faker } = require('@faker-js/faker')
const { get } = require('lodash')


const { generateGQLTestUtils, throwIfError } = require('@open-condo/codegen/generate.test.utils')


/* AUTOGENERATE MARKER <IMPORT> */


const { makeLoggedInAdminClient } = require('@open-condo/keystone/test.utils')

const { INVOICE_PAYMENT_TYPE_ONLINE } = require('@condo/domains/marketplace/constants')
const { FLAT_UNIT_TYPE } = require('@condo/domains/property/constants/common')
const { makeClientWithResidentAccessAndProperty } = require('@condo/domains/property/utils/testSchema')
const { buildFakeAddressAndMeta } = require('@condo/domains/property/utils/testSchema/factories')
const {
    Resident: ResidentGQL,
    ServiceConsumer: ServiceConsumerGQL,
    REGISTER_RESIDENT_MUTATION,
    REGISTER_RESIDENT_INVOICE_MUTATION,
    REGISTER_RESIDENT_SERVICE_CONSUMERS_MUTATION,
    FIND_ORGANIZATIONS_FOR_ADDRESS_QUERY,
    GET_RESIDENT_EXISTENCE_BY_PHONE_AND_ADDRESS_QUERY,
    DISCOVER_SERVICE_CONSUMERS_MUTATION,
    SEND_MESSAGE_TO_RESIDENT_SCOPES_MUTATION,
    REGISTER_SERVICE_CONSUMER_MUTATION,
} = require('@condo/domains/resident/gql')
const { makeClientWithResidentUser } = require(
    '@condo/domains/user/utils/testSchema')

const Resident = generateGQLTestUtils(ResidentGQL)
const ServiceConsumer = generateGQLTestUtils(ServiceConsumerGQL)

/* AUTOGENERATE MARKER <CONST> */

async function createTestResident (client, user, property, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!user || !user.id) throw new Error('no user.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const address = extraAttrs.address || get(property, 'address')
    const addressMeta = extraAttrs.addressMeta || get(property, 'addressMeta')

    const attrs = {
        dv: 1,
        sender,
        user: { connect: { id: user.id } },
        unitName: faker.random.alphaNumeric(8),
        unitType: FLAT_UNIT_TYPE,
        address,
        addressMeta,
        ...extraAttrs,
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

async function registerResidentByTestClient (client, extraAttrs = {}, withFlat = false) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const { address, addressMeta } = buildFakeAddressAndMeta(withFlat)
    const unitName = faker.random.alphaNumeric(3)

    const attrs = {
        dv: 1,
        sender,
        address,
        addressMeta,
        unitName,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(REGISTER_RESIDENT_MUTATION, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function createTestServiceConsumer (client, resident, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!resident || !resident.id) throw new Error('no resident.id')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        resident: { connect: { id: resident.id } },
        organization: { connect: { id: organization.id } },
        accountNumber: faker.random.alphaNumeric(8),
        ...extraAttrs,
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

async function registerServiceConsumerByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(REGISTER_SERVICE_CONSUMER_MUTATION, { data: attrs })
    throwIfError(data, errors)
    return [data.obj, attrs]
}


async function sendMessageToResidentScopesByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(SEND_MESSAGE_TO_RESIDENT_SCOPES_MUTATION, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function discoverServiceConsumersByTestClient (client, args, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!args) throw new Error('no data')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...args,
    }
    const { data, errors } = await client.mutate(DISCOVER_SERVICE_CONSUMERS_MUTATION, { data: attrs })

    if (!extraAttrs.raw) {
        throwIfError(data, errors)
    }

    return [data.result, errors, attrs]
}

async function getResidentExistenceByPhoneAndAddressByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(GET_RESIDENT_EXISTENCE_BY_PHONE_AND_ADDRESS_QUERY, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function findOrganizationsForAddressByTestClient (client, attrs = {}) {
    if (!client) throw new Error('no client')
    const { data, errors } = await client.query(FIND_ORGANIZATIONS_FOR_ADDRESS_QUERY, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}
/* AUTOGENERATE MARKER <FACTORY> */

async function makeClientWithServiceConsumer () {
    const client = await makeClientWithResidentAccessAndProperty()
    const adminClient = await makeLoggedInAdminClient()

    const [resident] = await createTestResident(adminClient, client.user, client.property)
    const [consumer] = await createTestServiceConsumer(adminClient, resident, client.organization)

    client.resident = resident
    client.serviceConsumer = consumer

    return client
}

/**
 * Creates a user with type resident and resident entity.
 * If you want to create only user with type resident use makeClientWithResidentUser
 */
async function makeClientWithResident () {
    const client = await makeClientWithResidentUser()
    const [resident, residentAttrs] = await registerResidentByTestClient(client)

    client.resident = resident
    client.residentAttrs = residentAttrs

    return client
}

async function registerResidentServiceConsumersByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = { dv: 1, sender, ...extraAttrs }
    const { data, errors } = await client.mutate(REGISTER_RESIDENT_SERVICE_CONSUMERS_MUTATION, { data: attrs })
    throwIfError(data, errors)
    return [data.objs, attrs]
}

async function registerResidentInvoiceByTestClient (client, resident, invoiceRows, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!resident || !resident.id) throw new Error('no resident.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        resident,
        invoiceRows,
        paymentType: INVOICE_PAYMENT_TYPE_ONLINE,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(REGISTER_RESIDENT_INVOICE_MUTATION, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

module.exports = {
    Resident, createTestResident, updateTestResident,
    registerResidentByTestClient, makeClientWithResident,
    ServiceConsumer, createTestServiceConsumer, updateTestServiceConsumer,
    makeClientWithServiceConsumer,
    registerServiceConsumerByTestClient,
    sendMessageToResidentScopesByTestClient,
    discoverServiceConsumersByTestClient,
    getResidentExistenceByPhoneAndAddressByTestClient,
    registerResidentServiceConsumersByTestClient,
    registerResidentInvoiceByTestClient,
    findOrganizationsForAddressByTestClient,
/* AUTOGENERATE MARKER <EXPORTS> */
}
