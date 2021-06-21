/**
 * Generated by `createschema user.ConfirmPhoneAction 'phone:Text;token:Text;smsCode:Integer;smsCodeRequestedAt:DateTimeUtc;smsCodeExpiresAt:DateTimeUtc;retries:Integer;isPhoneVerified:Checkbox;requestedAt:DateTimeUtc;expiresAt:DateTimeUtc;completedAt:DateTimeUtc;'`
 */

const faker = require('faker')
const { makeClient, makeLoggedInAdminClient, makeLoggedInClient } = require('@core/keystone/test.utils')
const {
    createTestPhone,
    createTestUser,
    ConfirmPhoneAction,
    createTestConfirmPhoneAction,
    updateTestConfirmPhoneAction,
} = require('@condo/domains/user/utils/testSchema')
const {
    CONFIRM_PHONE_ACTION_EXPIRED,
    CONFIRM_PHONE_SMS_CODE_EXPIRED,
    CONFIRM_PHONE_SMS_CODE_VERIFICATION_FAILED,
    CONFIRM_PHONE_SMS_CODE_MAX_RETRIES_REACHED,
    TOO_MANY_REQUESTS,
} = require('@condo/domains/user/constants/errors')

const {
    CONFIRM_PHONE_SMS_MAX_RETRIES,
} = require('@condo/domains/user/constants/common')

const {
    START_CONFIRM_PHONE_MUTATION,
    RESEND_CONFIRM_PHONE_SMS_MUTATION,
    COMPLETE_CONFIRM_PHONE_MUTATION,
    GET_PHONE_BY_CONFIRM_PHONE_TOKEN_QUERY,
} = require('@condo/domains/user/gql')

const captcha = () => {
    return faker.lorem.sentence()
}
describe('ConfirmPhoneAction CRUD', () => {
    describe('User', () => {
        it('cant create confirm phone action', async () => {
            const admin = await makeLoggedInAdminClient()
            const [, userAttrs] = await createTestUser(admin)
            const client = await makeLoggedInClient(userAttrs)
            let isErrorThrown = false
            try {
                await createTestConfirmPhoneAction(client)
            } catch (e) {
                isErrorThrown = true
                expect(e.errors[0]).toMatchObject({
                    'message': 'You do not have access to this resource',
                    'name': 'AccessDeniedError',
                    'path': ['obj'],
                })
                expect(e.data).toEqual({ 'obj': null })
            }
            expect(isErrorThrown).toBe(true)
        })
        it('cant read confirm phone actions', async () => {
            const admin = await makeLoggedInAdminClient()
            const [, userAttrs] = await createTestUser(admin)
            const client = await makeLoggedInClient(userAttrs)
            let isErrorThrown = false
            try {
                await ConfirmPhoneAction.getAll(client)
            } catch (e) {
                isErrorThrown = true
                expect(e.errors[0]).toMatchObject({
                    'message': 'You do not have access to this resource',
                    'name': 'AccessDeniedError',
                    'path': ['objs'],
                })
                expect(e.data).toEqual({ 'objs': null })
            }
            expect(isErrorThrown).toBe(true)
        })
        it('cant update confirm phone action', async () => {
            const admin = await makeLoggedInAdminClient()
            const [objCreated] = await createTestConfirmPhoneAction(admin)
            const [, userAttrs] = await createTestUser(admin)
            const client = await makeLoggedInClient(userAttrs)
            const payload = { phone: createTestPhone() }
            let isErrorThrown = false
            try {
                await updateTestConfirmPhoneAction(client, objCreated.id, payload)
            } catch (e) {
                isErrorThrown = true
                expect(e.errors[0]).toMatchObject({
                    'message': 'You do not have access to this resource',
                    'name': 'AccessDeniedError',
                    'path': ['obj'],
                })
                expect(e.data).toEqual({ 'obj': null })
            }
            expect(isErrorThrown).toBe(true)
        })
        it('cant delete confirm phone action', async () => {
            const admin = await makeLoggedInAdminClient()
            const [objCreated] = await createTestConfirmPhoneAction(admin)
            const [, userAttrs] = await createTestUser(admin)
            const client = await makeLoggedInClient(userAttrs)
            let isErrorThrown = false
            try {
                await ConfirmPhoneAction.delete(client, objCreated.id)
            } catch (e) {
                isErrorThrown = true
                expect(e.errors[0]).toMatchObject({
                    'message': 'You do not have access to this resource',
                    'name': 'AccessDeniedError',
                    'path': ['obj'],
                })
                expect(e.data).toEqual({ 'obj': null })
            }
            expect(isErrorThrown).toBe(true)
        })
    })
    describe('Anonymous', () => {
        it('cant create confirm phone action', async () => {
            const client = await makeClient()
            let isErrorThrown = false
            try {
                await createTestConfirmPhoneAction(client)
            } catch (e) {
                isErrorThrown = true
                expect(e.errors[0]).toMatchObject({
                    'message': 'You do not have access to this resource',
                    'name': 'AccessDeniedError',
                    'path': ['obj'],
                })
                expect(e.data).toEqual({ 'obj': null })
            }
            expect(isErrorThrown).toBe(true)
        })
        it('cant read confirm phone actions', async () => {
            const client = await makeClient()
            let isErrorThrown = false
            try {
                await ConfirmPhoneAction.getAll(client)
            } catch (e) {
                isErrorThrown = true
                expect(e.errors[0]).toMatchObject({
                    'message': 'You do not have access to this resource',
                    'name': 'AccessDeniedError',
                    'path': ['objs'],
                })
                expect(e.data).toEqual({ 'objs': null })
            }
            expect(isErrorThrown).toBe(true)
        })
        it('cant update confirm phone action', async () => {
            const admin = await makeLoggedInAdminClient()
            const [objCreated] = await createTestConfirmPhoneAction(admin)
            const client = await makeClient()
            const payload = { phone: createTestPhone() }
            let isErrorThrown = false
            try {
                await updateTestConfirmPhoneAction(client, objCreated.id, payload)
            } catch (e) {
                isErrorThrown = true
                expect(e.errors[0]).toMatchObject({
                    'message': 'You do not have access to this resource',
                    'name': 'AccessDeniedError',
                    'path': ['obj'],
                })
                expect(e.data).toEqual({ 'obj': null })
            }
            expect(isErrorThrown).toBe(true)
        })
        it('cant delete confirm phone action', async () => {
            const admin = await makeLoggedInAdminClient()
            const [objCreated] = await createTestConfirmPhoneAction(admin)
            const client = await makeClient()
            let isErrorThrown = false
            try {
                await ConfirmPhoneAction.delete(client, objCreated.id)
            } catch (e) {
                isErrorThrown = true
                expect(e.errors[0]).toMatchObject({
                    'message': 'You do not have access to this resource',
                    'name': 'AccessDeniedError',
                    'path': ['obj'],
                })
                expect(e.data).toEqual({ 'obj': null })
            }
            expect(isErrorThrown).toBe(true)
        })
    })
})




describe('ConfirmPhoneAction Service', () => {
    it('can be created by Anonymous', async () => {
        const client = await makeClient()
        const phone = createTestPhone()
        const createInput = { phone, dv: 1, sender: { dv: 1, fingerprint: 'tests' }, captcha: captcha() }
        const { data: { result: { token } } } = await client.mutate(START_CONFIRM_PHONE_MUTATION, { data: createInput })
        expect(token).not.toHaveLength(0)
    })
    it('throw error when is confirming with wrong sms code', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const [{ token }]  = await createTestConfirmPhoneAction(admin, {})
        const wrongLengthSmsCode = 11111
        const confirmInput = { token, smsCode: wrongLengthSmsCode, captcha: captcha() }
        const res = await client.mutate(COMPLETE_CONFIRM_PHONE_MUTATION, { data: confirmInput })
        expect(JSON.stringify(res.errors)).toContain(CONFIRM_PHONE_SMS_CODE_VERIFICATION_FAILED)
    })

    it('should increment retries on failed attempt', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const [{ token }]  = await createTestConfirmPhoneAction(admin, {})
        const wrongLengthSmsCode = 11111
        const completeInput = { token, smsCode: wrongLengthSmsCode, captcha: captcha() }
        await client.mutate(COMPLETE_CONFIRM_PHONE_MUTATION, { data: completeInput })
        const [actionAfter] = await ConfirmPhoneAction.getAll(admin, { token })
        expect(actionAfter.retries).toBe(1)
    })

    it('marks itself as verified when sms code matches', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const [{ token }]  = await createTestConfirmPhoneAction(admin, {})
        const [actionBefore] = await ConfirmPhoneAction.getAll(admin, { token })
        const completeInput = { token, smsCode: actionBefore.smsCode, captcha: captcha() }
        const { data: { result: { status } } } = await client.mutate(COMPLETE_CONFIRM_PHONE_MUTATION, { data: completeInput })
        expect(status).toBe('ok')
        const [actionAfter] = await ConfirmPhoneAction.getAll(admin, { token })
        expect(actionAfter.isPhoneVerified).toBe(true)
    })

    it('marks itself failed when maximum retries number excided', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const [{ token }]  = await createTestConfirmPhoneAction(admin, {})
        const [actionBefore] = await ConfirmPhoneAction.getAll(admin, { token })
        await ConfirmPhoneAction.update(admin, actionBefore.id, { retries: CONFIRM_PHONE_SMS_MAX_RETRIES + 1 })
        const completeInput = { token, smsCode: actionBefore.smsCode, captcha: captcha() }
        const res = await client.mutate(COMPLETE_CONFIRM_PHONE_MUTATION, { data: completeInput })
        expect(JSON.stringify(res.errors)).toContain(CONFIRM_PHONE_SMS_CODE_MAX_RETRIES_REACHED)
    })

    it('throws error when sms code ttl expires', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const [{ token }]  = await createTestConfirmPhoneAction(admin, {})
        const [actionBefore] = await ConfirmPhoneAction.getAll(admin, { token })
        await ConfirmPhoneAction.update(admin, actionBefore.id, {  smsCodeExpiresAt: actionBefore.smsCodeRequestedAt })
        const completeInput = { token, smsCode: actionBefore.smsCode, captcha: captcha() }
        const res = await client.mutate(COMPLETE_CONFIRM_PHONE_MUTATION, { data: completeInput })
        expect(JSON.stringify(res.errors)).toContain(CONFIRM_PHONE_SMS_CODE_EXPIRED)
    })

    it('throws error when confirm phone action expires', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const [{ token }]  = await createTestConfirmPhoneAction(admin, {})
        const [actionBefore] = await ConfirmPhoneAction.getAll(admin, { token })
        await ConfirmPhoneAction.update(admin, actionBefore.id, { expiresAt: actionBefore.requestedAt })
        const completeInput = { token, smsCode: actionBefore.smsCode, captcha: captcha() }
        const res = await client.mutate(COMPLETE_CONFIRM_PHONE_MUTATION, { data: completeInput })
        expect(JSON.stringify(res.errors)).toContain(CONFIRM_PHONE_ACTION_EXPIRED)
    })

    it('gives to Anonymous phone number when he asks with token', async () => {
        const client = await makeClient()
        const phone = createTestPhone()
        const admin = await makeLoggedInAdminClient()
        const [{ token }]  = await createTestConfirmPhoneAction(admin, { phone })
        const getInput = { token, captcha: captcha() }
        const { data: { result: { phone: phoneFromAction } } } = await client.query(GET_PHONE_BY_CONFIRM_PHONE_TOKEN_QUERY, { data: getInput })
        expect(phone).toBe(phoneFromAction)
    })

    it('should change sms code when resend is invoked', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const [{ token }]  = await createTestConfirmPhoneAction(admin, { })
        const [actionBefore] = await ConfirmPhoneAction.getAll(admin, { token })
        expect(actionBefore.smsCode).toBeGreaterThan(0)
        const resendInput = { token, sender: { dv: 1, fingerprint: 'tests' }, captcha: captcha() }
        await client.mutate(RESEND_CONFIRM_PHONE_SMS_MUTATION, { data: resendInput })
        const [actionAfter] = await ConfirmPhoneAction.getAll(admin, { token })
        expect(actionAfter.smsCode).toBeGreaterThan(0)
        expect(actionAfter.smsCode).not.toEqual(actionBefore.smsCode)
    })
    it('should block 2 sms code resend for the same phone', async () => {
        const client = await makeClient()
        const admin = await makeLoggedInAdminClient()
        const [{ token }]  = await createTestConfirmPhoneAction(admin, {})
        const resendInput = { token, sender: { dv: 1, fingerprint: 'tests' }, captcha: captcha() }
        await client.mutate(RESEND_CONFIRM_PHONE_SMS_MUTATION, { data: resendInput })
        const res = await client.mutate(RESEND_CONFIRM_PHONE_SMS_MUTATION, { data: resendInput })
        expect(JSON.stringify(res.errors)).toContain(TOO_MANY_REQUESTS)
    })
})
