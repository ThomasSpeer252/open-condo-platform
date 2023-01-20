/**
 * Generated by `createservice billing.ExportPaymentsService`
 */

const faker = require('faker')

const { makeClient } = require('@open-condo/keystone/test.utils')

const { EXPORT_PAYMENTS_TO_EXCEL } = require('@condo/domains/acquiring/gql')
const { makePayer, createTestPayment } = require('@condo/domains/acquiring/utils/testSchema')
const { createTestContact } = require('@condo/domains/contact/utils/testSchema')
const { DEFAULT_ORGANIZATION_TIMEZONE } = require('@condo/domains/organization/constants/common')
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')

function prepareVariables (organization) {
    return {
        data: {
            dv: 1,
            sender: { dv: 1, fingerprint: 'test-' + faker.random.alphaNumeric(8) },
            where: { organization: { id: organization.id } },
            sortBy: 'advancedAt_DESC',
            timeZone: DEFAULT_ORGANIZATION_TIMEZONE,
        },
    }
}

describe('ExportPaymentsService', () => {
    describe('User', () => {
        it('can get payments export from selected organization', async () => {
            const { admin, billingReceipts, acquiringContext, organization } = await makePayer()
            await createTestPayment(admin, organization, billingReceipts[0], acquiringContext)

            const {
                data: {
                    result: {
                        status,
                        linkToFile,
                    },
                },
            } = await admin.query(EXPORT_PAYMENTS_TO_EXCEL, prepareVariables(organization))

            expect(status).toBe('ok')
            expect(linkToFile).not.toHaveLength(0)
        })

        it('can not get contacts export from another organization', async () => {
            const { admin, billingReceipts, acquiringContext, organization } = await makePayer()
            const { organization: organization2 } = await makePayer()
            await createTestPayment(admin, organization, billingReceipts[0], acquiringContext)

            const {
                data: { result },
                errors,
            } = await admin.query(EXPORT_PAYMENTS_TO_EXCEL, prepareVariables(organization2))

            expect(result).toBeNull()
            expect(errors).toHaveLength(1)
        })

        it('can not get payments export in case of no payments found', async () => {
            const { admin, organization } = await makePayer()

            const {
                data: { result },
                errors,
            } = await admin.query(EXPORT_PAYMENTS_TO_EXCEL, prepareVariables(organization))

            expect(result).toBeNull()
            expect(errors).toHaveLength(1)
            expect(errors).toMatchObject([{
                message: 'No payments found to export',
                path: ['result'],
                extensions: {
                    query: 'exportPaymentsToExcel',
                    code: 'BAD_USER_INPUT',
                    type: 'NOTHING_TO_EXPORT',
                    message: 'No payments found to export',
                },
            }])
        })
    })

    describe('Anonymous', () => {
        it('can not get payments export', async () => {
            const client = await makeClient()
            const client2 = await makeClientWithProperty()
            await createTestContact(client2, client2.organization, client2.property)

            const {
                data: { result },
                errors,
            } = await client.query(EXPORT_PAYMENTS_TO_EXCEL, prepareVariables(client2.organization))

            expect(result).toBeNull()
            expect(errors).toHaveLength(1)
            expect(errors[0]).toMatchObject({
                'message': 'No or incorrect authentication credentials',
                'name': 'AuthenticationError',
            })
        })
    })
})
