/**
 * Generated by `createservice property.ExportPropertiesToExcelService --type queries`
 */

const { makeClient } = require('@condo/keystone/test.utils')
const { exportPropertiesToExcelByTestClient } = require('@condo/domains/property/utils/testSchema')
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { expectToThrowAccessDeniedErrorToResult, expectToThrowAuthenticationError, catchErrorFrom } = require('@condo/keystone/test.utils')
const { makeClientWithRegisteredOrganization } = require('@condo/domains/organization/utils/testSchema/Organization')


// TODO(zuch): remove after tests will have obs configuration in .env
const isObsConfigured = () => {
    const S3Config = {
        ...(process.env.SBERCLOUD_OBS_CONFIG ? JSON.parse(process.env.SBERCLOUD_OBS_CONFIG) : {}),
    }
    return !!(S3Config.bucket)
}

describe('ExportPropertiesToExcelService', () => {
    describe('User', () => {
        it('can get properties export from selected organization', async () => {
            if (isObsConfigured()) {
                const client = await makeClientWithProperty()
                const [{ status, linkToFile }] = await exportPropertiesToExcelByTestClient(client, { where: { organization: { id: client.organization.id } }, sortBy: 'id_ASC' })
                expect(status).toBe('ok')
                expect(linkToFile).not.toHaveLength(0)
            }
        })

        it('throws error when no properties for export exist', async () => {
            if (isObsConfigured()) {
                const client = await makeClientWithRegisteredOrganization()
                await catchErrorFrom(async () => {
                    await exportPropertiesToExcelByTestClient(client, { where: { organization: { id: client.organization.id } }, sortBy: 'id_ASC' })
                }, ({ errors }) => {
                    expect(errors).toMatchObject([{
                        message: 'No properties found to export for specified organization',
                        path: ['result'],
                        extensions: {
                            query: 'exportPropertiesToExcel',
                            code: 'BAD_USER_INPUT',
                            type: 'NOTHING_TO_EXPORT',
                            message: 'No properties found to export for specified organization',
                        },
                    }])
                })
            }
        })

        it('can not get properties export from another organization', async () => {
            const client1 = await makeClientWithProperty()
            const client2 = await makeClientWithProperty()
            await expectToThrowAccessDeniedErrorToResult(async () => {
                await exportPropertiesToExcelByTestClient(client1, { where: { organization: { id: client2.organization.id } }, sortBy: 'id_ASC' })
            })
        })
    })

    describe('Anonymous', () => {
        it('can not get tickets export', async () => {
            const client1 = await makeClient()
            const client2 = await makeClientWithProperty()
            await expectToThrowAuthenticationError(async () => {
                await exportPropertiesToExcelByTestClient(client1, { where: { organization: { id: client2.organization.id } }, sortBy: 'id_ASC' })
            }, 'result')
        })
    })
})
