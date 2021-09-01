/**
 * Generated by `createschema meter.MeterReadingSource 'organization:Relationship:Organization:CASCADE; type:Select:call,mobile_app,billing; name:Text;'`
 */

const { CALL_METER_READING_SOURCE_ID } = require('@condo/domains/meter/constants/constants')
const { MeterReadingSource } = require('../utils/testSchema')
const { makeClientWithNewRegisteredAndLoggedInUser } = require('@condo/domains/user/utils/testSchema')
const { makeLoggedInAdminClient, makeClient } = require('@core/keystone/test.utils')
const { createTestMeterReadingSource, updateTestMeterReadingSource } = require('@condo/domains/meter/utils/testSchema')
const { expectToThrowAccessDeniedErrorToObj } = require('@condo/domains/common/utils/testSchema')

describe('MeterReadingSource', () => {
    describe('Create', () => {
        test('user: cannot create MeterReadingSource', async () => {
            const client = await makeClientWithNewRegisteredAndLoggedInUser()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestMeterReadingSource(client)
            })
        })

        test('anonymous: cannot create Meter', async () => {
            const client = await makeClient()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestMeterReadingSource(client)
            })
        })

        test('admin: cannot create Meter', async () => {
            const admin = await makeLoggedInAdminClient()

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await createTestMeterReadingSource(admin)
            })
        })
    })
    describe('Update', () => {
        test('user: cannot update MeterReadingSource', async () => {
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            const [source] = await MeterReadingSource.getAll(client, { id: CALL_METER_READING_SOURCE_ID })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeterReadingSource(client, source.id, {})
            })
        })

        test('anonymous: cannot update Meter', async () => {
            const client = await makeClient()
            const [source] = await MeterReadingSource.getAll(client, { id: CALL_METER_READING_SOURCE_ID })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeterReadingSource(client, source.id, {})
            })
        })

        test('admin: cannot update Meter', async () => {
            const admin = await makeLoggedInAdminClient()
            const [source] = await MeterReadingSource.getAll(admin, { id: CALL_METER_READING_SOURCE_ID })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeterReadingSource(admin, source.id, {})
            })
        })
    })
    describe('Soft delete', () => {
        test('user: cannot soft delete MeterReadingSource', async () => {
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            const [source] = await MeterReadingSource.getAll(client, { id: CALL_METER_READING_SOURCE_ID })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeterReadingSource(client, source.id, { deletedAt: null })
            })
        })

        test('anonymous: cannot soft delete Meter', async () => {
            const client = await makeClient()
            const [source] = await MeterReadingSource.getAll(client, { id: CALL_METER_READING_SOURCE_ID })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeterReadingSource(client, source.id, { deletedAt: null })
            })
        })

        test('admin: cannot soft delete Meter', async () => {
            const admin = await makeLoggedInAdminClient()
            const [source] = await MeterReadingSource.getAll(admin, { id: CALL_METER_READING_SOURCE_ID })

            await expectToThrowAccessDeniedErrorToObj(async () => {
                await updateTestMeterReadingSource(admin, source.id, { deletedAt: null })
            })
        })
    })
    describe('Read', () => {
        test('user: can read MeterReadingSources', async () => {
            const client = await makeClientWithNewRegisteredAndLoggedInUser()
            const sources = await MeterReadingSource.getAll(client, {})

            expect(sources.length).toBeGreaterThan(0)
        })

        test('anonymous: cannot read MeterReadingSources', async () => {
            const client = await makeClient()
            const sources = await MeterReadingSource.getAll(client, {})

            expect(sources.length).toBeGreaterThan(0)
        })

        test('admin: can read MeterReadingSources', async () => {
            const admin = await makeLoggedInAdminClient()
            const sources = await MeterReadingSource.getAll(admin, {})

            expect(sources.length).toBeGreaterThan(0)
        })
    })
})
