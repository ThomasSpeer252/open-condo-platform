/**
 * Generated by `createschema ticket.Ticket organization:Text; statusReopenedCounter:Integer; statusReason?:Text; status:Relationship:TicketStatus:PROTECT; number?:Integer; client?:Relationship:User:SET_NULL; clientName:Text; clientEmail:Text; clientPhone:Text; operator:Relationship:User:SET_NULL; assignee?:Relationship:User:SET_NULL; classifier:Relationship:TicketClassifier:PROTECT; details:Text; meta?:Json;`
 */
const { makeClientWithProperty } = require('@condo/domains/property/schema/Property.test')
const { NUMBER_RE, UUID_RE, DATETIME_RE, makeClient } = require('@core/keystone/test.utils')

const { Ticket, createTestTicket, updateTestTicket } = require('@condo/domains/ticket/utils/testSchema')

describe('Ticket', () => {
    test('user: create Ticket', async () => {
        const client = await makeClientWithProperty()
        const [obj, attrs] = await createTestTicket(client, client.organization, client.property)
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
        expect(obj.organization).toEqual(expect.objectContaining({ id: client.organization.id }))
        expect(String(obj.number)).toMatch(NUMBER_RE)
        expect(obj.source).toEqual(expect.objectContaining({ id: attrs.source.connect.id }))
        expect(obj.sourceMeta).toEqual(null)
        expect(obj.classifier).toEqual(expect.objectContaining({ id: attrs.classifier.connect.id }))
        expect(obj.property).toEqual(expect.objectContaining({ id: client.property.id }))
        expect(obj.status).toEqual(expect.objectContaining({ id: attrs.status.connect.id }))
        expect(obj.statusReopenedCounter).toEqual(0)
        expect(obj.statusReason).toEqual(null)
        expect(obj.statusUpdatedAt).toBeNull()
        expect(obj.details).toEqual(attrs.details)
        expect(obj.isPaid).toEqual(false)
        expect(obj.isEmergency).toEqual(false)
        expect(obj.meta).toEqual(null)
        expect(obj.client).toEqual(null)
        expect(obj.operator).toEqual(null)
        expect(obj.assignee).toEqual(null)
        expect(obj.executor).toEqual(null)
        expect(obj.watchers).toEqual([])
    })

    test('anonymous: create Ticket', async () => {
        const client1 = await makeClientWithProperty()
        const client = await makeClient()
        try {
            await createTestTicket(client, client1.organization, client1.property)
        } catch (e) {
            expect(e.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['obj'],
            })
            expect(e.data).toEqual({ 'obj': null })
        }
    })

    test.skip('user: read Ticket', async () => {
        const client = await makeClientWithProperty()
        const [obj, attrs] = await createTestTicket(client, client.organization, client.property)
        const objs = await Ticket.getAll(client)
        expect(objs).toHaveLength(1)
        expect(objs[0].id).toMatch(obj.id)
        expect(objs[0].dv).toEqual(1)
        expect(objs[0].sender).toEqual(attrs.sender)
        expect(objs[0].v).toEqual(1)
        expect(objs[0].newId).toEqual(null)
        expect(objs[0].deletedAt).toEqual(null)
        expect(objs[0].createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
        expect(objs[0].updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
        expect(objs[0].createdAt).toMatch(obj.createdAt)
        expect(objs[0].updatedAt).toMatch(obj.updatedAt)
    })

    test('anonymous: read Ticket', async () => {
        const client = await makeClient()

        try {
            await Ticket.getAll(client)
        } catch (e) {
            expect(e.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['objs'],
            })
            expect(e.data).toEqual({ 'objs': null })
        }
    })

    test.skip('user: update Ticket', async () => {
        const client = await makeClientWithProperty()
        const payload = { details: 'new data' }
        const [objCreated] = await createTestTicket(client, client.organization, client.property)

        const [objUpdated, attrs] = await updateTestTicket(client, objCreated.id, payload)

        expect(objUpdated.id).toEqual(objCreated.id)
        expect(objUpdated.dv).toEqual(1)
        expect(objUpdated.sender).toEqual(attrs.sender)
        expect(objUpdated.v).toEqual(2)
        expect(objUpdated.newId).toEqual(null)
        expect(objUpdated.deletedAt).toEqual(null)
        expect(objUpdated.createdBy).toEqual(expect.objectContaining({ id: client.user.id }))
        expect(objUpdated.updatedBy).toEqual(expect.objectContaining({ id: client.user.id }))
        expect(objUpdated.createdAt).toMatch(DATETIME_RE)
        expect(objUpdated.updatedAt).toMatch(DATETIME_RE)
        expect(objUpdated.updatedAt).not.toEqual(objUpdated.createdAt)
        expect(objUpdated.details).toEqual(payload.details)
        expect(objUpdated.organization).toEqual(expect.objectContaining({ id: client.organization.id }))
        expect(objUpdated.number).toEqual(objCreated.number) 
        expect(objUpdated.source).toEqual(expect.objectContaining({ id: objCreated.organization.id }))
        // TODO(pahaz): check others fields ...
    })

    test('anonymous: update Ticket', async () => {
        const client1 = await makeClientWithProperty()
        const client = await makeClient()
        const payload = { details: 'new data' }
        const [objCreated] = await createTestTicket(client1, client1.organization, client1.property)
        try {
            await updateTestTicket(client, objCreated.id, payload)
        } catch (e) {
            expect(e.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['obj'],
            })
            expect(e.data).toEqual({ 'obj': null })
        }
    })

    test('user: delete Ticket', async () => {
        const client = await makeClientWithProperty()
        const [objCreated] = await createTestTicket(client, client.organization, client.property)
        try {
            await Ticket.delete(client, objCreated.id)
        } catch (e) {
            expect(e.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['obj'],
            })
            expect(e.data).toEqual({ 'obj': null })
        }
    })

    test('anonymous: delete Ticket', async () => {
        const client1 = await makeClientWithProperty()
        const client = await makeClient()
        const [objCreated] = await createTestTicket(client1, client1.organization, client1.property)
        try {
            await Ticket.delete(client, objCreated.id)
        } catch (e) {
            expect(e.errors[0]).toMatchObject({
                'message': 'You do not have access to this resource',
                'name': 'AccessDeniedError',
                'path': ['obj'],
            })
            expect(e.data).toEqual({ 'obj': null })
        }
    })
})
