/**
 * Generated by `createservice resident.GetResidentExistenceByPhoneAndAddressService --type queries`
 */

const { faker } = require('@faker-js/faker')

const { makeLoggedInAdminClient, expectToThrowAccessDeniedErrorToResult } = require('@open-condo/keystone/test.utils')

const { HOLDING_TYPE } = require('@condo/domains/organization/constants/common')
const { createTestOrganization, createTestOrganizationEmployeeRole, createTestOrganizationEmployee, createTestOrganizationLink } = require('@condo/domains/organization/utils/testSchema')
const { FLAT_UNIT_TYPE } = require('@condo/domains/property/constants/common')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { getResidentExistenceByPhoneAndAddressByTestClient } = require('@condo/domains/resident/utils/testSchema')
const { createTestResident } = require('@condo/domains/resident/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { makeClientWithResidentUser, createTestPhone } = require('@condo/domains/user/utils/testSchema')


describe('GetResidentExistenceByPhoneAndAddressService', () => {
    let adminClient

    beforeAll(async () => {
        adminClient = await makeLoggedInAdminClient()
    })

    describe('Access', () => {
        it('Admin can', async () => {
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)
            const unitName = faker.random.alphaNumeric(8)
            const phone = createTestPhone()

            const [result] = await getResidentExistenceByPhoneAndAddressByTestClient(adminClient, {
                phone,
                propertyId: property.id,
                unitName,
                unitType: FLAT_UNIT_TYPE,
            })

            expect(result.hasResident).toEqual(false)
            expect(result.hasResidentOnAddress).toEqual(false)
        })

        it('Employee with organization from passed property can', async () => {
            const employeeClient = await makeClientWithNewRegisteredAndLoggedInUser()
            const residentClient = await makeClientWithResidentUser()
            const [organization] = await createTestOrganization(adminClient)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization)
            await createTestOrganizationEmployee(adminClient, organization, employeeClient.user, role, { isAccepted: true })
            const [property] = await createTestProperty(adminClient, organization)
            const unitName = faker.random.alphaNumeric(8)
            await createTestResident(adminClient, residentClient.user, property, {
                unitName,
            })

            const [result] = await getResidentExistenceByPhoneAndAddressByTestClient(employeeClient, {
                phone: residentClient.userAttrs.phone,
                propertyId: property.id,
                unitName,
                unitType: FLAT_UNIT_TYPE,
            })

            expect(result.hasResident).toEqual(true)
            expect(result.hasResidentOnAddress).toEqual(true)
        })

        it('Employee in related from organization for property organization can', async () => {
            const employeeClient = await makeClientWithNewRegisteredAndLoggedInUser()
            const residentClient = await makeClientWithResidentUser()
            const [organization] = await createTestOrganization(adminClient)
            const [fromOrganization] = await createTestOrganization(adminClient, {
                type: HOLDING_TYPE,
            })
            await createTestOrganizationLink(adminClient, fromOrganization, organization)

            const [role] = await createTestOrganizationEmployeeRole(adminClient, fromOrganization)
            await createTestOrganizationEmployee(adminClient, fromOrganization, employeeClient.user, role, { isAccepted: true })

            const [property] = await createTestProperty(adminClient, organization)
            const unitName = faker.random.alphaNumeric(8)
            await createTestResident(adminClient, residentClient.user, property, {
                unitName,
            })

            const [result] = await getResidentExistenceByPhoneAndAddressByTestClient(employeeClient, {
                phone: residentClient.userAttrs.phone,
                propertyId: property.id,
                unitName,
                unitType: FLAT_UNIT_TYPE,
            })

            expect(result.hasResident).toEqual(true)
            expect(result.hasResidentOnAddress).toEqual(true)
        })

        it('Employee from other organization can not', async () => {
            const employeeClient = await makeClientWithNewRegisteredAndLoggedInUser()
            const [organization] = await createTestOrganization(adminClient)
            const [propertyOrganization] = await createTestOrganization(adminClient)
            const [role] = await createTestOrganizationEmployeeRole(adminClient, organization)
            await createTestOrganizationEmployee(adminClient, organization, employeeClient.user, role)
            const [property] = await createTestProperty(adminClient, propertyOrganization)
            const unitName = faker.random.alphaNumeric(8)
            const phone = createTestPhone()

            await expectToThrowAccessDeniedErrorToResult(async () =>
                await getResidentExistenceByPhoneAndAddressByTestClient(employeeClient, {
                    phone,
                    propertyId: property.id,
                    unitName,
                    unitType: FLAT_UNIT_TYPE,
                })
            )
        })
    })

    describe('Logic', () => {
        it('Returns "hasResident: true" and "hasResidentOnAddress: true" if phone and address matched to resident', async () => {
            const residentClient = await makeClientWithResidentUser()
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)
            const unitName = faker.random.alphaNumeric(8)
            await createTestResident(adminClient, residentClient.user, property, {
                unitName,
            })

            const [result] = await getResidentExistenceByPhoneAndAddressByTestClient(adminClient, {
                phone: residentClient.userAttrs.phone,
                propertyId: property.id,
                unitName,
                unitType: FLAT_UNIT_TYPE,
            })

            expect(result.hasResident).toEqual(true)
            expect(result.hasResidentOnAddress).toEqual(true)
        })

        it('Returns "hasResident: true" and "hasResidentOnAddress: false" if found residents by phone but on other address', async () => {
            const residentClient = await makeClientWithResidentUser()
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)
            const [residentProperty] = await createTestProperty(adminClient, organization)
            const unitName = faker.random.alphaNumeric(8)
            await createTestResident(adminClient, residentClient.user, residentProperty, {
                unitName,
            })

            const [result] = await getResidentExistenceByPhoneAndAddressByTestClient(adminClient, {
                phone: residentClient.userAttrs.phone,
                propertyId: property.id,
                unitName,
                unitType: FLAT_UNIT_TYPE,
            })

            expect(result.hasResident).toEqual(true)
            expect(result.hasResidentOnAddress).toEqual(false)
        })

        it('Returns "hasResident: false" and "hasResidentOnAddress: false" if not residents found by phone', async () => {
            const [organization] = await createTestOrganization(adminClient)
            const [property] = await createTestProperty(adminClient, organization)
            const unitName = faker.random.alphaNumeric(8)
            const phone = createTestPhone()

            const [result] = await getResidentExistenceByPhoneAndAddressByTestClient(adminClient, {
                phone,
                propertyId: property.id,
                unitName,
                unitType: FLAT_UNIT_TYPE,
            })

            expect(result.hasResident).toEqual(false)
            expect(result.hasResidentOnAddress).toEqual(false)
        })
    })
})
