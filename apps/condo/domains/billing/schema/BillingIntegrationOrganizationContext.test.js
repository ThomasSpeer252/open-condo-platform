/**
 * Generated by `createschema billing.BillingIntegrationOrganizationContext 'integration:Relationship:BillingIntegration:PROTECT; organization:Relationship:Organization:CASCADE; settings:Json; state:Json' --force`
 */

const { createTestOrganizationEmployee, createTestOrganizationEmployeeRole } = require('@condo/domains/organization/utils/testSchema')
const { makeLoggedInClient } = require('@condo/domains/user/utils/testSchema')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { createTestBillingIntegration, createTestBillingIntegrationOrganizationContext, updateTestBillingIntegrationOrganizationContext, createTestBillingIntegrationAccessRight } = require('@condo/domains/billing/utils/testSchema')
const { expectToThrowAccessDeniedErrorToObj } = require('@condo/domains/common/utils/testSchema')

describe('BillingIntegrationOrganizationContext', () => {
    test('admin: create BillingIntegrationOrganizationContext', async () => {
        const admin = await makeLoggedInAdminClient()
        const [integration] = await createTestBillingIntegration(admin)
        const [organization] = await createTestOrganization(admin)
        const [context] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)

        expect(context).toEqual(expect.objectContaining({
            integration: { id: integration.id, name: integration.name },
            organization: { id: organization.id, name: organization.name },
        }))
    })

    test('user: read BillingIntegrationOrganizationContext', async () => {
        const admin = await makeLoggedInAdminClient()
        const [integration] = await createTestBillingIntegration(admin)
        const [organization] = await createTestOrganization(admin)
        const user = await makeLoggedInClient()

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestBillingIntegrationOrganizationContext(user, organization, integration)
        })
    })

    test('anonymous: create BillingIntegrationOrganizationContext', async () => {
        const admin = await makeLoggedInAdminClient()
        const [integration] = await createTestBillingIntegration(admin)
        const [organization] = await createTestOrganization(admin)

        const user = await makeClient()

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestBillingIntegrationOrganizationContext(user, organization, integration)
        })
    })

    test('organization integration manager: create BillingIntegrationOrganizationContext', async () => {
        const admin = await makeLoggedInAdminClient()
        const [integration] = await createTestBillingIntegration(admin)
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageIntegrations: true,
        })
        const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
        await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)

        expect(context).toEqual(expect.objectContaining({
            integration: { id: integration.id, name: integration.name },
            organization: { id: organization.id, name: organization.name },
        }))
    })

    test('organization integration manager: update BillingIntegrationOrganizationContext', async () => {
        const admin = await makeLoggedInAdminClient()
        const [integration] = await createTestBillingIntegration(admin)
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageIntegrations: true,
        })
        const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
        await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

        const [context] = await createTestBillingIntegrationOrganizationContext(managerUserClient, organization, integration)
        const [updContext] = await updateTestBillingIntegrationOrganizationContext(managerUserClient, context.id, { settings: {
            dv: 1,
            gisOrganizationId: 'testId',
        } })

        expect(updContext).toEqual(expect.objectContaining({
            integration: { id: integration.id, name: integration.name },
            organization: { id: organization.id, name: organization.name },
            settings: { gisOrganizationId: 'testId', dv: 1 },
        }))
    })

    test('integration: create BillingIntegrationOrganizationContext', async () => {
        const admin = await makeLoggedInAdminClient()
        const [integration] = await createTestBillingIntegration(admin)
        const [organization] = await createTestOrganization(admin)

        const integrationClient = await makeClientWithNewRegisteredAndLoggedInUser()
        await createTestBillingIntegrationAccessRight(admin, integration, integrationClient.user)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestBillingIntegrationOrganizationContext(integrationClient, organization, integration)
        })
    })

    test('integration: update BillingIntegrationOrganizationContext', async () => {
        const admin = await makeLoggedInAdminClient()
        const [integration] = await createTestBillingIntegration(admin)
        const [organization] = await createTestOrganization(admin)

        const integrationClient = await makeClientWithNewRegisteredAndLoggedInUser()
        await createTestBillingIntegrationAccessRight(admin, integration, integrationClient.user)

        const [context] = await createTestBillingIntegrationOrganizationContext(admin, organization, integration)
        const [updContext] = await updateTestBillingIntegrationOrganizationContext(integrationClient, context.id, { settings: {
            dv: 1,
            gisOrganizationId: 'testId',
        } })

        expect(updContext).toEqual(expect.objectContaining({
            settings: { dv: 1, gisOrganizationId: 'testId'  },
        }))
    })
})
