/**
 * Generated by `createservice organization.ResetOrganizationService --type mutations`
 */

const { faker } = require('@faker-js/faker')

const { makeLoggedInAdminClient, makeClient, catchErrorFrom, expectToThrowAccessDeniedErrorToResult, expectToThrowAuthenticationErrorToResult } = require('@open-condo/keystone/test.utils')

const { createTestAcquiringIntegrationContext, createTestAcquiringIntegration, AcquiringIntegrationContext } = require('@condo/domains/acquiring/utils/testSchema')
const { BANK_INTEGRATION_IDS } = require('@condo/domains/banking/constants')
const { createTestBankIntegrationAccountContext, createTestBankIntegrationOrganizationContext, BankIntegrationOrganizationContext } = require('@condo/domains/banking/utils/testSchema')
const { createTestBillingIntegrationOrganizationContext, createTestBillingIntegration, BillingIntegrationOrganizationContext } = require('@condo/domains/billing/utils/testSchema')
const { createTestB2BAppContext, B2BAppContext, createTestB2BApp } = require('@condo/domains/miniapp/utils/testSchema')
const { DELETED_ORGANIZATION_NAME } = require('@condo/domains/organization/constants/common')
const { resetOrganizationByTestClient, createTestOrganization, Organization, createTestOrganizationEmployee, createTestOrganizationEmployeeRole, createTestOrganizationLink, OrganizationLink } = require('@condo/domains/organization/utils/testSchema')
const { OrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { createTestProperty, Property } = require('@condo/domains/property/utils/testSchema')
const { makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')
const { makeClientWithStaffUser } = require('@condo/domains/user/utils/testSchema')


describe('ResetOrganizationService', () => {
    let support, admin

    beforeAll(async () => {
        support = await makeClientWithSupportUser()
        admin = await makeLoggedInAdminClient()
    })

    test('anonymous: can not execute', async () => {
        const client = await makeClient()
        await expectToThrowAuthenticationErrorToResult(async () => {
            await resetOrganizationByTestClient(client, { organizationId: faker.datatype.uuid() })
        })
    })

    test('user: can not execute', async () => {
        const client = await makeClientWithStaffUser()
        await expectToThrowAccessDeniedErrorToResult(async () => {
            await resetOrganizationByTestClient(client, { organizationId: faker.datatype.uuid() })
        })
    })

    test('support can', async () => {
        const [organization] = await createTestOrganization(admin)
        const payload = {
            organizationId: organization.id,
        }

        await resetOrganizationByTestClient(support, payload)

        const [resetedOrg] = await Organization.getAll(admin, { id: organization.id })
        expect(resetedOrg.id).toEqual(organization.id)
        expect(resetedOrg.name).toEqual(DELETED_ORGANIZATION_NAME)
        expect(resetedOrg.importId).toEqual(null)
        expect(resetedOrg.meta).toEqual(null)
        expect(resetedOrg.features).toEqual([])
    })

    test('two reseted organizations do not violate constrains', async () => {
        const [organization] = await createTestOrganization(admin)
        const [organization2] = await createTestOrganization(admin)

        await resetOrganizationByTestClient(support, { organizationId: organization.id })
        await resetOrganizationByTestClient(support, { organizationId: organization2.id })

        const [resetedOrg] = await Organization.getAll(admin, { id: organization.id })
        expect(resetedOrg.id).toEqual(organization.id)
        expect(resetedOrg.name).toEqual(DELETED_ORGANIZATION_NAME)
        expect(resetedOrg.importId).toEqual(null)
        expect(resetedOrg.meta).toEqual(null)
        expect(resetedOrg.features).toEqual([])

        const [resetedOrg2] = await Organization.getAll(admin, { id: organization2.id })
        expect(resetedOrg2.id).toEqual(organization2.id)
        expect(resetedOrg2.name).toEqual(DELETED_ORGANIZATION_NAME)
        expect(resetedOrg2.importId).toEqual(null)
        expect(resetedOrg2.meta).toEqual(null)
        expect(resetedOrg2.features).toEqual([])
    })

    test('support cant reset non existing user', async () => {
        const orgId = faker.datatype.uuid()

        await catchErrorFrom(async () => {
            await resetOrganizationByTestClient(support, { organizationId: orgId })
        }, ({ errors }) => {
            expect(errors).toMatchObject([{
                message: 'Could not find organization by provided id',
                name: 'GQLError',
                path: ['result'],
                extensions: {
                    mutation: 'resetOrganization',
                    variable: ['data', 'organizationId'],
                    type: 'ORGANIZATION_NOT_FOUND',
                    message: 'Could not find organization by provided id',
                },
            }])
        })
    })

    test('clear all OrganizationEmployee related to reseted organization', async () => {
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization)
        const client = await makeClientWithStaffUser()
        const client2 = await makeClientWithStaffUser()

        const [employee] = await createTestOrganizationEmployee(admin, organization, client.user, role)
        const [employee2] = await createTestOrganizationEmployee(admin, organization, client2.user, role)

        await resetOrganizationByTestClient(support, { organizationId: organization.id })

        const employees = await OrganizationEmployee.getAll(admin, {
            organization: { id: organization.id },
        })

        expect(employees).toHaveLength(0)
    })

    test('soft delete all entities related to reseted organization', async () => {
        const [createdOrganization] = await createTestOrganization(admin)

        const [role] = await createTestOrganizationEmployeeRole(admin, createdOrganization)
        const client = await makeClientWithStaffUser()
        const [employee] = await createTestOrganizationEmployee(admin, createdOrganization, client.user, role)

        const [createdProperty] = await createTestProperty(admin, createdOrganization)

        const [createdOrganization2] = await createTestOrganization(admin)
        const [createdLinkFrom] = await createTestOrganizationLink(admin, createdOrganization2, createdOrganization)
        const [createdLinkTo] = await createTestOrganizationLink(admin, createdOrganization, createdOrganization2)

        const [billingIntegration] = await createTestBillingIntegration(admin)
        const [createdBillingIntegrationOrgCtx] = await createTestBillingIntegrationOrganizationContext(admin, createdOrganization, billingIntegration)

        const [acquiringIntegration] = await createTestAcquiringIntegration(admin)
        const [createdAcquiringIntegrationCtx] = await createTestAcquiringIntegrationContext(admin, createdOrganization, acquiringIntegration)

        const [b2BApp] = await createTestB2BApp(admin)
        const [createdB2BAppCtx] = await createTestB2BAppContext(admin, b2BApp, createdOrganization)

        const [createdBankAccountContext] = await createTestBankIntegrationAccountContext(admin, { id: BANK_INTEGRATION_IDS.SBBOL }, createdOrganization)

        const [createdBankIntegrationOrganizationContext] = await createTestBankIntegrationOrganizationContext(admin, { id: BANK_INTEGRATION_IDS.SBBOL }, createdOrganization)

        await resetOrganizationByTestClient(admin, { organizationId: createdOrganization.id })

        const employees = await OrganizationEmployee.getAll(admin, {
            organization: { id: createdOrganization.id },
        })
        expect(employees).toHaveLength(0)

        const property = await Property.getAll(admin, { id: createdProperty.id })
        expect(property).toHaveLength(0)

        const linkFrom = await OrganizationLink.getAll(admin, { id: createdLinkFrom.id })
        expect(linkFrom).toHaveLength(0)

        const linkTo = await OrganizationLink.getAll(admin, { id: createdLinkTo.id })
        expect(linkTo).toHaveLength(0)

        const billingIntegrationOrgCtx = await BillingIntegrationOrganizationContext.getAll(admin, { id: createdBillingIntegrationOrgCtx.id })
        expect(billingIntegrationOrgCtx).toHaveLength(0)

        const acquiringIntegrationCtx = await AcquiringIntegrationContext.getAll(admin, { id: createdAcquiringIntegrationCtx.id })
        expect(acquiringIntegrationCtx).toHaveLength(0)

        const bankIntegrationOrganizationContexts = await BankIntegrationOrganizationContext.getAll(admin, { id: createdBankIntegrationOrganizationContext.id })
        expect(bankIntegrationOrganizationContexts).toHaveLength(0)

        const b2BAppCtx = await B2BAppContext.getAll(admin, { id: createdB2BAppCtx.id })
        expect(b2BAppCtx).toHaveLength(0)

        const [organization] = await Organization.getAll(admin, { id: createdOrganization.id })
        expect(organization.name).toEqual(DELETED_ORGANIZATION_NAME)
        expect(organization.deletedAt).toBeNull()

        const [organization2] = await Organization.getAll(admin, { id: createdOrganization2.id })
        expect(organization2.name).toEqual(organization2.name)
        expect(organization2.deletedAt).toBeNull()

    })

})