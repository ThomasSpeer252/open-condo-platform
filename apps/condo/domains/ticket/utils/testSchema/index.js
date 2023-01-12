/**
 * Generated by `createschema ticket.Ticket organization:Text; statusReopenedCounter:Integer; statusReason?:Text; status:Relationship:TicketStatus:PROTECT; number?:Integer; client?:Relationship:User:SET_NULL; clientName:Text; clientEmail:Text; clientPhone:Text; operator:Relationship:User:SET_NULL; assignee?:Relationship:User:SET_NULL; details:Text; meta?:Json;`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const faker = require('faker')
const { get } = require('lodash')
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { makeLoggedInAdminClient } = require('@open-condo/keystone/test.utils')
const { TICKET_STATUS_TYPES, ORGANIZATION_COMMENT_TYPE } = require('../../constants')
const { generateGQLTestUtils, throwIfError } = require('@open-condo/codegen/generate.test.utils')
const { Ticket: TicketGQL, EXPORT_TICKETS_TO_EXCEL } = require('@condo/domains/ticket/gql')
const {
    TicketStatus: TicketStatusGQL,
    TicketChange: TicketChangeGQL,
    TicketSource: TicketSourceGQL,
    TicketFile: TicketFileGQL,
    TicketComment: TicketCommentGQL,
    TicketPlaceClassifier: TicketPlaceClassifierGQL,
    TicketCategoryClassifier: TicketCategoryClassifierGQL,
    TicketProblemClassifier: TicketProblemClassifierGQL,
    TicketClassifier: TicketClassifierGQL,
} = require('@condo/domains/ticket/gql')
const { ResidentTicket: ResidentTicketGQL } = require('@condo/domains/ticket/gql')
const { TicketFilterTemplate: TicketFilterTemplateGQL } = require('@condo/domains/ticket/gql')
const { PREDICT_TICKET_CLASSIFICATION_QUERY } = require('@condo/domains/ticket/gql')
const { FLAT_UNIT_TYPE } = require("@condo/domains/property/constants/common");
const { TicketCommentFile: TicketCommentFileGQL } = require('@condo/domains/ticket/gql')
const { TicketCommentsTime: TicketCommentsTimeGQL } = require('@condo/domains/ticket/gql')
const { UserTicketCommentReadTime: UserTicketCommentReadTimeGQL } = require('@condo/domains/ticket/gql')
const { TicketPropertyHint: TicketPropertyHintGQL } = require('@condo/domains/ticket/gql')
const { TicketPropertyHintProperty: TicketPropertyHintPropertyGQL } = require('@condo/domains/ticket/gql')
const { TicketOrganizationSetting: TicketOrganizationSettingGQL } = require('@condo/domains/ticket/gql')
const { TicketExportTask: TicketExportTaskGQL } = require('@condo/domains/ticket/gql')
const { DEFAULT_ORGANIZATION_TIMEZONE } = require('@condo/domains/organization/constants/common')
const { EXCEL } = require('@condo/domains/common/constants/export')
const { Incident: IncidentGQL } = require('@condo/domains/ticket/gql')
const { IncidentProperty: IncidentPropertyGQL } = require('@condo/domains/ticket/gql')
const { IncidentTicketClassifier: IncidentTicketClassifierGQL } = require('@condo/domains/ticket/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const TICKET_OPEN_STATUS_ID ='6ef3abc4-022f-481b-90fb-8430345ebfc2'
const TICKET_OTHER_SOURCE_ID = '7da1e3be-06ba-4c9e-bba6-f97f278ac6e4'

const Ticket = generateGQLTestUtils(TicketGQL)
const TicketStatus = generateGQLTestUtils(TicketStatusGQL)
const TicketFile = generateGQLTestUtils(TicketFileGQL)
const TicketChange = generateGQLTestUtils(TicketChangeGQL)
const TicketSource = generateGQLTestUtils(TicketSourceGQL)
const TicketComment = generateGQLTestUtils(TicketCommentGQL)
const TicketPlaceClassifier = generateGQLTestUtils(TicketPlaceClassifierGQL)
const TicketCategoryClassifier = generateGQLTestUtils(TicketCategoryClassifierGQL)
const TicketProblemClassifier = generateGQLTestUtils(TicketProblemClassifierGQL)
const TicketClassifier = generateGQLTestUtils(TicketClassifierGQL)
const ResidentTicket = generateGQLTestUtils(ResidentTicketGQL)
const TicketFilterTemplate = generateGQLTestUtils(TicketFilterTemplateGQL)
const TicketCommentFile = generateGQLTestUtils(TicketCommentFileGQL)
const TicketCommentsTime = generateGQLTestUtils(TicketCommentsTimeGQL)
const UserTicketCommentReadTime = generateGQLTestUtils(UserTicketCommentReadTimeGQL)
const TicketPropertyHint = generateGQLTestUtils(TicketPropertyHintGQL)
const TicketPropertyHintProperty = generateGQLTestUtils(TicketPropertyHintPropertyGQL)
const TicketOrganizationSetting = generateGQLTestUtils(TicketOrganizationSettingGQL)
const TicketExportTask = generateGQLTestUtils(TicketExportTaskGQL)
const Incident = generateGQLTestUtils(IncidentGQL)
const IncidentProperty = generateGQLTestUtils(IncidentPropertyGQL)
const IncidentTicketClassifier = generateGQLTestUtils(IncidentTicketClassifierGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createTestTicket (client, organization, property, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    if (!property || !property.id) throw new Error('no property.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const details = faker.random.alphaNumeric(10)
    const unitName = faker.random.alphaNumeric(5)

    const attrs = {
        dv: 1,
        sender,
        details,
        unitName,
        unitType: FLAT_UNIT_TYPE,
        organization: { connect: { id: organization.id } },
        property: { connect: { id: property.id } },
        status: { connect: { id: TICKET_OPEN_STATUS_ID } },
        source: { connect: { id: TICKET_OTHER_SOURCE_ID } },
        isResidentTicket: false,
        ...extraAttrs,
    }
    const obj = await Ticket.create(client, attrs)
    return [obj, attrs]
}

async function updateTestTicket (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await Ticket.update(client, id, attrs)
    return [obj, attrs]
}

async function ticketStatusByType (client) {
    const statuses = await TicketStatus.getAll(client)
    return Object.fromEntries(statuses.map(status => [status.type, status.id]))
}

async function createTestTicketStatus (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const name = faker.random.alphaNumeric(8)
    const type = faker.random.arrayElement(TICKET_STATUS_TYPES)

    const attrs = {
        dv: 1,
        sender,
        name, type,
        ...extraAttrs,
    }
    const obj = await TicketStatus.create(client, attrs)
    return [obj, attrs]
}

async function updateTestTicketStatus (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await TicketStatus.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestTicketChange (client, ticket, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!ticket || !ticket.id) throw new Error('no ticket.id')

    const attrs = {
        dv: 1,
        ticket: { connect: { id: ticket.id } },
        ...extraAttrs,
    }
    const obj = await TicketChange.create(client, attrs)
    return [obj, attrs]
}

async function updateTestTicketChange (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await TicketChange.update(client, id, attrs)
    return [obj, attrs]
}


async function createTestTicketFile (client, ticket, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const ticketConnection = (ticket && ticket.id) ? { ticket: { connect: { id: ticket.id } } } : {}
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const attrs = {
        dv: 1,
        sender,
        ...ticketConnection,
        ...extraAttrs,
    }
    const obj = await TicketFile.create(client, attrs)
    return [obj, attrs]
}

async function updateTestTicketFile (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await TicketFile.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestTicketComment (client, ticket, user, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!ticket || !ticket.id) throw new Error('no ticket.id')
    if (!user || !user.id) throw new Error('no user.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const content = faker.random.alphaNumeric(10)

    const attrs = {
        dv: 1,
        sender,
        ticket: { connect: { id: ticket.id } },
        user: { connect: { id: user.id } },
        type: ORGANIZATION_COMMENT_TYPE,
        content,
        ...extraAttrs,
    }
    const obj = await TicketComment.create(client, attrs)
    return [obj, attrs]
}

async function updateTestTicketComment (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        content: faker.random.alphaNumeric(10),
        ...extraAttrs,
    }
    const obj = await TicketComment.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestTicketPlaceClassifier (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const attrs = {
        dv: 1,
        name: faker.lorem.word(),
        sender,
        ...extraAttrs,
    }
    const obj = await TicketPlaceClassifier.create(client, attrs)
    return [obj, attrs]
}

async function updateTestTicketPlaceClassifier (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await TicketPlaceClassifier.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestTicketCategoryClassifier (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const attrs = {
        dv: 1,
        sender,
        name: faker.lorem.word(),
        ...extraAttrs,
    }
    const obj = await TicketCategoryClassifier.create(client, attrs)
    return [obj, attrs]
}

async function updateTestTicketCategoryClassifier (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await TicketCategoryClassifier.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestTicketProblemClassifier (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const attrs = {
        dv: 1,
        sender,
        name: faker.lorem.word(),
        ...extraAttrs,
    }
    const obj = await TicketProblemClassifier.create(client, attrs)
    return [obj, attrs]
}

async function updateTestTicketProblemClassifier (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await TicketProblemClassifier.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestTicketClassifier (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const admin = await makeLoggedInAdminClient()
    const [place] = await createTestTicketPlaceClassifier(admin)
    const [category] = await createTestTicketCategoryClassifier(admin)
    const [problem] = await createTestTicketProblemClassifier(admin)
    const attrs = {
        dv: 1,
        sender,
        place: { connect: { id: place.id } },
        category: { connect: { id: category.id } },
        problem: { connect: { id: problem.id } },
        ...extraAttrs,
    }
    const obj = await TicketClassifier.create(client, attrs)
    return [obj, attrs]
}

async function updateTestTicketClassifier (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await TicketClassifier.update(client, id, attrs)
    return [obj, attrs]
}

const TICKET_MOBILE_SOURCE_ID = '3068d49a-a45c-4c3a-a02d-ea1a53e1febb'

async function createResidentTicketByTestClient(client, property, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        details: faker.lorem.words(),
        property: { connect: { id: get(property, 'id') } },
        source: { connect: { id: TICKET_MOBILE_SOURCE_ID } },
        ...extraAttrs,
    }
    const obj = await ResidentTicket.create(client, attrs)
    return [obj, attrs]
}

async function updateResidentTicketByTestClient(client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await ResidentTicket.update(client, id, attrs)
    return [obj, attrs]
}
async function createTestTicketFilterTemplate (client, employee, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!employee || !employee.id) throw new Error('no employee.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const name = faker.random.alphaNumeric(5)
    const ticketUnitFilter = [faker.random.alphaNumeric(5)]
    const fields = { unitName: ticketUnitFilter }

    const attrs = {
        dv: 1,
        sender,
        employee: { connect: { id: employee.id } },
        name,
        fields,
        ...extraAttrs,
    }
    const obj = await TicketFilterTemplate.create(client, attrs)
    return [obj, attrs]
}

async function updateTestTicketFilterTemplate (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await TicketFilterTemplate.update(client, id, attrs)
    return [obj, attrs]
}

async function predictTicketClassificationByTestClient(client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const attrs = {
        details: faker.lorem.words(),
        ...extraAttrs,
    }
    const { data, errors } = await client.query(PREDICT_TICKET_CLASSIFICATION_QUERY, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function createTestTicketCommentFile (client, ticket, ticketComment, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const ticketCommentConnection = (ticketComment && ticketComment.id) ? { ticketComment: { connect: { id: ticketComment.id } } } : {}
    const ticketConnection = (ticket && ticket.id) ? { ticket: { connect: { id: ticket.id } } } : {}
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...ticketConnection,
        ...ticketCommentConnection,
        ...extraAttrs,
    }
    const obj = await TicketCommentFile.create(client, attrs)
    return [obj, attrs]
}

async function updateTestTicketCommentFile (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await TicketCommentFile.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestTicketCommentsTime (client, organization, ticket, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    if (!ticket || !ticket.id) throw new Error('no ticket.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        organization: { connect: { id: organization.id } },
        ticket: { connect: { id: ticket.id } },
        ...extraAttrs,
    }
    const obj = await TicketCommentsTime.create(client, attrs)
    return [obj, attrs]
}

async function updateTestTicketCommentsTime (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await TicketCommentsTime.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestUserTicketCommentReadTime (client, user, ticket, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!user || !user.id) throw new Error('no user.id')
    if (!ticket || !ticket.id) throw new Error('no ticket.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    const now = new Date().toISOString()

    const attrs = {
        dv: 1,
        sender,
        user: { connect: { id: user.id } },
        ticket: { connect: { id: ticket.id } },
        readResidentCommentAt: now,
        readCommentAt: now,
        ...extraAttrs,
    }
    const obj = await UserTicketCommentReadTime.create(client, attrs)
    return [obj, attrs]
}

async function updateTestUserTicketCommentReadTime (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await UserTicketCommentReadTime.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestTicketPropertyHint (client, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        organization: { connect: { id: organization.id } },
        content: extraAttrs.content || faker.random.alphaNumeric(5),
        ...extraAttrs,
    }
    const obj = await TicketPropertyHint.create(client, attrs)
    return [obj, attrs]
}

async function updateTestTicketPropertyHint (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await TicketPropertyHint.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestTicketPropertyHintProperty (client, ticketHint, property, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!ticketHint || !ticketHint.id) throw new Error('no ticketHint.id')
    if (!property || !property.id) throw new Error('no property.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ticketPropertyHint: { connect: { id: ticketHint.id } },
        property: { connect: { id: property.id } },
        ...extraAttrs,
    }
    const obj = await TicketPropertyHintProperty.create(client, attrs)
    return [obj, attrs]
}

async function updateTestTicketPropertyHintProperty (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await TicketPropertyHintProperty.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestTicketOrganizationSetting (client, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        organization: { connect: { id: organization.id } },
        ...extraAttrs,
    }
    const obj = await TicketOrganizationSetting.create(client, attrs)
    return [obj, attrs]
}

async function updateTestTicketOrganizationSetting (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await TicketOrganizationSetting.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestTicketExportTask (client, user, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        format: EXCEL,
        where: {},
        sortBy: {},
        locale: 'ru',
        timeZone: 'Europe/Moscow',
        user: { connect: { id: user.id } },
        ...extraAttrs,
    }
    const obj = await TicketExportTask.create(client, attrs)
    return [obj, attrs]
}

async function updateTestTicketExportTask (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await TicketExportTask.update(client, id, attrs)
    return [obj, attrs]
}

async function exportTestTicketsToExcel (client, where={}, data={}) {
    const { data: { result: { task } } } = await client.query(EXPORT_TICKETS_TO_EXCEL, {
        data: {
            dv: 1,
            sender: { dv: 1, fingerprint: 'test-' + faker.random.alphaNumeric(8) },
            where,
            sortBy: 'id_ASC',
            timeZone: DEFAULT_ORGANIZATION_TIMEZONE,
            ...data,
        },
    })

    return task
}

async function createTestIncident (client, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        organization: { connect: { id: organization.id } },
        ...extraAttrs,
    }
    const obj = await Incident.create(client, attrs)
    return [obj, attrs]
}

async function updateTestIncident (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await Incident.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestIncidentProperty (client, incident, property, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!incident || !incident.id) throw new Error('no incident.id')
    if (!property || !property.id) throw new Error('no property.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        incident: { connect: { id: incident.id } },
        property: { connect: { id: property.id } },
        ...extraAttrs,
    }
    const obj = await IncidentProperty.create(client, attrs)
    return [obj, attrs]
}

async function updateTestIncidentProperty (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await IncidentProperty.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestIncidentTicketClassifier (client, incident, classifier, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!incident || !incident.id) throw new Error('no incident.id')
    if (!classifier || !classifier.id) throw new Error('no classifier.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        incident: { connect: { id: incident.id } },
        classifier: { connect: { id: classifier.id } },
        ...extraAttrs,
    }
    const obj = await IncidentTicketClassifier.create(client, attrs)
    return [obj, attrs]
}

async function updateTestIncidentTicketClassifier (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await IncidentTicketClassifier.update(client, id, attrs)
    return [obj, attrs]
}

/* AUTOGENERATE MARKER <FACTORY> */

async function makeClientWithTicket () {
    const client = await makeClientWithProperty()
    const [ticket] = await createTestTicket(client, client.organization, client.property)
    client.ticket = ticket
    return client
}

module.exports = {
    Ticket,
    TicketFile,
    TicketChange,
    TicketStatus,
    TicketSource,
    ResidentTicket,
    createTestTicket,
    updateTestTicket,
    ticketStatusByType,
    createTestTicketStatus,
    updateTestTicketStatus,
    createTestTicketFile,
    updateTestTicketFile,
    createTestTicketChange,
    updateTestTicketChange,
    makeClientWithTicket,
    TicketPlaceClassifier,
    TicketCategoryClassifier,
    TicketProblemClassifier,
    TicketClassifier,
    TicketComment, createTestTicketComment, updateTestTicketComment,
    createTestTicketPlaceClassifier, updateTestTicketPlaceClassifier, createTestTicketCategoryClassifier, updateTestTicketCategoryClassifier, createTestTicketProblemClassifier, updateTestTicketProblemClassifier, createTestTicketClassifier, updateTestTicketClassifier,
    createResidentTicketByTestClient,
    updateResidentTicketByTestClient,
    TicketFilterTemplate, createTestTicketFilterTemplate, updateTestTicketFilterTemplate,
    predictTicketClassificationByTestClient,
    TicketCommentFile, createTestTicketCommentFile, updateTestTicketCommentFile,
    TicketCommentsTime, createTestTicketCommentsTime, updateTestTicketCommentsTime,
    UserTicketCommentReadTime, createTestUserTicketCommentReadTime, updateTestUserTicketCommentReadTime,
    TicketPropertyHint, createTestTicketPropertyHint, updateTestTicketPropertyHint,
    TicketPropertyHintProperty, createTestTicketPropertyHintProperty, updateTestTicketPropertyHintProperty,
    TicketOrganizationSetting, createTestTicketOrganizationSetting, updateTestTicketOrganizationSetting,
    TicketExportTask, createTestTicketExportTask, updateTestTicketExportTask,
    exportTestTicketsToExcel,
    Incident, createTestIncident, updateTestIncident,
    IncidentProperty, createTestIncidentProperty, updateTestIncidentProperty,
    IncidentTicketClassifier, createTestIncidentTicketClassifier, updateTestIncidentTicketClassifier,
/* AUTOGENERATE MARKER <EXPORTS> */
}
