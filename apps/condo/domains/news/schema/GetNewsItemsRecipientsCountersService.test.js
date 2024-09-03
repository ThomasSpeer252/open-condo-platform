/**
 * Generated by `createservice news.GetNewsItemsRecipientsCountersService --type mutations`
 */
const { pick } = require('lodash')

const {
    makeLoggedInAdminClient,
    makeClient,
    expectToThrowAuthenticationError, expectToThrowAccessDeniedErrorToResult,
} = require('@open-condo/keystone/test.utils')

const { getNewsItemsRecipientsCountersByTestClient, propertyMap1x9x4 } = require('@condo/domains/news/utils/testSchema')
const {
    createTestOrganization,
    createTestOrganizationEmployeeRole,
} = require('@condo/domains/organization/utils/testSchema')
const { createTestOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema')
const { FLAT_UNIT_TYPE, PARKING_UNIT_TYPE, WAREHOUSE_UNIT_TYPE } = require('@condo/domains/property/constants/common')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const { buildPropertyMap } = require('@condo/domains/property/utils/testSchema/factories')
const { createTestResident } = require('@condo/domains/resident/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, createTestUser } = require('@condo/domains/user/utils/testSchema')


let adminClient, staffClientYes
let dummyO10n

describe('GetNewsItemsRecipientsCountersService', () => {
    beforeEach(async () => {
        adminClient = await makeLoggedInAdminClient()
        const [o10n] = await createTestOrganization(adminClient)
        dummyO10n = o10n

        staffClientYes = await makeClientWithNewRegisteredAndLoggedInUser()
        const [roleYes] = await createTestOrganizationEmployeeRole(adminClient, o10n, { canReadNewsItems: true })
        await createTestOrganizationEmployee(adminClient, o10n, staffClientYes.user, roleYes)
    })

    test('The data for counters is calculated correctly', async () => {
        const [property1] = await createTestProperty(adminClient, dummyO10n, { map: propertyMap1x9x4 })

        const [user11] = await createTestUser(adminClient)
        const [user12] = await createTestUser(adminClient)
        await createTestResident(adminClient, user11, property1, { unitType: FLAT_UNIT_TYPE, unitName: '1' })
        await createTestResident(adminClient, user11, property1, { unitType: WAREHOUSE_UNIT_TYPE, unitName: '1' })
        await createTestResident(adminClient, user11, property1, { unitType: PARKING_UNIT_TYPE, unitName: '1p' })

        await createTestResident(adminClient, user12, property1, { unitType: FLAT_UNIT_TYPE, unitName: '2' })
        await createTestResident(adminClient, user12, property1, { unitType: PARKING_UNIT_TYPE, unitName: '2p' })

        await createTestResident(adminClient, user12, property1, { unitType: FLAT_UNIT_TYPE, unitName: '3' })

        const [user13] = await createTestUser(adminClient)
        await createTestResident(adminClient, user13, property1, { unitType: FLAT_UNIT_TYPE, unitName: '4' })
        await createTestResident(adminClient, user12, property1, { unitType: PARKING_UNIT_TYPE, unitName: '4' })

        const [user14] = await createTestUser(adminClient)
        await createTestResident(adminClient, user14, property1, { unitType: FLAT_UNIT_TYPE, unitName: '4' })

        const [user15] = await createTestUser(adminClient)
        await createTestResident(adminClient, user15, property1, { unitType: FLAT_UNIT_TYPE, unitName: '4' })

        const [user16] = await createTestUser(adminClient)
        await createTestResident(adminClient, user16, property1, { unitType: FLAT_UNIT_TYPE, unitName: '100500' }) // 10050* - unitName not from map


        const [property2] = await createTestProperty(adminClient, dummyO10n, { map: propertyMap1x9x4 })

        const [user21] = await createTestUser(adminClient)
        await createTestResident(adminClient, user21, property2, { unitType: FLAT_UNIT_TYPE, unitName: '1' })


        const [property3] = await createTestProperty(adminClient, dummyO10n, { map: propertyMap1x9x4 })

        await createTestResident(adminClient, user11, property3, { unitType: FLAT_UNIT_TYPE, unitName: '100501' }) // 10050* - unitName not from map


        /**
         * To Organization
         */
        const payload3 = {
            organization: pick(dummyO10n, 'id'),
            newsItemScopes: [
                { property: null, unitType: null, unitName: null },
            ],
        }
        const [data3] = await getNewsItemsRecipientsCountersByTestClient(staffClientYes, payload3)
        expect(data3).toEqual({ propertiesCount: 3, unitsCount: 108, receiversCount: 11 })

        /**
         * To Property
         */
        const payload2 = {
            organization: pick(dummyO10n, 'id'),
            newsItemScopes: [
                { property: { id: property1.id }, unitType: null, unitName: null },
            ],
        }
        const [data2] = await getNewsItemsRecipientsCountersByTestClient(staffClientYes, payload2)
        expect(data2).toEqual({ propertiesCount: 1, unitsCount: 36, receiversCount: 9 })

        const payload5 = {
            organization: pick(dummyO10n, 'id'),
            newsItemScopes: [
                { property: { id: property3.id }, unitType: null, unitName: null },
            ],
        }
        const [data5] = await getNewsItemsRecipientsCountersByTestClient(staffClientYes, payload5)
        expect(data5).toEqual({ propertiesCount: 1, unitsCount: 36, receiversCount: 1 })

        const payload6 = {
            organization: pick(dummyO10n, 'id'),
            newsItemScopes: [
                { property: { id: property2.id }, unitType: null, unitName: null },
                { property: { id: property3.id }, unitType: null, unitName: null },
            ],
        }
        const [data6] = await getNewsItemsRecipientsCountersByTestClient(staffClientYes, payload6)
        expect(data6).toEqual({ propertiesCount: 2, unitsCount: 72, receiversCount: 2 })

        /**
         * To different scopes
         */
        const payload4 = {
            organization: pick(dummyO10n, 'id'),
            newsItemScopes: [
                { property: { id: property1.id }, unitType: FLAT_UNIT_TYPE, unitName: '1' },
                { property: { id: property1.id }, unitType: FLAT_UNIT_TYPE, unitName: '2' },
                { property: { id: property1.id }, unitType: PARKING_UNIT_TYPE, unitName: 'doesnt exist' },
            ],
        }
        const [data4] = await getNewsItemsRecipientsCountersByTestClient(staffClientYes, payload4)
        expect(data4).toEqual({ propertiesCount: 1, unitsCount: 2, receiversCount: 2 })

        const payload1 = {
            organization: pick(dummyO10n, 'id'),
            newsItemScopes: [
                { property: { id: property1.id }, unitType: WAREHOUSE_UNIT_TYPE, unitName: '1' },
                { property: { id: property1.id }, unitType: FLAT_UNIT_TYPE, unitName: '1' },
            ],
        }
        const [data1] = await getNewsItemsRecipientsCountersByTestClient(staffClientYes, payload1)
        expect(data1).toEqual({ propertiesCount: 1, unitsCount: 1, receiversCount: 2 })
    })

    test('The data for counters without propertyMap is calculated correctly', async () => {
        const [property1] = await createTestProperty(adminClient, dummyO10n)

        const [user11] = await createTestUser(adminClient)
        await createTestResident(adminClient, user11, property1, { unitType: FLAT_UNIT_TYPE, unitName: '1' })

        const [user12] = await createTestUser(adminClient)
        await createTestResident(adminClient, user12, property1, { unitType: FLAT_UNIT_TYPE, unitName: '1' })
        await createTestResident(adminClient, user12, property1, { unitType: WAREHOUSE_UNIT_TYPE, unitName: '1' }) // not in map
        await createTestResident(adminClient, user12, property1, { unitType: PARKING_UNIT_TYPE, unitName: '1p' }) // not in map
        await createTestResident(adminClient, user12, property1, { unitType: FLAT_UNIT_TYPE, unitName: '2' })
        await createTestResident(adminClient, user12, property1, { unitType: FLAT_UNIT_TYPE, unitName: '3' })

        const [user13] = await createTestUser(adminClient)
        await createTestResident(adminClient, user13, property1, { unitType: FLAT_UNIT_TYPE, unitName: '4' })

        const [user14] = await createTestUser(adminClient)
        await createTestResident(adminClient, user14, property1, { unitType: FLAT_UNIT_TYPE, unitName: '4' })

        const [property2] = await createTestProperty(adminClient, dummyO10n)
        const [user21] = await createTestUser(adminClient)
        await createTestResident(adminClient, user21, property2, { unitType: FLAT_UNIT_TYPE, unitName: '1' })

        /**
         * To Organization
         */
        const payload1 = {
            organization: pick(dummyO10n, 'id'),
            newsItemScopes: [
                { property: null, unitType: null, unitName: null },
            ],
        }
        const [data1] = await getNewsItemsRecipientsCountersByTestClient(staffClientYes, payload1)
        expect(data1).toEqual({ propertiesCount: 2, unitsCount: 0, receiversCount: 7 })

        /**
         * To Property
         */
        const payload2 = {
            organization: pick(dummyO10n, 'id'),
            newsItemScopes: [
                { property: { id: property1.id }, unitType: null, unitName: null },
            ],
        }
        const [data2] = await getNewsItemsRecipientsCountersByTestClient(staffClientYes, payload2)
        expect(data2).toEqual({ propertiesCount: 1, unitsCount: 0, receiversCount: 6 })

        const payload3 = {
            organization: pick(dummyO10n, 'id'),
            newsItemScopes: [
                { property: { id: property1.id }, unitType: null, unitName: null },
                { property: { id: property2.id }, unitType: null, unitName: null },
            ],
        }
        const [data3] = await getNewsItemsRecipientsCountersByTestClient(staffClientYes, payload3)
        expect(data3).toEqual({ propertiesCount: 2, unitsCount: 0, receiversCount: 7 })

        /**
         * To unitNames / unitTypes
         */
        const payload4 = {
            organization: pick(dummyO10n, 'id'),
            newsItemScopes: [
                { property: { id: property1.id }, unitType: null, unitName: '1' },
                { property: { id: property1.id }, unitType: null, unitName: '4' },
            ],
        }
        const [data4] = await getNewsItemsRecipientsCountersByTestClient(staffClientYes, payload4)
        expect(data4).toEqual({ propertiesCount: 1, unitsCount: 0, receiversCount: 0 })
    })

    test('The data for counters calculated correctly on a large amount of data', async () => {
        const residentsCount = 200
        const floorsCount = 200
        const unitsOnFloorCount = 10
        const unitsCount = floorsCount * unitsOnFloorCount
        const propertyMap = buildPropertyMap({
            floors: floorsCount,
            unitsOnFloor: unitsOnFloorCount,
            parkingFloors: 0,
        })
        const [property1] = await createTestProperty(adminClient, dummyO10n, { map: propertyMap })
        await createTestProperty(adminClient, dummyO10n, { map: propertyMap })
        await createTestProperty(adminClient, dummyO10n, { map: propertyMap })
        const [user] = await createTestUser(adminClient)

        for (let i = 0; i < residentsCount; i++) {
            await createTestResident(adminClient, user, property1, { unitType: 'flat', unitName: `${i + 1}` })
        }

        const payload = {
            organization: pick(dummyO10n, 'id'),
            newsItemScopes: [
                { property: null, unitType: null, unitName: null },
            ],
        }
        const [data] = await getNewsItemsRecipientsCountersByTestClient(staffClientYes, payload)

        expect(data).toEqual({ propertiesCount: 3, unitsCount: unitsCount * 3, receiversCount: residentsCount })
    }, 60000)

    test('anonymous can\'t execute', async () => {
        const anonymousClient = await makeClient()
        await expectToThrowAuthenticationError(async () => {
            await getNewsItemsRecipientsCountersByTestClient(anonymousClient, {
                organization: pick(dummyO10n, 'id'),
                newsItemScopes: [{ property: null, unitType: null, unitName: null }],
            })
        }, 'result')
    })

    test('staff without permission can\'t execute', async () => {
        const staffClientNo = await makeClientWithNewRegisteredAndLoggedInUser()
        const [roleNo] = await createTestOrganizationEmployeeRole(adminClient, dummyO10n, { canReadNewsItems: false })
        await createTestOrganizationEmployee(adminClient, dummyO10n, staffClientNo.user, roleNo)

        await expectToThrowAccessDeniedErrorToResult(async () => {
            await getNewsItemsRecipientsCountersByTestClient(staffClientNo, {
                organization: pick(dummyO10n, 'id'),
                newsItemScopes: [{ property: null, unitType: null, unitName: null }],
            })
        })
    })
})
