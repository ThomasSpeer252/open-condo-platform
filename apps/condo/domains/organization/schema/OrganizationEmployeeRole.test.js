/**
 * Generated by `createschema organization.OrganizationEmployeeRole 'organization:Relationship:Organization:CASCADE; name:Text; statusTransitions:Json; canManageOrganization:Checkbox; canManageEmployees:Checkbox; canManageRoles:Checkbox; canManageIntegrations:Checkbox; canManageProperties:Checkbox; canManageTickets:Checkbox;' --force`
 */

const { DEFAULT_STATUS_TRANSITIONS } = require ('@condo/domains/ticket/constants/statusTransitions');
const { createTestOrganizationEmployee } = require('../utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { createTestOrganization } = require('../utils/testSchema')
const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@core/keystone/test.utils')

const { OrganizationEmployeeRole, createTestOrganizationEmployeeRole, updateTestOrganizationEmployeeRole } = require('@condo/domains/organization/utils/testSchema')

describe('OrganizationEmployeeRole', () => {
    describe('user: create OrganizationEmployeeRole', () => {

        it('can with granted "canManageRoles" permission', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageRoles: true,
            })
            const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

            const [obj, attrs] = await createTestOrganizationEmployeeRole(managerUserClient, organization)

            expect(obj.id).toMatch(UUID_RE)
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.name).toEqual(attrs.name)
            expect(obj.statusTransitions).toMatchObject(DEFAULT_STATUS_TRANSITIONS)
            expect(obj.organization).toEqual(expect.objectContaining({ id: organization.id }))
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: managerUserClient.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: managerUserClient.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
        })

        it('cannot without granted "canManageRoles" permission', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageRoles: false,
            })
            const notManagerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, notManagerUserClient.user, role)

            let thrownError
            try {
                await createTestOrganizationEmployeeRole(notManagerUserClient, organization)
            } catch (e) {
                thrownError = e
            }
            expect(thrownError).toBeDefined()
            expect(thrownError.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['obj'],
            })
            expect(thrownError.data).toEqual({ 'obj': null })
        })

    })

    test('anonymous: create OrganizationEmployeeRole', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const anonymous = await makeClient()
        let thrownError
        try {
            await createTestOrganizationEmployeeRole(anonymous, organization)
        } catch (e) {
            thrownError = e
        }
        expect(thrownError).toBeDefined()
        expect(thrownError.errors[0]).toMatchObject({
            'message': 'You do not have access to this resource',
            'name': 'AccessDeniedError',
            'path': ['obj'],
        })
        expect(thrownError.data).toEqual({ 'obj': null })
    })

    describe('user: read OrganizationEmployeeRole', () => {

        it('can only for organization it employed in', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role, attrs] = await createTestOrganizationEmployeeRole(admin, organization)
            const employeeUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, employeeUserClient.user, role)

            const [anotherOrganization] = await createTestOrganization(admin)
            await createTestOrganizationEmployeeRole(admin, anotherOrganization)

            const objs = await OrganizationEmployeeRole.getAll(employeeUserClient, {}, { sortBy: ['updatedAt_DESC'] })

            expect(objs).toHaveLength(1)
            expect(objs[0].id).toMatch(role.id)
            expect(objs[0].dv).toEqual(1)
            expect(objs[0].sender).toEqual(attrs.sender)
            expect(objs[0].v).toEqual(1)
            expect(objs[0].createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(objs[0].updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(objs[0].createdAt).toMatch(role.createdAt)
            expect(objs[0].updatedAt).toMatch(role.updatedAt)
        })

    })

    test('anonymous: read OrganizationEmployeeRole', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        await createTestOrganizationEmployeeRole(admin, organization)

        const anonymous = await makeClient()

        let thrownError
        try {
            await OrganizationEmployeeRole.getAll(anonymous)
        } catch (e) {
            thrownError = e
        }
        expect(thrownError).toBeDefined()
        expect(thrownError.errors[0]).toMatchObject({
            'message': 'You do not have access to this resource',
            'name': 'AccessDeniedError',
            'path': ['objs'],
        })
        expect(thrownError.data).toEqual({ 'objs': null })
    })

    describe('user: update OrganizationEmployeeRole', () => {

        it('can with granted "canManageRoles" permission', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageRoles: true,
            })
            const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

            const [objUpdated, attrs] = await updateTestOrganizationEmployeeRole(managerUserClient, role.id)

            expect(objUpdated.id).toEqual(role.id)
            expect(objUpdated.dv).toEqual(1)
            expect(objUpdated.sender).toEqual(attrs.sender)
            expect(objUpdated.v).toEqual(2)
            expect(objUpdated.name).toEqual(attrs.name)
            expect(objUpdated.statusTransitions).toMatchObject(attrs.statusTransitions)
            expect(objUpdated.createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
            expect(objUpdated.updatedBy).toEqual(expect.objectContaining({ id: managerUserClient.user.id }))
            expect(objUpdated.createdAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).toMatch(DATETIME_RE)
            expect(objUpdated.updatedAt).not.toEqual(objUpdated.createdAt)
        })

        it('cannot without granted "canManageRoles" permission', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageRoles: false,
            })
            const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

            let thrownError
            try {
                await updateTestOrganizationEmployeeRole(managerUserClient, role.id)
            } catch (e) {
                thrownError = e
            }
            expect(thrownError).toBeDefined()
            expect(thrownError.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['obj'],
            })
            expect(thrownError.data).toEqual({ 'obj': null })
        })

    })

    test('anonymous: update OrganizationEmployeeRole', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageRoles: false,
        })
        const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
        await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

        const client = await makeClient()

        let thrownError
        try {
            await updateTestOrganizationEmployeeRole(client, role.id)
        } catch (e) {
            thrownError = e
        }
        expect(thrownError).toBeDefined()
        expect(thrownError.errors[0]).toMatchObject({
            'message': 'You do not have access to this resource',
            'name': 'AccessDeniedError',
            'path': ['obj'],
        })
        expect(thrownError.data).toEqual({ 'obj': null })
    })

    test('user: delete OrganizationEmployeeRole', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageRoles: true,
        })
        const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
        await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)

        let thrownError
        try {
            await OrganizationEmployeeRole.delete(managerUserClient, role.id)
        } catch (e) {
            thrownError = e
        }
        expect(thrownError).toBeDefined()
        expect(thrownError.errors[0].message).toMatch('Cannot query field "deleteOrganizationEmployeeRole" on type "Mutation"')
        expect(thrownError.errors[0].name).toMatch('ValidationError')
    })

    test('anonymous: delete OrganizationEmployeeRole', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageRoles: true,
        })

        const anonymous = await makeClient()
        let thrownError
        try {
            await OrganizationEmployeeRole.delete(anonymous, role.id)
        } catch (e) {
            thrownError = e
        }
        expect(thrownError).toBeDefined()
        expect(thrownError.errors[0].message).toMatch('Cannot query field "deleteOrganizationEmployeeRole" on type "Mutation"')
        expect(thrownError.errors[0].name).toMatch('ValidationError')
    })
})
