/**
 * Generated by `createschema miniapp.B2BAppNewsSharingConfig 'publishUrl:Text; previewUrl:Text; getRecipientsUrl:Text;'`
 */

const { faker } = require('@faker-js/faker')

const { makeLoggedInAdminClient, makeClient, expectValuesOfCommonFields } = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj,
} = require('@open-condo/keystone/test.utils')

const { B2BAppNewsSharingConfig, createTestB2BAppNewsSharingConfig, updateTestB2BAppNewsSharingConfig } = require('@condo/domains/miniapp/utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser } = require('@condo/domains/user/utils/testSchema')


describe('B2BAppNewsSharingConfig', () => {
    describe('CRUD tests', () => {
        let admin
        let support
        let user
        let anonymous
        beforeAll(async () => {
            admin = await makeLoggedInAdminClient()
            support = await makeClientWithSupportUser()
            user = await makeClientWithNewRegisteredAndLoggedInUser()
            anonymous = await makeClient()
        })
        describe('create', () => {
            const createPayload = {
                name: 'telegram',
                publishUrl: faker.internet.url(),
                previewUrl: faker.internet.url(),
                getRecipientsUrl: faker.internet.url(),
                getRecipientsCountersUrl: faker.internet.url(),
                customFormUrl: faker.internet.url(),
            }
            test('admin can', async () => {
                const [obj, attrs] = await createTestB2BAppNewsSharingConfig(admin, createPayload)

                expectValuesOfCommonFields(obj, attrs, admin)
                expect(obj).toEqual(expect.objectContaining(createPayload))
            })

            test('support can', async () => {
                const [obj, attrs] = await createTestB2BAppNewsSharingConfig(support, createPayload)

                expectValuesOfCommonFields(obj, attrs, support)
                expect(obj).toEqual(expect.objectContaining(createPayload))
            })

            test('user can\'t', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestB2BAppNewsSharingConfig(user, createPayload)
                })
            })

            test('anonymous can\'t', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestB2BAppNewsSharingConfig(anonymous, createPayload)
                })
            })
        })

        describe('update', () => {
            let createdB2BAppNewsSharingConfig
            const updatePayload = {
                publishUrl: faker.internet.url(),
            }
            beforeEach(async () => {
                [createdB2BAppNewsSharingConfig] = await createTestB2BAppNewsSharingConfig(admin)
            })
            test('admin can', async () => {
                const [obj] = await updateTestB2BAppNewsSharingConfig(admin, createdB2BAppNewsSharingConfig.id, updatePayload)

                expect(obj.v).toEqual(2)
                expect(obj).toEqual(expect.objectContaining(updatePayload))
            })

            test('support can', async () => {
                const [obj] = await updateTestB2BAppNewsSharingConfig(support, createdB2BAppNewsSharingConfig.id, updatePayload)

                expect(obj.v).toEqual(2)
                expect(obj).toEqual(expect.objectContaining(updatePayload))
            })

            test('user can\'t', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestB2BAppNewsSharingConfig(user, createdB2BAppNewsSharingConfig.id, updatePayload)
                })
            })

            test('anonymous can\'t', async () => {
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestB2BAppNewsSharingConfig(anonymous, createdB2BAppNewsSharingConfig.id, updatePayload)
                })
            })
        })

        describe('hard delete', () => {
            let createdB2BAppNewsSharingConfig
            beforeAll(async () => {
                [createdB2BAppNewsSharingConfig] = await createTestB2BAppNewsSharingConfig(admin)
            })
            test('nobody can', async () => {
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await B2BAppNewsSharingConfig.delete(admin, createdB2BAppNewsSharingConfig.id)
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await B2BAppNewsSharingConfig.delete(support, createdB2BAppNewsSharingConfig.id)
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await B2BAppNewsSharingConfig.delete(user, createdB2BAppNewsSharingConfig.id)
                })
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await B2BAppNewsSharingConfig.delete(anonymous, createdB2BAppNewsSharingConfig.id)
                })
            })
        })

        describe('read', () => {
            let createdB2BAppNewsSharingConfig
            beforeAll(async () => {
                [createdB2BAppNewsSharingConfig] = await createTestB2BAppNewsSharingConfig(admin)
            })
            test('admin can', async () => {
                const apps = await B2BAppNewsSharingConfig.getAll(admin, {
                    id: createdB2BAppNewsSharingConfig.id,
                })
                expect(apps).toBeDefined()
                expect(apps).toHaveLength(1)
                expect(apps[0]).toHaveProperty('id', createdB2BAppNewsSharingConfig.id)
                expect(apps[0]).toHaveProperty('publishUrl', createdB2BAppNewsSharingConfig.publishUrl)
            })
            test('support can', async () => {
                const apps = await B2BAppNewsSharingConfig.getAll(support, {
                    id: createdB2BAppNewsSharingConfig.id,
                })
                expect(apps).toBeDefined()
                expect(apps).toHaveLength(1)
                expect(apps[0]).toHaveProperty('id', createdB2BAppNewsSharingConfig.id)
                expect(apps[0]).toHaveProperty('publishUrl', createdB2BAppNewsSharingConfig.publishUrl)
            })
            test('user can', async () => {
                const apps = await B2BAppNewsSharingConfig.getAll(user, {
                    id: createdB2BAppNewsSharingConfig.id,
                })
                expect(apps).toBeDefined()
                expect(apps).toHaveLength(1)
                expect(apps[0]).toHaveProperty('id', createdB2BAppNewsSharingConfig.id)
                expect(apps[0]).toHaveProperty('publishUrl', createdB2BAppNewsSharingConfig.publishUrl)
            })
            test('anonymous can\'t', async () => {
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await B2BAppNewsSharingConfig.getAll(anonymous, {
                        id: createdB2BAppNewsSharingConfig.id,
                    })
                })
            })
        })
    })
})
