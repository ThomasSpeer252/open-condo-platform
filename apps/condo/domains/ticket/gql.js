/**
 * Generated by `createschema ticket.Ticket organization:Text; statusReopenedCounter:Integer; statusReason?:Text; status:Relationship:TicketStatus:PROTECT; number?:Integer; client?:Relationship:User:SET_NULL; clientName:Text; clientEmail:Text; clientPhone:Text; operator:Relationship:User:SET_NULL; assignee?:Relationship:User:SET_NULL; classifier:Relationship:TicketClassifier:PROTECT; details:Text; meta?:Json;`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateGqlQueries } = require('@condo/domains/common/utils/codegeneration/generate.gql')
const { gql } = require('graphql-tag')
const COMMON_FIELDS = 'id dv sender v deletedAt newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const TICKET_FIELDS = `{ organization { id name } property { id name address } unitName sectionName floorName status { id name type organization { id } colors } statusReopenedCounter statusUpdatedAt statusReason number client { id name } clientName clientEmail clientPhone contact { id name } operator { id name } assignee { id name } executor { id name } watchers { id name } classifier { id name organization { id } parent { id name } } details related { id details } isEmergency isPaid meta source { id name type } sourceMeta ${COMMON_FIELDS} }`
const Ticket = generateGqlQueries('Ticket', TICKET_FIELDS)

const TICKET_STATUS_FIELDS = `{ organization { id } type name colors ${COMMON_FIELDS} }`
const TicketStatus = generateGqlQueries('TicketStatus', TICKET_STATUS_FIELDS)

const TICKET_SOURCE_FIELDS = `{ organization { id } type name ${COMMON_FIELDS} }`
const TicketSource = generateGqlQueries('TicketSource', TICKET_SOURCE_FIELDS)

const TICKET_CLASSIFIER_FIELDS = `{ organization { id } parent { id } fullName name ${COMMON_FIELDS} }`
const TicketClassifier = generateGqlQueries('TicketClassifier', TICKET_CLASSIFIER_FIELDS)

/*
    We cannot use generated fields from TicketChange here, because we will have circular dependency,
    by requiring something from ./schema modules, that will cause all required items to be undefined.
    So, do it by hands here.
    PS: not exactly by hands, pasted from debugger ;)
*/
const TICKET_CHANGE_DATA_FIELDS = [
    'statusReopenedCounterFrom',
    'statusReopenedCounterTo',
    'statusReasonFrom',
    'statusReasonTo',
    'numberFrom',
    'numberTo',
    'clientNameFrom',
    'clientNameTo',
    'clientEmailFrom',
    'clientEmailTo',
    'clientPhoneFrom',
    'clientPhoneTo',
    'detailsFrom',
    'detailsTo',
    'isPaidFrom',
    'isPaidTo',
    'isEmergencyFrom',
    'isEmergencyTo',
    'metaFrom',
    'metaTo',
    'sectionNameFrom',
    'sectionNameTo',
    'floorNameFrom',
    'floorNameTo',
    'unitNameFrom',
    'unitNameTo',
    'sourceMetaFrom',
    'sourceMetaTo',
    'organizationIdFrom',
    'organizationIdTo',
    'organizationDisplayNameFrom',
    'organizationDisplayNameTo',
    'statusIdFrom',
    'statusIdTo',
    'statusDisplayNameFrom',
    'statusDisplayNameTo',
    'clientIdFrom',
    'clientIdTo',
    'clientDisplayNameFrom',
    'clientDisplayNameTo',
    'contactIdFrom',
    'contactIdTo',
    'contactDisplayNameFrom',
    'contactDisplayNameTo',
    'operatorIdFrom',
    'operatorIdTo',
    'operatorDisplayNameFrom',
    'operatorDisplayNameTo',
    'assigneeIdFrom',
    'assigneeIdTo',
    'assigneeDisplayNameFrom',
    'assigneeDisplayNameTo',
    'executorIdFrom',
    'executorIdTo',
    'executorDisplayNameFrom',
    'executorDisplayNameTo',
    'classifierIdFrom',
    'classifierIdTo',
    'classifierDisplayNameFrom',
    'classifierDisplayNameTo',
    'relatedIdFrom',
    'relatedIdTo',
    'relatedDisplayNameFrom',
    'relatedDisplayNameTo',
    'propertyIdFrom',
    'propertyIdTo',
    'propertyDisplayNameFrom',
    'propertyDisplayNameTo',
    'sourceIdFrom',
    'sourceIdTo',
    'sourceDisplayNameFrom',
    'sourceDisplayNameTo',
    'watchersIdsFrom',
    'watchersIdsTo',
    'watchersDisplayNamesFrom',
    'watchersDisplayNamesTo',
]

const TICKET_CHANGE_FIELDS = `{ ticket { id property { address } } id dv sender v createdBy { id name } updatedBy { id name } createdAt updatedAt ${TICKET_CHANGE_DATA_FIELDS.join(' ')} }`
const TicketChange = generateGqlQueries('TicketChange', TICKET_CHANGE_FIELDS)

const TICKET_FILE_FIELDS = `{ id file { id originalFilename publicUrl mimetype } organization { id } ticket { id } ${COMMON_FIELDS} }`
const TicketFile = generateGqlQueries('TicketFile', TICKET_FILE_FIELDS)

const TICKET_COMMENT_FIELDS = `{ ticket { id } user { id name } content ${COMMON_FIELDS} }`
const TicketComment = generateGqlQueries('TicketComment', TICKET_COMMENT_FIELDS)

/* AUTOGENERATE MARKER <CONST> */
const XLS_EXPORT_LIMIT = 100
// If there is no limit - error "maxTotalResults","limit":1000 - will take place
// TODO(zuch): Xls export on server side and make xls exports look better

const GET_ALL_TICKET_FOR_XLS_EXPORT = gql`
    query GetAllTicketsForXLS ($where: TicketWhereInput!, $sortBy: [SortTicketsBy!]) {
        tickets: allTickets(where: $where, sortBy: $sortBy, first: ${XLS_EXPORT_LIMIT}) {
            number
            status { id name }
            details
            property { id name }
            assignee { id name }
            executor { id name }
            createdAt
            clientName
        }  
  }
`

const GET_TICKET_WIDGET_REPORT_DATA = gql`
    query getWidgetData ($data: TicketReportWidgetInput!) {
        result: ticketReportWidgetData(data: $data) { data }
    }
`

module.exports = {
    Ticket,
    TicketStatus,
    TicketChange,
    TicketSource,
    TicketClassifier,
    TicketFile,
    TICKET_CHANGE_DATA_FIELDS,
    GET_ALL_TICKET_FOR_XLS_EXPORT,
    GET_TICKET_WIDGET_REPORT_DATA,
    TicketComment,
/* AUTOGENERATE MARKER <EXPORTS> */
}
