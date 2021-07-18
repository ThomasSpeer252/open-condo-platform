/**
 * Generated by `createservice user.SigninOrRegisterResidentUserService`
 */

const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { expectToThrowAccessDeniedErrorToObj } = require('@condo/domains/common/utils/testSchema')

const { SigninOrRegisterResidentUserService } = require('@condo/domains/user/utils/testSchema')

describe('SigninOrRegisterResidentUserService', () => {
    describe('User', () => {
        it('can not register with token', async () => {
            const client = await makeClient()
        })
    })
    describe('Anonymous', () => {
        it('can register with valid token', async () => {
            //
        })
        it('can signin with valid token if already existed', async () => {
            //
        })
        it('can not signin if token is used', async () => {
            //
        })
        it('can not signin if token is not confirmed', async () => {
            //
        })
        it('can not signin if token is expired', async () => {
            //
        })

    })
})
