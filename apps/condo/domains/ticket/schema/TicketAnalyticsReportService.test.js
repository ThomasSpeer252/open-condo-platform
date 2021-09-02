/**
 * Generated by `createservice ticket.TicketAnalyticsReportService`
 */

const { TICKET_ANALYTICS_REPORT_QUERY, EXPORT_TICKET_ANALYTICS_TO_EXCEL } = require(('@condo/domains/ticket/gql'))
const dayjs = require('dayjs')
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { createTestUser, makeLoggedInClient } = require('@condo/domains/user/utils/testSchema')
const { createTestTicket, makeClientWithTicket } = require('@condo/domains/ticket/utils/testSchema')
const { makeClient, makeLoggedInAdminClient } = require('@core/keystone/test.utils')
const isObsConfigured = require('@condo/domains/ticket/utils/testSchema/isObsConfigured')

describe('TicketAnalyticsReportService', () => {
    describe('User', () => {
        it('can read TicketAnalyticsReportService grouped counts [day, status]', async () => {
            const client = await makeClientWithTicket()
            await createTestTicket(client, client.organization, client.property)
            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')
            const { data: { result: { groups } } } = await client.query(TICKET_ANALYTICS_REPORT_QUERY, {
                dv: 1,
                sender: { dv: 1, fingerprint: 'tests' },
                data: {
                    where: {
                        organization: { id: client.organization.id },
                        AND: [
                            { createdAt_gte: dateStart.toISOString() },
                            { createdAt_lte: dateEnd.toISOString() },
                        ],
                    },
                    groupBy: [ 'day', 'status' ],
                },
            })
            expect(groups).toBeDefined()
            expect(groups).toHaveLength(1)
            expect(groups[0].count).toEqual(2)
        })

        it('can read TicketAnalyticsReportService grouped counts [status, day]', async () => {
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property)
            await createTestTicket(client, client.organization, client.property, { isPaid: true })
            await createTestTicket(client, client.organization, client.property, { isEmergency: true })
            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')
            const { data: { result: { groups } } } = await client.query(TICKET_ANALYTICS_REPORT_QUERY, {
                dv: 1,
                sender: { dv: 1, fingerprint: 'tests' },
                data: {
                    where: {
                        organization: { id: client.organization.id },
                        AND: [
                            { createdAt_gte: dateStart.toISOString() },
                            { createdAt_lte: dateEnd.toISOString() },
                            { isEmergency: true },
                        ],
                    },
                    groupBy: [ 'status', 'day' ],
                },
            })
            expect(groups).toBeDefined()
            expect(groups).toHaveLength(1)
            expect(groups[0].count).toEqual(1)
        })

        it('can read TicketAnalyticsReportService groupped with property filter', async () => {
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property)
            await createTestTicket(client, client.organization, client.property, { isPaid: true })
            await createTestTicket(client, client.organization, client.property, { isEmergency: true })

            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')
            const { data: { result: { groups } } } = await client.query(TICKET_ANALYTICS_REPORT_QUERY, {
                dv: 1,
                sender: { dv: 1, fingerprint: 'tests' },
                data: {
                    where: {
                        organization: { id: client.organization.id },
                        AND: [
                            { createdAt_gte: dateStart.toISOString() },
                            { createdAt_lte: dateEnd.toISOString() },
                            { property: { id_in: [ client.property.id ] } },
                            { isPaid: false },
                            { isEmergency: false },
                        ],
                    },
                    groupBy: [ 'property', 'status' ],
                },
            })
            expect(groups).toBeDefined()
            expect(groups).toHaveLength(1)
            expect(groups[0].count).toEqual(1)
            expect(groups[0].property).toEqual(client.property.address)
        })

        it('can not read TicketAnalyticsReportService from another organization', async () => {
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property)
            const wrongClient = await makeClientWithProperty()
            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')
            const { data: { result: { groups: emptyGroups } } } = await wrongClient.query(TICKET_ANALYTICS_REPORT_QUERY, {
                dv: 1,
                sender: { dv:1, fingerprint: 'tests' },
                data: {
                    where: {
                        organization: { id: wrongClient.organization.id },
                        AND: [
                            { createdAt_gte: dateStart.toISOString() },
                            { createdAt_lte: dateEnd.toISOString() },
                        ],
                    },
                    groupBy: [ 'day', 'status' ],
                },
            })

            const { data: { result: { groups } } } = await client.query(TICKET_ANALYTICS_REPORT_QUERY, {
                dv: 1,
                sender: { dv:1, fingerprint: 'tests' },
                data: {
                    where: {
                        organization: { id: client.organization.id },
                        AND: [
                            { createdAt_gte: dateStart.toISOString() },
                            { createdAt_lte: dateEnd.toISOString() },
                        ],
                    },
                    groupBy: [ 'day', 'status' ],
                },
            })

            expect(emptyGroups).toMatchObject({})
            expect(groups).toBeDefined()
            expect(groups).toHaveLength(1)
            expect(groups[0].count).toEqual(1)
        })

        it('can read exportTicketAnalyticsToExcel with selected organization', async () => {
            if (isObsConfigured()) {
                const client = await makeClientWithProperty()
                await createTestTicket(client, client.organization, client.property)
                const dateStart = dayjs().startOf('week')
                const dateEnd = dayjs().endOf('week')
                const { data: { result: { link } } }  = await client.query(EXPORT_TICKET_ANALYTICS_TO_EXCEL, {
                    dv: 1,
                    sender: { dv: 1, fingerprint: 'tests' },
                    data: {
                        where: {
                            organization: { id: client.organization.id },
                            AND: [
                                { createdAt_gte: dateStart.toISOString() },
                                { createdAt_lte: dateEnd.toISOString() },
                            ],
                        },
                        groupBy: ['status', 'day'],
                        translates: {
                            property: client.property.address,
                        },
                    },
                })
                expect(link).not.toHaveLength(0)
            }
        })

        it('can not read exportTicketAnalyticsToExcel from another organization', async () => {
            const admin = await makeLoggedInAdminClient()
            const [, userAttrs] = await createTestUser(admin)
            const restrictedClient = await makeLoggedInClient(userAttrs)
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property)
            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')
            const { data: { result }, errors } = await restrictedClient.query(EXPORT_TICKET_ANALYTICS_TO_EXCEL, {
                dv: 1,
                sender: { dv:1, fingerprint: 'tests' },
                data: {
                    where: {
                        organization: { id: client.organization.id },
                        AND: [
                            { createdAt_gte: dateStart.toISOString() },
                            { createdAt_lte: dateEnd.toISOString() },
                        ],
                    },
                    groupBy: ['day', 'status'],
                    translates: {
                        property: client.property.address,
                    },
                },
            })

            expect(result).toBeNull()
            expect(errors).toHaveLength(1)
            expect(errors[0].name).toEqual('AccessDeniedError')
        })
    })

    describe('Anonymous', () => {
        it('can not read TicketAnalyticsReportService', async () => {
            const client = await makeClient()
            const clientWithProperty = await makeClientWithProperty()
            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')
            const { errors, data: { result } } = await client.query(TICKET_ANALYTICS_REPORT_QUERY, {
                dv: 1, sender: { dv: 1, fingerprint: 'tests' },
                data: {
                    where: {
                        organization: { id: clientWithProperty.organization.id },
                        AND: [
                            { createdAt_gte: dateStart.toISOString() },
                            { createdAt_lte: dateEnd.toISOString() },
                        ],
                    },
                    groupBy: [ 'day', 'status' ],
                },
            })
            expect(result).toBeNull()
            expect(errors).toHaveLength(1)
            expect(errors[0].name).toEqual('AuthenticationError')
        })

        it('can not get ticket analytics export', async () => {
            const anonymousClient = await makeClient()
            const client = await makeClientWithProperty()
            await createTestTicket(client, client.organization, client.property)
            const dateStart = dayjs().startOf('week')
            const dateEnd = dayjs().endOf('week')
            const { data: { result }, errors } = await anonymousClient.query(EXPORT_TICKET_ANALYTICS_TO_EXCEL, {
                data: {
                    where: {
                        organization: { id: client.organization.id },
                        AND: [
                            { createdAt_gte: dateStart.toISOString() },
                            { createdAt_lte: dateEnd.toISOString() },
                        ],
                    },
                    groupBy: ['day', 'status'],
                    translates: {
                        property: client.property.address,
                    },
                },
            })

            expect(result).toBeNull()
            expect(errors).toHaveLength(1)
            expect(errors[0].name).toEqual('AuthenticationError')
        })
    })
})
