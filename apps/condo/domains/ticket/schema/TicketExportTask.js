/**
 * Generated by `createschema ticket.TicketExportTask 'status:Select:processing,completed,error; format:Select:excel; exportedRecordsCount:Integer; totalRecordsCount:Integer; file?:File; meta?:Json'`
 */

const { Text, Integer, Select, File } = require('@keystonejs/fields')
const { Json } = require('@condo/keystone/fields')
const { GQLListSchema } = require('@condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@condo/keystone/plugins')
const { dvAndSender } = require('@condo/domains/common/schema/plugins/dvAndSender')
const access = require('@condo/domains/ticket/access/TicketExportTask')
const { EXPORT_STATUS_VALUES, EXPORT_FORMAT_VALUES, PROCESSING } = require('@condo/domains/common/constants/export')
const FileAdapter = require('@condo/domains/common/utils/fileAdapter')
const { normalizeTimeZone } = require('@condo/domains/common/utils/timezone')
const { DEFAULT_ORGANIZATION_TIMEZONE } = require('@condo/domains/organization/constants/common')
const { extractReqLocale } = require('@condo/locales/extractReqLocale')
const conf = require('@condo/config')
const { exportTicketsTask } = require('../tasks/exportTicketsTask')
const { getFileMetaAfterChange } = require('../../common/utils/fileAdapter')

const TICKET_EXPORT_TASK_FOLDER_NAME = 'TicketExportTask'
const TicketExportTaskFileAdapter = new FileAdapter(TICKET_EXPORT_TASK_FOLDER_NAME)

const setFileMetaAfterChange = getFileMetaAfterChange(TicketExportTaskFileAdapter, 'file')

const TicketExportTask = new GQLListSchema('TicketExportTask', {
    schemaDoc: 'Stores requested export format, status of export job, link to exported file and information about progress of export job',
    fields: {

        status: {
            schemaDoc: 'Status of export job',
            type: Select,
            options: EXPORT_STATUS_VALUES,
            isRequired: true,
            defaultValue: PROCESSING,
        },

        format: {
            schemaDoc: 'Requested export file format',
            type: Select,
            options: EXPORT_FORMAT_VALUES,
            isRequired: true,
        },

        exportedRecordsCount: {
            schemaDoc: 'How many records at the moment are exported',
            type: Integer,
            isRequired: true,
            defaultValue: 0,
        },

        totalRecordsCount: {
            schemaDoc: 'Total records to export. Can be unknown due to implementation specifics',
            type: Integer,
            isRequired: false,
            defaultValue: 0,
        },

        file: {
            schemaDoc: 'Meta information about file, saved outside of database somewhere. Shape of meta information JSON object is specific to file adapter, used by saving a file.',
            type: File,
            adapter: TicketExportTaskFileAdapter,
        },

        meta: {
            schemaDoc: 'Stores information about query and ids of exported and failed records',
            type: Json,
        },

        where: {
            schemaDoc: 'Filtering conditions for records to export',
            type: Json,
            isRequired: true,
            // TODO(antonal): add validation by reusing `TicketWhereInput` as a GraphQL type
        },

        sortBy: {
            schemaDoc: 'Sorting parameters for records to export',
            type: Json,
            isRequired: true,
            // TODO(antonal): add validation by reusing `SortTicketsBy` as a GraphQL type
        },

        locale: {
            schemaDoc: 'Requested export locale, in that the resulting file will be rendered',
            type: Text,
            isRequired: true,
            hooks: {
                resolveInput: async ({ context }) => {
                    return extractReqLocale(context.req) || conf.DEFAULT_LOCALE
                },
            },
        },

        timeZone: {
            schemaDoc: 'To requested timeZone all datetime fields will be converted',
            type: Text,
            isRequired: true,
            hooks: {
                resolveInput: async ({ resolvedData }) => {
                    const { timeZoneFromUser } = resolvedData
                    return normalizeTimeZone(timeZoneFromUser) || DEFAULT_ORGANIZATION_TIMEZONE
                },
            },
        },

        user: {
            schemaDoc: 'User that requested this exporting operation. Will be used for read access checks to display all exported tasks somewhere and to display progress indicator of ongoing exporting task for current user',
            type: 'Relationship',
            ref: 'User',
            isRequired: true,
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
            knexOptions: { isNotNullable: true },
        },

    },
    hooks: {
        // `updatedItem` means "The new/currently stored item" in Keystone
        afterChange: async (args) => {
            const { updatedItem, operation } = args
            await setFileMetaAfterChange(args)
            if (operation === 'create') {
                await exportTicketsTask.delay(updatedItem.id)
            }
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadTicketExportTasks,
        create: access.canManageTicketExportTasks,
        update: access.canManageTicketExportTasks,
        delete: false,
        auth: true,
    },
})

module.exports = {
    TicketExportTask,
}
