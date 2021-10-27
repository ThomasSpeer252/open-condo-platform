/**
 * Generated by `createschema acquiring.MultiPayment 'amount:Decimal; commission?:Decimal; time:DateTimeUtc; cardNumber:Text; serviceCategory:Text;'`
 */

const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')
const { makePayerAndPayments } = require('@condo/domains/acquiring/utils/testSchema')

const {
    MultiPayment,
    createTestMultiPayment,
    updateTestMultiPayment,
    createTestAcquiringIntegration,
    createTestAcquiringIntegrationAccessRight,
} = require('@condo/domains/acquiring/utils/testSchema')
const {
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowAuthenticationErrorToObj,
} = require('@condo/domains/common/utils/testSchema')
const { MULTIPAYMENT_ERROR_STATUS } = require('../constants')

describe('MultiPayment', () => {
    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const { payments, acquiringIntegration, client } = await makePayerAndPayments()
                const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)
                const paymentsIds = payments.map(payment => ({ id: payment.id }))

                expect(multiPayment).toBeDefined()
                expect(multiPayment).toHaveProperty(['integration', 'id'], acquiringIntegration.id)
                expect(multiPayment).toHaveProperty('payments')
                expect(multiPayment.payments).toEqual(expect.arrayContaining(paymentsIds))
            })
            test('support can\'t', async () => {
                const support = await makeClientWithSupportUser()
                const { payments, acquiringIntegration, client } = await makePayerAndPayments()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestMultiPayment(support, payments, client.user, acquiringIntegration)
                })
            })
            test('user can\'t', async () => {
                const { payments, acquiringIntegration, client } = await makePayerAndPayments()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestMultiPayment(client, payments, client.user, acquiringIntegration)
                })
            })
            test('anonymous can\'t', async () => {
                const anonymousClient = await makeClient()
                const { payments, acquiringIntegration, client } = await makePayerAndPayments()
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestMultiPayment(anonymousClient, payments, client.user, acquiringIntegration)
                })
            })
        })
        describe('read', () => {
            test('admin can', async () => {
                const { payments, acquiringIntegration, client, admin } = await makePayerAndPayments()
                await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                const multiPayments = await MultiPayment.getAll(admin)
                expect(multiPayments).toBeDefined()
                expect(multiPayments).not.toHaveLength(0)
            })
            test('support can', async () => {
                const { payments, acquiringIntegration, client, admin } = await makePayerAndPayments()
                await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                const support = await makeClientWithSupportUser()
                const multiPayments = await MultiPayment.getAll(support)
                expect(multiPayments).toBeDefined()
                expect(multiPayments).not.toHaveLength(0)
            })
            describe('user', () => {
                test('user can see only it\'s own multipayments', async () => {
                    const { admin, payments: firstPayments, acquiringIntegration: firstAcquiringIntegration, client: firstClient } = await makePayerAndPayments()
                    const { payments: secondPayments, client: secondClient } = await makePayerAndPayments()
                    const [firstMultiPayment] = await createTestMultiPayment(admin, firstPayments, firstClient.user, firstAcquiringIntegration)
                    const [secondMultiPayment] = await createTestMultiPayment(admin, secondPayments, secondClient.user, firstAcquiringIntegration)
                    let { data: { objs: firstMultiPayments } } = await MultiPayment.getAll(firstClient, {}, { raw:true })
                    expect(firstMultiPayments).toBeDefined()
                    expect(firstMultiPayments).toHaveLength(1)
                    expect(firstMultiPayments).toHaveProperty(['0', 'id'], firstMultiPayment.id)
                    let { data: { objs: secondMultiPayments } } = await MultiPayment.getAll(secondClient, {}, { raw:true })
                    expect(secondMultiPayments).toBeDefined()
                    expect(secondMultiPayments).toHaveLength(1)
                    expect(secondMultiPayments).toHaveProperty(['0', 'id'], secondMultiPayment.id)
                })
                test('integration account can see only multipayments linked to it\'s integration', async () => {
                    const { admin, payments, acquiringIntegration: firstIntegration, client, billingIntegration } = await makePayerAndPayments()
                    const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, firstIntegration)
                    const [secondIntegration] = await createTestAcquiringIntegration(admin, [billingIntegration])

                    const firstIntegrationClient = await makeClientWithNewRegisteredAndLoggedInUser()
                    const secondIntegrationClient = await makeClientWithNewRegisteredAndLoggedInUser()
                    await createTestAcquiringIntegrationAccessRight(admin, firstIntegration, firstIntegrationClient.user)
                    await createTestAcquiringIntegrationAccessRight(admin, secondIntegration, secondIntegrationClient.user)

                    let { data: { objs: firstMultiPayments } } = await MultiPayment.getAll(firstIntegrationClient, {}, { raw:true })
                    expect(firstMultiPayments).toBeDefined()
                    expect(firstMultiPayments).toHaveLength(1)
                    expect(firstMultiPayments).toHaveProperty(['0', 'id'], multiPayment.id)
                    let { data: { objs: secondMultiPayments } } = await MultiPayment.getAll(secondIntegrationClient, {}, { raw:true })
                    expect(secondMultiPayments).toBeDefined()
                    expect(secondMultiPayments).toHaveLength(0)
                })
            })
            test('anonymous can\'t', async () => {
                const anonymousClient = await makeClient()
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await MultiPayment.getAll(anonymousClient)
                })
            })
        })
        describe('update', () => {
            test('admin can', async () => {
                const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                const [updatedMultiPayment] = await updateTestMultiPayment(admin, multiPayment.id, {
                    status: MULTIPAYMENT_ERROR_STATUS,
                })
                expect(updatedMultiPayment).toBeDefined()
                expect(updatedMultiPayment).toHaveProperty('status', MULTIPAYMENT_ERROR_STATUS)

            })
            test('support can\'t', async () => {
                const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                const support = await makeClientWithSupportUser()
                const payload = {}
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestMultiPayment(support, multiPayment.id, payload)
                })
            })
            describe('user',  () => {
                test('acquiring integration account can change it\'s own multipayments', async () => {
                    const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                    const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                    const integrationClient = await makeClientWithNewRegisteredAndLoggedInUser()
                    await createTestAcquiringIntegrationAccessRight(admin, acquiringIntegration, integrationClient.user)
                    const [updatedMultiPayment, updatedMultiPaymentAttrs] = await updateTestMultiPayment(integrationClient, multiPayment.id, {
                        status: MULTIPAYMENT_ERROR_STATUS,
                    }, { raw:true })
                    expect(updatedMultiPaymentAttrs).toBeDefined()
                    expect(updatedMultiPaymentAttrs).toHaveProperty('status', MULTIPAYMENT_ERROR_STATUS)
                })
                test('user can\'t', async () => {
                    const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                    const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                    const payload = {}
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await updateTestMultiPayment(client, multiPayment.id, payload)
                    })
                })
            })
            test('anonymous can\'t', async () => {
                const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                const anonymousClient = await makeClient()
                const payload = {}
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestMultiPayment(anonymousClient, multiPayment.id, payload)
                })
            })
        })
        describe('delete',  () => {
            test('admin can\'t', async () => {
                const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await MultiPayment.delete(admin, multiPayment.id)
                })
            })
            test('support can\'t', async () => {
                const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                const support = await makeClientWithSupportUser()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await MultiPayment.delete(support, multiPayment.id)
                })
            })

            test('user can\'t', async () => {
                const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await MultiPayment.delete(client, multiPayment.id)
                })
            })

            test('anonymous can\'t', async () => {
                const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
                const [multiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)

                const anonymousClient = await makeClient()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await MultiPayment.delete(anonymousClient, multiPayment.id)
                })
            })
        })
    })
    describe('real-life cases', () => {
        // TODO (savelevMatthew) write tests

        test('mobile resident can\'t see his sensitive data in his own MultiPayments', async () => {
            const { admin, payments, acquiringIntegration, client } = await makePayerAndPayments()
            const [createdMultiPayment] = await createTestMultiPayment(admin, payments, client.user, acquiringIntegration)
            // We use raw: true because when using field access, all fields that are not permitted result in error which stops the test
            let { data: { objs: multiPayments } } = await MultiPayment.getAll(client, {}, { raw: true })
            expect(multiPayments).toBeDefined()
            expect(multiPayments).toHaveLength(1)
            const retrievedMultiPayment = multiPayments[0]
            expect(retrievedMultiPayment.id).toBe(createdMultiPayment.id)
            expect(retrievedMultiPayment.implicitFee).toBeNull()
            expect(retrievedMultiPayment.transactionId).toBeNull()
            expect(retrievedMultiPayment.meta).toBeNull()
        })
    })
})
