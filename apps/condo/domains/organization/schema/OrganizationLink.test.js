/**
 * Generated by `createschema organization.OrganizationLink 'from:Relationship:Organization:CASCADE; to:Relationship:Organization:SET_NULL;'`
 */

const { createTestOrganizationEmployee, OrganizationLink } = require('../utils/testSchema')
const { makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')
const { createTestOrganizationEmployeeRole } = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { Ticket, createTestTicket } = require('@condo/domains/ticket/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { createTestOrganization } = require('../utils/testSchema')
const { makeLoggedInAdminClient, makeClient, UUID_RE } = require('@condo/keystone/test.utils')
const { createTestOrganizationLink, updateTestOrganizationLink } = require('@condo/domains/organization/utils/testSchema')
const { expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObj } = require('@condo/keystone/test.utils')

describe('OrganizationLink', () => {
    test('admin: can create OrganizationLink', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organizationFrom] = await createTestOrganization(admin)
        const [organizationTo] = await createTestOrganization(admin)

        const [obj] = await createTestOrganizationLink(admin, organizationFrom, organizationTo)

        expect(obj.id).toMatch(UUID_RE)
    })

    test('support: can create OrganizationLink', async () => {
        const support = await makeClientWithSupportUser()
        const admin = await makeLoggedInAdminClient()
        const [organizationFrom] = await createTestOrganization(admin)
        const [organizationTo] = await createTestOrganization(admin)

        const [obj] = await createTestOrganizationLink(support, organizationFrom, organizationTo)

        expect(obj.id).toMatch(UUID_RE)
    })

    test('admin: can read OrganizationLink', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organizationFrom] = await createTestOrganization(admin)
        const [organizationTo] = await createTestOrganization(admin)
        const [link] = await createTestOrganizationLink(admin, organizationFrom, organizationTo)

        const links = await OrganizationLink.getAll(admin, { id: link.id })
        expect(links).toHaveLength(1)
        expect(links[0].id).toEqual(link.id)
    })

    test('support: can read OrganizationLink', async () => {
        const support = await makeClientWithSupportUser()
        const admin = await makeLoggedInAdminClient()
        const [organizationFrom] = await createTestOrganization(admin)
        const [organizationTo] = await createTestOrganization(admin)
        const [link] = await createTestOrganizationLink(admin, organizationFrom, organizationTo)

        const links = await OrganizationLink.getAll(support, { id: link.id })
        expect(links).toHaveLength(1)
        expect(links[0].id).toEqual(link.id)
    })

    test('admin: can update OrganizationLink', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organizationFrom] = await createTestOrganization(admin)
        const [organizationTo1] = await createTestOrganization(admin)
        const [organizationTo2] = await createTestOrganization(admin)
        const [link] = await createTestOrganizationLink(admin, organizationFrom, organizationTo1)

        const [updatedLink] = await updateTestOrganizationLink(admin, link.id, {
            to: { connect: { id: organizationTo2.id } },
        })

        expect(updatedLink.to.id).toEqual(organizationTo2.id)
    })

    test('user: cannot create OrganizationLink', async () => {
        const admin = await makeLoggedInAdminClient()
        const user = await makeClientWithNewRegisteredAndLoggedInUser()
        const [organizationFrom] = await createTestOrganization(admin)
        const [organizationTo] = await createTestOrganization(admin)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestOrganizationLink(user, organizationFrom, organizationTo)
        })
    })

    test('user: may be a member of several "from" organizations', async () => {
        const admin = await makeLoggedInAdminClient()
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        const ticketCreator1 = await makeClientWithProperty()
        const ticketCreator2 = await makeClientWithProperty()
        const [ticket1] = await createTestTicket(ticketCreator1, ticketCreator1.organization, ticketCreator1.property)
        const [ticket2] = await createTestTicket(ticketCreator2, ticketCreator2.organization, ticketCreator2.property)

        const [organizationFrom1] = await createTestOrganization(admin)
        const [organizationFrom2] = await createTestOrganization(admin)
        await createTestOrganizationLink(admin, organizationFrom1, ticketCreator1.organization)
        await createTestOrganizationLink(admin, organizationFrom2, ticketCreator2.organization)

        const [role1] = await createTestOrganizationEmployeeRole(admin, organizationFrom1)
        await createTestOrganizationEmployee(admin, organizationFrom1, userClient.user, role1)
        const [role2] = await createTestOrganizationEmployeeRole(admin, organizationFrom1)
        await createTestOrganizationEmployee(admin, organizationFrom2, userClient.user, role2)

        const allTickets = await Ticket.getAll(userClient, {})

        expect(allTickets).toHaveLength(2)

        const [ticketFromOrganization1] = await Ticket.getAll(userClient, { id: ticket1.id })
        expect(ticketFromOrganization1).toBeDefined()
        expect(ticketFromOrganization1.id).toEqual(ticket1.id)

        const [ticketFromOrganization2] = await Ticket.getAll(userClient, { id: ticket2.id })
        expect(ticketFromOrganization2).toBeDefined()
        expect(ticketFromOrganization2.id).toEqual(ticket2.id)
    })

    test('user: cannot update OrganizationLink', async () => {
        const user = await makeClientWithNewRegisteredAndLoggedInUser()
        const admin = await makeLoggedInAdminClient()
        const [organizationFrom] = await createTestOrganization(admin)
        const [organizationTo] = await createTestOrganization(admin)
        const [link] = await createTestOrganizationLink(admin, organizationFrom, organizationTo)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestOrganizationLink(user, link.id)
        })
    })

    test('anonymous: cannot create OrganizationLink', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const [organizationFrom] = await createTestOrganization(admin)
        const [organizationTo] = await createTestOrganization(admin)

        await expectToThrowAuthenticationErrorToObj(async () => {
            await createTestOrganizationLink(client, organizationFrom, organizationTo)
        })
    })

    test('anonymous: cannot update OrganizationLink', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const [organizationFrom] = await createTestOrganization(admin)
        const [organizationTo] = await createTestOrganization(admin)
        const [link] = await createTestOrganizationLink(admin, organizationFrom, organizationTo)

        await expectToThrowAuthenticationErrorToObj(async () => {
            await updateTestOrganizationLink(client, link.id)
        })
    })
})
