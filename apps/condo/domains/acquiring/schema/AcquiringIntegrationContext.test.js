/**
 * Generated by `createschema acquiring.AcquiringIntegrationContext 'integration:Relationship:AcquiringIntegration:PROTECT; organization:Relationship:Organization:PROTECT; settings:Json; state:Json;' --force`
 */

const faker = require('faker')
const { createTestOrganizationEmployee, createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { createTestOrganizationEmployeeRole } = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser, makeClientWithServiceUser } = require('@condo/domains/user/utils/testSchema')
const { makeLoggedInAdminClient, makeClient } = require('@condo/keystone/test.utils')
const { normalizeEmail } = require('@condo/domains/common/utils/mail')
const {
    AcquiringIntegrationContext,
    createTestAcquiringIntegrationContext,
    updateTestAcquiringIntegrationContext,
    createTestAcquiringIntegration,
    createTestAcquiringIntegrationAccessRight,
} = require('@condo/domains/acquiring/utils/testSchema')
const { registerNewOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const {
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAuthenticationErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowValidationFailureError,
    expectToThrowGraphQLRequestError,
} = require('@condo/domains/common/utils/testSchema')

const { createTestBillingIntegration, createTestRecipient } = require('@condo/domains/billing/utils/testSchema')
const { CONTEXT_ALREADY_HAVE_ACTIVE_CONTEXT } = require('@condo/domains/acquiring/constants/errors')

const dayjs = require('dayjs')
const { expectToThrowGQLError } = require('../../common/utils/testSchema')

describe('AcquiringIntegrationContext', () => {
    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)
                expect(context).toBeDefined()
                expect(context).toHaveProperty(['organization', 'id'], organization.id)
                expect(context).toHaveProperty(['integration', 'id'], integration.id)
            })
            test('support can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])

                const support = await makeClientWithSupportUser()
                const [context] = await createTestAcquiringIntegrationContext(support, organization, integration)
                expect(context).toBeDefined()
                expect(context).toHaveProperty(['organization', 'id'], organization.id)
                expect(context).toHaveProperty(['integration', 'id'], integration.id)
            })
            describe('user', () => {
                test('can with if it\'s integration manager of organization (has `canManageIntegration`)', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const [organization] = await registerNewOrganization(admin)
                    const [billingIntegration] = await createTestBillingIntegration(admin)
                    const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                    const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                        canManageIntegrations: true,
                    })
                    const client = await makeClientWithNewRegisteredAndLoggedInUser()
                    await createTestOrganizationEmployee(admin, organization, client.user, role)
                    const [context] = await createTestAcquiringIntegrationContext(client, organization, integration)
                    expect(context).toBeDefined()
                    expect(context).toHaveProperty(['organization', 'id'], organization.id)
                    expect(context).toHaveProperty(['integration', 'id'], integration.id)
                })
                describe('Acquiring integration', () => {
                    test('if it\'s integration account, and organization was created by it', async () => {
                        const admin = await makeLoggedInAdminClient()

                        const client = await makeClientWithServiceUser()
                        const [billingIntegration] = await createTestBillingIntegration(admin)
                        const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                        await createTestAcquiringIntegrationAccessRight(admin, integration, client.user)

                        const [organization] = await registerNewOrganization(client)

                        const [context] = await createTestAcquiringIntegrationContext(client, organization, integration)
                        expect(context).toBeDefined()
                        expect(context).toHaveProperty(['organization', 'id'], organization.id)
                        expect(context).toHaveProperty(['integration', 'id'], integration.id)
                    })
                    // TODO(DOMA-1700): Add more precise tests after refactoring
                    describe('Can create context if organization doesn\'t have active context', () => {
                        test('No active context', async () => {
                            const admin = await makeLoggedInAdminClient()

                            const client = await makeClientWithServiceUser()
                            const [billingIntegration] = await createTestBillingIntegration(admin)
                            const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                            await createTestAcquiringIntegrationAccessRight(admin, integration, client.user)
                            // service user can create context only for it's personal organizations (EPS)
                            const [organization] = await registerNewOrganization(client)

                            const [context] = await createTestAcquiringIntegrationContext(client, organization, integration)
                            expect(context).toBeDefined()
                            expect(context).toHaveProperty(['organization', 'id'], organization.id)
                            expect(context).toHaveProperty(['integration', 'id'], integration.id)
                        })
                        test('Already have active context', async () => {
                            const admin = await makeLoggedInAdminClient()

                            const client = await makeClientWithServiceUser()
                            const [billingIntegration] = await createTestBillingIntegration(admin)
                            const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                            const [secondIntegration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                            await createTestAcquiringIntegrationAccessRight(admin, integration, client.user)

                            const [organization] = await registerNewOrganization(client)

                            await createTestAcquiringIntegrationContext(admin, organization, secondIntegration)
                            await expectToThrowValidationFailureError(async () => {
                                await createTestAcquiringIntegrationContext(client, organization, integration)
                            }, CONTEXT_ALREADY_HAVE_ACTIVE_CONTEXT)
                        })
                    })
                })
                test('can\'t in other cases', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const [organization] = await registerNewOrganization(admin)
                    const [billingIntegration] = await createTestBillingIntegration(admin)
                    const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                    const client = await makeClientWithNewRegisteredAndLoggedInUser()

                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await createTestAcquiringIntegrationContext(client, organization, integration)
                    })
                })
            })
            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])

                const anonymousClient = await makeClient()
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestAcquiringIntegrationContext(anonymousClient, organization, integration)
                })
            })
        })
        describe('read', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                await createTestAcquiringIntegrationContext(admin, organization, integration)

                const contexts = await AcquiringIntegrationContext.getAll(admin)
                expect(contexts).toBeDefined()
                expect(contexts).not.toHaveLength(0)
            })
            test('support can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                await createTestAcquiringIntegrationContext(admin, organization, integration)

                const support = await makeClientWithSupportUser()
                const contexts = await AcquiringIntegrationContext.getAll(support)
                expect(contexts).toBeDefined()
                expect(contexts).not.toHaveLength(0)
            })
            describe('user', () => {
                describe('Employee: can see if have permission `canReadPayments` set',  () => {
                    test('permission set', async () => {
                        const admin = await makeLoggedInAdminClient()
                        const [organization] = await registerNewOrganization(admin)
                        const [billingIntegration] = await createTestBillingIntegration(admin)
                        const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                        await createTestAcquiringIntegrationContext(admin, organization, integration)
                        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                            canReadPayments: true,
                        })
                        const client = await makeClientWithNewRegisteredAndLoggedInUser()
                        await createTestOrganizationEmployee(admin, organization, client.user, role)

                        const contexts = await AcquiringIntegrationContext.getAll(client)
                        expect(contexts).toBeDefined()
                        expect(contexts).toHaveLength(1)
                    })
                    test('permission not set', async () => {
                        const admin = await makeLoggedInAdminClient()
                        const [organization] = await registerNewOrganization(admin)
                        const [billingIntegration] = await createTestBillingIntegration(admin)
                        const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                        await createTestAcquiringIntegrationContext(admin, organization, integration)

                        const client = await makeClientWithNewRegisteredAndLoggedInUser()

                        const contexts = await AcquiringIntegrationContext.getAll(client)
                        expect(contexts).toBeDefined()
                        expect(contexts).toHaveLength(0)
                    })
                })
                test('Integration account: only linked to this integration ones',  async () => {
                    const admin = await makeLoggedInAdminClient()
                    const [firstOrganization] = await registerNewOrganization(admin)
                    const [billingIntegration] = await createTestBillingIntegration(admin)
                    const [firstIntegration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                    const [secondOrganization] = await registerNewOrganization(admin)
                    const [secondIntegration] = await createTestAcquiringIntegration(admin, [billingIntegration])

                    await createTestAcquiringIntegrationContext(admin, firstOrganization, firstIntegration)
                    await createTestAcquiringIntegrationContext(admin, secondOrganization, secondIntegration)

                    const client = await makeClientWithServiceUser()
                    await createTestAcquiringIntegrationAccessRight(admin, firstIntegration, client.user)

                    const contexts = await AcquiringIntegrationContext.getAll(client)
                    expect(contexts).toBeDefined()
                    expect(contexts).toHaveLength(1)
                    expect(contexts[0].integration.id).toEqual(firstIntegration.id)
                })
                test('Can\'t in other cases', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const [organization] = await registerNewOrganization(admin)
                    const [billingIntegration] = await createTestBillingIntegration(admin)
                    const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                    await createTestAcquiringIntegrationContext(admin, organization, integration)
                    const client = await makeClientWithNewRegisteredAndLoggedInUser()

                    const contexts = await AcquiringIntegrationContext.getAll(client)
                    expect(contexts).toHaveLength(0)
                })
            })
            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                await createTestAcquiringIntegrationContext(admin, organization, integration)

                const anonymousClient = await makeClient()
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await AcquiringIntegrationContext.getAll(anonymousClient)
                })
            })
        })
        describe('update', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)
                const payload = {
                    settings: { dv: 1, fieldOne: 'value' },
                }

                const [newContext] = await updateTestAcquiringIntegrationContext(admin, context.id, payload )

                expect(newContext).toBeDefined()
                expect(newContext).toHaveProperty('settings')
                expect(newContext).toEqual(expect.objectContaining(payload))
            })
            test('support can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)

                const support = await makeClientWithSupportUser()

                const [updatedContext] =  await updateTestAcquiringIntegrationContext(support, context.id, {
                    deletedAt: dayjs().toISOString(),
                })
                expect(updatedContext).toBeDefined()
                expect(updatedContext).toHaveProperty('deletedAt')
                expect(updatedContext.deletedAt).not.toBeNull()
            })
            describe('user', () => {
                test('can if it\'s acquiring integration account', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const [organization] = await registerNewOrganization(admin)
                    const [billingIntegration] = await createTestBillingIntegration(admin)
                    const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                    const client = await makeClientWithServiceUser()
                    await createTestAcquiringIntegrationAccessRight(admin, integration, client.user)
                    const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)

                    const statePayload = { state:  { dv: 1, myParameter: 'value' } }
                    const [newContext] = await updateTestAcquiringIntegrationContext(client, context.id, statePayload)
                    expect(newContext).toBeDefined()
                    expect(newContext).toEqual(expect.objectContaining(statePayload))

                })
                test('can\'t if integration manager (have `canManageIntegration` = true)', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const [organization] = await registerNewOrganization(admin)
                    const [billingIntegration] = await createTestBillingIntegration(admin)
                    const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                    const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)

                    const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                        canManageIntegrations: true,
                    })
                    const client = await makeClientWithNewRegisteredAndLoggedInUser()
                    await createTestOrganizationEmployee(admin, organization, client.user, role)

                    const payload = {}
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await updateTestAcquiringIntegrationContext(client, context.id, payload)
                    })
                })
                test('can\'t in other cases', async () => {
                    const admin = await makeLoggedInAdminClient()
                    const [organization] = await registerNewOrganization(admin)
                    const [billingIntegration] = await createTestBillingIntegration(admin)
                    const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                    const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)

                    const client = await makeClientWithNewRegisteredAndLoggedInUser()
                    const payload = {}
                    await expectToThrowAccessDeniedErrorToObj(async () => {
                        await updateTestAcquiringIntegrationContext(client, context.id, payload)
                    })
                })
            })
            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)

                const client = await makeClient()
                const payload = {}
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestAcquiringIntegrationContext(client, context.id, payload)
                })
            })
        })
        describe('delete', () => {
            test('admin can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await AcquiringIntegrationContext.delete(admin, context.id)
                })
            })
            test('support can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)

                const support = await makeClientWithSupportUser()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await AcquiringIntegrationContext.delete(support, context.id)
                })
            })
            test('user can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await AcquiringIntegrationContext.delete(client, context.id)
                })
            })
            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [billingIntegration] = await createTestBillingIntegration(admin)
                const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
                const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)

                const anonymousClient = await makeClient()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await AcquiringIntegrationContext.delete(anonymousClient, context.id)
                })
            })
        })
    })
    describe('Validation tests', () => {
        test('Should have correct dv field (=== 1)', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await registerNewOrganization(admin)
            const [billingIntegration] = await createTestBillingIntegration(admin)
            const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
            await expectToThrowGQLError(async () => await createTestAcquiringIntegrationContext(admin, organization, integration, {
                dv: 2,
                sender: { dv: 1, fingerprint: 'tests' },
            }), {
                'code': 'BAD_USER_INPUT',
                'type': 'DV_VERSION_MISMATCH',
                'message': 'Wrong value for data version number',
                'mutation': 'createAcquiringIntegrationContext',
                'messageForUser': '',
                'variable': ['data', 'dv'],
            })
            const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)
            await expectToThrowGQLError(async () => await updateTestAcquiringIntegrationContext(admin, context.id, {
                dv: 2,
                sender: { dv: 1, fingerprint: 'tests' },
            }), {
                'code': 'BAD_USER_INPUT',
                'type': 'DV_VERSION_MISMATCH',
                'message': 'Wrong value for data version number',
                'mutation': 'updateAcquiringIntegrationContext',
                'messageForUser': '',
                'variable': ['data', 'dv'],
            })
        })
        test('Organization and integration fields cannot be changed', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [billingIntegration] = await createTestBillingIntegration(admin)
            const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
            const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)
            const [secondOrganization] = await createTestOrganization(admin)
            const [secondBillingIntegration] = await createTestBillingIntegration(admin)
            const [secondIntegration] = await createTestAcquiringIntegration(admin, [secondBillingIntegration])
            await expectToThrowGraphQLRequestError(async () => {
                await updateTestAcquiringIntegrationContext(admin,  context.id, {
                    organization: { connect: { id: secondOrganization.id } },
                })
            }, 'Field "organization" is not defined')
            await expectToThrowGraphQLRequestError(async () => {
                await updateTestAcquiringIntegrationContext(admin, context.id, {
                    integration: { connect: { id: secondIntegration.id } },
                })
            }, 'Field "integration" is not defined')
        })
    })
    describe('Acquiring integration', () => {
        test('Fields check', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await registerNewOrganization(admin)
            const [billingIntegration] = await createTestBillingIntegration(admin)
            const [integration] = await createTestAcquiringIntegration(admin, [billingIntegration])
            const recipient = createTestRecipient()
            const reason = faker.lorem.sentence(1)
            const email = faker.internet.email()
            const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration, { email, reason, recipient })
            expect(context.email).toEqual(normalizeEmail(email))
            expect(context.reason).toEqual(reason)
            expect(context.recipient.bankAccount).toEqual(recipient.bankAccount)
            expect(context.recipient.iec).toEqual(recipient.iec)
            expect(context.recipient.tin).toEqual(recipient.tin)
            expect(context.recipient.bic).toEqual(recipient.bic)
        })
    })
})