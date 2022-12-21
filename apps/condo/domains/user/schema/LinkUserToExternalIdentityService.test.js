/**
 * Generated by `createservice user.LinkUserToExternalIdentityService`
 */
const { catchErrorFrom } = require('@open-condo/keystone/test.utils')

const { SBBOL_IDP_TYPE } = require('@condo/domains/user/constants/common')
const { linkUserToExternalIdentityByTestClient, makeClientWithResidentUser } = require('@condo/domains/user/utils/testSchema')

describe('LinkUserToExternalIdentityService', () => {
    test('Sbbol case - should throw an error', async () => {
        const client = await makeClientWithResidentUser()
        const payload = { identityType: SBBOL_IDP_TYPE, tokenSet: {} }

        await catchErrorFrom(async () => {
            await linkUserToExternalIdentityByTestClient(client, payload)
        }, ({ errors }) => {
            expect(errors).toMatchObject([{
                message: 'Identity integration does not support login form',
                path: ['result'],
                extensions: {
                    mutation: 'linkUserToExternalIdentity',
                    variable: ['data', 'identityType'],
                    code: 'BAD_USER_INPUT',
                    type: 'IDENTITY_INTEGRATION_DOES_NOT_SUPPORT_LOGIN_FORM',
                    message: 'Identity integration does not support login form',
                },
            }])
        })
    })
})