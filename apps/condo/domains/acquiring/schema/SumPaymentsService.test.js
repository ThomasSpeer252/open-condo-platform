/**
 * Generated by `createservice acquiring.SumPaymentsService`
 */

const Big = require('big.js')
const { makeClient } = require('@condo/keystone/test.utils')

const { makePayer, createTestPayment, sumPaymentsByTestClient, createPaymentsAndGetSum } = require('@condo/domains/acquiring/utils/testSchema')
const { makeClientWithSupportUser, makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { createTestOrganizationEmployeeRole, createTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { catchErrorFrom, expectToThrowAuthenticationError } = require('@condo/domains/common/utils/testSchema')

describe('SumPaymentsService', () => {
    describe('logic and correct summing', () => {
        test('admin: sum one payment', async () => {
            const { client: admin, organization, sum: manualSum } = await createPaymentsAndGetSum()
            const where = { organization: { id: organization.id } }
            const { sum } = await sumPaymentsByTestClient(admin, where)

            expect(String(sum)).toEqual(manualSum)
        })
        test('admin: sum 101 payments', async () => {
            const { client: admin, organization, sum: manualSum } = await createPaymentsAndGetSum(101)
            const where = { organization: { id: organization.id } }
            const { sum } = await sumPaymentsByTestClient(admin, where)

            expect(String(sum)).toEqual(manualSum)
        })
        test('admin: sum zero payments', async () => {
            const { admin, organization } = await makePayer()
            const where = { organization: { id: organization.id } }
            const { sum } = await sumPaymentsByTestClient(admin, where)

            expect(String(sum)).toEqual(Big(0).toFixed(8))
        })
    })
    describe('access checks', () => {
        test('support can sum payments', async () => {
            const { organization, sum: manualSum } = await createPaymentsAndGetSum(10)
            const support = await makeClientWithSupportUser()
            const where = { organization: { id: organization.id } }
            const { sum } = await sumPaymentsByTestClient(support, where)

            expect(String(sum)).toEqual(manualSum)
        })
        test('employee with canReadPayments can sum payments', async () => {
            const { client: admin, organization, sum: manualSum } = await createPaymentsAndGetSum(10)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canReadPayments: true,
            })
            const employeeClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, employeeClient.user, role)
            const where = { organization: { id: organization.id } }
            const { sum } = await sumPaymentsByTestClient(employeeClient, where)

            expect(String(sum)).toEqual(manualSum)
        })
        test('employee without canReadPayments cant sum payments', async () => {
            const { admin, billingReceipts, acquiringContext, organization } = await makePayer()
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canReadPayments: false,
            })
            const employeeClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, employeeClient.user, role)

            await createTestPayment(admin, organization, billingReceipts[0], acquiringContext)

            const where = { organization: { id: organization.id } }
            await catchErrorFrom(async () => {
                await sumPaymentsByTestClient(employeeClient, where)
            }, ({ errors }) => {
                expect(errors).toMatchObject([{
                    'message': 'You do not have access to this resource',
                    'name': 'AccessDeniedError',
                    'path': ['result'],
                    'data': {
                        'type': 'query',
                        'target': '_allPaymentsSum',
                    },
                }])
            })
        })
        test('anonymous cant sum payments', async () => {
            const { admin, billingReceipts, acquiringContext, organization } = await makePayer()
            const anonymous = await makeClient()
            await createTestPayment(admin, organization, billingReceipts[0], acquiringContext)

            const where = { organization: { id: organization.id } }
            await expectToThrowAuthenticationError(async () => {
                await sumPaymentsByTestClient(anonymous, where)
            }, 'result')
        })
    })
})