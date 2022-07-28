/**
 * Generated by `createschema ticket.TicketFile 'organization:Text;file?:File;ticket?:Relationship:Ticket:SET_NULL;'`
 */
const get = require('lodash/get')
const { Relationship, File } = require('@keystonejs/fields')
const { GQLListSchema, getById } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const access = require('@condo/domains/ticket/access/TicketFile')

const FileAdapter = require('@condo/domains/common/utils/fileAdapter')
const { getFileMetaAfterChange } = require('@condo/domains/common/utils/fileAdapter')

const TICKET_FILE_FOLDER_NAME = 'ticket'
const Adapter = new FileAdapter(TICKET_FILE_FOLDER_NAME)
const fileMetaAfterChange = getFileMetaAfterChange(Adapter)

// TODO(zuch): find a way to upload images in jest tests
// and make file field required
const TicketFile = new GQLListSchema('TicketFile', {
    schemaDoc: 'File attached to the ticket',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,
        organization: ORGANIZATION_OWNED_FIELD,
        file: {
            schemaDoc: 'File object with meta information and publicUrl',
            type: File,
            adapter: Adapter,
            isRequired: false,
        },
        ticket: {
            schemaDoc: 'Link to ticket',
            type: Relationship,
            ref: 'Ticket',
            many: false,
            isRequired: false,
            knexOptions: { isNotNullable: false }, // ticketFile can be without ticket on create (temporary)
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
            hooks: {
                validateInput: async ({ resolvedData, fieldPath, existingItem, addFieldValidationError }) => {
                    const ticketId = get(resolvedData, 'ticket')

                    if (ticketId) {
                        const ticketFileOrganizationId = resolvedData['organization'] || existingItem['organization']
                        const ticket = await getById('Ticket', ticketId)
                        const ticketOrganizationId = get(ticket, 'organization')

                        if (ticketOrganizationId !== ticketFileOrganizationId) {
                            addFieldValidationError(`${fieldPath} field validation error. Ticket organization doesn't match to TicketFile organization`)
                        }
                    }
                },
            },
        },
    },
    hooks: {
        afterChange: fileMetaAfterChange,
        afterDelete: async ({ existingItem }) => {
            if (existingItem.file) {
                await Adapter.delete(existingItem.file)
            }
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadTicketFiles,
        create: access.canManageTicketFiles,
        update: access.canManageTicketFiles,
        delete: false,
        auth: true,
    },
})

module.exports = {
    TicketFile,
}
