/**
 * Generated by `createschema user.OidcClient 'clientId:Text; payload:Json; name?:Text; meta?:Json'`
 */

const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@core/keystone/test.utils')
const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj, expectToThrowAccessDeniedErrorToObjects,
} = require('@condo/domains/common/utils/testSchema')
const {
    makeClientWithNewRegisteredAndLoggedInUser,
    makeClientWithSupportUser,
} = require('@condo/domains/user/utils/testSchema')
const { OidcClient, createTestOidcClient, updateTestOidcClient } = require('@condo/domains/user/utils/testSchema')
const faker = require('faker')
const { expectToThrowValidationFailureError } = require('../../common/utils/testSchema')

describe('OidcClient', () => {
    describe('CRUD tests', () => {
        describe('create', () => {
            test('admin can', async () => {
                // 1) prepare data
                const admin = await makeLoggedInAdminClient()

                // 2) action
                const [obj, attrs] = await createTestOidcClient(admin)

                // 3) check
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
            })

            test('support can', async () => {
                const client = await makeClientWithSupportUser()

                const [obj, attrs] = await createTestOidcClient(client)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
            })

            test('user can\'t', async () => {
                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestOidcClient(client)
                })
            })

            test('anonymous can\'t', async () => {
                const client = await makeClient()

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestOidcClient(client)
                })
            })
        })

        describe('update', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestOidcClient(admin)

                const [obj, attrs] = await updateTestOidcClient(admin, objCreated.id)

                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.v).toEqual(2)
            })

            test('support can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestOidcClient(admin)

                const client = await makeClientWithSupportUser()
                const [obj, attrs] = await updateTestOidcClient(client, objCreated.id)

                expect(obj.id).toMatch(UUID_RE)
                expect(obj.dv).toEqual(1)
                expect(obj.sender).toEqual(attrs.sender)
                expect(obj.updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
            })

            test('user can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestOidcClient(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    const [obj, attrs] = await updateTestOidcClient(client, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestOidcClient(admin)

                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestOidcClient(client, objCreated.id)
                })
            })
        })

        describe('hard delete', () => {
            test('admin can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestOidcClient(admin)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await OidcClient.delete(admin, objCreated.id)
                })
            })

            test('user can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestOidcClient(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await OidcClient.delete(client, objCreated.id)
                })
            })

            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [objCreated] = await createTestOidcClient(admin)

                const client = await makeClient()
                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await OidcClient.delete(client, objCreated.id)
                })
            })
        })

        describe('read', () => {
            test('admin can', async () => {
                const admin = await makeLoggedInAdminClient()
                const [obj, attrs] = await createTestOidcClient(admin)

                const objs = await OidcClient.getAll(admin, {}, { sortBy: ['updatedAt_DESC'] })

                expect(objs.length).toBeGreaterThanOrEqual(1)
                expect(objs).toEqual(expect.arrayContaining([
                    expect.objectContaining({
                        id: obj.id,
                    }),
                ]))
            })

            test('user can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                await createTestOidcClient(admin)

                const client = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObjects(async () => {
                    await OidcClient.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
                })
            })

            test('anonymous can\'t', async () => {
                const admin = await makeLoggedInAdminClient()
                const [obj, attrs] = await createTestOidcClient(admin)

                const client = await makeClient()
                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await OidcClient.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })
                })
            })
        })
    })

    test('Can\'t create without clientSecret', async () => {
        const admin = await makeLoggedInAdminClient()
        const clientId = faker.random.alphaNumeric(12)

        await expectToThrowValidationFailureError(async () => {
            await createTestOidcClient(admin, {
                payload: {
                    client_id: clientId,
                    grant_types: ['implicit', 'authorization_code'],
                    // client_secret: faker.random.alphaNumeric(12), // Trying without this field
                    redirect_uris: ['https://jwt.io/'],
                    response_types: ['code id_token', 'code', 'id_token'],
                    token_endpoint_auth_method: 'client_secret_basic',
                },
            })
        }, 'Invalid json structure of payload field')
    })
})
