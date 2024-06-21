/**
 * Generated by `createschema user.User name:Text; password?:Password; isAdmin?:Checkbox; email?:Text; isEmailVerified?:Checkbox; phone?:Text; isPhoneVerified?:Checkbox; avatar?:File; meta:Json; importId:Text;`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const { faker } = require('@faker-js/faker')
const { v4: uuid } = require('uuid')
const { countryPhoneData } = require('phone')
const { max, repeat, get, isEmpty } = require('lodash')

const { getRandomString, makeClient, makeLoggedInClient, makeLoggedInAdminClient } = require('@open-condo/keystone/test.utils')
const { generateGQLTestUtils, throwIfError } = require('@open-condo/codegen/generate.test.utils')

const {
    SMS_CODE_TTL,
    CONFIRM_PHONE_ACTION_EXPIRY,
    SBER_ID_IDP_TYPE,
    RESIDENT,
    STAFF,
    SERVICE
} = require('@condo/domains/user/constants/common')
const { IDENTITY_TYPES} = require('@condo/domains/user/constants')
const {
    ConfirmPhoneAction: ConfirmPhoneActionGQL,
    ForgotPasswordAction: ForgotPasswordActionGQL,
    OidcClient: OidcClientGQL,
    User: UserGQL,
    UserAdmin: UserAdminGQL,
    UserExternalIdentity: UserExternalIdentityGQL,
    COMPLETE_CONFIRM_PHONE_MUTATION,
    CHANGE_PHONE_NUMBER_RESIDENT_USER_MUTATION,
    CHANGE_PASSWORD_WITH_TOKEN_MUTATION,
    REGISTER_NEW_SERVICE_USER_MUTATION,
    REGISTER_NEW_USER_MUTATION,
    RESET_USER_MUTATION,
    SEND_MESSAGE_TO_SUPPORT_MUTATION,
    SIGNIN_AS_USER_MUTATION,
} = require('@condo/domains/user/gql')
const { generateSmsCode } = require('@condo/domains/user/utils/serverSchema')

const User = generateGQLTestUtils(UserGQL)
const UserAdmin = generateGQLTestUtils(UserAdminGQL)
const UserExternalIdentity = generateGQLTestUtils(UserExternalIdentityGQL)

const { ExternalTokenAccessRight: ExternalTokenAccessRightGQL } = require('@condo/domains/user/gql')
const { GET_ACCESS_TOKEN_BY_USER_ID_QUERY } = require('@condo/domains/user/gql')
const { UserRightsSet: UserRightsSetGQL } = require('@condo/domains/user/gql')
/* AUTOGENERATE MARKER <IMPORT> */

function createTestEmail () {
    return ('test.' + getRandomString() + '@example.com').toLowerCase()
}

function createTestPhone () {
    const { country_code, mobile_begin_with, phone_number_lengths } = faker.helpers.arrayElement(countryPhoneData.filter(x => get(x, 'mobile_begin_with.length', 0) > 0))
    const length = max(phone_number_lengths)
    const code = String(faker.helpers.arrayElement(mobile_begin_with))

    return faker.phone.number('+' + country_code + code + repeat('#', length - code.length))
}

function createTestLandlineNumber () {
    return faker.phone.number('+7343#######')
}

async function createTestUser (client, extraAttrs = {}, { raw = false } = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: 'test-' + faker.random.alphaNumeric(8) }
    const name = faker.name.firstName()
    const email = createTestEmail()
    const phone = createTestPhone()
    const password = getRandomString()
    const meta = {
        dv: 1, city: faker.address.city(), county: faker.address.county(),
    }

    const attrs = {
        dv: 1,
        sender,
        name, email, phone,
        password, meta,
        type: STAFF,
        ...extraAttrs,
    }
    const result = await User.create(client, attrs, { raw })
    if (raw) return result
    return [result, attrs]
}

async function createTestUserExternalIdentity (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: 'test-' + faker.random.alphaNumeric(8) }
    const identityId = faker.random.alphaNumeric(8)
    const identityType = SBER_ID_IDP_TYPE
    const meta = {
        dv: 1, city: faker.address.city(), county: faker.address.county(),
    }

    const attrs = {
        dv: 1,
        sender,
        identityId,
        identityType,
        meta,
        ...extraAttrs,
    }
    const result = await UserExternalIdentity.create(client, attrs)
    return [result, attrs]
}

async function updateTestUser (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await User.update(client, id, attrs)
    return [obj, attrs]
}

async function registerNewUser (client, extraAttrs = {}, { raw = false } = {}) {
    if (!client) throw new Error('no client')
    const admin = await makeLoggedInAdminClient()
    const sender = { dv: 1, fingerprint: 'test-' + faker.random.alphaNumeric(8) }
    const name = faker.name.firstName()
    const email = createTestEmail()
    const password = getRandomString()
    const phone = extraAttrs.phone || createTestPhone()
    const meta = {
        dv: 1, city: faker.address.city(), county: faker.address.county(),
    }
    const [{ token }] = await createTestConfirmPhoneAction(admin, { phone, isPhoneVerified: true })
    const attrs = {
        dv: 1,
        sender,
        name,
        email,
        phone,
        password,
        meta,
        confirmPhoneActionToken: token,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(REGISTER_NEW_USER_MUTATION, {
        data: attrs,
    })
    if (raw) return { data, errors }
    throwIfError(data, errors, { query: REGISTER_NEW_USER_MUTATION, variables: { data: attrs } })
    return [data.user, attrs]
}

async function makeClientWithNewRegisteredAndLoggedInUser (userExtraAttrs = {}) {
    const [user, userAttrs] = await registerNewUser(await makeClient())
    const client = await makeLoggedInClient(userAttrs)
    if (!isEmpty(userExtraAttrs)) await addStaffAccess(user, userExtraAttrs)
    client.user = user
    client.userAttrs = userAttrs
    return client
}

async function makeClientWithSupportUser (userExtraAttrs = {}) {
    const [user, userAttrs] = await registerNewUser(await makeClient())
    const client = await makeLoggedInClient(userAttrs)
    await addSupportAccess(user, userExtraAttrs)
    client.user = user
    client.userAttrs = userAttrs
    return client
}

async function makeClientWithResidentUser (updateUserExtraAttrs = {}, createUserExtraAttrs = {}) {
    const [user, userAttrs] = await registerNewUser(await makeClient(), createUserExtraAttrs)
    const client = await makeLoggedInClient(userAttrs)
    await addResidentAccess(user, updateUserExtraAttrs)
    client.user = user
    client.userAttrs = userAttrs
    return client
}

async function makeClientWithStaffUser (userExtraAttrs = {}) {
    const [user, userAttrs] = await registerNewUser(await makeClient())
    const client = await makeLoggedInClient(userAttrs)
    await addStaffAccess(user, userExtraAttrs)
    client.user = user
    client.userAttrs = userAttrs
    return client
}

async function makeClientWithServiceUser (userExtraAttrs = {}) {
    const [user, userAttrs] = await registerNewUser(await makeClient())
    const client = await makeLoggedInClient(userAttrs)
    await addServiceAccess(user, userExtraAttrs)
    client.user = user
    client.userAttrs = userAttrs
    return client
}

async function addAdminAccess (user, extraAttrs = {}) {
    const admin = await makeLoggedInAdminClient()
    const dv = 1
    const sender = { dv:1, fingerprint: "user-test-schema-utils" }
    await User.update(admin, user.id, { dv, sender, isAdmin: true, ...extraAttrs })
}

async function addSupportAccess (user, extraAttrs = {}) {
    const admin = await makeLoggedInAdminClient()
    const dv = 1
    const sender = { dv:1, fingerprint: "user-test-schema-utils" }
    await User.update(admin, user.id, { dv, sender, isSupport: true, ...extraAttrs })
}

async function addResidentAccess (user, extraAttrs = {}) {
    const admin = await makeLoggedInAdminClient()
    const dv = 1
    const sender = { dv:1, fingerprint: "user-test-schema-utils" }
    await User.update(admin, user.id, { dv, sender, type: RESIDENT, ...extraAttrs })
}

async function addStaffAccess (user, extraAttrs = {}) {
    const admin = await makeLoggedInAdminClient()
    const dv = 1
    const sender = { dv:1, fingerprint: "user-test-schema-utils" }
    await User.update(admin, user.id, { dv, sender, type: STAFF, ...extraAttrs })
}

async function addServiceAccess (user, extraAttrs = {}) {
    const admin = await makeLoggedInAdminClient()
    const dv = 1
    const sender = { dv:1, fingerprint: "user-test-schema-utils" }
    await User.update(admin, user.id, { dv, sender, type: SERVICE, ...extraAttrs })
}

const ConfirmPhoneAction = generateGQLTestUtils(ConfirmPhoneActionGQL)
const ForgotPasswordAction = generateGQLTestUtils(ForgotPasswordActionGQL)

const OidcClient = generateGQLTestUtils(OidcClientGQL)
const ExternalTokenAccessRight = generateGQLTestUtils(ExternalTokenAccessRightGQL)
const UserRightsSet = generateGQLTestUtils(UserRightsSetGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createTestConfirmPhoneAction (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const now = Date.now()
    const attributes = {
        token: uuid(),
        phone: createTestPhone(),
        smsCode: generateSmsCode(),
        smsCodeRequestedAt: new Date(now).toISOString(),
        smsCodeExpiresAt: new Date(now + SMS_CODE_TTL * 1000).toISOString(),
        requestedAt: new Date(now).toISOString(),
        expiresAt: new Date(now + CONFIRM_PHONE_ACTION_EXPIRY * 1000).toISOString(),
    }
    const attrs = {
        dv: 1,
        sender,
        ...attributes,
        ...extraAttrs,
    }
    const obj = await ConfirmPhoneAction.create(client, attrs)
    return [obj, attrs]
}

async function updateTestConfirmPhoneAction (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await ConfirmPhoneAction.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestForgotPasswordAction (client, user, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!user || !user.id) throw new Error('no user.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const now = Date.now()
    const attrs = {
        dv: 1,
        sender,
        user: { connect: { id: user.id } },
        token: uuid(),
        requestedAt: new Date(now).toISOString(),
        expiresAt: new Date(now + CONFIRM_PHONE_ACTION_EXPIRY * 1000).toISOString(),
        ...extraAttrs,
    }
    const obj = await ForgotPasswordAction.create(client, attrs)

    return [obj, attrs]
}

async function updateTestForgotPasswordAction (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await ForgotPasswordAction.update(client, id, attrs)
    return [obj, attrs]
}

async function signinAsUserByTestClient (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    if (!id) throw new Error('No user id passed')
    const attrs = {
        dv: 1,
        sender,
        id,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(SIGNIN_AS_USER_MUTATION, { data: attrs })
    throwIfError(data, errors, { query: SIGNIN_AS_USER_MUTATION, variables: { data: attrs } })
    return [data.result, attrs]
}

async function resetUserByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(RESET_USER_MUTATION, { data: attrs })
    throwIfError(data, errors, { query: RESET_USER_MUTATION, variables: { data: attrs } })
    return [data.result, attrs]
}

async function registerNewServiceUserByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: 'test-' + faker.random.alphaNumeric(8) }
    const name = faker.name.firstName()
    const email = createTestEmail()
    const meta = {
        dv: 1, city: faker.address.city(), county: faker.address.county(),
    }
    const attrs = {
        dv: 1,
        sender,
        name,
        email,
        meta,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(REGISTER_NEW_SERVICE_USER_MUTATION, { data: attrs })
    throwIfError(data, errors, { query: REGISTER_NEW_SERVICE_USER_MUTATION, variables: { data: attrs } })
    return [data.result, attrs]
}

async function supportSendMessageToSupportByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(SEND_MESSAGE_TO_SUPPORT_MUTATION, { data: attrs })
    throwIfError(data, errors, { query: SEND_MESSAGE_TO_SUPPORT_MUTATION, variables: { data: attrs } })
    return [data.result, attrs]
}

async function completeConfirmPhoneActionByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(COMPLETE_CONFIRM_PHONE_MUTATION, { data: attrs })
    throwIfError(data, errors, { query: COMPLETE_CONFIRM_PHONE_MUTATION, variables: { data: attrs } })
    return [data.result, attrs]
}

async function changePhoneNumberResidentUserByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }

    const { data, errors } = await client.mutate(CHANGE_PHONE_NUMBER_RESIDENT_USER_MUTATION, { data: attrs })
    throwIfError(data, errors, { query: CHANGE_PHONE_NUMBER_RESIDENT_USER_MUTATION, variables: { data: attrs } })
    return [data.result, attrs]
}

async function changePasswordWithTokenByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(CHANGE_PASSWORD_WITH_TOKEN_MUTATION, { data: attrs })
    throwIfError(data, errors, { query: CHANGE_PASSWORD_WITH_TOKEN_MUTATION, variables: { data: attrs } })
    return [data.result, attrs]
}

async function createTestOidcClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const clientId = get(extraAttrs, 'payload.client_id', faker.random.alphaNumeric(12))

    const attrs = {
        dv: 1,
        sender,
        clientId,
        isEnabled: true,
        payload: {
            client_id: clientId,
            grant_types: ['implicit', 'authorization_code', 'refresh_token'],
            client_secret: faker.random.alphaNumeric(12),
            redirect_uris: ['https://jwt.io/'],
            response_types: ['code id_token', 'code', 'id_token'],
            token_endpoint_auth_method: 'client_secret_basic',
        },
        ...extraAttrs,
    }
    const obj = await OidcClient.create(client, attrs)
    return [obj, attrs]
}

async function updateTestOidcClient (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await OidcClient.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestExternalTokenAccessRight (client, user, identityType, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!user || !user.id) throw new Error('no user.id')
    if(!identityType) throw new Error('no identityType')
    if (!IDENTITY_TYPES.includes(identityType)) throw new Error('unknown identityType')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        user: { connect: { id: user.id } },
        type: identityType,
        ...extraAttrs,
    }
    const obj = await ExternalTokenAccessRight.create(client, attrs)
    return [obj, attrs]
}

async function updateTestExternalTokenAccessRight (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await ExternalTokenAccessRight.update(client, id, attrs)
    return [obj, attrs]
}


async function getAccessTokenByUserIdByTestClient(client, extraAttrs = {}) {
    if (!client) throw new Error('no client')

    const attrs = {
        ...extraAttrs,
    }
    const { data, errors } = await client.query(GET_ACCESS_TOKEN_BY_USER_ID_QUERY, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}
async function createTestUserRightsSet (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const name = faker.lorem.words(3)

    const attrs = {
        dv: 1,
        sender,
        name,
        ...extraAttrs,
    }
    const obj = await UserRightsSet.create(client, attrs)
    return [obj, attrs]
}

async function updateTestUserRightsSet (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await UserRightsSet.update(client, id, attrs)
    return [obj, attrs]
}

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    User,
    UserAdmin,
    UserExternalIdentity,
    createTestUser,
    createTestUserExternalIdentity,
    updateTestUser,
    registerNewUser,
    makeLoggedInClient,
    makeClientWithSupportUser,
    makeClientWithResidentUser,
    makeClientWithServiceUser,
    makeClientWithStaffUser,
    makeClientWithNewRegisteredAndLoggedInUser,
    addAdminAccess,
    addSupportAccess,
    addResidentAccess,
    addServiceAccess,
    addStaffAccess,
    createTestEmail,
    createTestPhone,
    createTestLandlineNumber,
    ConfirmPhoneAction,
    createTestConfirmPhoneAction,
    updateTestConfirmPhoneAction,
    ForgotPasswordAction,
    createTestForgotPasswordAction,
    updateTestForgotPasswordAction,
    signinAsUserByTestClient,
    registerNewServiceUserByTestClient,
    resetUserByTestClient,
    supportSendMessageToSupportByTestClient,
    completeConfirmPhoneActionByTestClient,
    changePhoneNumberResidentUserByTestClient,
    changePasswordWithTokenByTestClient,
    OidcClient, createTestOidcClient, updateTestOidcClient,
    ExternalTokenAccessRight, createTestExternalTokenAccessRight, updateTestExternalTokenAccessRight,
    getAccessTokenByUserIdByTestClient,
    UserRightsSet, createTestUserRightsSet, updateTestUserRightsSet,
/* AUTOGENERATE MARKER <EXPORTS> */
}
