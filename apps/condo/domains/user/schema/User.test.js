/**
 * Generated by `createschema user.User name:Text; password?:Password; isAdmin?:Checkbox; email?:Text; isEmailVerified?:Checkbox; phone?:Text; isPhoneVerified?:Checkbox; avatar?:File; meta:Json; importId:Text;`
 */

const { faker } = require('@faker-js/faker')

const { generateGqlQueries } = require('@open-condo/codegen/generate.gql')
const { generateGQLTestUtils } = require('@open-condo/codegen/generate.test.utils')
const {
    getRandomString,
    makeLoggedInAdminClient,
    makeClient,
    DEFAULT_TEST_ADMIN_IDENTITY,
    DEFAULT_TEST_USER_IDENTITY,
    DEFAULT_TEST_USER_SECRET,
    UUID_RE,
    expectToThrowGraphQLRequestError,
    expectToThrowAccessDeniedErrorToObj,
    expectToThrowAccessDeniedErrorToObjects,
    expectToThrowAccessDeniedErrorToCount,
    expectToThrowAuthenticationErrorToObj,
    expectToThrowAuthenticationErrorToObjects,
    expectToThrowGQLError,
    catchErrorFrom,
} = require('@open-condo/keystone/test.utils')

const { normalizeEmail } = require('@condo/domains/common/utils/mail')
const {
    MIN_PASSWORD_LENGTH,
    MAX_PASSWORD_LENGTH,
    STAFF,
    RESIDENT,
    SERVICE,
} = require('@condo/domains/user/constants/common')
const {
    WRONG_EMAIL_ERROR, WRONG_PASSWORD_ERROR, EMPTY_PASSWORD_ERROR, GQL_ERRORS: ERRORS,
} = require('@condo/domains/user/constants/errors')
const { GET_MY_USERINFO, SIGNIN_MUTATION } = require('@condo/domains/user/gql')
const {
    User,
    UserAdmin,
    createTestUser,
    updateTestUser,
    createTestUserRightsSet,
    makeClientWithNewRegisteredAndLoggedInUser,
    makeClientWithServiceUser,
    makeLoggedInClient,
    createTestLandlineNumber,
    createTestPhone,
    createTestEmail,
    makeClientWithResidentUser,
} = require('@condo/domains/user/utils/testSchema')


describe('SIGNIN', () => {
    test('anonymous: SIGNIN_MUTATION', async () => {
        const client = await makeClient()
        const { data, errors } = await client.mutate(SIGNIN_MUTATION, {
            'identity': DEFAULT_TEST_USER_IDENTITY,
            'secret': DEFAULT_TEST_USER_SECRET,
        })
        expect(errors).toEqual(undefined)
        expect(data.obj.item.id).toMatch(/[a-zA-Z0-9-_]+/)
    })

    test('anonymous: GET_MY_USERINFO', async () => {
        const client = await makeClient()
        const { data, errors } = await client.query(GET_MY_USERINFO)
        expect(errors).toEqual(undefined)
        expect(data).toEqual({ 'user': null })
    })

    test('user: GET_MY_USERINFO', async () => {
        const client = await makeLoggedInClient()
        const { data, errors } = await client.query(GET_MY_USERINFO)
        expect(errors).toEqual(undefined)
        expect(data.user).toEqual(expect.objectContaining({ id: client.user.id }))
    })

    test('anonymous: SIGNIN_MUTATION by wrong password', async () => {
        const client = await makeClient()
        const { data, errors } = await client.mutate(SIGNIN_MUTATION, {
            'identity': DEFAULT_TEST_USER_IDENTITY,
            'secret': 'wrong password',
        })
        expect(data).toEqual({ 'obj': null })
        expect(JSON.stringify(errors)).toMatch((WRONG_PASSWORD_ERROR))
    })

    test('anonymous: SIGNIN_MUTATION by wrong email', async () => {
        const client = await makeClient()
        const { data, errors } = await client.mutate(SIGNIN_MUTATION, {
            'identity': 'some3571592131usermail@example.com',
            'secret': 'wrong password',
        })
        expect(data).toEqual({ 'obj': null })
        expect(JSON.stringify(errors)).toMatch(WRONG_EMAIL_ERROR)
    })

    test('check auth by empty password', async () => {
        const admin = await makeLoggedInAdminClient()
        const [, userAttrs] = await createTestUser(admin, { password: '' })
        const checkAuthByEmptyPassword = async () => {
            await makeLoggedInClient({ email: userAttrs.email, password: '' })
        }
        await expect(checkAuthByEmptyPassword).rejects.toThrow(EMPTY_PASSWORD_ERROR)
    })

    test('soft deleted user cannot be authorized', async () => {
        const admin = await makeLoggedInAdminClient()
        const [user, userAttrs] = await createTestUser(admin)
        const { email, password } = userAttrs
        const [deletedUser] = await User.softDelete(admin, user.id)
        expect(deletedUser.deletedAt).not.toBeNull()
        const client = await makeClient()
        const res = await client.mutate(SIGNIN_MUTATION, { identity: email, secret: password })
        expect(res.data.obj).toBeNull()
        expect(res.errors[0].message).toEqual(expect.stringContaining('[passwordAuth:identity:notFound]'))
    })

    test('should authorize resident user', async () => {
        const admin = await makeLoggedInAdminClient()
        const [user, userAttrs] = await createTestUser(admin, { type: RESIDENT })
        const client = await makeClient()
        const res = await client.mutate(SIGNIN_MUTATION, { identity: userAttrs.email, secret: userAttrs.password })
        expect(res.errors).toEqual(undefined)
        expect(res.data.obj.item.id).toBe(user.id)
    })

    test('should authorize staff user', async () => {
        const admin = await makeLoggedInAdminClient()
        const [user, userAttrs] = await createTestUser(admin, { type: STAFF })
        const client = await makeClient()
        const res = await client.mutate(SIGNIN_MUTATION, { identity: userAttrs.email, secret: userAttrs.password })
        expect(res.errors).toEqual(undefined)
        expect(res.data.obj.item.id).toBe(user.id)
    })

    test('should authorize service user', async () => {
        const admin = await makeLoggedInAdminClient()
        const [user, userAttrs] = await createTestUser(admin, { type: SERVICE })
        const client = await makeClient()
        const res = await client.mutate(SIGNIN_MUTATION, { identity: userAttrs.email, secret: userAttrs.password })
        expect(res.errors).toEqual(undefined)
        expect(res.data.obj.item.id).toBe(user.id)
    })

    test('should throw error if service and staff users have one email', async () => {
        const admin = await makeLoggedInAdminClient()
        const email = createTestEmail()
        const [, staffUserAttrs] = await createTestUser(admin, { type: STAFF, email })
        const [, serviceUserAttrs] = await createTestUser(admin, { type: SERVICE, email })
        const client = await makeClient()

        const staffRes = await client.mutate(SIGNIN_MUTATION, { identity: staffUserAttrs.email, secret: staffUserAttrs.password })
        expect(staffRes.data.obj).toBeNull()
        expect(staffRes.errors[0].message).toEqual(expect.stringContaining('[passwordAuth:identity:multipleFound]'))

        const serviceRes = await client.mutate(SIGNIN_MUTATION, { identity: serviceUserAttrs.email, secret: serviceUserAttrs.password })
        expect(serviceRes.data.obj).toBeNull()
        expect(serviceRes.errors[0].message).toEqual(expect.stringContaining('[passwordAuth:identity:multipleFound]'))
    })
})

describe('User', () => {
    test('user: create User', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestUser(client)
        })
    })

    test('anonymous: create User', async () => {
        const client = await makeClient()
        await expectToThrowAuthenticationErrorToObj(async () => {
            await createTestUser(client)
        })
    })

    test('user: read User', async () => {
        const admin = await makeLoggedInAdminClient()
        const [anotherUser] = await createTestUser(admin)

        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const { data } = await UserAdmin.getAll(client, {}, { raw: true, sortBy: ['updatedAt_DESC'] })
        expect(data.objs).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: client.user.id,
                    email: client.userAttrs.email,
                    phone: client.userAttrs.phone,
                }),
                expect.objectContaining({ id: anotherUser.id, email: null, phone: null }),
            ]),
        )
        expect(data.objs.length >= 1).toBeTruthy()
    })

    test('anonymous: read User', async () => {
        const client = await makeClient()
        await expectToThrowAuthenticationErrorToObjects(async () => {
            await User.getAll(client)
        })
    })

    test('user: update self User', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const payload = {}
        const [obj, attrs] = await updateTestUser(client, client.user.id, payload)
        expect(obj.updatedBy).toMatchObject({ id: client.user.id })
        expect(obj.sender).toMatchObject(attrs.sender)
        expect(obj.v).toBeGreaterThan(client.user.v)
    })

    test('user: update self User phone should fail', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const payload = { phone: createTestPhone() }
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestUser(client, client.user.id, payload)
        })
    })

    // TODO(pahaz): !!! remove this test in the FUTURE
    test('user: update self resident phone should ok', async () => {
        const client = await makeClientWithResidentUser()
        const payload = { phone: client.userAttrs.phone }
        await updateTestUser(client, client.user.id, payload)

        const objs = await UserAdmin.getAll(client, { id: client.user.id })
        expect(objs[0]).toEqual(expect.objectContaining({ phone: client.userAttrs.phone }))
    })

    // TODO(pahaz): !!! unskip!
    test.skip('user: update self User email should fail', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const payload = { email: createTestEmail() }
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestUser(client, client.user.id, payload)
        })
    })

    test('user: update self User name', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const payload = { name: createTestEmail() }
        const [obj] = await updateTestUser(client, client.user.id, payload)
        expect(obj.name).toEqual(payload.name)
    })

    test('user: update self User isAdmin should fail', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const payload = { isAdmin: true }
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestUser(client, client.user.id, payload)
        })
    })

    test('user: update self User password should fail', async () => {
        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const password = getRandomString()
        const payload = { password }
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestUser(client, client.user.id, payload)
        })
    })

    test('user: update another User should fail', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestUser(admin)

        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        const payload = {}
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestUser(client, objCreated.id, payload)
        })
    })

    test('anonymous: update User', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestUser(admin)

        const client = await makeClient()
        const payload = {}
        await expectToThrowAuthenticationErrorToObj(async () => {
            await updateTestUser(client, objCreated.id, payload)
        })
    })

    test('user: delete User', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestUser(admin)

        const client = await makeClientWithNewRegisteredAndLoggedInUser()
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await User.delete(client, objCreated.id)
        })
    })

    test('anonymous: delete User', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestUser(admin)

        const client = await makeClient()
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await User.delete(client, objCreated.id)
        })
    })

    test('anonymous: count', async () => {
        const client = await makeClient()
        const { data, errors } = await User.count(client, {}, { raw: true })
        expect(data).toEqual({ meta: { count: null } })
        expect(errors[0]).toMatchObject({
            'message': 'No or incorrect authentication credentials',
            'name': 'AuthenticationError',
            'path': ['meta', 'count'],
        })
    })

    test('user: count', async () => {
        const admin = await makeLoggedInAdminClient()
        const [, userAttrs] = await createTestUser(admin)
        const client = await makeLoggedInClient(userAttrs)
        const count = await User.count(client)
        expect(count).toBeGreaterThanOrEqual(2)
    })
})

describe('User utils', () => {
    test('createUser()', async () => {
        const admin = await makeLoggedInAdminClient()
        const [user, userAttrs] = await createTestUser(admin)
        expect(user.id).toMatch(/^[A-Za-z0-9-]+$/g)
        expect(userAttrs.email).toBeTruthy()
        expect(userAttrs.password).toBeTruthy()
    })

    test('createUser() with dv/sender cookies', async () => {
        const admin = await makeLoggedInAdminClient()
        const newCookie = `${admin.getCookie()}; sender=%7B%22fingerprint%22%3A%22xY1byOxr6wCu%22%2C%22dv%22%3A1%7D; dv=1`
        admin.setHeaders({
            Cookie: newCookie,
        })
        const [user, attrs] = await createTestUser(admin, { dv: undefined, sender: undefined })
        expect(attrs.dv).toBeUndefined()
        expect(attrs.sender).toBeUndefined()
        expect(user.id).toMatch(UUID_RE)
    })

    test('createUser() with wrong dv', async () => {
        const admin = await makeLoggedInAdminClient()
        await expectToThrowGQLError(async () => await createTestUser(admin, { dv: 7 }), {
            'code': 'BAD_USER_INPUT',
            'type': 'DV_VERSION_MISMATCH',
            'message': 'Wrong value for data version number',
            'mutation': 'createUser',
            'variable': ['data', 'dv'],
        })
    })

    test('createUser() with wrong sender dv', async () => {
        const admin = await makeLoggedInAdminClient()
        await expectToThrowGQLError(async () => await createTestUser(admin, {
            sender: {
                dv: 2,
                fingerprint: '<errrr>',
            },
        }), {
            'code': 'BAD_USER_INPUT',
            'type': 'WRONG_FORMAT',
            'correctExample': '{ dv: 1, fingerprint: \'example-fingerprint-alphanumeric-value\'}',
            'message': 'Invalid format of "sender" field value. {details}',
            'mutation': 'createUser',
            'messageInterpolation': { 'details': 'fingerprint: [\'Fingerprint is invalid\'], dv: [\'Dv must be equal to 1\']' },
            'variable': ['data', 'sender'],
        })
    })

    test('createUser() with wrong sender fingerprint', async () => {
        const admin = await makeLoggedInAdminClient()
        await expectToThrowGQLError(async () => await createTestUser(admin, {
            sender: {
                dv: 1,
                fingerprint: '<errrr>',
            },
        }), {
            'code': 'BAD_USER_INPUT',
            'type': 'WRONG_FORMAT',
            'correctExample': '{ dv: 1, fingerprint: \'example-fingerprint-alphanumeric-value\'}',
            'message': 'Invalid format of "sender" field value. {details}',
            'mutation': 'createUser',
            'messageInterpolation': { 'details': 'fingerprint: [\'Fingerprint is invalid\']' },
            'variable': ['data', 'sender'],
        })
    })

    test('createUser() with landline phone number', async () => {
        const admin = await makeLoggedInAdminClient()
        const phone = createTestLandlineNumber()

        const { data, errors } = await createTestUser(admin, { phone }, { raw: true })

        expect(data).toEqual({ 'obj': null })
        expect(errors).toMatchObject([{
            message: 'You attempted to perform an invalid mutation',
            name: 'ValidationFailureError',
            path: ['obj'],
            data: {
                messages: ['[format:phone] invalid format'],
            },
        }])
    })

    test('makeLoggedInClient() without arguments', async () => {
        const admin = await makeLoggedInAdminClient()
        const client = await makeLoggedInClient()
        const userObj = await UserAdmin.getOne(admin, { id: client.user.id })
        expect(userObj).toMatchObject({
            email: DEFAULT_TEST_USER_IDENTITY,
            isAdmin: false,
            isSupport: false,
            type: 'staff',
        })
        const adminObj = await UserAdmin.getOne(admin, { id: admin.user.id })
        expect(adminObj).toMatchObject({
            email: DEFAULT_TEST_ADMIN_IDENTITY,
            isAdmin: true,
            isSupport: false,
            type: 'staff',
        })
    })
})

describe('User fields', () => {
    test('Convert email to lower case', async () => {
        const admin = await makeLoggedInAdminClient()
        const email = 'XXX' + getRandomString() + '@example.com'
        const [user, userAttrs] = await createTestUser(admin, { email })

        const objs = await UserAdmin.getAll(admin, { id: user.id })
        expect(objs[0]).toEqual(expect.objectContaining({ email: email.toLowerCase(), id: user.id }))

        const client2 = await makeLoggedInClient({ password: userAttrs.password, email: email.toLowerCase() })
        expect(client2.user.id).toEqual(user.id)

        // TODO(pahaz): fix in a future (it's no OK if you can't logged in by upper case email)
        const checkAuthByUpperCaseEmail = async () => {
            await makeLoggedInClient(userAttrs)
        }
        await expect(checkAuthByUpperCaseEmail).rejects.toThrow(WRONG_EMAIL_ERROR)
    })

    test('should auto-set "showGlobalHints" to true if value is not passed explicitly', async () => {
        const admin = await makeLoggedInAdminClient()
        const [user] = await createTestUser(admin)

        expect(user.showGlobalHints).toBeTruthy()
    })
})

const COMMON_FIELDS = 'id dv sender v deletedAt newId createdBy updatedBy createdAt updatedAt'
const HISTORY_FIELDS = 'history_id history_action history_date'
const USER_HISTORY_FIELDS = `{ ${HISTORY_FIELDS} name avatar meta type isPhoneVerified isEmailVerified ${COMMON_FIELDS} }`
const UserHistoryAdminGQL = generateGqlQueries('UserHistoryRecord', USER_HISTORY_FIELDS)
const UserHistoryAdmin = generateGQLTestUtils(UserHistoryAdminGQL)

describe('UserHistoryRecord', () => {
    test('create/update action generate history records', async () => {
        const admin = await makeLoggedInAdminClient()
        const name = getRandomString()

        const [user] = await createTestUser(admin)
        await User.update(admin, user.id, { name, dv: 1, sender: user.sender })

        const objs = await UserHistoryAdmin.getAll(admin, { history_id: user.id }, { sortBy: ['history_date_ASC'] })
        expect(objs).toMatchObject([
            {
                history_id: user.id,
                history_action: 'c',
                name: user.name,
                avatar: user.avatar,
                meta: user.meta,
                type: user.type,
                isPhoneVerified: user.isPhoneVerified,
                isEmailVerified: user.isEmailVerified,
                dv: 1,
                sender: user.sender,
                v: 1,
                deletedAt: null,
                newId: null,
                createdBy: admin.user.id,
                updatedBy: admin.user.id,
            },
            {
                history_id: user.id,
                history_action: 'u',
                name,
                avatar: user.avatar,
                meta: user.meta,
                type: user.type,
                isPhoneVerified: user.isPhoneVerified,
                isEmailVerified: user.isEmailVerified,
                dv: 1,
                sender: user.sender,
                v: 2,
                deletedAt: null,
                newId: null,
                createdBy: admin.user.id,
                updatedBy: admin.user.id,
            },
        ])
    })
})

describe('Cache tests', () => {
    test('Clients that ask for different set of fields in parallel get different set of fields', async () => {
        const originalClient = await makeClientWithNewRegisteredAndLoggedInUser()

        const originalClientUserId = originalClient.user.id

        const requests = []

        const CLIENTS = [
            { fields: ['id'], result: {} },
            { fields: ['id', 'name'], result: {} },
            { fields: ['id', 'type'], result: {} },
            { fields: ['id', 'dv'], result: {} },
            { fields: ['id', 'updatedAt'], result: {} },
            { fields: ['id', 'deletedAt'], result: {} },
        ]

        const REQUEST_ID = 'REQ_TEST'

        for (let i = 0; i < CLIENTS.length; ++i) {
            const modifiedClient = await makeClientWithNewRegisteredAndLoggedInUser()
            modifiedClient.setHeaders({ 'X-Request-Id': REQUEST_ID })

            const modifiedGQL = generateGqlQueries('User', `{ ${CLIENTS[i].fields.join(' ')} }`)
            const modifiedAPI = generateGQLTestUtils(modifiedGQL)

            CLIENTS[i].api = modifiedAPI
            CLIENTS[i].client = modifiedClient
        }

        for (let i = 0; i < CLIENTS.length; ++i) {
            const request = async () => {
                CLIENTS[i].result = await CLIENTS[i].api.getAll(CLIENTS[i].client, { id: originalClientUserId })
            }
            requests.push(request())
        }

        await Promise.all(requests)

        for (let i = 0; i < CLIENTS.length; ++i) {

            const fields = CLIENTS[i].fields
            const user = CLIENTS[i].result[0]

            for (let j = 0; j < fields.length; ++j) {
                const property = fields[j]
                expect(user).toHaveProperty(property)
                expect(user[property]).toEqual(originalClient.user[property])
            }
        }
    })
})

describe('Custom access rights', () => {
    it('should grant access to specific field if override rule was provided', async () => {
        const admin = await makeLoggedInAdminClient()

        const [user, userAttrs] = await createTestUser(admin)

        const customAccess = {
            accessRules: [{
                list: 'User',
                fields: [{ field: 'email', read: true }],
            }],
        }

        const [specialUser, specialUserAttrs] = await createTestUser(admin, { customAccess })
        const client = await makeLoggedInClient({ password: specialUserAttrs.password, email: specialUserAttrs.email })
        client.user = specialUser
        const regularClient = await makeLoggedInClient()

        const { data } = await UserAdmin.getAll(client, {
            id: user.id,
        }, { raw: true })


        expect(data.objs[0]).toHaveProperty('email', userAttrs.email)
        expect(data.objs[0]).toHaveProperty('id', user.id)

        const { data: regularData } = await UserAdmin.getAll(regularClient, {
            id: user.id,
        }, { raw: true })

        expect(regularData.objs[0]).toHaveProperty('email', null)
        expect(regularData.objs[0]).toHaveProperty('id', user.id)
    })

    it('should grant access to a list if override rule was provided', async () => {
        const admin = await makeLoggedInAdminClient()

        const customAccess = {
            accessRules: [{
                list: 'User',
                read: true,
                create: true,
                fields: [
                    { field: 'password', create: true },
                    { field: 'email', create: true, read: true },
                    { field: 'phone', create: true, read: true },
                ],
            }],
        }
        const [user, userAttrs] = await createTestUser(admin, { customAccess })

        const client = await makeLoggedInClient({ password: userAttrs.password, email: userAttrs.email })
        client.user = user

        const [createdUser] = await createTestUser(client)

        expect(createdUser).toBeDefined()
        expect(createdUser).toHaveProperty('id')
    })
})

describe('Validations', () => {
    describe('Password', () => {
        test('set to empty password', async () => {
            const admin = await makeLoggedInAdminClient()

            const [user] = await createTestUser(admin, { password: '' })
            expect(user.id).toBeDefined()

            const [user2] = await createTestUser(admin, { password: null })
            expect(user2.id).toBeDefined()
        })

        test('set to weak password', async () => {
            const admin = await makeLoggedInAdminClient()
            const password = '123456789'

            await catchErrorFrom(
                async () => await createTestUser(admin, { password }),
                ({ errors }) => {
                    expect(errors).toHaveLength(1)
                    expect(errors[0]).toEqual(expect.objectContaining({
                        message: '[password:rejectCommon:User:password] Common and frequently-used passwords are not allowed.',
                    }))
                },
            )
        })

        test('set to short password', async () => {
            const admin = await makeLoggedInAdminClient()
            const password = faker.internet.password(MIN_PASSWORD_LENGTH - 1)

            await catchErrorFrom(
                async () => await createTestUser(admin, { password }),
                ({ errors }) => {
                    expect(errors).toHaveLength(1)
                    expect(errors[0]).toEqual(expect.objectContaining({
                        message: ERRORS.INVALID_PASSWORD_LENGTH.message,
                    }))
                },
            )
        })

        test('set to password starting or ending with a space', async () => {
            const admin = await makeLoggedInAdminClient()
            const password = '  ' + faker.internet.password() + '  '

            const [user] = await createTestUser(admin, { password })
            expect(user.id).toBeDefined()
        })

        test('set to very long password', async () => {
            const admin = await makeLoggedInAdminClient()
            const password = faker.internet.password(MAX_PASSWORD_LENGTH + 1)

            await catchErrorFrom(
                async () => await createTestUser(admin, { password }),
                ({ errors }) => {
                    expect(errors).toHaveLength(1)
                    expect(errors[0]).toEqual(expect.objectContaining({
                        message: ERRORS.INVALID_PASSWORD_LENGTH.message,
                    }))
                },
            )
        })

        test('set to password containing email', async () => {
            const admin = await makeLoggedInAdminClient()
            const [user, userAttrs] = await createTestUser(admin)
            const password = userAttrs.email + faker.internet.password()

            await catchErrorFrom(
                async () => await updateTestUser(admin, user.id, { password }),
                ({ errors }) => {
                    expect(errors).toHaveLength(1)
                    expect(errors[0]).toEqual(expect.objectContaining({
                        message: ERRORS.PASSWORD_CONTAINS_EMAIL.message,
                    }))
                },
            )
        })

        test('set to password containing phone', async () => {
            const admin = await makeLoggedInAdminClient()
            const [user, userAttrs] = await createTestUser(admin)
            const password = userAttrs.phone + faker.internet.password()

            await catchErrorFrom(
                async () => await updateTestUser(admin, user.id, { password }),
                ({ errors }) => {
                    expect(errors).toHaveLength(1)
                    expect(errors[0]).toEqual(expect.objectContaining({
                        message: ERRORS.PASSWORD_CONTAINS_PHONE.message,
                    }))
                },
            )
        })

        test('set to wrong format password', async () => {
            const admin = await makeLoggedInAdminClient()
            const password = faker.datatype.number()

            await expectToThrowGraphQLRequestError(
                async () => await createTestUser(admin, { password }),
                '"data.password"; String cannot represent a non string value',
            )
        })

        test('set to password that does not containing at least 4 different characters', async () => {
            const admin = await makeLoggedInAdminClient()
            const password = '12331212312123'

            await catchErrorFrom(
                async () => await createTestUser(admin, { password }),
                ({ errors }) => {
                    expect(errors).toHaveLength(1)
                    expect(errors[0]).toEqual(expect.objectContaining({
                        message: ERRORS.PASSWORD_CONSISTS_OF_SMALL_SET_OF_CHARACTERS.message,
                    }))
                },
            )
        })
    })
})

function generateSearchScenarios (field, value) {
    const prefixes = ['', 'contains', 'starts_with', 'ends_with']

    const allStringFields = []
    for (const prefix of prefixes) {
        allStringFields.push([field, prefix].filter(x => x).join('_'))
        allStringFields.push([field, prefix, 'i'].filter(x => x).join('_'))
        allStringFields.push([field, 'not', prefix].filter(x => x).join('_'))
        allStringFields.push([field, 'not', prefix, 'i'].filter(x => x).join('_'))
    }

    return allStringFields.map(field => ({ [field]: value })).concat([
        { [`${field}_in`]: [value] },
        { [`${field}_not_in`]: [value] },
    ])
}

describe('Sensitive data search', () => {
    const testPhone = '+79991234567'
    const testEmail = 'search@email.com'
    const cases = [
        ...generateSearchScenarios('phone', testPhone).map(where => [JSON.stringify(where), where]),
        ...generateSearchScenarios('email', testEmail).map(where => [JSON.stringify(where), where]),
        ['AND / OR combo with phone', {
            OR: [
                { AND: [{ phone: testPhone }] },
                { AND: [{ name: 'User' }] },
            ],
        }],
        ['AND / OR combo with email', {
            OR: [
                { AND: [{ name: 'User' }] },
                { AND: [{ email: testEmail }] },
            ],
        }],
    ]
    describe('Sensitive fields cannot be searched by user', () => {
        let user
        beforeAll(async () => {
            user = await makeClientWithNewRegisteredAndLoggedInUser()
        })
        test.each(cases)('%p', async (_, where) => {
            await expectToThrowAccessDeniedErrorToObjects(async () => {
                await User.getAll(user, where)
            })
            await expectToThrowAccessDeniedErrorToCount(async () => {
                await User.count(user, where)
            }, ['meta'])
        })
    })
    test('Email address of service users can be read by another service users with direct access', async () => {
        const admin = await makeLoggedInAdminClient()
        const [rightsSet] = await createTestUserRightsSet(admin, {
            canReadUsers: true,
            canReadUserEmailField: true,
        })
        const firstServiceUser = await makeClientWithServiceUser({
            rightsSet: { connect: { id: rightsSet.id } },
        })
        const secondServiceUser = await makeClientWithServiceUser()
        const nonServiceUser = await makeClientWithNewRegisteredAndLoggedInUser()

        const UserWithEmail = generateGQLTestUtils(generateGqlQueries('User', '{ id email deletedAt }'))

        const readUser = await UserWithEmail.getOne(firstServiceUser, { id: secondServiceUser.user.id })
        expect(readUser).toHaveProperty('id', secondServiceUser.user.id)
        expect(readUser).toHaveProperty('email', normalizeEmail(secondServiceUser.userAttrs.email))
        expect(readUser).toHaveProperty('deletedAt')
        expect(readUser.deletedAt).toBeNull()

        const accessDeniedCases = [
            [firstServiceUser, nonServiceUser],
            [secondServiceUser, firstServiceUser],
            [secondServiceUser, nonServiceUser],
            [nonServiceUser, secondServiceUser],
        ]

        for (const [client, target] of accessDeniedCases) {
            await catchErrorFrom(async () => {
                await UserWithEmail.getOne(client, { id: target.user.id })
            }, (caught) => {
                expect(caught).toMatchObject({
                    name: 'TestClientResponseError',
                    data: {
                        objs: [
                            {
                                deletedAt: null,
                                email: null,
                                id: target.user.id,
                            },
                        ],
                    },
                    errors: [expect.objectContaining({
                        'message': 'You do not have access to this resource',
                        'name': 'AccessDeniedError',
                        'path': ['objs', 0, 'email'],
                        'extensions': {
                            'code': 'INTERNAL_SERVER_ERROR',
                        },
                    })],
                })
            })
        }
    })
})