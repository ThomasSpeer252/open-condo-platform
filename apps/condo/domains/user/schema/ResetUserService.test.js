/**
 * Generated by `createservice user.ResetUserService --type mutations`
 */

const faker = require('faker')
const { makeLoggedInAdminClient } = require('@core/keystone/test.utils')
const { makeClient } = require('@core/keystone/test.utils')
const { catchErrorFrom } = require('@condo/domains/common/utils/testSchema')
const { DELETED_USER_NAME } = require('@condo/domains/user/constants')
const {
    makeClientWithNewRegisteredAndLoggedInUser,
    registerNewUser,
    resetUserByTestClient,
    makeClientWithSupportUser,
    UserAdmin,
} = require('@condo/domains/user/utils/testSchema')

 
describe('ResetUserService', () => {
    test('support can reset user', async () => {
        const support = await makeClientWithSupportUser()
        const [user] = await registerNewUser(await makeClient())

        const payload = {
            user: { id: user.id },
        }

        await resetUserByTestClient(support, payload)

        // We use admin context here, since support does not have access to email and phone fields
        const adminClient = await makeLoggedInAdminClient()
        const [resetUser] = await UserAdmin.getAll(adminClient, { id: user.id })
        expect(resetUser.id).toEqual(user.id)
        expect(resetUser.name).toEqual(DELETED_USER_NAME)
        expect(resetUser.phone).toBeNull()
        expect(resetUser.email).toBeNull()
        expect(resetUser.isAdmin).toBeFalsy()
        expect(resetUser.isSupport).toBeFalsy()
        expect(resetUser.importId).toBeNull()
        expect(resetUser.importRemoteSystem).toBeNull()
        expect(resetUser.isPhoneVerified).toEqual(false)
        expect(resetUser.isEmailVerified).toEqual(false)
    })

    test('two reset users do not violate constrains', async () => {
        const support = await makeClientWithSupportUser()
        const [user] = await registerNewUser(await makeClient())
        const [user2] = await registerNewUser(await makeClient())

        const payload = {
            user: { id: user.id },
        }
        await resetUserByTestClient(support, payload)

        const payload2 = {
            user: { id: user2.id },
        }
        await resetUserByTestClient(support, payload2)

        // We use admin context here, since support does not have access to email and phone fields
        const adminClient = await makeLoggedInAdminClient()

        const [resetUser] = await UserAdmin.getAll(adminClient, { id: user.id })
        expect(resetUser.id).toEqual(user.id)
        expect(resetUser.name).toEqual(DELETED_USER_NAME)
        expect(resetUser.phone).toBeNull()
        expect(resetUser.email).toBeNull()

        const [resetUser2] = await UserAdmin.getAll(adminClient, { id: user.id })
        expect(resetUser2.id).toEqual(user.id)
        expect(resetUser2.name).toEqual(DELETED_USER_NAME)
        expect(resetUser2.phone).toBeNull()
        expect(resetUser2.email).toBeNull()
    })
 
    test('support cant reset non existing user', async () => {
        const supportClient = await makeClientWithSupportUser()
        const userId = faker.random.uuid()
        const payload = {
            user: { id: userId },
        }

        await catchErrorFrom(async () => {
            await resetUserByTestClient(supportClient, payload)
        }, ({ errors }) => {
            expect(errors).toMatchObject([{
                message: 'Could not find User by provided id',
                name: 'GraphQLError',
                path: ['result'],
                extensions: {
                    mutation: 'resetUser',
                    variable: ['data', 'user', 'id'],
                    code: 'BAD_USER_INPUT',
                    type: 'USER_NOT_FOUND',
                },
            }])
        })
    })

    test('support cant reset admin user', async () => {
        const supportClient = await makeClientWithSupportUser()
        const adminClient = await makeLoggedInAdminClient()
        const userId = adminClient.user.id
        const payload = {
            user: { id: userId },
        }

        await catchErrorFrom(async () => {
            await resetUserByTestClient(supportClient, payload)
        }, ({ errors }) => {
            expect(errors).toMatchObject([{
                message: 'You cannot reset admin user',
                name: 'GraphQLError',
                path: ['result'],
                extensions: {
                    mutation: 'resetUser',
                    variable: ['data', 'user', 'id'],
                    code: 'FORBIDDEN',
                    type: 'CANNOT_RESET_ADMIN_USER',
                },
            }])
        })
    })

    test('user cant reset user', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const payload = {
            user: { id: client.user.id },
        }

        await catchErrorFrom(async () => {
            await resetUserByTestClient(client, payload)
        }, (e) => {
            expect(e.errors[0].name).toContain('AccessDeniedError')
        })
    })

    test('anonymous cant reset user', async () => {
        const client = await makeClient()
        const userToResetId = faker.random.uuid()
        await catchErrorFrom(async () => {
            await resetUserByTestClient(client, { user: { id: userToResetId } })
        }, (e) => {
            expect(e.errors[0].name).toContain('AuthenticationError')
        })
    })
})