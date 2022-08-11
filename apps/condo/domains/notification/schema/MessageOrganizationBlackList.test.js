/**
 * Generated by `createschema notification.MessageOrganizationBlackList 'organization?:Relationship:Organization:CASCADE; description:Text'`
 */
const faker = require('faker')

const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE, waitFor } = require('@condo/keystone/test.utils')

const {
    expectToThrowAuthenticationErrorToObj, expectToThrowAuthenticationErrorToObjects,
    expectToThrowAccessDeniedErrorToObj, expectToThrowAccessDeniedErrorToObjects, expectToThrowInternalError,
} = require('@condo/domains/common/utils/testSchema')

const { makeClientWithNewRegisteredAndLoggedInUser, makeClientWithSupportUser, createTestEmail, createTestPhone } = require('@condo/domains/user/utils/testSchema')

const { MessageOrganizationBlackList, createTestMessageOrganizationBlackList, updateTestMessageOrganizationBlackList, Message, createTestMessageUserBlackList } = require('@condo/domains/notification/utils/testSchema')
const { makeClientWithRegisteredOrganization, inviteNewOrganizationEmployee } = require('@condo/domains/organization/utils/testSchema/Organization')
const { DIRTY_INVITE_NEW_EMPLOYEE_MESSAGE_TYPE, MESSAGE_ERROR_STATUS } = require('@condo/domains/notification/constants/constants')
const { MESSAGE_TYPE_IN_USER_BLACK_LIST, MESSAGE_TYPE_IN_ORGANIZATION_BLACK_LIST } = require('@condo/domains/notification/constants/errors')
const { UNIQUE_CONSTRAINT_ERROR } = require('@condo/domains/common/constants/errors')

describe('MessageOrganizationBlackList', () => {
    afterEach(async () => {
        const supportClient = await makeClientWithSupportUser()
        const allOrganizationsBlackList = await MessageOrganizationBlackList.getAll(supportClient, {
            organization_is_null: true,
        })

        for (const blackListRule of allOrganizationsBlackList) {
            await updateTestMessageOrganizationBlackList(supportClient, blackListRule.id, {
                deletedAt: 'true',
            })
        }
    })

    describe('accesses', () => {
        describe('create', () => {
            it('support can create MessageOrganizationBlackList', async () => {
                const supportClient = await makeClientWithSupportUser()

                const [blackList] = await createTestMessageOrganizationBlackList(supportClient)

                expect(blackList.id).toMatch(UUID_RE)
            })

            it('user cannot create MessageOrganizationBlackList', async () => {
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await createTestMessageOrganizationBlackList(userClient)
                })
            })

            it('anonymous cannot create MessageOrganizationBlackList', async () => {
                const anonymousClient = await makeClient()

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await createTestMessageOrganizationBlackList(anonymousClient)
                })
            })
        })

        describe('update', () => {
            it('support can update MessageOrganizationBlackList', async () => {
                const supportClient = await makeClientWithSupportUser()

                const [blackList] = await createTestMessageOrganizationBlackList(supportClient)
                const description = faker.random.alphaNumeric(8)

                const [updatedBlackList] = await updateTestMessageOrganizationBlackList(supportClient, blackList.id, {
                    description,
                })

                expect(updatedBlackList.description).toEqual(description)
            })

            it('user cannot update MessageOrganizationBlackList', async () => {
                const supportClient = await makeClientWithSupportUser()
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()

                const [blackList] = await createTestMessageOrganizationBlackList(supportClient)
                const description = faker.random.alphaNumeric(8)

                await expectToThrowAccessDeniedErrorToObj(async () => {
                    await updateTestMessageOrganizationBlackList(userClient, blackList.id, {
                        description,
                    })
                })
            })

            it('anonymous cannot update MessageOrganizationBlackList', async () => {
                const supportClient = await makeClientWithSupportUser()
                const anonymousClient = await makeClient()

                const [blackList] = await createTestMessageOrganizationBlackList(supportClient)
                const description = faker.random.alphaNumeric(8)

                await expectToThrowAuthenticationErrorToObj(async () => {
                    await updateTestMessageOrganizationBlackList(anonymousClient, blackList.id, {
                        description,
                    })
                })
            })
        })

        describe('read', () => {
            it('user cannot read MessageOrganizationBlackList', async () => {
                const supportClient = await makeClientWithSupportUser()
                const userClient = await makeClientWithNewRegisteredAndLoggedInUser()

                await createTestMessageOrganizationBlackList(supportClient)

                await expectToThrowAccessDeniedErrorToObjects(async () => {
                    await MessageOrganizationBlackList.getAll(userClient)
                })
            })

            it('anonymous cannot read MessageOrganizationBlackList', async () => {
                const supportClient = await makeClientWithSupportUser()
                const anonymousClient = await makeClient()

                await createTestMessageOrganizationBlackList(supportClient)

                await expectToThrowAuthenticationErrorToObjects(async () => {
                    await MessageOrganizationBlackList.getAll(anonymousClient)
                })
            })
        })
    })

    describe('logic', () => {
        it('dont send notification if organization added in MessageOrganizationBlackList', async () => {
            const admin = await makeLoggedInAdminClient()
            const userAttrs = {
                name: faker.name.firstName(),
                email: createTestEmail(),
                phone: createTestPhone(),
            }
            const client = await makeClientWithRegisteredOrganization()

            await createTestMessageOrganizationBlackList(admin, {
                type: DIRTY_INVITE_NEW_EMPLOYEE_MESSAGE_TYPE,
                organization: { connect: { id: client.organization.id } },
            })

            const [employee] = await inviteNewOrganizationEmployee(client, client.organization, userAttrs)

            await waitFor(async () => {
                const messageWhere = { user: { id: employee.user.id }, type: DIRTY_INVITE_NEW_EMPLOYEE_MESSAGE_TYPE }
                const messages = await Message.getAll(admin, messageWhere)

                expect(messages[0].status).toEqual(MESSAGE_ERROR_STATUS)
                expect(messages[0].processingMeta.error).toEqual(MESSAGE_TYPE_IN_ORGANIZATION_BLACK_LIST)
            })
        })

        it('dont send notification if all organizaitons added in MessageOrganizationBlackList', async () => {
            const admin = await makeLoggedInAdminClient()
            const userAttrs = {
                name: faker.name.firstName(),
                email: createTestEmail(),
                phone: createTestPhone(),
            }
            const client = await makeClientWithRegisteredOrganization()

            await createTestMessageOrganizationBlackList(admin, {
                type: DIRTY_INVITE_NEW_EMPLOYEE_MESSAGE_TYPE,
            })

            const [employee] = await inviteNewOrganizationEmployee(client, client.organization, userAttrs)

            await waitFor(async () => {
                const messageWhere = { user: { id: employee.user.id }, type: DIRTY_INVITE_NEW_EMPLOYEE_MESSAGE_TYPE }
                const messages = await Message.getAll(admin, messageWhere)

                expect(messages[0].status).toEqual(MESSAGE_ERROR_STATUS)
                expect(messages[0].processingMeta.error).toEqual(MESSAGE_TYPE_IN_ORGANIZATION_BLACK_LIST)
            })
        })
    })

    describe('constraints', () => {
        it('unique organization and type', async () => {
            const admin = await makeLoggedInAdminClient()
            const client = await makeClientWithRegisteredOrganization()

            await createTestMessageOrganizationBlackList(admin, {
                type: DIRTY_INVITE_NEW_EMPLOYEE_MESSAGE_TYPE,
                organization: { connect: { id: client.organization.id } },
            })

            await expectToThrowInternalError(async () => {
                await createTestMessageOrganizationBlackList(admin, {
                    type: DIRTY_INVITE_NEW_EMPLOYEE_MESSAGE_TYPE,
                    organization: { connect: { id: client.organization.id } },
                })
            }, `${UNIQUE_CONSTRAINT_ERROR} "message_organization_black_list_unique_organization_and_type"`)
        })
    })
})
