/**
 * Generated by `createschema billing.BillingIntegrationOrganizationContext 'integration:Relationship:BillingIntegration:PROTECT; organization:Relationship:Organization:CASCADE; settings:Json; state:Json' --force`
 */
const { makeClientWithSupportUser } = require(
    '@condo/domains/user/utils/testSchema')
const { createTestOrganization, updateTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithIntegrationAccess, updateTestBillingIntegration } = require('@condo/domains/billing/utils/testSchema')
const { registerNewOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const { createTestOrganizationEmployee, createTestOrganizationEmployeeRole } = require('@condo/domains/organization/utils/testSchema')
const { createTestBillingIntegration, createReceiptsReader } = require('../utils/testSchema')
const { makeContextWithOrganizationAndIntegrationAsAdmin } = require('@condo/domains/billing/utils/testSchema')
const { makeOrganizationIntegrationManager } = require('@condo/domains/billing/utils/testSchema')
const { BillingIntegrationOrganizationContext } = require('@condo/domains/billing/utils/testSchema')
const { expectToThrowAuthenticationErrorToObjects, expectToThrowAuthenticationErrorToObj } = require('@condo/domains/common/utils/testSchema')
const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const {
    createTestBillingIntegrationOrganizationContext, updateTestBillingIntegrationOrganizationContext } = require('@condo/domains/billing/utils/testSchema')
const { expectToThrowAccessDeniedErrorToObj } = require('@condo/domains/common/utils/testSchema')
const { CONTEXT_STATUSES } = require('@condo/domains/miniapp/constants')

describe('BillingIntegrationOrganizationContext', () => {
    describe('CRUD tests', () => {
        test('admin: create BillingIntegrationOrganizationContext', async () => {
            const { context, integration, organization } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            expect(context).toHaveProperty(['integration', 'id'], integration.id)
            expect(context).toHaveProperty(['organization', 'id'], organization.id)
        })

        test('support: create BillingIntegrationOrganizationContext', async () => {
            const admin = await makeLoggedInAdminClient()
            const [integration] = await createTestBillingIntegration(admin)
            const [organization] = await  registerNewOrganization(admin)

            const support = await makeClientWithSupportUser()
            const [context] = await createTestBillingIntegrationOrganizationContext(support, organization, integration)

            expect(context).toHaveProperty(['integration', 'id'], integration.id)
            expect(context).toHaveProperty(['organization', 'id'], organization.id)
        })

        test('user: create BillingIntegrationOrganizationContext', async () => {
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const admin = await makeLoggedInAdminClient()
            const [integration] = await createTestBillingIntegration(admin)
            const [organization] = await registerNewOrganization(admin)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestBillingIntegrationOrganizationContext(user, organization, integration)
            })
        })

        test('anonymous: create BillingIntegrationOrganizationContext', async () => {
            const anon = await makeClient()
            const admin = await makeLoggedInAdminClient()
            const [integration] = await createTestBillingIntegration(admin)
            const [organization] = await registerNewOrganization(admin)

            await expectToThrowAuthenticationErrorToObj(async () => {
                await createTestBillingIntegrationOrganizationContext(anon, organization, integration)
            })
        })

        test('organization integration manager: create BillingIntegrationOrganizationContext', async () => {
            const { managerUserClient, integration, organization } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            expect(context).toHaveProperty(['integration', 'id'], integration.id)
            expect(context).toHaveProperty(['organization', 'id'], organization.id)
        })

        test('admin: update BillingIntegrationOrganizationContext', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const payload = { settings: { dv: 1, test: 'test' } }
            const [updatedObj] = await updateTestBillingIntegrationOrganizationContext(admin, context.id, payload)

            expect(updatedObj.settings.test).toEqual('test')
        })

        test('support: update BillingIntegrationOrganizationContext', async () => {
            const support = await makeClientWithSupportUser()

            const { managerUserClient, integration, organization } = await makeOrganizationIntegrationManager()
            const [ context ] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)

            const payload = { settings: { dv: 1, test: 'test' } }
            const [updatedObj] = await updateTestBillingIntegrationOrganizationContext(support, context.id, payload)

            expect(updatedObj.settings.test).toEqual('test')
        })

        test('user: update BillingIntegrationOrganizationContext', async () => {
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const payload = { settings: { dv: 1, test: 'test' } }

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestBillingIntegrationOrganizationContext(user, context.id, payload)
            })
        })

        test('anonymous: update BillingIntegrationOrganizationContext', async () => {
            const user = await makeClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const payload = { settings: { dv: 1, test: 'test' } }

            await expectToThrowAuthenticationErrorToObj(async () => {
                await updateTestBillingIntegrationOrganizationContext(user, context.id, payload)
            })
        })

        test('integration: update BillingIntegrationOrganizationContext', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const integrationClient = await makeClientWithIntegrationAccess()
            const [organization] = await createTestOrganization(adminClient)
            const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, organization, integrationClient.integration)

            const payload = { settings: { dv: 1, test: 'test' } }
            const [updatedObj] = await updateTestBillingIntegrationOrganizationContext(integrationClient, context.id, payload)

            expect(updatedObj.settings.test).toEqual('test')
        })

        test('organization integration manager: update BillingIntegrationOrganizationContext', async () => {
            const { managerUserClient, integration, organization } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const payload = { settings: { dv: 1, test: 'test' } }
            const [updatedObj] = await updateTestBillingIntegrationOrganizationContext(managerUserClient, context.id, payload)

            expect(updatedObj.settings.test).toEqual('test')
        })

        test('admin: read BillingIntegrationOrganizationContext', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const contexts = await BillingIntegrationOrganizationContext.getAll(admin, { id: context.id })
            expect(contexts).toHaveLength(1)
        })

        test('user: read BillingIntegrationOrganizationContext', async () => {
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const user = await makeClientWithNewRegisteredAndLoggedInUser()

            const contexts = await BillingIntegrationOrganizationContext.getAll(user, { id: context.id })
            expect(contexts).toHaveLength(0)
        })

        test('anonymous: read BillingIntegrationOrganizationContext', async () => {
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()
            const client = await makeClient()

            await expectToThrowAuthenticationErrorToObjects(async () => {
                await BillingIntegrationOrganizationContext.getAll(client, { id: context.id })
            })
        })

        test('organization integration manager: read BillingIntegrationOrganizationContext', async () => {
            const { managerUserClient, integration, organization } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const contexts = await BillingIntegrationOrganizationContext.getAll(managerUserClient, { id: context.id })
            expect(contexts).toHaveLength(1)
        })

        test('employee with `canReadBillingReceipts`: read BillingIntegrationOrganizationContext', async () => {
            const { managerUserClient, integration, organization } = await makeOrganizationIntegrationManager()
            const client = await createReceiptsReader(organization)
            await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const contexts = await BillingIntegrationOrganizationContext.getAll(client)
            expect(contexts).toHaveLength(1)
        })

        test('employee without `canReadBillingReceipts`: read BillingIntegrationOrganizationContext', async () => {
            const admin = await makeLoggedInAdminClient()
            const { managerUserClient, integration, organization } = await makeOrganizationIntegrationManager()
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canBeAssignedAsExecutor: true,
                canBeAssignedAsResponsible: true,
            })
            await createTestOrganizationEmployee(admin, organization, client.user, role)
            await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const contexts = await BillingIntegrationOrganizationContext.getAll(client)
            expect(contexts).toHaveLength(0)
        })

        test('deleted from organization employee with `canReadBillingReceipts`: read BillingIntegrationOrganizationContext', async () => {
            const admin = await makeLoggedInAdminClient()
            const { managerUserClient, integration, organization } = await makeOrganizationIntegrationManager()
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canReadBillingReceipts: true,
            })
            await createTestOrganizationEmployee(admin, organization, client.user, role, {
                isBlocked: true,
            })
            await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            const contexts = await BillingIntegrationOrganizationContext.getAll(client)
            expect(contexts).toHaveLength(0)
        })

        test('integration: read BillingIntegrationOrganizationContext', async () => {
            const adminClient = await makeLoggedInAdminClient()
            const integrationClient = await makeClientWithIntegrationAccess()
            const [organization] = await createTestOrganization(adminClient)
            const [context] = await createTestBillingIntegrationOrganizationContext(adminClient, organization, integrationClient.integration)

            const contexts = await BillingIntegrationOrganizationContext.getAll(integrationClient, { id: context.id })
            expect(contexts).toHaveLength(1)
        })

        // todo(toplenboren) fix this skipped test!
        test.skip('organization integration manager: read BillingIntegrationOrganizationContext from deleted integration', async () => {
            const admin = await makeLoggedInAdminClient()
            const { managerUserClient, integration, organization } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            await updateTestBillingIntegration(admin, integration.id, { deletedAt: null })

            const contexts = await BillingIntegrationOrganizationContext.getAll(managerUserClient, { id: context.id })
            expect(contexts).toHaveLength(0)
        })

        // todo(toplenboren) fix this skipped test!
        test.skip('organization integration manager: read BillingIntegrationOrganizationContext from deleted organization', async () => {
            const admin = await makeLoggedInAdminClient()
            const { managerUserClient, integration, organization } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
            await updateTestOrganization(admin, organization.id, { deletedAt: null })

            const contexts = await BillingIntegrationOrganizationContext.getAll(managerUserClient, { id: context.id })
            expect(contexts).toHaveLength(0)
        })

        test('admin: delete BillingIntegrationOrganizationContext', async () => {
            const admin = await makeLoggedInAdminClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await BillingIntegrationOrganizationContext.delete(admin, context.id)
            })
        })

        test('user: delete BillingIntegrationOrganizationContext', async () => {
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await BillingIntegrationOrganizationContext.delete(user, context.id)
            })
        })

        test('anonymous: delete BillingIntegrationOrganizationContext', async () => {
            const user = await makeClient()
            const { context } = await makeContextWithOrganizationAndIntegrationAsAdmin()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await BillingIntegrationOrganizationContext.delete(user, context.id)
            })
        })

        test('organization integration manager: delete BillingIntegrationOrganizationContext', async () => {
            const { managerUserClient, integration, organization } = await makeOrganizationIntegrationManager()
            const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await BillingIntegrationOrganizationContext.delete(managerUserClient, context.id)
            })
        })
    })
    describe('Must resolve default status on create if not specified',  () => {
        let organization
        let admin
        beforeAll(async () => {
            const adminClient = await makeLoggedInAdminClient()
            admin = adminClient
            const [org] = await registerNewOrganization(adminClient)
            organization = org
        })
        test.each(CONTEXT_STATUSES)('%p', async (status) => {
            const [integration] = await createTestBillingIntegration(admin, {
                contextDefaultStatus: status,
            })
            const [context] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)
            expect(context).toBeDefined()
            expect(context).toHaveProperty('status', status)
        })
    })
})