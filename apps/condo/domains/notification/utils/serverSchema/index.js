/**
 * Generated by `createschema notification.Message 'organization?:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; ticket?:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; type:Text; meta:Json; channels:Json; status:Select:sending,planned,sent,canceled; sendAt:DateTimeUtc;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { LOCALES } = require('@condo/domains/common/constants/locale')
const { MESSAGE_TYPES } = require('../../constants')
const { generateServerUtils, execGqlWithoutAccess } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')

const { Message: MessageGQL } = require('@condo/domains/notification/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const { SEND_MESSAGE, RESEND_MESSAGE } = require('../../gql')

const Message = generateServerUtils(MessageGQL)

async function sendMessage (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')
    if (!data.to) throw new Error('no data.to')
    if (!data.to.email && !data.to.phone && !data.to.user) throw new Error('wrong data.to')
    if (!data.type) throw new Error('no data.type')
    if (!MESSAGE_TYPES.includes(data.type)) throw new Error('unknown data.type')
    if (!Object.keys(LOCALES).includes(data.lang)) throw new Error('unknown data.lang')

    return await execGqlWithoutAccess(context, {
        query: SEND_MESSAGE,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to sendMessage',
        dataPath: 'result',
    })
}

async function resendMessage (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.message || !data.message.id) throw new Error('no data.message')

    return await execGqlWithoutAccess(context, {
        query: RESEND_MESSAGE,
        variables: { data },
        errorMessage: '[error] Unable to resendMessage',
        dataPath: 'result',
    })
}

/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    Message, sendMessage, resendMessage,
    /* AUTOGENERATE MARKER <EXPORTS> */
}
