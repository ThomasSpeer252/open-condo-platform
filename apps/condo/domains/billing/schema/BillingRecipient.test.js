/**
 * Generated by `createschema billing.BillingRecipient 'organization:Relationship:Organization:CASCADE; tin:Text; iec:Text; bic:Text; context?:Relationship:BillingIntegrationOrganizationContext:SET_NULL; bankAccount:Text; name?:Text; approved:Checkbox; meta?:Json;'`
 */

const { faker } = require('@faker-js/faker')
const dayjs = require('dayjs')

const {
    expectToThrowGraphQLRequestError, expectToThrowUniqueConstraintViolationError,
} = require('@open-condo/keystone/test.utils')
const { makeClient, makeLoggedInAdminClient } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj,
    expectToThrowAccessDeniedErrorToObj,
} = require('@open-condo/keystone/test.utils')

const {
    createTestBankAccount,
    updateTestBankAccount,
} = require('@condo/domains/banking/utils/testSchema')
const {
    BillingRecipient,
    createTestBillingRecipient,
    updateTestBillingRecipient,
    makeContextWithOrganizationAndIntegrationAsAdmin,
    createTestBillingIntegrationOrganizationContext,
    updateTestBillingIntegrationOrganizationContext,
    makeOrganizationIntegrationManager,
    makeClientWithIntegrationAccess,
} = require('@condo/domains/billing/utils/testSchema')
const {
    createTestOrganization,
    updateTestOrganization,
} = require('@condo/domains/organization/utils/testSchema')
const {
    makeClientWithSupportUser,
    makeClientWithNewRegisteredAndLoggedInUser,
} = require('@condo/domains/user/utils/testSchema')


describe('BillingRecipient', () => {
    describe('Create', () => {
        test('admin can create BillingRecipient', async () => {
            const admin = await makeLoggedInAdminClient()

            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            const [obj] = await createTestBillingRecipient(admin, context)

            expect(obj.importId).toBeDefined()
            expect(obj.tin).toBeDefined()
            expect(obj.iec).toBeDefined()
            expect(obj.bic).toBeDefined()
            expect(obj.bankAccount).toBeDefined()
            expect(obj.name).toBeDefined()
            expect(obj.isApproved).toBeDefined()
            expect(obj.meta).toBeDefined()
            expect(obj.classificationCode).toBeDefined()
        })

        test('support can\'t create BillingRecipient', async () => {
            const support = await makeClientWithSupportUser()

            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestBillingRecipient(support, context)
            })
        })

        test('billing integration can create BillingRecipient', async () => {

            const admin = await makeLoggedInAdminClient()
            const integrationClient = await makeClientWithIntegrationAccess()

            const [ organization ] = await createTestOrganization(admin)
            const [ context ] = await createTestBillingIntegrationOrganizationContext(admin, organization, integrationClient.integration)

            const [obj] = await createTestBillingRecipient(integrationClient, context)

            expect(obj.importId).toBeDefined()
            expect(obj.tin).toBeDefined()
            expect(obj.iec).toBeDefined()
            expect(obj.bic).toBeDefined()
            expect(obj.bankAccount).toBeDefined()
            expect(obj.name).toBeDefined()
            expect(obj.isApproved).toBeDefined()
            expect(obj.meta).toBeDefined()
        })

        test('organization integration manager can create BillingRecipient', async () => {
            const { managerUserClient, integration, organization } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const [obj] = await createTestBillingRecipient(managerUserClient, context)

            expect(obj.importId).toBeDefined()
            expect(obj.tin).toBeDefined()
            expect(obj.iec).toBeDefined()
            expect(obj.bic).toBeDefined()
            expect(obj.bankAccount).toBeDefined()
            expect(obj.name).toBeDefined()
            expect(obj.isApproved).toBeDefined()
            expect(obj.meta).toBeDefined()
        })

        test('organization integration manager can\'t create BillingRecipient for another organization', async () => {
            const { managerUserClient, integration, organization } = await makeOrganizationIntegrationManager()
            const { managerUserClient: anotherManagerUserClient } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestBillingRecipient(anotherManagerUserClient, context)
            })
        })

        test('user can\'t create BillingRecipient', async () => {
            const user = await makeClientWithNewRegisteredAndLoggedInUser()

            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestBillingRecipient(user, context)
            })
        })

        test('anonymous can\'t create BillingRecipient', async () => {
            const anonymous = await makeClient()

            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            await expectToThrowAuthenticationErrorToObj(async () => {
                await createTestBillingRecipient(anonymous, context)
            })
        })
    })

    describe('Read', () => {
        test('admin can read BillingRecipient', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            const [ createdObj ] = await createTestBillingRecipient(admin, context)
            const [ readObj ] = await BillingRecipient.getAll(admin, { id: createdObj.id })

            expect(readObj.importId).toEqual(createdObj.importId)
            expect(readObj.tin).toEqual(createdObj.tin)
            expect(readObj.iec).toEqual(createdObj.iec)
            expect(readObj.bic).toEqual(createdObj.bic)
            expect(readObj.bankAccount).toEqual(createdObj.bankAccount)
            expect(readObj.name).toEqual(createdObj.name)
            expect(readObj.isApproved).toEqual(createdObj.isApproved)
        })

        test('support can read BillingRecipient', async () => {
            const admin = await makeLoggedInAdminClient()
            const support = await makeClientWithSupportUser()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            const [ createdObj ] = await createTestBillingRecipient(admin, context)
            const [ readObj ] = await BillingRecipient.getAll(support, { id: createdObj.id })

            expect(readObj.importId).toEqual(createdObj.importId)
            expect(readObj.tin).toEqual(createdObj.tin)
            expect(readObj.iec).toEqual(createdObj.iec)
            expect(readObj.bic).toEqual(createdObj.bic)
            expect(readObj.bankAccount).toEqual(createdObj.bankAccount)
            expect(readObj.name).toEqual(createdObj.name)
            expect(readObj.isApproved).toEqual(createdObj.isApproved)
        })

        test('organization integration manager can read BillingRecipient', async () => {

            const admin = await makeLoggedInAdminClient()
            const { managerUserClient, integration, organization } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)

            const [ createdObj ] = await createTestBillingRecipient(admin, context)
            const [ readObj ] = await BillingRecipient.getAll(managerUserClient, { id: createdObj.id })

            expect(readObj.importId).toEqual(createdObj.importId)
            expect(readObj.tin).toEqual(createdObj.tin)
            expect(readObj.iec).toEqual(createdObj.iec)
            expect(readObj.bic).toEqual(createdObj.bic)
            expect(readObj.bankAccount).toEqual(createdObj.bankAccount)
            expect(readObj.name).toEqual(createdObj.name)
            expect(readObj.isApproved).toEqual(createdObj.isApproved)
        })

        test('integration service account can read BillingRecipient', async () => {

            const admin = await makeLoggedInAdminClient()
            const integrationClient = await makeClientWithIntegrationAccess()

            const [ organization ] = await createTestOrganization(admin)
            const [ context ] = await createTestBillingIntegrationOrganizationContext(admin, organization, integrationClient.integration)

            const [ createdObj ] = await createTestBillingRecipient(integrationClient, context)
            const [ readObj ] = await BillingRecipient.getAll(integrationClient, { id: createdObj.id })

            expect(readObj.importId).toEqual(createdObj.importId)
            expect(readObj.tin).toEqual(createdObj.tin)
            expect(readObj.iec).toEqual(createdObj.iec)
            expect(readObj.bic).toEqual(createdObj.bic)
            expect(readObj.bankAccount).toEqual(createdObj.bankAccount)
            expect(readObj.name).toEqual(createdObj.name)
            expect(readObj.isApproved).toEqual(createdObj.isApproved)
        })

        test('user can\'t read BillingRecipients', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            await createTestBillingRecipient(adminClient, context)

            const readObjects = await BillingRecipient.getAll(user)

            expect(readObjects).toHaveLength(0)
        })

        test('anonymous can\'t read BillingRecipients', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            await createTestBillingRecipient(adminClient, context)

            const readObjects = await BillingRecipient.getAll(user)

            expect(readObjects).toHaveLength(0)
        })
    })

    describe('Update', () => {
        test('admin can update BillingRecipient', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            const [ createdObj ] = await createTestBillingRecipient(admin, context)
            const name = faker.datatype.uuid()
            const [ updatedObj ] = await updateTestBillingRecipient(admin, createdObj.id, { name })

            expect(createdObj.id).toEqual(updatedObj.id)
            expect(updatedObj.name).toEqual(name)
        })

        test('support can\' update BillingRecipient', async () => {
            const admin = await makeLoggedInAdminClient()
            const support = await makeClientWithSupportUser()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            const [ createdObj ] = await createTestBillingRecipient(admin, context)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestBillingRecipient(support, createdObj.id, { name: faker.datatype.uuid() })
            })
        })

        test('integration service account can update BillingRecipient', async () => {
            const admin = await makeLoggedInAdminClient()
            const integrationClient = await makeClientWithIntegrationAccess()

            const [ organization ] = await createTestOrganization(admin)
            const [ context ] = await createTestBillingIntegrationOrganizationContext(admin, organization, integrationClient.integration)

            const [ createdObj ] = await createTestBillingRecipient(integrationClient, context)
            const name = faker.datatype.uuid()
            const [ updatedObj ] = await updateTestBillingRecipient(integrationClient, createdObj.id, { name })

            expect(createdObj.id).toEqual(updatedObj.id)
            expect(updatedObj.name).toEqual(name)
        })

        test('organization integration manager can\'t update BillingRecipient', async () => {

            const admin = await makeLoggedInAdminClient()
            const { managerUserClient, integration, organization } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)

            const [ createdObj ] = await createTestBillingRecipient(admin, context)

            await expectToThrowAccessDeniedErrorToObj(async () => {await updateTestBillingRecipient(managerUserClient,
                createdObj.id, { name: faker.datatype.uuid() })
            })
        })

        test('user can\'t update BillingRecipients', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            const [ createdObj ] = await createTestBillingRecipient(adminClient, context)

            await expectToThrowAccessDeniedErrorToObj(async () => {await updateTestBillingRecipient(user,
                createdObj.id, { name: faker.datatype.uuid() })
            })
        })

        test('anonymous can\'t update BillingRecipients', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            const [ createdObj ] = await createTestBillingRecipient(adminClient, context)

            await expectToThrowAccessDeniedErrorToObj(async () => {await updateTestBillingRecipient(user,
                createdObj.id, { name: faker.datatype.uuid() })
            })
        })
    })

    describe('Delete', () => {
        test('admin can\'t delete BillingRecipients', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            const [ createdObj ] = await createTestBillingRecipient(adminClient, context)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await BillingRecipient.delete(adminClient, createdObj.id)
            })
        })
    })

    describe('Virtual fields', () => {
        describe('isApproved', () => {
            test('related context deleted', async () => {
                const admin = await makeLoggedInAdminClient()
                const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
                const [createdObj] = await createTestBillingRecipient(admin, context)

                // delete context
                await updateTestBillingIntegrationOrganizationContext(admin, context.id, {
                    deletedAt: dayjs().toString(),
                })

                // get recipient
                const recipient = await BillingRecipient.getOne(admin, { id: createdObj.id })
                expect(recipient.isApproved).toEqual(false)
            })

            test('related organization deleted', async () => {
                const admin = await makeLoggedInAdminClient()
                const { context, organization } = await makeContextWithOrganizationAndIntegrationAsAdmin()
                const [createdObj] = await createTestBillingRecipient(admin, context)

                // delete organization
                await updateTestOrganization(admin, organization.id, {
                    deletedAt: dayjs().toString(),
                })

                // get recipient
                const recipient = await BillingRecipient.getOne(admin, { id: createdObj.id })
                expect(recipient.isApproved).toEqual(false)
            })

            test('related organization same tin', async () => {
                const admin = await makeLoggedInAdminClient()
                const { context, organization } = await makeContextWithOrganizationAndIntegrationAsAdmin()
                const [createdObj] = await createTestBillingRecipient(admin, context)

                // set new tin organization
                await updateTestOrganization(admin, organization.id, {
                    tin: createdObj.tin,
                })

                // get recipient
                const recipient = await BillingRecipient.getOne(admin, { id: createdObj.id })
                expect(recipient.isApproved).toEqual(true)
            })

            test('related organization different tin and no bank accounts', async () => {
                const admin = await makeLoggedInAdminClient()
                const { context, organization } = await makeContextWithOrganizationAndIntegrationAsAdmin()
                const [createdObj] = await createTestBillingRecipient(admin, context)

                // set new tin organization
                await updateTestOrganization(admin, organization.id, {
                    tin: faker.random.numeric(12),
                })

                // get recipient
                const recipient = await BillingRecipient.getOne(admin, { id: createdObj.id })
                expect(recipient.isApproved).toEqual(false)
            })

            test('related organization different tin and bank account related', async () => {
                const admin = await makeLoggedInAdminClient()
                const { context, organization } = await makeContextWithOrganizationAndIntegrationAsAdmin()
                const [createdObj] = await createTestBillingRecipient(admin, context)

                // create account
                const [account] = await createTestBankAccount(admin, organization, {})

                // update recipient tin
                await updateTestBillingRecipient(admin, createdObj.id, {
                    bic: account.routingNumber,
                    bankAccount: account.number,
                })

                // get recipient
                const recipient = await BillingRecipient.getOne(admin, { id: createdObj.id })
                expect(recipient.isApproved).toEqual(true)
            })

            test('related organization different tin and bank account different bic', async () => {
                const admin = await makeLoggedInAdminClient()
                const { context, organization } = await makeContextWithOrganizationAndIntegrationAsAdmin()
                const [createdObj] = await createTestBillingRecipient(admin, context)

                // create account
                const [account] = await createTestBankAccount(admin, organization, {})

                // update recipient tin
                await updateTestBillingRecipient(admin, createdObj.id, {
                    bankAccount: account.number,
                })

                // get recipient
                const recipient = await BillingRecipient.getOne(admin, { id: createdObj.id })
                expect(recipient.isApproved).toEqual(false)
            })

            test('related organization different tin and bank account different account number', async () => {
                const admin = await makeLoggedInAdminClient()
                const { context, organization } = await makeContextWithOrganizationAndIntegrationAsAdmin()
                const [createdObj] = await createTestBillingRecipient(admin, context)

                // create account
                const [account] = await createTestBankAccount(admin, organization, {})

                // update recipient tin
                await updateTestBillingRecipient(admin, createdObj.id, {
                    bic: account.routingNumber,
                })

                // get recipient
                const recipient = await BillingRecipient.getOne(admin, { id: createdObj.id })
                expect(recipient.isApproved).toEqual(false)
            })

            test('related organization different tin and bank account deleted', async () => {
                const admin = await makeLoggedInAdminClient()
                const { context, organization } = await makeContextWithOrganizationAndIntegrationAsAdmin()
                const [createdObj] = await createTestBillingRecipient(admin, context)

                // create account
                const [account] = await createTestBankAccount(admin, organization, {})

                // update recipient tin
                await updateTestBillingRecipient(admin, createdObj.id, {
                    bic: account.routingNumber,
                    bankAccount: account.number,
                })

                // update account
                await updateTestBankAccount(admin, account.id, {
                    deletedAt: dayjs().toString(),
                })

                // get recipient
                const recipient = await BillingRecipient.getOne(admin, { id: createdObj.id })
                expect(recipient.isApproved).toEqual(false)
            })

            test('related organization different tin and bank account not approved', async () => {
                const admin = await makeLoggedInAdminClient()
                const { context, organization } = await makeContextWithOrganizationAndIntegrationAsAdmin()
                const [createdObj] = await createTestBillingRecipient(admin, context)

                // create account
                const [account] = await createTestBankAccount(admin, organization, {
                    isApproved: false,
                })

                // update recipient tin
                await updateTestBillingRecipient(admin, createdObj.id, {
                    bic: account.routingNumber,
                    bankAccount: account.number,
                })

                // get recipient
                const recipient = await BillingRecipient.getOne(admin, { id: createdObj.id })
                expect(recipient.isApproved).toEqual(false)
            })
        })
    })

    describe('Constraints', () => {
        test('can\'t create same BillingRecipient', async () => {
            const admin = await makeLoggedInAdminClient()

            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            const [obj] = await createTestBillingRecipient(admin, context)

            await expectToThrowUniqueConstraintViolationError(async () => {
                await createTestBillingRecipient(admin, context, {
                    tin: obj.tin,
                    iec: obj.iec,
                    bic: obj.bic,
                    bankAccount: obj.bankAccount,
                })
            }, 'billingRecipient_unique_context_tin_iec_bic_bankAccount')
        })

        test('can create - delete - create new BillingRecipient', async () => {
            const admin = await makeLoggedInAdminClient()

            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            const [obj] = await createTestBillingRecipient(admin, context)

            const [updatedObj] = await updateTestBillingRecipient(admin, obj.id, { deletedAt: 'True' })

            const [objNew] = await createTestBillingRecipient(admin, context, {
                tin: obj.tin,
                iec: obj.iec,
                bic: obj.bic,
                bankAccount: obj.bankAccount,
            })

            expect(obj.id).toBeDefined()
            expect(updatedObj.id).toEqual(obj.id)
            expect(updatedObj.deletedAt).not.toBeNull()
            expect(objNew.id).toBeDefined()
            expect(obj.id).not.toEqual(objNew.id)
        })
    })

    describe('Validation tests', () => {
        test('Context field cannot be changed', async () => {
            const { context, admin } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const { context: anotherContext } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const [recipient] = await createTestBillingRecipient(admin, context)
            await expectToThrowGraphQLRequestError(async () => {
                await updateTestBillingRecipient(admin, recipient.id, {
                    context: { connect: { id: anotherContext.id } },
                })
            }, 'Field "context" is not defined')
        })
    })
})
