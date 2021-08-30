/**
 * Generated by `createschema notification.Message 'organization?:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; ticket?:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; type:Text; meta:Json; channels:Json; status:Select:sending,planned,sent,canceled; deliveredAt:DateTimeUtc;'`
 */

const { REGISTER_NEW_USER_MESSAGE_TYPE, INVITE_NEW_EMPLOYEE_MESSAGE_TYPE } = require('@condo/domains/notification/constants')
const { makeClientWithRegisteredOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')
const { makeLoggedInAdminClient, makeClient, UUID_RE, DATETIME_RE } = require('@core/keystone/test.utils')

const { Message, createTestMessage, updateTestMessage } = require('@condo/domains/notification/utils/testSchema')
const { expectToThrowAuthenticationErrorToObjects, catchErrorFrom, expectToThrowAccessDeniedErrorToObj, expectToThrowAuthenticationErrorToObj } = require('../../common/utils/testSchema')

describe('Message', () => {
    test('admin: create Message', async () => {
        const client = await makeLoggedInAdminClient()

        const [obj, attrs] = await createTestMessage(client)
        expect(obj.id).toMatch(UUID_RE)
        expect(obj.dv).toEqual(1)
        expect(obj.sender).toEqual(attrs.sender)
        expect(obj.v).toEqual(1)
        expect(obj.newId).toEqual(null)
        expect(obj.deletedAt).toEqual(null)
        expect(obj.createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
        expect(obj.updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
        expect(obj.createdAt).toMatch(DATETIME_RE)
        expect(obj.updatedAt).toMatch(DATETIME_RE)
        expect(obj.status).toEqual('sending')
        expect(obj.lang).toEqual('en')
        expect(obj.user).toEqual(null)
        expect(obj.email).toEqual(attrs.email)
        expect(obj.phone).toEqual(null)
        expect(obj.processingMeta).toEqual(null)
        expect(obj.deliveredAt).toEqual(null)
    })

    test('admin: update Message', async () => {
        const client = await makeLoggedInAdminClient()

        const [objCreated] = await createTestMessage(client)
        const [obj] = await updateTestMessage(client, objCreated.id, { email: 'new.user.mail@example.org' })
        expect(obj.email).toEqual('new.user.mail@example.org')
    })

    test('user: create Message', async () => {
        const client = await makeClientWithRegisteredOrganization()
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await createTestMessage(client)
        })
    })

    test('anonymous: create Message', async () => {
        const client = await makeClient()
        await expectToThrowAuthenticationErrorToObj(async () => {
            await createTestMessage(client)
        })
    })

    test('user: read Message', async () => {
        const client = await makeClientWithRegisteredOrganization()

        const admin = await makeLoggedInAdminClient()
        const [obj, attrs] = await createTestMessage(admin, { user: { connect: { id: client.user.id } } })

        const objs = await Message.getAll(client, {}, { sortBy: ['updatedAt_DESC'] })

        expect(objs[1].type).toEqual(REGISTER_NEW_USER_MESSAGE_TYPE)
        expect(objs[0].type).toEqual(INVITE_NEW_EMPLOYEE_MESSAGE_TYPE)
        expect(objs).toHaveLength(2)
        expect(objs[0].id).toMatch(obj.id)
        expect(objs[0].dv).toEqual(1)
        expect(objs[0].sender).toEqual(attrs.sender)
        expect(objs[0].v).toEqual(1)
        expect(objs[0].newId).toEqual(null)
        expect(objs[0].deletedAt).toEqual(null)
        expect(objs[0].createdBy).toEqual(expect.objectContaining({ id: admin.user.id }))
        expect(objs[0].updatedBy).toEqual(expect.objectContaining({ id: admin.user.id }))
        expect(objs[0].createdAt).toMatch(obj.createdAt)
        expect(objs[0].updatedAt).toMatch(obj.updatedAt)
    })

    test('anonymous: read Message', async () => {
        const client = await makeClient()

        await expectToThrowAuthenticationErrorToObjects(async () => {
            await Message.getAll(client)
        })
    })

    test('user: update Message', async () => {
        const client = await makeClientWithRegisteredOrganization()

        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestMessage(admin, { user: { connect: { id: client.user.id } } })

        const payload = {}
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await updateTestMessage(client, objCreated.id, payload)
        })
    })

    test('anonymous: update Message', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestMessage(admin)

        const client = await makeClient()
        const payload = {}
        await expectToThrowAuthenticationErrorToObj(async () => {
            await updateTestMessage(client, objCreated.id, payload)
        })
    })

    test('user: delete Message', async () => {
        const client = await makeClientWithRegisteredOrganization()

        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestMessage(admin, { user: { connect: { id: client.user.id } } })

        await expectToThrowAccessDeniedErrorToObj(async () => {
            await Message.delete(client, objCreated.id)
        })
    })

    test('anonymous: delete Message', async () => {
        const admin = await makeLoggedInAdminClient()
        const [objCreated] = await createTestMessage(admin)

        const client = await makeClient()
        await expectToThrowAccessDeniedErrorToObj(async () => {
            await Message.delete(client, objCreated.id)
        })
    })

    test('admin: create with wrong sender', async () => {
        const admin = await makeLoggedInAdminClient()
        await catchErrorFrom(
            async () => await createTestMessage(admin, { sender: 'invalid' }),
            ({ errors, data }) => {
                expect(data).toEqual(undefined)
                expect(errors[0]).toMatchObject({
                    name: 'UserInputError',
                    message: 'Variable "$data" got invalid value "invalid" at "data.sender"; Expected type "SenderFieldInput" to be an object.',
                    extensions: { code: 'BAD_USER_INPUT' },
                    uid: expect.any(String),
                })
            },
        )
    })
})
