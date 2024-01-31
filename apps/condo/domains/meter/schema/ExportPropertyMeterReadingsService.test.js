/**
 * Generated by `createservice meter.ExportPropertyMeterReadingsService --type queries`
 */
const {
    makeLoggedInAdminClient,
    expectToThrowAccessDeniedErrorToResult,
    expectToThrowAuthenticationErrorToResult,
    expectToThrowGQLError,
} = require('@open-condo/keystone/test.utils')
const { makeClient } = require('@open-condo/keystone/test.utils')

const {
    CALL_METER_READING_SOURCE_ID,
    COLD_WATER_METER_RESOURCE_ID,
} = require('@condo/domains/meter/constants/constants')
const {
    createTestPropertyMeter,
    createTestPropertyMeterReading,
    MeterReadingSource,
    MeterResource,
    exportPropertyMeterReadingsByTestClient,
} = require('@condo/domains/meter/utils/testSchema')
const {
    makeEmployeeUserClientWithAbilities,
    createTestOrganizationEmployeeRole,
    createTestOrganizationEmployee,
} = require('@condo/domains/organization/utils/testSchema')
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const {
    makeClientWithNewRegisteredAndLoggedInUser,
    makeClientWithSupportUser,
} = require('@condo/domains/user/utils/testSchema')

const { ERRORS } = require('./ExportPropertyMeterReadingsService')


describe('ExportPropertyMeterReadingsService', () => {
    let admin, support, employee, anonymous, user,
        organization
    
    beforeAll(async () => {
        admin = await makeLoggedInAdminClient()
        support = await makeClientWithSupportUser()
        anonymous = await makeClient()
        user = await makeClientWithNewRegisteredAndLoggedInUser()

        const employeeClient = await makeEmployeeUserClientWithAbilities({ canManageMeters: true, canReadMeters: true })
        employee = employeeClient
        organization = employeeClient.organization
        const property = employeeClient.property

        const [resource] = await MeterResource.getAll(employee, { id: COLD_WATER_METER_RESOURCE_ID })
        const [source] = await MeterReadingSource.getAll(employee, { id: CALL_METER_READING_SOURCE_ID })
        const [meter] = await createTestPropertyMeter(employee, organization, property, resource, {})
        await createTestPropertyMeterReading(employee, meter, source)
    })

    describe('Accesses', () => {
        describe('Admin', () => {
            test('Can get meter readings export from selected organization', async () => {
                const [{ status, linkToFile }] = await exportPropertyMeterReadingsByTestClient(admin, {
                    where: { organization: { id: organization.id } },
                    sortBy: 'id_ASC',
                })

                expect(status).toBe('ok')
                expect(linkToFile).not.toHaveLength(0)
            })
        })

        describe('Support', () => {
            test('Can not get meter readings export', async () => {
                await expectToThrowAccessDeniedErrorToResult(async () => {
                    await exportPropertyMeterReadingsByTestClient(support, {
                        where: { organization: { id: organization.id } },
                        sortBy: 'id_ASC',
                    })
                })
            })
        })

        describe('Employee', () => {
            describe('Without "canReadMeters" permission', () => {
                test('Can not export meters', async () => {
                    const employee = await makeClientWithProperty()
                    const [role] = await createTestOrganizationEmployeeRole(admin, organization, { canReadMeters: false })
                    await createTestOrganizationEmployee(admin, organization, employee.user, role, {
                        isAccepted: true,
                    })

                    await expectToThrowAccessDeniedErrorToResult(async () => {
                        await exportPropertyMeterReadingsByTestClient(employee, {
                            where: {
                                organization: { id: organization.id },
                            },
                        })
                    })
                })
            })

            describe('With "canReadMeters" permission', () => {
                test('should return exported meter readings from selected organization', async () => {
                    const [{ status, linkToFile }] = await exportPropertyMeterReadingsByTestClient(employee, {
                        where: { organization: { id: organization.id } },
                        sortBy: 'id_ASC',
                    })

                    expect(status).toBe('ok')
                    expect(linkToFile).not.toHaveLength(0)
                })

                test('should throw error when no meter readings are presented for specified organization', async () => {
                    await expectToThrowGQLError(async () => {
                        await exportPropertyMeterReadingsByTestClient(employee, {
                            where: { organization: { id: organization.id }, id_in: [] },
                            sortBy: 'id_ASC',
                        })
                    }, ERRORS.NOTHING_TO_EXPORT, 'result')
                })
            })
        })

        describe('User', () => {
            test('Can not get meter readings export', async () => {
                await expectToThrowAccessDeniedErrorToResult(async () => {
                    await exportPropertyMeterReadingsByTestClient(user, {
                        where: { organization: { id: organization.id } },
                        sortBy: 'id_ASC',
                    })
                })
            })
        })

        describe('Anonymous', () => {
            test('Can not get meter readings export', async () => {
                await expectToThrowAuthenticationErrorToResult(async () => {
                    await exportPropertyMeterReadingsByTestClient(anonymous, {
                        where: { organization: { id: organization.id } },
                        sortBy: 'id_ASC',
                    })
                })
            })
        })
    })
})
