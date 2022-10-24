/**
 * Generated by `createschema subscription.ServiceSubscription 'type:Select:default,sbbol; isTrial:Checkbox; organization:Relationship:Organization:CASCADE; startAt:DateTimeUtc; finishAt:DateTimeUtc;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')

const { generateGQLTestUtils } = require('@condo/codegen/generate.test.utils')

const { ServiceSubscription: ServiceSubscriptionGQL } = require('@condo/domains/subscription/gql')
const dayjs = require('dayjs')
const { catchErrorFrom } = require('@condo/keystone/test.utils')
const { ServiceSubscriptionPayment: ServiceSubscriptionPaymentGQL } = require('@condo/domains/subscription/gql')
const { SUBSCRIPTION_PAYMENT_STATUS } = require('../../constants')
const { SUBSCRIPTION_TYPE } = require('../../constants')
const { WRONG_PAYMENT_STATUS_TRANSITION_ERROR } = require('../../constants/errors')
const { makeLoggedInAdminClient } = require('@condo/keystone/test.utils')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
/* AUTOGENERATE MARKER <IMPORT> */

const ServiceSubscription = generateGQLTestUtils(ServiceSubscriptionGQL)
const ServiceSubscriptionPayment = generateGQLTestUtils(ServiceSubscriptionPaymentGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createTestServiceSubscription (client, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const type = 'default'
    const isTrial = false
    const startAt = dayjs()
    const finishAt = dayjs().add(15, 'days')
    const unitsCount = faker.datatype.number()
    const unitPrice = faker.datatype.float({ precision: 0.01 })
    const totalPrice = unitsCount * unitPrice
    const currency = 'RUB'

    const attrs = {
        dv: 1,
        sender,
        type,
        isTrial,
        startAt,
        finishAt,
        unitsCount,
        unitPrice: String(unitPrice),
        totalPrice: String(totalPrice),
        currency,
        organization: { connect: { id: organization.id } },
        ...extraAttrs,
    }
    const obj = await ServiceSubscription.create(client, attrs)
    return [obj, attrs]
}

async function updateTestServiceSubscription (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestServiceSubscription logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await ServiceSubscription.update(client, id, attrs)
    return [obj, attrs]
}

const expectOverlappingFor = async (action, ...args) => (
    await catchErrorFrom(async () => {
        await action(...args)
    }, ({ errors, data }) => {
        expect(errors[0].data.messages[0]).toMatch('[overlapping]')
        expect(data).toEqual({ 'obj': null })
    })
)

async function createTestServiceSubscriptionPayment (client, organization, subscription, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    if (!subscription || !subscription.id) throw new Error('no subscription.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const type = 'default'
    const status = SUBSCRIPTION_PAYMENT_STATUS.CREATED
    const amount = faker.datatype.float({ precision: 0.01 }).toString()
    const currency = 'RUB'

    const attrs = {
        dv: 1,
        sender,
        type,
        status,
        amount,
        currency,
        organization: { connect: { id: organization.id } },
        subscription: { connect: { id: subscription.id } },
        ...extraAttrs,
    }
    const obj = await ServiceSubscriptionPayment.create(client, attrs)
    return [obj, attrs]
}

async function updateTestServiceSubscriptionPayment (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        status: SUBSCRIPTION_PAYMENT_STATUS.PROCESSING,
        type: SUBSCRIPTION_TYPE.SBBOL,
        amount: faker.datatype.float({ precision: 0.01 }).toString(),
        ...extraAttrs,
    }
    const obj = await ServiceSubscriptionPayment.update(client, id, attrs)
    return [obj, attrs]
}

async function expectErrorByChangingStatusOfPayment ({ from, to }) {
    const adminClient = await makeLoggedInAdminClient()
    const [organization] = await createTestOrganization(adminClient)
    const [subscription] = await createTestServiceSubscription(adminClient, organization)
    const [obj] = await createTestServiceSubscriptionPayment(adminClient, organization, subscription, {
        status: from,
    })

    const changeToCreated = {
        status: to,
    }
    await catchErrorFrom(async () => {
        await updateTestServiceSubscriptionPayment(adminClient, obj.id, changeToCreated)
    }, ({ errors, data }) => {
        expect(errors[0].data.messages[0]).toMatch((WRONG_PAYMENT_STATUS_TRANSITION_ERROR + ` ServiceSubscriptionPayment(id=${obj.id}) cannot change status from '${obj.status}' to '${changeToCreated.status}'`))
        expect(data).toEqual({ 'obj': null })
    })
}

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    ServiceSubscription, createTestServiceSubscription, updateTestServiceSubscription, expectOverlappingFor,
    ServiceSubscriptionPayment, createTestServiceSubscriptionPayment, updateTestServiceSubscriptionPayment,
    expectErrorByChangingStatusOfPayment,
/* AUTOGENERATE MARKER <EXPORTS> */
}
