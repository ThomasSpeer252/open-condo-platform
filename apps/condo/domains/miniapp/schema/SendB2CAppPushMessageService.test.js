/**
 * Generated by `createservice miniapp.SendB2CAppPushMessageService --type mutations`
 */
const { faker } = require('@faker-js/faker')
const { omit } = require('lodash')

const conf = require('@open-condo/config')
const {
    makeLoggedInAdminClient, makeLoggedInClient,
    makeClient, UUID_RE, catchErrorFrom,
} = require('@open-condo/keystone/test.utils')
const {
    expectToThrowAccessDeniedErrorToResult,
    expectToThrowAuthenticationErrorToResult,
} = require('@open-condo/keystone/test.utils')

const {
    createTestB2CApp,
    sendB2CAppPushMessageByTestClient, createTestMessageAppBlackList,
} = require('@condo/domains/miniapp/utils/testSchema')
const {
    B2C_APP_MESSAGE_PUSH_TYPE,
    VOIP_INCOMING_CALL_MESSAGE_TYPE,
    APPLE_CONFIG_TEST_VOIP_PUSHTOKEN_ENV,
    DEVICE_PLATFORM_IOS, APP_RESIDENT_ID_IOS,
    PUSH_TRANSPORT_APPLE,
} = require('@condo/domains/notification/constants/constants')
const { syncRemoteClientByTestClient } = require('@condo/domains/notification/utils/testSchema')
const {
    getRandomTokenData,
    getRandomFakeSuccessToken,
} = require('@condo/domains/notification/utils/testSchema/helpers')
const {
    makeClientWithRegisteredOrganization,
} = require('@condo/domains/organization/utils/testSchema/Organization')
const { makeClientWithResidentAccessAndProperty } = require('@condo/domains/property/utils/testSchema')
const { createTestResident } = require('@condo/domains/resident/utils/testSchema')
const {
    makeClientWithSupportUser,
    makeClientWithStaffUser,
    makeClientWithResidentUser,
} = require('@condo/domains/user/utils/testSchema')

const { ERRORS } = require('./SendB2CAppPushMessageService')

const APPLE_TEST_VOIP_PUSHTOKEN = conf[APPLE_CONFIG_TEST_VOIP_PUSHTOKEN_ENV] || null

describe('SendB2CAppPushMessageService', () => {
    let admin, user, residentClient, resident, appAttrs, b2cApp

    beforeAll( async () => {
        admin = await makeLoggedInAdminClient()
        residentClient = await makeClientWithResidentAccessAndProperty()

        const [b2c] = await createTestB2CApp(admin)
        const [residentData] = await createTestResident(admin, residentClient.user, residentClient.property)

        user = residentClient.user
        resident = residentData
        b2cApp = b2c
        appAttrs = {
            type: B2C_APP_MESSAGE_PUSH_TYPE,
            app: { id: b2cApp.id },
            user: { id: user.id },
            resident: { id: resident.id },
        }
    })

    describe('access checks', () => {
        it('Admin can SendB2CAppPushMessageService', async () => {
            const [message] = await sendB2CAppPushMessageByTestClient(admin, appAttrs)

            expect(message.id).toMatch(UUID_RE)
        })

        it('Support can SendB2CAppPushMessageService', async () => {
            const supportClient = await makeClientWithSupportUser()
            const [b2c] = await createTestB2CApp(admin)
            const [message] = await sendB2CAppPushMessageByTestClient(supportClient, {
                ...appAttrs,
                app: { id: b2c.id },
            })

            expect(message.id).toMatch(UUID_RE)
        })

        it('Anonymous cannot SendB2CAppPushMessageService', async () => {
            const anonymousClient = await makeClient()

            await expectToThrowAuthenticationErrorToResult(async () => {
                await sendB2CAppPushMessageByTestClient(anonymousClient, appAttrs)
            })
        })

        it('Management company admin user cannot SendB2CAppPushMessageService to other users', async () => {
            const client = await makeClientWithRegisteredOrganization()

            await expectToThrowAccessDeniedErrorToResult(async () => {
                await sendB2CAppPushMessageByTestClient(client, appAttrs)
            })
        })

        it('Staff cannot SendB2CAppPushMessageService to other users', async () => {
            const staffClient = await makeClientWithStaffUser()

            await expectToThrowAccessDeniedErrorToResult(async () => {
                await sendB2CAppPushMessageByTestClient(staffClient, appAttrs)
            })
        })

        /** we now require either residentId or propertyId + unitType + unitName which is available only for resident users */
        it.skip('Staff can SendB2CAppPushMessageService to himself', async () => {
            const staffClient = await makeClientWithStaffUser()
            const [message] = await sendB2CAppPushMessageByTestClient(staffClient, {
                ...appAttrs,
                user: { id: staffClient.id },
            })

            expect(message.id).toMatch(UUID_RE)
        })

        it('Resident cannot SendB2CAppPushMessageService to other users', async () => {
            const residentClient1 = await makeClientWithResidentUser()

            await expectToThrowAccessDeniedErrorToResult(async () => {
                await sendB2CAppPushMessageByTestClient(residentClient1, appAttrs)
            })
        })

        it('Resident can SendB2CAppPushMessageService to himself', async () => {
            const [b2c] = await createTestB2CApp(admin)
            const [message] = await sendB2CAppPushMessageByTestClient(residentClient, {
                ...appAttrs,
                app: { id: b2c.id },
            })

            expect(message.id).toMatch(UUID_RE)
        })
    })

    describe('errors', () => {
        it('No user with provided id for random id', async () => {
            await catchErrorFrom(async () => {
                await sendB2CAppPushMessageByTestClient(admin, {
                    ...appAttrs,
                    user: { id: faker.datatype.uuid() },
                })
            }, ({ errors }) => {
                expect(errors).toMatchObject([{
                    message: ERRORS.USER_NOT_FOUND.message,
                    path: ['result'],
                    extensions: omit(ERRORS.USER_NOT_FOUND, 'messageForUser'),
                }])
            })
        })

        it('No app with provided id for random id', async () => {
            await catchErrorFrom(async () => {
                await sendB2CAppPushMessageByTestClient(admin, {
                    ...appAttrs,
                    app: { id: faker.datatype.uuid() },
                })
            }, ({ errors }) => {
                expect(errors).toMatchObject([{
                    message: ERRORS.APP_NOT_FOUND.message,
                    path: ['result'],
                    extensions: omit(ERRORS.APP_NOT_FOUND, 'messageForUser'),
                }])
            })
        })

        it('Should have correct dv field (=== 1)', async () => {
            await catchErrorFrom(async () => {
                await sendB2CAppPushMessageByTestClient(admin, {
                    ...appAttrs,
                    dv: 2,
                })
            }, ({ errors }) => {
                expect(errors).toMatchObject([{
                    message: ERRORS.DV_VERSION_MISMATCH.message,
                    path: ['result'],
                    extensions: omit(ERRORS.DV_VERSION_MISMATCH, 'messageForUser'),
                }])
            })
        })

        it('Should have correct sender field [\'Dv must be equal to 1\']', async () => {
            await catchErrorFrom(async () => {
                await sendB2CAppPushMessageByTestClient(admin, {
                    ...appAttrs,
                    sender: { dv: 2, fingerprint: faker.random.alphaNumeric(8) },
                })
            }, ({ errors }) => {
                expect(errors).toMatchObject([{
                    message: 'Invalid format of "sender" field value. dv: [\'Dv must be equal to 1\']',
                    path: ['result'],
                    extensions: omit(ERRORS.WRONG_SENDER_FORMAT, 'messageForUser'),
                }])
            })
        })

        it('Resident id is missing', async () => {
            const expectedErrorMessage = 'Field "resident" of required type "ResidentWhereUniqueInput!" was not provided'

            await catchErrorFrom(
                async () => {
                    await sendB2CAppPushMessageByTestClient(admin, {
                        ...appAttrs,
                        resident: undefined,
                    })
                },
                ({ errors, data }) => {
                    expect(errors[0].message).toContain(expectedErrorMessage)
                    expect(data).toBeUndefined()
                }
            )
        })

        it('User id is missing', async () => {
            const expectedErrorMessage = 'Field "user" of required type "UserWhereUniqueInput!" was not provided'

            await catchErrorFrom(
                async () => {
                    await sendB2CAppPushMessageByTestClient(admin, {
                        ...appAttrs,
                        user: undefined,
                    })
                },
                ({ errors, data }) => {
                    expect(errors[0].message).toContain(expectedErrorMessage)
                    expect(data).toBeUndefined()
                }
            )
        })

        it('App id is missing', async () => {
            const expectedErrorMessage = 'Field "app" of required type "B2CAppWhereUniqueInput!" was not provided'

            await catchErrorFrom(
                async () => {
                    await sendB2CAppPushMessageByTestClient(admin, {
                        ...appAttrs,
                        app: undefined,
                    })
                },
                ({ errors, data }) => {
                    expect(errors[0].message).toContain(expectedErrorMessage)
                    expect(data).toBeUndefined()
                }
            )
        })

        it('Type is missing', async () => {
            const expectedErrorMessage = 'Field "type" of required type "SendB2CAppPushMessageType!" was not provided'

            await catchErrorFrom(
                async () => {
                    await sendB2CAppPushMessageByTestClient(admin, {
                        ...appAttrs,
                        type: undefined,
                    })
                },
                ({ errors, data }) => {
                    expect(errors[0].message).toContain(expectedErrorMessage)
                    expect(data).toBeUndefined()
                }
            )
        })

        it('No resident with provided id for random id', async () => {
            await catchErrorFrom(async () => {
                await sendB2CAppPushMessageByTestClient(admin, {
                    ...appAttrs,
                    resident: { id: faker.datatype.uuid() },
                })
            }, ({ errors }) => {
                expect(errors).toMatchObject([{
                    message: ERRORS.RESIDENT_NOT_FOUND.message,
                    path: ['result'],
                    extensions: omit(ERRORS.RESIDENT_NOT_FOUND, 'messageForUser'),
                }])
            })
        })
    })

    describe('Black list checks', () => {
        it('Don\'t send message if app added to MessageAppBlackList', async () => {
            const [b2c] = await createTestB2CApp(admin)

            await createTestMessageAppBlackList(admin, {
                type: B2C_APP_MESSAGE_PUSH_TYPE,
                app: { connect: { id: b2c.id } },
            })

            await catchErrorFrom(async () => {
                await sendB2CAppPushMessageByTestClient(admin, {
                    ...appAttrs,
                    app: { id: b2c.id },
                })
            }, ({ errors }) => {
                expect(errors).toMatchObject([{
                    message: ERRORS.APP_IN_BLACK_LIST.message,
                    path: ['result'],
                    extensions: omit(ERRORS.APP_IN_BLACK_LIST, 'messageForUser'),
                }])
            })
        })
    })

    /**
     * This test is needed only for local debugging
     */
    describe.skip('real notification send for debugging', () => {
        it('send VOIP_INCOMING_CALL_MESSAGE_TYPE to real VoIP push token if exists', async () => {
            const user = await makeLoggedInClient()
            const propertyId = 'e360edab-db67-408c-9aef-ddb70c31d3ec'
            // This is app id from condo, make sure to substitute it to one of already existing b2c apps locally for this test to work
            const EXISTING_B2C_APP_ID = 'b252edfd-1097-40ee-a159-05f6d6a1ee95'

            /**
             * NOTE: requires real VoIP push token to be sen in your .env to APPLE_TEST_VOIP_PUSHTOKEN
             * Also need APPLE_CONFIG_JSON
             * */

            const payload = getRandomTokenData({
                devicePlatform: DEVICE_PLATFORM_IOS,
                appId: APP_RESIDENT_ID_IOS,
                pushToken: getRandomFakeSuccessToken(),
                pushTransportVoIP: PUSH_TRANSPORT_APPLE,
                pushTokenVoIP: APPLE_TEST_VOIP_PUSHTOKEN,
            })

            await syncRemoteClientByTestClient(user, payload)

            const [message] = await sendB2CAppPushMessageByTestClient(admin, {
                type: VOIP_INCOMING_CALL_MESSAGE_TYPE,
                app: { id: EXISTING_B2C_APP_ID },
                user: { id: user.user.id },
                data: {
                    body: 'VoIP test body',
                    title: 'VoIP test title',
                    B2CAppContext: JSON.stringify({ propertyId }),
                },
            })

            expect(message.id).toMatch(UUID_RE)
        })
    })

})