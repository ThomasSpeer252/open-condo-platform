/**
 * Generated by `createschema banking.BankContractorAccount 'name:Text; organization:Relationship:Organization:CASCADE; costItem?:Relationship:BankCostItem:SET_NULL; tin:Text; country:Text; routingNumber:Text; number:Text; currencyCode:Text; importId?:Text; territoryCode?:Text; bankName?:Text; meta?:Json; tinMeta?:Json; routingNumberMeta?:Json'`
 */

const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
} = require('@open-condo/keystone/test.utils')


const { BankContractorAccount, createTestBankContractorAccount, updateTestBankContractorAccount } = require('@condo/domains/banking/utils/testSchema')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')

const {
    createTestOrganizationEmployeeRole,
    createTestOrganizationEmployee, createTestOrganizationLink,
} = require('../../organization/utils/testSchema')

let admin
let support
let anonymous

describe('BankContractorAccount', () => {

    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        support = await makeClientWithSupportUser()
        anonymous = await makeClient()
    })

    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                const [organization] = await createTestOrganization(admin)
                const [obj, attrs] = await createTestBankContractorAccount(admin, organization)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(1)
                expect(obj.newId).toEqual(null)
                expect(obj.deletedAt).toEqual(null)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
                expect(obj.createdAt).toMatch(DATETIME_RE)
                expect(obj.updatedAt).toMatch(DATETIME_RE)
                expect(obj.name).toMatch(attrs.name)
                expect(obj.organization.id).toEqual(organization.id)
                expect(obj.tin).toMatch(attrs.tin)
                expect(obj.country).toMatch(attrs.country)
                expect(obj.routingNumber).toMatch(attrs.routingNumber)
                expect(obj.number).toMatch(attrs.number)
                expect(obj.currencyCode).toMatch(attrs.currencyCode)
                expect(obj.importId).toMatch(attrs.importId)
                expect(obj.territoryCode).toMatch(attrs.territoryCode)
                expect(obj.bankName).toMatch(attrs.bankName)
            })

            test('support can', async () => {
                const [organization] = await createTestOrganization(admin)
                const [obj, attrs] = await createTestBankContractorAccount(support, organization)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: support.user.id }))
            })

            test('user can\'t', async () => {
                const user = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestBankContractorAccount(user, organization)
                })
            })

            test('anonymous can\'t', async () => {
                const [organization] = await createTestOrganization(admin)
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestBankContractorAccount(anonymous, organization)
                })
            })
        })

        describe('update', () => {
            test('admin can', async () => {
                const [organization] = await createTestOrganization(admin)
                const [objCreated] = await createTestBankContractorAccount(admin, organization)

                const [obj, attrs] = await updateTestBankContractorAccount(admin, objCreated.id)

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
            })

            test('support can', async () => {
                const [organization] = await createTestOrganization(admin)
                const [objCreated] = await createTestBankContractorAccount(admin, organization)

                const [obj, attrs] = await updateTestBankContractorAccount(support, objCreated.id)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: support.user.id }))
            })

            test('user can\'t', async () => {
                const user = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [objCreated] = await createTestBankContractorAccount(admin, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestBankContractorAccount(user, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const [organization] = await createTestOrganization(admin)
                const [objCreated] = await createTestBankContractorAccount(admin, organization)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestBankContractorAccount(anonymous, objCreated.id)
                })
            })
        })

        describe('hard delete', () => {
            test('admin can\'t', async () => {
                const [organization] = await createTestOrganization(admin)
                const [objCreated] = await createTestBankContractorAccount(admin, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankContractorAccount.delete(admin, objCreated.id)
                })
            })

            test('user can\'t', async () => {
                const user = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [objCreated] = await createTestBankContractorAccount(admin, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankContractorAccount.delete(user, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const [organization] = await createTestOrganization(admin)
                const [objCreated] = await createTestBankContractorAccount(admin, organization)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await BankContractorAccount.delete(anonymous, objCreated.id)
                })
            })
        })

        describe('read', () => {
            test('admin can', async () => {
                const [organization] = await createTestOrganization(admin)
                const [obj] = await createTestBankContractorAccount(admin, organization)

                const objs = await BankContractorAccount.getAll(admin, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                        name: obj.name,
                        organization: {
                            id: organization.id,
                        },
                        tin: obj.tin,
                        country: obj.country,
                        routingNumber: obj.routingNumber,
                        number: obj.number,
                        currencyCode: obj.currencyCode,
                        importId: obj.importId,
                        territoryCode: obj.territoryCode,
                        bankName: obj.bankName,
                    }),
                ]))
            })

            test('user can if it is an employee of related organization', async () => {
                // NOTE: do not affect shared organization for this test module
                const [organization] = await createTestOrganization(admin)


                const [obj] = await createTestBankContractorAccount(admin, organization)

                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [role] = await createTestOrganizationEmployeeRole(admin, organization)
                await createTestOrganizationEmployee(admin, organization, userClient.user, role, {})

                const objs = await BankContractorAccount.getAll(userClient, { id: obj.id }, { sortBy: ['updatedAt_DESC'] })

                expect(objs).toHaveLength(1)
                expect(objs[0]).toMatchObject({
                    id: obj.id,
                    name: obj.name,
                    organization: {
                        id: organization.id,
                    },
                    tin: obj.tin,
                    country: obj.country,
                    routingNumber: obj.routingNumber,
                    number: obj.number,
                    currencyCode: obj.currencyCode,
                    importId: obj.importId,
                    territoryCode: obj.territoryCode,
                    bankName: obj.bankName,
                })
            })

            test('user can if it is an employee from linked parent organization', async () => {
                const [parentOrganization] = await createTestOrganization(admin)
                const [childOrganization] = await createTestOrganization(admin)

                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationLink(admin, parentOrganization, childOrganization)
                const [role] = await createTestOrganizationEmployeeRole(admin, parentOrganization)
                await createTestOrganizationEmployee(admin, parentOrganization, userClient.user, role, {})

                const [obj] = await createTestBankContractorAccount(admin, childOrganization)

                const objs = await BankContractorAccount.getAll(userClient, { id: obj.id }, { sortBy: ['updatedAt_DESC'] })

                expect(objs).toHaveLength(1)
                expect(objs[0]).toMatchObject({
                    id: obj.id,
                    name: obj.name,
                    organization: {
                        id: childOrganization.id,
                    },
                    tin: obj.tin,
                    country: obj.country,
                    routingNumber: obj.routingNumber,
                    number: obj.number,
                    currencyCode: obj.currencyCode,
                    importId: obj.importId,
                    territoryCode: obj.territoryCode,
                    bankName: obj.bankName,
                })
            })

            test('user cannot in other cases', async () => {
                const [organization] = await createTestOrganization(admin)
                const [obj] = await createTestBankContractorAccount(admin, organization)

                const user = await makeClientWithNewRegisteredAndLoggedInUser()
                const objs = await BankContractorAccount.getAll(user, { id: obj.id }, { sortBy: ['updatedAt_DESC'] })
                expect(objs).toHaveLength(0)
            })

            test('anonymous can\'t', async () => {
                const [organization] = await createTestOrganization(admin)
                await createTestBankContractorAccount(admin, organization)

                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await BankContractorAccount.getAll(anonymous, {}, { sortBy: ['updatedAt_DESC'] })
                })
            })
        })
    })

    describe('Permissions', () => {
        describe('user', () => {
            it('can connect to organization it is employed in and has permission "canManageBankContractorAccounts"', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageBankContractorAccounts: true,
                })
                await createTestOrganizationEmployee(admin, organization, userClient.user, role)
                const [obj, attrs] = await createTestBankContractorAccount(userClient, organization)
                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: userClient.user.id }))
            })

            it('cannot connect to organization it is employed in and does not have permission "canManageBankContractorAccounts"', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, organization, {
                    canManageBankContractorAccounts: false,
                })
                await createTestOrganizationEmployee(admin, organization, userClient.user, role)
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestBankContractorAccount(userClient, organization)
                })
            })

            it('cannot connect to organization it is not employed in and has in another organization permission "canManageBankContractorAccounts"', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()
                const [organization] = await createTestOrganization(admin)
                const [anotherOrganization] = await createTestOrganization(admin)
                const [role] = await createTestOrganizationEmployeeRole(admin, anotherOrganization, {
                    canManageBankContractorAccounts: true,
                })
                await createTestOrganizationEmployee(admin, anotherOrganization, userClient.user, role)
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestBankContractorAccount(userClient, organization)
                })
            })
        })
    })
})
