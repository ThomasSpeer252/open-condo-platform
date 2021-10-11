/**
 * Generated by `createschema acquiring.AcquiringIntegrationContext 'integration:Relationship:AcquiringIntegration:PROTECT; organization:Relationship:Organization:PROTECT; settings:Json; state:Json;' --force`
 */

const { createTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { createTestOrganizationEmployeeRole } = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')
const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')

const {
    AcquiringIntegrationContext,
    createTestAcquiringIntegrationContext,
    updateTestAcquiringIntegrationContext,
    createTestAcquiringIntegration,
    createTestAcquiringIntegrationAccessRight,
} = require('@condo/domains/acquiring/utils/testSchema')
const { registerNewOrganization } = require('@condo/domains/organization/utils/testSchema/organization')
const {
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAuthenticationErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
} = require('@condo/domains/common/utils/testSchema')

describe('AcquiringIntegrationContext', () => {
    describe('create', () => {
        test('admin can', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await registerNewOrganization(admin)
            const [integration] = await createTestAcquiringIntegration(admin)
            const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)
            expect(context).toBeDefined()
            expect(context).toHaveProperty(['organization', 'id'], organization.id)
            expect(context).toHaveProperty(['integration', 'id'], integration.id)
        })
        test('support can\'t', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await registerNewOrganization(admin)
            const [integration] = await createTestAcquiringIntegration(admin)

            const support = await makeClientWithSupportUser()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestAcquiringIntegrationContext(support, organization, integration)
            })
        })
        describe('user', async () => {
            test('can with if it\'s integration manager of organization (has `canManageIntegration`)', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [integration] = await createTestAcquiringIntegration(admin)
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
            test('if it\'s integration account, and has access rights to integration', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [integration] = await createTestAcquiringIntegration(admin)
                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestAcquiringIntegrationAccessRight(admin, integration, client.user)

                const [context] = await createTestAcquiringIntegrationContext(client, organization, integration)
                expect(context).toBeDefined()
                expect(context).toHaveProperty(['organization', 'id'], organization.id)
                expect(context).toHaveProperty(['integration', 'id'], integration.id)
            })
            test('can\'t in other cases', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [integration] = await createTestAcquiringIntegration(admin)
                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestAcquiringIntegrationContext(client, organization, integration)
                })
            })
        })
        test('anonymous can\'t', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await registerNewOrganization(admin)
            const [integration] = await createTestAcquiringIntegration(admin)

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
            const [integration] = await createTestAcquiringIntegration(admin)
            await createTestAcquiringIntegrationContext(admin, organization, integration)

            const contexts = await AcquiringIntegrationContext.getAll(admin)
            expect(contexts).toBeDefined()
            expect(contexts).not.toHaveLength(0)
        })
        test('support can', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await registerNewOrganization(admin)
            const [integration] = await createTestAcquiringIntegration(admin)
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
                    const [integration] = await createTestAcquiringIntegration(admin)
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
                    const [integration] = await createTestAcquiringIntegration(admin)
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
                const [firstIntegration] = await createTestAcquiringIntegration(admin)
                const [secondOrganization] = await registerNewOrganization(admin)
                const [secondIntegration] = await createTestAcquiringIntegration(admin)

                await createTestAcquiringIntegrationContext(admin, firstOrganization, firstIntegration)
                await createTestAcquiringIntegrationContext(admin, secondOrganization, secondIntegration)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestAcquiringIntegrationAccessRight(admin, firstIntegration, client.user)

                const contexts = await AcquiringIntegrationContext.getAll(client)
                expect(contexts).toBeDefined()
                expect(contexts).toHaveLength(1)
                expect(contexts[0]).toEqual(expect.objectContaining({ integration: { id: firstIntegration.id } }))
            })
            test('Can\'t in other cases', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [integration] = await createTestAcquiringIntegration(admin)
                await createTestAcquiringIntegrationContext(admin, organization, integration)
                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                const contexts = await AcquiringIntegrationContext.getAll(client)
                expect(contexts).toHaveLength(0)
            })
        })
        test('anonymous can\'t', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await registerNewOrganization(admin)
            const [integration] = await createTestAcquiringIntegration(admin)
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
            const [integration] = await createTestAcquiringIntegration(admin)
            const [newIntegration] = await createTestAcquiringIntegration(admin)
            const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)

            const [newContext] = await updateTestAcquiringIntegrationContext(admin, context.id, {
                integration: { connect: { id: newIntegration.id } },
            } )

            expect(newContext).toBeDefined()
            expect(newContext).toEqual(expect.objectContaining({
                integration: { id: newIntegration.id },
            }))
        })
        test('support can\'t', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await registerNewOrganization(admin)
            const [integration] = await createTestAcquiringIntegration(admin)
            const [newIntegration] = await createTestAcquiringIntegration(admin)
            const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)

            const support = await makeClientWithSupportUser()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestAcquiringIntegrationContext(support, context.id, {
                    integration: { connect: { id: newIntegration.id } },
                })
            })
        })
        describe('user', () => {
            test('can if it\'s acquiring integration account', async () => {
                const admin = await makeLoggedInAdminClient()
                const [organization] = await registerNewOrganization(admin)
                const [integration] = await createTestAcquiringIntegration(admin)
                const client = await makeClientWithNewRegisteredAndLoggedInUser()
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
                const [integration] = await createTestAcquiringIntegration(admin)
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
                const [integration] = await createTestAcquiringIntegration(admin)
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
            const [integration] = await createTestAcquiringIntegration(admin)
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
            const [integration] = await createTestAcquiringIntegration(admin)
            const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await AcquiringIntegrationContext.delete(admin, context.id)
            })
        })
        test('support can\'t', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await registerNewOrganization(admin)
            const [integration] = await createTestAcquiringIntegration(admin)
            const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)

            const support = await makeClientWithSupportUser()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await AcquiringIntegrationContext.delete(support, context.id)
            })
        })
        test('user can\'t', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await registerNewOrganization(admin)
            const [integration] = await createTestAcquiringIntegration(admin)
            const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)

            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await AcquiringIntegrationContext.delete(client, context.id)
            })
        })
        test('anonymous can\'t', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await registerNewOrganization(admin)
            const [integration] = await createTestAcquiringIntegration(admin)
            const [context] = await createTestAcquiringIntegrationContext(admin, organization, integration)

            const anonymousClient = await makeClient()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await AcquiringIntegrationContext.delete(anonymousClient, context.id)
            })
        })
    })
})
