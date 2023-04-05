/**
 * Generated by `createschema news.NewsItem 'organization:Relationship:Organization:CASCADE; title:Text; body:Text; type:Select:common,emergency'`
 */

const faker = require('faker')

const {
    makeLoggedInAdminClient,
    makeClient,
    UUID_RE,
    DATETIME_RE,
    expectToThrowGQLError,
} = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
} = require('@open-condo/keystone/test.utils')

const { NEWS_TYPE_EMERGENCY, NEWS_TYPE_COMMON } = require('@condo/domains/news/constants/newsTypes')
const {
    NewsItem,
    createTestNewsItem,
    updateTestNewsItem,
    createTestNewsItemScope,
} = require('@condo/domains/news/utils/testSchema')
const {
    createTestOrganizationEmployeeRole,
    createTestOrganizationEmployee,
    createTestOrganization,
} = require('@condo/domains/organization/utils/testSchema')
const { FLAT_UNIT_TYPE } = require('@condo/domains/property/constants/common')
const {
    makeClientWithResidentAccessAndProperty,
    createTestProperty,
} = require('@condo/domains/property/utils/testSchema')
const { createTestResident } = require('@condo/domains/resident/utils/testSchema')
const {
    makeClientWithNewRegisteredAndLoggedInUser,
    makeClientWithSupportUser,
    makeClientWithResidentUser,
} = require('@condo/domains/user/utils/testSchema')

let adminClient, supportClient, anonymousClient, dummyO10n

describe('NewsItems', () => {
    beforeAll(async () => {
        adminClient = await makeLoggedInAdminClient()
        supportClient = await makeClientWithSupportUser()
        anonymousClient = await makeClient()
        const [o10n] = await createTestOrganization(adminClient)
        dummyO10n = o10n
    })

    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                const [obj, attrs] = await createTestNewsItem(adminClient, dummyO10n)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(1)
                expect(obj.newId).toEqual(null)
                expect(obj.deletedAt).toEqual(null)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
                expect(obj.createdAt).toMatch(DATETIME_RE)
                expect(obj.updatedAt).toMatch(DATETIME_RE)
                expect(obj.organization.id).toMatch(dummyO10n.id)
                expect(obj.title).toEqual(attrs.title)
                expect(obj.body).toEqual(attrs.body)
                expect(obj.type).toEqual(attrs.type)
            })

            test('support can', async () => {
                const [obj, attrs] = await createTestNewsItem(supportClient, dummyO10n)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: supportClient.user.id }))
            })

            test('stuff with permission can', async () => {
                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                const [o10n] = await createTestOrganization(adminClient)
                const [role] = await createTestOrganizationEmployeeRole(adminClient, o10n, { canManageNewsItems: true })
                await createTestOrganizationEmployee(adminClient, o10n, client.user, role)

                const [obj, attrs] = await createTestNewsItem(client, o10n)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
            })

            test('staff without permission can\'t', async () => {
                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                const [o10n] = await createTestOrganization(adminClient)
                const [role] = await createTestOrganizationEmployeeRole(adminClient, o10n, { canManageNewsItems: false })
                await createTestOrganizationEmployee(adminClient, o10n, client.user, role)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestNewsItem(client, o10n)
                })
            })

            test('resident can\'t', async () => {
                const client = await makeClientWithResidentAccessAndProperty()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestNewsItem(client, client.organization)
                })
            })

            test('anonymous can\'t', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestNewsItem(anonymousClient, dummyO10n)
                })
            })
        })

        describe('update', () => {
            test('admin can', async () => {
                const [objCreated] = await createTestNewsItem(adminClient, dummyO10n)

                const body = faker.lorem.words(10)

                const [obj, attrs] = await updateTestNewsItem(adminClient, objCreated.id, { body })

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
            })

            test('support can', async () => {
                const [objCreated] = await createTestNewsItem(adminClient, dummyO10n)

                const body = faker.lorem.words(10)
                const [obj, attrs] = await updateTestNewsItem(supportClient, objCreated.id, { body })

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: supportClient.user.id }))
            })

            test('stuff with permission can', async () => {
                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                const [o10n] = await createTestOrganization(adminClient)
                const [objCreated] = await createTestNewsItem(adminClient, o10n)
                const [role] = await createTestOrganizationEmployeeRole(adminClient, o10n, { canManageNewsItems: true })
                await createTestOrganizationEmployee(adminClient, o10n, client.user, role)

                const body = faker.lorem.words(10)
                const [obj, attrs] = await updateTestNewsItem(client, objCreated.id, { body })

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.v).toEqual(2)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: adminClient.user.id }))
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
            })

            test('staff without permission can\'t', async () => {
                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                const [o10n] = await createTestOrganization(adminClient)
                const [objCreated] = await createTestNewsItem(adminClient, o10n)
                const [role] = await createTestOrganizationEmployeeRole(adminClient, o10n, { canManageNewsItems: false })
                await createTestOrganizationEmployee(adminClient, o10n, client.user, role)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    const body = faker.lorem.words(10)
                    await updateTestNewsItem(client, objCreated.id, { body })
                })
            })

            test('resident can\'t', async () => {
                const [o10n, o10nAttrs] = await createTestOrganization(adminClient)
                const [objCreated] = await createTestNewsItem(adminClient, o10n)

                const client = await makeClientWithResidentAccessAndProperty()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    const body = faker.lorem.words(10)
                    const [obj, attrs] = await updateTestNewsItem(client, objCreated.id, { body })
                })
            })

            test('anonymous can\'t', async () => {
                const [objCreated] = await createTestNewsItem(adminClient, dummyO10n)

                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestNewsItem(client, objCreated.id)
                })
            })
        })

        describe('hard delete', () => {
            test('admin can\'t', async () => {
                const [objCreated] = await createTestNewsItem(adminClient, dummyO10n)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await NewsItem.delete(adminClient, objCreated.id)
                })
            })

            test('user can\'t', async () => {
                const [objCreated] = await createTestNewsItem(adminClient, dummyO10n)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await NewsItem.delete(client, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const [objCreated] = await createTestNewsItem(adminClient, dummyO10n)

                const client = await makeClient()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await NewsItem.delete(client, objCreated.id)
                })
            })
        })

        describe('read', () => {
            test('admin can', async () => {
                const [obj, attrs] = await createTestNewsItem(adminClient, dummyO10n)

                const objs = await NewsItem.getAll(adminClient, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                    }),
                ]))
            })

            test('stuff can', async () => {
                const [o10n] = await createTestOrganization(adminClient)
                const [objCreated] = await createTestNewsItem(adminClient, o10n)
                const [roleWithAccess] = await createTestOrganizationEmployeeRole(adminClient, o10n, { canManageNewsItems: true })
                const [roleWithoutAccess] = await createTestOrganizationEmployeeRole(adminClient, o10n, { canManageNewsItems: false })

                const clientWithAccess = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationEmployee(adminClient, o10n, clientWithAccess.user, roleWithAccess)

                const clientWithoutAccess = await makeClientWithNewRegisteredAndLoggedInUser()
                await createTestOrganizationEmployee(adminClient, o10n, clientWithoutAccess.user, roleWithoutAccess)

                const objs = await NewsItem.getAll(clientWithAccess, {}, { sortBy: ['updatedAt_DESC'] })
                const objs2 = await NewsItem.getAll(clientWithoutAccess, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs).toHaveLength(1)
                expect(objs[0]).toMatchObject({
                    id: objCreated.id,
                })

                expect(objs2).toHaveLength(1)
                expect(objs2[0]).toMatchObject({
                    id: objCreated.id,
                })
            })

            test('anonymous can\'t', async () => {
                const [obj, attrs] = await createTestNewsItem(adminClient, dummyO10n)

                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await NewsItem.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
                })
            })

            test('eligible resident can, not eligible can\'t', async () => {
                const residentClient1 = await makeClientWithResidentUser()
                const residentClient2 = await makeClientWithResidentUser()
                const residentClient3 = await makeClientWithResidentAccessAndProperty()
                const [o10n] = await createTestOrganization(adminClient)
                const [property] = await createTestProperty(adminClient, o10n)

                const unitType1 = FLAT_UNIT_TYPE
                const unitName1 = faker.lorem.word()
                const unitType2 = FLAT_UNIT_TYPE
                const unitName2 = faker.lorem.word()
                const unitType3 = FLAT_UNIT_TYPE
                const unitName3 = faker.lorem.word()

                await createTestResident(adminClient, residentClient1.user, property, {
                    unitType: unitType1,
                    unitName: unitName1,
                })

                await createTestResident(adminClient, residentClient2.user, property, {
                    unitType: unitType2,
                    unitName: unitName2,
                })

                await createTestResident(adminClient, residentClient3.user, residentClient3.property, {
                    unitType: unitType3,
                    unitName: unitName3,
                })

                // News item for particular unit
                const [newsItem1, newsItem1Attrs] = await createTestNewsItem(adminClient, o10n)
                const [newsItemScope1] = await createTestNewsItemScope(adminClient, newsItem1, {
                    property: { connect: { id: property.id } },
                    unitType: unitType1,
                    unitName: unitName1,
                })

                // News item for property
                const [newsItem2, newsItem2Attrs] = await createTestNewsItem(adminClient, o10n)
                const [newsItemScope2] = await createTestNewsItemScope(adminClient, newsItem2, {
                    property: { connect: { id: property.id } },
                })

                // News item for all organization
                const [newsItem3, newsItem3Attrs] = await createTestNewsItem(adminClient, o10n)
                const [newsItemScope3] = await createTestNewsItemScope(adminClient, newsItem3)

                const newsItems1 = await NewsItem.getAll(residentClient1, {})
                const newsItems2 = await NewsItem.getAll(residentClient2, {})
                const newsItems3 = await NewsItem.getAll(residentClient3, {})

                expect(newsItems1).toHaveLength(3)
                expect(newsItems1).toEqual(expect.arrayContaining([
                    expect.objectContaining({ id: newsItem1.id, title: newsItem1Attrs.title }),
                    expect.objectContaining({ id: newsItem2.id, title: newsItem2Attrs.title }),
                    expect.objectContaining({ id: newsItem3.id, title: newsItem3Attrs.title }),
                ]))

                expect(newsItems2).toHaveLength(2)
                expect(newsItems2).toEqual(expect.arrayContaining([
                    expect.objectContaining({ id: newsItem2.id, title: newsItem2Attrs.title }),
                    expect.objectContaining({ id: newsItem3.id, title: newsItem3Attrs.title }),
                ]))

                expect(newsItems3).toHaveLength(0)
            })

            test('user with two residents within organization must see all eligible news items', async () => {
                const residentClient1 = await makeClientWithResidentUser()
                const [o10n] = await createTestOrganization(adminClient)
                const [property] = await createTestProperty(adminClient, o10n)
                const [otherProperty] = await createTestProperty(adminClient, o10n)

                const unitType1 = FLAT_UNIT_TYPE
                const unitName1 = faker.lorem.word()
                const unitType2 = FLAT_UNIT_TYPE
                const unitName2 = faker.lorem.word()

                await createTestResident(adminClient, residentClient1.user, property, {
                    unitType: unitType1,
                    unitName: unitName1,
                })

                await createTestResident(adminClient, residentClient1.user, property, {
                    unitType: unitType2,
                    unitName: unitName2,
                })

                const [newsItem1, newsItem1Attrs] = await createTestNewsItem(adminClient, o10n)
                const [newsItemScope1] = await createTestNewsItemScope(adminClient, newsItem1, {
                    property: { connect: { id: property.id } },
                    unitType: unitType1,
                    unitName: unitName1,
                })

                const [newsItem2, newsItem2Attrs] = await createTestNewsItem(adminClient, o10n)
                const [newsItemScope2] = await createTestNewsItemScope(adminClient, newsItem2, {
                    property: { connect: { id: property.id } },
                    unitType: unitType2,
                    unitName: unitName2,
                })

                const [newsItem3, newsItem3Attrs] = await createTestNewsItem(adminClient, o10n)
                const [newsItemScope3] = await createTestNewsItemScope(adminClient, newsItem3)

                const [newsItem4, newsItem4Attrs] = await createTestNewsItem(adminClient, o10n)
                const [newsItemScope4] = await createTestNewsItemScope(adminClient, newsItem4, {
                    property: { connect: { id: otherProperty.id } },
                })

                const newsItems = await NewsItem.getAll(residentClient1, {})

                expect(newsItems).toHaveLength(3)
                expect(newsItems).toEqual(expect.arrayContaining([
                    expect.objectContaining({ id: newsItem1.id, title: newsItem1Attrs.title }),
                    expect.objectContaining({ id: newsItem2.id, title: newsItem2Attrs.title }),
                    expect.objectContaining({ id: newsItem3.id, title: newsItem3Attrs.title }),
                ]))
            })

            test('two residents, two organizations: each must see eligible news items', async () => {
                const residentClient1 = await makeClientWithResidentUser()
                const residentClient2 = await makeClientWithResidentUser()
                const [o10n1] = await createTestOrganization(adminClient)
                const [o10n2] = await createTestOrganization(adminClient)
                const [property1] = await createTestProperty(adminClient, o10n1)
                const [property2] = await createTestProperty(adminClient, o10n2)

                const unitType1 = FLAT_UNIT_TYPE
                const unitName1 = faker.lorem.word()
                const unitType2 = FLAT_UNIT_TYPE
                const unitName2 = faker.lorem.word()

                await createTestResident(adminClient, residentClient1.user, property1, {
                    unitType: unitType1,
                    unitName: unitName1,
                })

                await createTestResident(adminClient, residentClient2.user, property2, {
                    unitType: unitType2,
                    unitName: unitName2,
                })

                // News item for one organization
                const [newsItem1, newsItem1Attrs] = await createTestNewsItem(adminClient, o10n1)
                const [newsItemScope1] = await createTestNewsItemScope(adminClient, newsItem1, {
                    property: { connect: { id: property1.id } },
                })

                // Two news items for another organization
                const [newsItem2, newsItem2Attrs] = await createTestNewsItem(adminClient, o10n2)
                const [newsItemScope2] = await createTestNewsItemScope(adminClient, newsItem2, {
                    property: { connect: { id: property2.id } },
                })
                const [newsItem3, newsItem3Attrs] = await createTestNewsItem(adminClient, o10n2)
                const [newsItemScope3] = await createTestNewsItemScope(adminClient, newsItem3, {
                    property: { connect: { id: property2.id } },
                })

                const newsItems1 = await NewsItem.getAll(residentClient1, {})
                const newsItems2 = await NewsItem.getAll(residentClient2, {})

                expect(newsItems1).toHaveLength(1)
                expect(newsItems1).toEqual(expect.arrayContaining([
                    expect.objectContaining({ id: newsItem1.id, title: newsItem1Attrs.title }),
                ]))

                expect(newsItems2).toHaveLength(2)
                expect(newsItems2).toEqual(expect.arrayContaining([
                    expect.objectContaining({ id: newsItem2.id, title: newsItem2Attrs.title }),
                    expect.objectContaining({ id: newsItem3.id, title: newsItem3Attrs.title }),
                ]))
            })
        })
    })

    describe('Validation tests', () => {
        test('Should have correct dv field (=== 1)', async () => {
            await expectToThrowGQLError(
                async () => await createTestNewsItem(adminClient, dummyO10n, { dv: 42 }),
                {
                    code: 'BAD_USER_INPUT',
                    type: 'DV_VERSION_MISMATCH',
                    message: 'Wrong value for data version number',
                    mutation: 'createNewsItem',
                    variable: ['data', 'dv'],
                },
            )
        })

        test('The \'common\' news type the default one', async () => {
            const [obj, attrs] = await createTestNewsItem(adminClient, dummyO10n, { type: undefined })

            //after creation
            expect(obj.type).toMatch(NEWS_TYPE_COMMON)

            // and after updating
            const [updatedObj] = await updateTestNewsItem(adminClient, obj.id, { type: undefined })
            expect(updatedObj.type).toMatch(NEWS_TYPE_COMMON)
        })

        test('must throw an error if there is no validity date for emergency news item', async () => {
            await expectToThrowGQLError(
                async () => await createTestNewsItem(adminClient, dummyO10n, { type: NEWS_TYPE_EMERGENCY }),
                {
                    code: 'BAD_USER_INPUT',
                    type: 'EMPTY_VALID_BEFORE_DATE',
                    message: 'The date the news item valid before is empty',
                    mutation: 'createNewsItem',
                    variable: ['data', 'validBefore'],
                    messageForUser: 'api.newsItem.EMPTY_VALID_BEFORE_DATE',
                },
            )
        })
    })
})

