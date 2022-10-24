/**
 * Generated by `createschema ticket.MeterReadingFilterTemplate 'name:Text; employee:Relationship:OrganizationEmployee:CASCADE; filters:Json'`
 */

const faker = require('faker')
const { makeLoggedInAdminClient, makeClient, UUID_RE } = require('@condo/keystone/test.utils')

const { MeterReadingFilterTemplate, createTestMeterReadingFilterTemplate, updateTestMeterReadingFilterTemplate } = require('@condo/domains/meter/utils/testSchema')
const {
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAuthenticationErrorToObj,
    expectToThrowValidationFailureError,
    expectToThrowAuthenticationErrorToObjects,
} = require('@condo/keystone/test.utils')
const { createTestOrganization, createTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const {
    createTestOrganizationEmployeeRole,
    updateTestOrganizationEmployee,
} = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')

describe('MeterReadingFilterTemplate', () => {
    describe('Create', () => {
        test('admin: can create MeterReadingFilterTemplate', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee] = await createTestOrganizationEmployee(admin, organization, user.user, role)

            const [filtersTemplate] = await createTestMeterReadingFilterTemplate(admin, employee, {})

            expect(filtersTemplate.id).toMatch(UUID_RE)
        })

        test('employee: can create MeterReadingFilterTemplate', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee] = await createTestOrganizationEmployee(admin, organization, user.user, role)

            const [filtersTemplate] = await createTestMeterReadingFilterTemplate(user, employee, {})

            expect(filtersTemplate.id).toMatch(UUID_RE)
        })

        test('employee: cannot create MeterReadingFilterTemplate with wrong filter field', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee] = await createTestOrganizationEmployee(admin, organization, user.user, role)
            const wrongFieldValue = faker.random.alphaNumeric(5)
            const wrongFilters = {
                wrongField: wrongFieldValue,
            }

            await expectToThrowValidationFailureError(
                async () => await createTestMeterReadingFilterTemplate(user, employee, {
                    fields: wrongFilters,
                }),
                'fields field validation error. JSON not in the correct format - path: msg:must NOT have additional properties',
            )
        })

        test('employee: cannot create MeterReadingFilterTemplate with wrong filter field value', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee] = await createTestOrganizationEmployee(admin, organization, user.user, role)
            const wrongFieldValue = faker.random.number()
            const wrongFilters = {
                date: wrongFieldValue,
            }

            await expectToThrowValidationFailureError(
                async () => await createTestMeterReadingFilterTemplate(user, employee, {
                    fields: wrongFilters,
                }),
                'fields field validation error. JSON not in the correct format - path:/date msg:must be array',
            )
        })

        test('deleted employee: cannot create MeterReadingFilterTemplate', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee] = await createTestOrganizationEmployee(admin, organization, user.user, role)
            await updateTestOrganizationEmployee(admin, employee.id, {
                deletedAt: 'true',
            })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestMeterReadingFilterTemplate(user, employee, {})
            })
        })

        test('blocked employee: cannot create MeterReadingFilterTemplate', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee] = await createTestOrganizationEmployee(admin, organization, user.user, role)
            await updateTestOrganizationEmployee(admin, employee.id, {
                isBlocked: true,
            })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestMeterReadingFilterTemplate(user, employee, {})
            })
        })

        test('user: cannot create MeterReadingFilterTemplate', async () => {
            const admin = await makeLoggedInAdminClient()
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const employeeUser = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee] = await createTestOrganizationEmployee(admin, organization, employeeUser.user, role)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestMeterReadingFilterTemplate(user, employee, {})
            })
        })

        test('anonymous: cannot create MeterReadingFilterTemplate', async () => {
            const admin = await makeLoggedInAdminClient()
            const anonymous = await makeClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const employeeUser = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee] = await createTestOrganizationEmployee(admin, organization, employeeUser.user, role)

            await expectToThrowAuthenticationErrorToObj(async () => {
                await createTestMeterReadingFilterTemplate(anonymous, employee, {})
            })
        })
    })

    describe('Read', () => {
        test('admin: can read MeterReadingFilterTemplate', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee] = await createTestOrganizationEmployee(admin, organization, user.user, role)

            const [filtersTemplate] = await createTestMeterReadingFilterTemplate(admin, employee, {})
            const templates = await MeterReadingFilterTemplate.getAll(admin, { id: filtersTemplate.id })

            expect(templates).toHaveLength(1)
            expect(templates[0].id).toEqual(filtersTemplate.id)
        })

        test('employee: can read his MeterReadingFilterTemplate', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee] = await createTestOrganizationEmployee(admin, organization, user.user, role)

            const [filtersTemplate] = await createTestMeterReadingFilterTemplate(user, employee, {})
            const templates = await MeterReadingFilterTemplate.getAll(user, { id: filtersTemplate.id })

            expect(templates).toHaveLength(1)
            expect(templates[0].id).toEqual(filtersTemplate.id)
        })

        test('employee: cannot read not his own MeterReadingFilterTemplate', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const user1 = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee1] = await createTestOrganizationEmployee(admin, organization, user1.user, role)
            const user2 = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, user2.user, role)

            const [filtersTemplate] = await createTestMeterReadingFilterTemplate(user1, employee1, {})
            const templates = await MeterReadingFilterTemplate.getAll(user2, { id: filtersTemplate.id })

            expect(templates).toHaveLength(0)
        })

        test('user: cannot read MeterReadingFilterTemplate', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const user1 = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee] = await createTestOrganizationEmployee(admin, organization, user1.user, role)
            const user2 = await makeClientWithNewRegisteredAndLoggedInUser()

            const [filtersTemplate] = await createTestMeterReadingFilterTemplate(user1, employee, {})
            const templates = await MeterReadingFilterTemplate.getAll(user2, { id: filtersTemplate.id })

            expect(templates).toHaveLength(0)
        })

        test('anonymous: cannot read MeterReadingFilterTemplate', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const user1 = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee] = await createTestOrganizationEmployee(admin, organization, user1.user, role)
            const anonymous = await makeClient()

            const [filtersTemplate] = await createTestMeterReadingFilterTemplate(user1, employee, {})

            await expectToThrowAuthenticationErrorToObjects(async () => {
                await MeterReadingFilterTemplate.getAll(anonymous, { id: filtersTemplate.id })
            })
        })
    })

    describe('Update', () => {
        test('admin: can update MeterReadingFilterTemplate', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee] = await createTestOrganizationEmployee(admin, organization, user.user, role)

            const [filtersTemplate] = await createTestMeterReadingFilterTemplate(admin, employee, {})
            const newTemplateName = faker.random.alphaNumeric(8)
            const [updatedTemplate] = await updateTestMeterReadingFilterTemplate(admin, filtersTemplate.id, {
                name: newTemplateName,
            })

            expect(updatedTemplate.id).toEqual(filtersTemplate.id)
            expect(updatedTemplate.name).toEqual(newTemplateName)
        })

        test('employee: can update his MeterReadingFilterTemplate', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const user = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee] = await createTestOrganizationEmployee(admin, organization, user.user, role)

            const [filtersTemplate] = await createTestMeterReadingFilterTemplate(user, employee, {})
            const newTemplateName = faker.random.alphaNumeric(8)
            const [updatedTemplate] = await updateTestMeterReadingFilterTemplate(user, filtersTemplate.id, {
                name: newTemplateName,
            })

            expect(updatedTemplate.id).toEqual(filtersTemplate.id)
            expect(updatedTemplate.name).toEqual(newTemplateName)
        })

        test('employee: cannot update not his own MeterReadingFilterTemplate', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const user1 = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee1] = await createTestOrganizationEmployee(admin, organization, user1.user, role)
            const user2 = await makeClientWithNewRegisteredAndLoggedInUser()
            await createTestOrganizationEmployee(admin, organization, user2.user, role)

            const [filtersTemplate] = await createTestMeterReadingFilterTemplate(user1, employee1, {})
            const newTemplateName = faker.random.alphaNumeric(8)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeterReadingFilterTemplate(user2, filtersTemplate.id, {
                    name: newTemplateName,
                })
            })
        })

        test('user: cannot update MeterReadingFilterTemplate', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const user1 = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee1] = await createTestOrganizationEmployee(admin, organization, user1.user, role)
            const user2 = await makeClientWithNewRegisteredAndLoggedInUser()

            const [filtersTemplate] = await createTestMeterReadingFilterTemplate(user1, employee1, {})
            const newTemplateName = faker.random.alphaNumeric(8)

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeterReadingFilterTemplate(user2, filtersTemplate.id, {
                    name: newTemplateName,
                })
            })
        })

        test('anonymous: cannot update MeterReadingFilterTemplate', async () => {
            const admin = await makeLoggedInAdminClient()
            const [organization] = await createTestOrganization(admin)
            const [role] = await createTestOrganizationEmployeeRole(admin, organization, {})
            const user1 = await makeClientWithNewRegisteredAndLoggedInUser()
            const [employee1] = await createTestOrganizationEmployee(admin, organization, user1.user, role)
            const user2 = await makeClient()

            const [filtersTemplate] = await createTestMeterReadingFilterTemplate(user1, employee1, {})
            const newTemplateName = faker.random.alphaNumeric(8)

            await expectToThrowAuthenticationErrorToObj(async () => {
                await updateTestMeterReadingFilterTemplate(user2, filtersTemplate.id, {
                    name: newTemplateName,
                })
            })
        })
    })
})