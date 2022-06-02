/**
 * Generated by `createschema organization.OrganizationEmployee 'organization:Relationship:Organization:CASCADE; user:Relationship:User:SET_NULL; inviteCode:Text; name:Text; email:Text; phone:Text; role:Relationship:OrganizationEmployeeRole:SET_NULL; isAccepted:Checkbox; isRejected:Checkbox' --force`
 */
const { pick } = require('lodash')
const faker = require('faker')

const { makeLoggedInAdminClient, makeClient, DATETIME_RE, getRandomString } = require('@core/keystone/test.utils')

const { expectToThrowAuthenticationErrorToObjects, expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObj } = require('@condo/domains/common/utils/testSchema')

const { createTestPhone, createTestEmail, updateTestUser, makeClientWithNewRegisteredAndLoggedInUser, UserAdmin } = require('@condo/domains/user/utils/testSchema')
const { acceptOrRejectOrganizationInviteById, inviteNewOrganizationEmployee, makeClientWithRegisteredOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const {
    OrganizationEmployee,
    createTestOrganizationEmployee,
    updateTestOrganizationEmployee,
    makeAdminClientWithRegisteredOrganizationWithRoleWithEmployee,
    createTestOrganizationEmployeeRole,
    createTestOrganization,
} = require('@condo/domains/organization/utils/testSchema')
const { createTestTicketCategoryClassifier } = require('@condo/domains/ticket/utils/testSchema')

describe('OrganizationEmployee', () => {
    describe('user: create OrganizationEmployee', () => {

        test('cannot without granted "canManageEmployees" permission', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageEmployees: false,
            })
            const notManagerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, notManagerUserClient.user, role)
            const { user } = await makeClientWithNewRegisteredAndLoggedInUser()
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestOrganizationEmployee(notManagerUserClient, organization, user, role)
            })
        })

        test('can with granted "canManageEmployees" permission', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageEmployees: true,
            })
            const managerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, managerUserClient.user, role)
            const { user } = await makeClientWithNewRegisteredAndLoggedInUser()

            const [categoryClassifier1] = await createTestTicketCategoryClassifier(admin)
            const [categoryClassifier2] = await createTestTicketCategoryClassifier(admin)

            const [obj, attrs] = await createTestOrganizationEmployee(managerUserClient, organization, user, role, {
                specializations: {
                    connect: [
                        { id: categoryClassifier1.id },
                        { id: categoryClassifier2.id },
                    ],
                },
            })
            expect(obj.id).toBeDefined()
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(1)
            expect(obj.createdBy).toEqual(expect.objectContaining({ id: managerUserClient.user.id }))
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: managerUserClient.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
            expect(obj.specializations).toHaveLength(2)
            expect(obj.specializations).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(pick(categoryClassifier1, ['id', 'name'])),
                ]),
            )
            expect(obj.specializations).toEqual(
                expect.arrayContaining([
                    expect.objectContaining(pick(categoryClassifier2, ['id', 'name'])),
                ]),
            )
        })

    })

    test('anonymous: create OrganizationEmployee', async () => {
        const anonymous = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageEmployees: false,
        })
        const { user } = await makeClientWithNewRegisteredAndLoggedInUser()
        await expectToThrowAuthenticationErrorToObj(async () => {
            await createTestOrganizationEmployee(anonymous, organization, user, role)
        })
    })

    test('user: read OrganizationEmployee', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageEmployees: false,
        })
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        const [obj, attrs] = await createTestOrganizationEmployee(admin, organization, userClient.user, role)

        const objs = await OrganizationEmployee.getAll(userClient, {}, { sortBy: ['updatedAt_DESC'] })

        expect(objs.length).toBeGreaterThan(0)
        expect(objs[0].id).toMatch(obj.id)
        expect(objs[0].dv).toEqual(1)
        expect(objs[0].sender).toEqual(attrs.sender)
        expect(objs[0].v).toEqual(1)
        expect(objs[0].createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
        expect(objs[0].updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
        expect(objs[0].createdAt).toMatch(obj.createdAt)
        expect(objs[0].updatedAt).toMatch(obj.updatedAt)
    })

    test('user with deleted employee: can read his employee', async () => {
        const admin = await makeLoggedInAdminClient()
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization)
        const [employee] = await createTestOrganizationEmployee(admin, organization, userClient.user, role)
        await updateTestOrganizationEmployee(admin, employee.id, { deletedAt: 'true' })

        const { data: { objs } } = await OrganizationEmployee.getAll(userClient,
            { OR: [{ deletedAt: null }, { deletedAt_not: null }] },
            { raw: true },
        )

        expect(objs).toHaveLength(1)
        expect(objs[0].id).toEqual(employee.id)
        expect(objs[0].email).toEqual(employee.email)
        expect(objs[0].phone).toEqual(employee.phone)
    })

    test('user with deleted employee: cannot read other employees', async () => {
        const admin = await makeLoggedInAdminClient()
        const userClient1 = await makeClientWithNewRegisteredAndLoggedInUser()
        const userClient2 = await makeClientWithNewRegisteredAndLoggedInUser()
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization)
        const [employee1] = await createTestOrganizationEmployee(admin, organization, userClient1.user, role)
        await createTestOrganizationEmployee(admin, organization, userClient2.user, role)
        await updateTestOrganizationEmployee(admin, employee1.id, { deletedAt: 'true' })

        const objs = await OrganizationEmployee.getAll(userClient1, {})

        expect(objs).toHaveLength(0)
    })

    test('anonymous: read OrganizationEmployee', async () => {
        const client = await makeClient()

        await expectToThrowAuthenticationErrorToObjects(async () => {
            await OrganizationEmployee.getAll(client)
        })
    })

    describe('user: update OrganizationEmployee', () => {
        test('can set phone and email to null', async () => {
            const client = await makeClientWithRegisteredOrganization()
            const employee = await OrganizationEmployee.getOne(client, { user: { id: client.user.id } })
            const [updatedEmployee] = await updateTestOrganizationEmployee(client, employee.id, {
                phone: null,
                email: null,
                name: 'HACKER',
            })
            expect(updatedEmployee).toMatchObject({
                phone: null,
                email: null,
                name: 'HACKER',
                user: { id: client.user.id },
                organization: { id: client.organization.id },
            })
        })

        test('cannot without granted "canManageEmployees" permission', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageEmployees: false,
            })
            const notManagerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, notManagerUserClient.user, role)
            const { user } = await makeClientWithNewRegisteredAndLoggedInUser()
            const [objCreated] = await createTestOrganizationEmployee(admin, organization, user, role)
            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestOrganizationEmployee(notManagerUserClient, objCreated.id)
            })
        })

        test('can with granted "canManageEmployees" permission', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageEmployees: true,
            })
            const managerClient = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, managerClient.user, role)
            const { user } = await makeClientWithNewRegisteredAndLoggedInUser()
            const [objCreated] = await createTestOrganizationEmployee(admin, organization, user, role)

            const payload = {
                name: faker.name.firstName(),
            }
            const [obj, attrs] = await updateTestOrganizationEmployee(managerClient, objCreated.id, payload)
            expect(obj.id).toBeDefined()
            expect(obj.dv).toEqual(1)
            expect(obj.sender).toEqual(attrs.sender)
            expect(obj.v).toEqual(2)
            expect(obj.name).toEqual(attrs.name)
            expect(obj.updatedBy).toEqual(expect.objectContaining({ id: managerClient.user.id }))
            expect(obj.createdAt).toMatch(DATETIME_RE)
            expect(obj.updatedAt).toMatch(DATETIME_RE)
        })

    })

    test('anonymous: update OrganizationEmployee', async () => {
        const { employee } = await makeAdminClientWithRegisteredOrganizationWithRoleWithEmployee()

        const client = await makeClient()
        const payload = {}
        await expectToThrowAuthenticationErrorToObj(async () => {
            await updateTestOrganizationEmployee(client, employee.id, payload)
        })
    })

    describe('user: softDelete OrganizationEmployee', () => {

        test('cannot without granted "canManageEmployees" permission', async () => {
            const { employee, admin, organization } = await makeAdminClientWithRegisteredOrganizationWithRoleWithEmployee()
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageEmployees: false,
            })
            const notManagerUserClient = await makeClientWithNewRegisteredAndLoggedInUser()

            await createTestOrganizationEmployee(admin, organization, notManagerUserClient.user, role)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await OrganizationEmployee.softDelete(notManagerUserClient, employee.id)
            })
        })

        test('can with granted "canManageEmployees" permission', async () => {
            const { employee, admin, organization } = await makeAdminClientWithRegisteredOrganizationWithRoleWithEmployee()
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                canManageEmployees: true,
            })
            const managerClient = await makeClientWithNewRegisteredAndLoggedInUser()

            await createTestOrganizationEmployee(admin, organization, managerClient.user, role, { isBlocked: false })

            const [obj] = await OrganizationEmployee.softDelete(managerClient, employee.id)

            expect(obj.id).toBeDefined()

            const objs = await OrganizationEmployee.getAll(admin, { id: obj.id })

            expect(objs).toHaveLength(0)
        })

    })

    test('anonymous: delete OrganizationEmployee', async () => {
        const { employee } = await makeAdminClientWithRegisteredOrganizationWithRoleWithEmployee()

        const client = await makeClient()
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await OrganizationEmployee.delete(client, employee.id)
        })
    })

    describe('admin', () => {
        it('can count all', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization)
            const userClient1 = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, userClient1.user, role)
            const userClient2 = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, userClient2.user, role)

            const countOfCreatedByAdmin = await OrganizationEmployee.count(admin, { createdBy: { id: admin.user.id } })
            expect(countOfCreatedByAdmin).toBeGreaterThan(2)

            const countOfAll = await OrganizationEmployee.count(admin)
            expect(countOfAll).toBeGreaterThanOrEqual(countOfCreatedByAdmin)
        })
    })

    test('user: deleted user dont have access to update OrganizationEmployee', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
            canManageEmployees: true,
            canManageOrganization: true,
        })

        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
        const [obj] = await createTestOrganizationEmployee(admin, organization, userClient.user, role)

        await updateTestOrganizationEmployee(userClient, obj.id, { name: 'name2' })
        await updateTestOrganizationEmployee(admin, obj.id, { deletedAt: 'true' })

        const { data: { objs } } = await OrganizationEmployee.getAll(userClient, {}, { raw: 'true' })
        expect(objs).toHaveLength(0)

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestOrganizationEmployee(userClient, obj.id, { name: 'name3' })
        })
    })

    test('employee who accepted the invite: updates phone and email if employee user updates', async () => {
        const admin = await makeLoggedInAdminClient()
        const [organization] = await createTestOrganization(admin)
        const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
        const userClient = await makeClientWithNewRegisteredAndLoggedInUser()

        await createTestOrganizationEmployee(admin, organization, userClient.user, role, { isAccepted: true })
        await createTestOrganizationEmployee(admin, organization, userClient.user, role, { isAccepted: true })

        const email = faker.random.alphaNumeric(10) + '@example.com'
        const phone = faker.phone.phoneNumber('+79#########')
        await updateTestUser(admin, userClient.user.id, {
            email,
            phone,
        })

        const employees = await OrganizationEmployee.getAll(userClient)

        expect(employees).toHaveLength(2)
        expect(employees[0].email).toEqual(email)
        expect(employees[1].email).toEqual(email)
        expect(employees[0].phone).toEqual(phone)
        expect(employees[1].phone).toEqual(phone)
    })

    test('employee: did not update phone and email when user did nothing with invite', async () => {
        const admin = await makeLoggedInAdminClient()
        const client1 = await makeClientWithRegisteredOrganization()
        const client2 = await makeClientWithNewRegisteredAndLoggedInUser()

        const [invitedEmployee] = await inviteNewOrganizationEmployee(client1, client1.organization, client2.userAttrs)

        const email = createTestEmail()
        const phone = createTestPhone()
        await updateTestUser(admin, client2.user.id, {
            email,
            phone,
        })

        const [employee] = await OrganizationEmployee.getAll(client1, { user: { id: client2.user.id } })
        expect(employee.phone).toEqual(invitedEmployee.phone)
        expect(employee.email).toEqual(invitedEmployee.email)
    })

    test('employee: update phone and email when user accept invite', async () => {
        const admin = await makeLoggedInAdminClient()
        const client1 = await makeClientWithRegisteredOrganization()
        const client2 = await makeClientWithNewRegisteredAndLoggedInUser()

        const [invitedEmployee] = await inviteNewOrganizationEmployee(client1, client1.organization, client2.userAttrs)
        await acceptOrRejectOrganizationInviteById(client2, invitedEmployee)

        const email = createTestEmail()
        const phone = createTestPhone()
        await updateTestUser(admin, client2.user.id, {
            email,
            phone,
        })

        const [employee] = await OrganizationEmployee.getAll(client1, { user: { id: client2.user.id } })
        expect(employee.phone).toEqual(phone)
        expect(employee.email).toEqual(email)
    })

    test('employee: did not update phone and email when user reject invite', async () => {
        const admin = await makeLoggedInAdminClient()
        const client1 = await makeClientWithRegisteredOrganization()
        const client2 = await makeClientWithNewRegisteredAndLoggedInUser()

        const [invitedEmployee] = await inviteNewOrganizationEmployee(client1, client1.organization, client2.userAttrs)
        await acceptOrRejectOrganizationInviteById(client2, invitedEmployee, {
            isAccepted: false,
            isRejected: true,
        })

        const email = createTestEmail()
        const phone = createTestPhone()
        await updateTestUser(admin, client2.user.id, {
            email,
            phone,
        })

        const [employee] = await OrganizationEmployee.getAll(client1, { user: { id: client2.user.id } })
        expect(employee.phone).toEqual(invitedEmployee.phone)
        expect(employee.email).toEqual(invitedEmployee.email)
    })

    test('admin: setting User.email/User.phone to null causes OrganizationEmployee to be updated', async () => {
        const admin = await makeLoggedInAdminClient()
        const client = await makeClientWithRegisteredOrganization()
        await updateTestUser(admin, client.user.id, {
            isSupport: false,
            isAdmin: false,
            name: 'DELETED',
            email: null,
            phone: null,
        })
        const employee = await OrganizationEmployee.getOne(admin, { user: { id: client.user.id } })
        const updatedUser = await UserAdmin.getOne(admin, { id: client.user.id })

        expect(employee).toMatchObject({
            email: null,
            phone: null,
            name: 'DELETED',
        })
        expect(updatedUser).toMatchObject({
            isSupport: false,
            isAdmin: false,
            name: 'DELETED',
            email: null,
            phone: null,
        })
    })

    test('Case: some user invite another and then both of them changed their names', async () => {
        const admin = await makeLoggedInAdminClient()
        const phone = createTestPhone()
        const email = createTestEmail()
        const client2 = await makeClientWithNewRegisteredAndLoggedInUser()
        const client1 = await makeClientWithRegisteredOrganization()

        // client1 invite client2 by phone with wrong name!
        const [invite2_0] = await inviteNewOrganizationEmployee(client1, client1.organization, { phone: client2.userAttrs.phone, name: 'TEST1', email })
        expect(invite2_0).toMatchObject({
            name: 'TEST1',
            phone: client2.userAttrs.phone,
            email,
            user: expect.objectContaining({
                id: client2.user.id,
            }),
            isAccepted: false,
            isRejected: false,
        })

        // client2 accept the invite
        const [invite2_1] = await acceptOrRejectOrganizationInviteById(client2, invite2_0, { isAccepted: true })
        expect(invite2_1).toMatchObject({
            id: invite2_0.id,
            name: client2.userAttrs.name,
            phone: client2.userAttrs.phone,
            email: client2.userAttrs.email,
            user: expect.objectContaining({
                id: client2.user.id,
            }),
            isAccepted: true,
            isRejected: false,
        })

        // admin change the user1 name, email and phone
        await updateTestUser(admin, client1.user.id, {
            name: 'UPDATED1',
            email: null,
            phone,
        })
        // client2 change their name
        await updateTestUser(client2, client2.user.id, {
            name: 'CLIENT2',
        })

        // check that the changes are reflected
        const employee1 = await OrganizationEmployee.getOne(admin, { user: { id: client1.user.id } })
        const employee2 = await OrganizationEmployee.getOne(admin, { user: { id: client2.user.id } })
        expect(employee1.id).not.toEqual(employee2.id)
        expect(employee1).toMatchObject({
            email: null,
            phone,
            name: 'UPDATED1',
            user: expect.objectContaining({
                id: client1.user.id,
            }),
        })
        expect(employee2).toMatchObject({
            id: invite2_0.id,
            name: 'CLIENT2',
            phone: client2.userAttrs.phone,
            email: client2.userAttrs.email,
            user: expect.objectContaining({
                id: client2.user.id,
            }),
            isAccepted: true,
            isRejected: false,
        })

        // Updated
        const user1 = await UserAdmin.getOne(admin, { id: client1.user.id })
        expect(user1).toMatchObject({
            name: 'UPDATED1',
            email: null,
            phone,
        })
        // Not changed
        const user2 = await UserAdmin.getOne(admin, { id: client2.user.id })
        expect(user2).toMatchObject({
            name: 'CLIENT2',
            email: client2.userAttrs.email,
            phone: client2.userAttrs.phone,
        })
    })
})
