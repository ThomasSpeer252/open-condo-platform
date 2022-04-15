/**
 * Generated by `createservice notification.SetMessageStatusService --type mutations`
 */
const faker = require('faker')
const dayjs = require('dayjs')

const conf = require('@core/config')
const { makeLoggedInAdminClient, UUID_RE } = require('@core/keystone/test.utils')

const { DEFAULT_LOCALE } = require('@condo/domains/common/constants/countries')
const { sleep } = require('@condo/domains/common/utils/sleep')

const { setMessageStatusByTestClient, syncDeviceByTestClient } = require('@condo/domains/notification/utils/testSchema')
const { Message, sendMessageByTestClient } = require('@condo/domains/notification/utils/testSchema')
const {
    TICKET_ASSIGNEE_CONNECTED_TYPE,
    PUSH_FAKE_TOKEN_SUCCESS,
    PUSH_TRANSPORT_FIREBASE,
    MESSAGE_SENDING_STATUS,
    MESSAGE_SENT_STATUS,
    MESSAGE_DELIVERED_STATUS,
    MESSAGE_READ_STATUS,
} = require('@condo/domains/notification/constants/constants')
const { getRandomTokenData } = require('@condo/domains/notification/utils/testSchema/helpers')

const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')

describe('SetMessageStatusService', () => {
    it('Emulates success push notification delivery and checks correct message status transitions', async () => {
        const admin = await makeLoggedInAdminClient()
        const assignee = await makeClientWithNewRegisteredAndLoggedInUser()
        const randomFakeSuccessPushtoken = `${PUSH_FAKE_TOKEN_SUCCESS}-${faker.datatype.uuid()}`
        const tokenData = { pushToken: randomFakeSuccessPushtoken, pushTransport: PUSH_TRANSPORT_FIREBASE }
        const payload = getRandomTokenData(tokenData)
        /**
         * Register fake success pushToken in order for user to be able to receive push notifications
         */
        const [device] = await syncDeviceByTestClient(assignee, payload)

        expect(device.pushTransport).toEqual(payload.pushTransport)

        const ticketId = faker.datatype.uuid()
        const extraAttrs = {
            lang: DEFAULT_LOCALE,
            to: { user: { id: assignee.user.id } },
            type: TICKET_ASSIGNEE_CONNECTED_TYPE,
            meta: {
                dv: 1,
                data: {
                    ticketId,
                    ticketNumber: faker.datatype.number(8),
                    userId: assignee.user.id,
                    url: `${conf.SERVER_URL}/ticket/${ticketId}`,
                },
            },
        }

        /**
         * Send push notification to user
         */
        const [message] = await sendMessageByTestClient(admin, extraAttrs)

        expect(message.status).toEqual(MESSAGE_SENDING_STATUS)

        /**
         * Give worker some time to proceed async logic
         */
        // TODO(DOMA-2765) Get rid of sleep
        await sleep(1000)

        const messageWhere = { user: { id: assignee.user.id }, type: TICKET_ASSIGNEE_CONNECTED_TYPE }
        const message1 = await Message.getOne(admin, messageWhere)

        /**
         * Make sure message status is MESSAGE_SENT_STATUS
         */
        expect(message1.id).toMatch(UUID_RE)
        expect(message1.status).toEqual(MESSAGE_SENT_STATUS)

        /**
         * Emulate request from mobile device to set message status to MESSAGE_DELIVERED_STATUS
         */
        const payload1 = { messageId: message.id, deliveredAt: dayjs().toISOString() }
        const [data] = await setMessageStatusByTestClient(admin, payload1)

        expect(data.status).toMatch('ok')

        const message2 = await Message.getOne(admin, messageWhere)

        expect(message2.status).toEqual(MESSAGE_DELIVERED_STATUS)

        /**
         * Emulate request from mobile device to set message status to MESSAGE_READ_STATUS
         */
        const payload2 = { messageId: message.id, readAt: dayjs().toISOString() }
        const [data1] = await setMessageStatusByTestClient(admin, payload2)

        expect(data1.status).toMatch('ok')

        const message3 = await Message.getOne(admin, messageWhere)

        expect(message3.status).toEqual(MESSAGE_READ_STATUS)

        /**
         * Emulate STRANGE request from mobile device to set message status to MESSAGE_DELIVERED_STATUS
         * after it was already set to final status of MESSAGE_READ_STATUS
         * Makes sure status does not degrade
         */
        const payload3 = { messageId: message.id, deliveredAt: dayjs().toISOString() }

        const [data2] = await setMessageStatusByTestClient(admin, payload3)

        expect(data2.status).toMatch('ok')

        const message4 = await Message.getOne(admin, messageWhere)

        expect(message4.status).toEqual(MESSAGE_READ_STATUS)

    })
})