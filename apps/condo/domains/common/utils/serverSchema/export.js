const { EXPORT_PROCESSING_BATCH_SIZE } = require('../../constants/export')
const { COMPLETED } = require('@condo/domains/common/constants/export')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@condo/keystone/errors')
const { NOTHING_TO_EXPORT } = require('@condo/domains/common/constants/errors')
const { TASK_WORKER_FINGERPRINT } = require('@condo/domains/common/constants/tasks')
const Upload = require('graphql-upload/public/Upload')

const errors = {
    NOTHING_TO_EXPORT: {
        code: BAD_USER_INPUT,
        type: NOTHING_TO_EXPORT,
        message: 'No records to export for {schema} with id "{id}"',
        messageForUser: 'tasks.export.error.NOTHING_TO_EXPORT',
    },
}

/**
 * Common fields of export task record
 *
 * @typedef ExportTask
 * @property {Number} id
 * @property {Number} exportedRecordsCount
 * @property {Number} totalRecordsCount
 */

/**
 * Converts record fetched from database to file row JSON representation
 * @typedef ConvertRecordToFileRowFunction
 */

/**
 * Loads records batch with specified offset and limit
 * @typedef LoadRecordsBatchFunction
 */

/**
 * Queries records in batches to avoid database overload, converts them to file rows representation
 * @param {Object} args
 * @param args.context - Keystone context
 * @param {LoadRecordsBatchFunction} args.loadRecordsBatch - function to load a batch of records
 * @param {ConvertRecordToFileRowFunction} args.convertRecordToFileRow - function to convert record to file row JSON representation
 * @param {ExportTask} args.task - task schema record that needs to be updated during operation progress
 * @param args.taskServerUtils - utils from serverSchema
 * @return {Promise<*[]>} - JSON representation of file rows, that will be saved to file
 */
const loadRecordsAndConvertToFileRows = async ({ context, loadRecordsBatch, convertRecordToFileRow, task: { id: taskId }, taskServerUtils }) => {
    let hasMore
    let offset = 0
    let rows = []
    let task // a fresh record we are working with

    do {
        const batch = await loadRecordsBatch(offset, EXPORT_PROCESSING_BATCH_SIZE)
        if (batch.length === 0) {
            if (offset === 0) {
                await taskServerUtils.update(context, taskId, {
                    dv: 1,
                    sender: {
                        dv: 1,
                        fingerprint: TASK_WORKER_FINGERPRINT,
                    },
                    status: COMPLETED,
                })
                throw new GQLError({
                    ...errors.NOTHING_TO_EXPORT,
                    messageInterpolation: {
                        schema: taskServerUtils.gql.SINGULAR_FORM,
                        id: taskId,
                    },
                })
            }
        } else {
            const convertedRecords = await Promise.all(batch.map(convertRecordToFileRow))
            rows = [
                ...rows,
                ...convertedRecords,
            ]

            task = await taskServerUtils.getOne(context, { id: taskId })
            // NOTE: Ideally, we need a kind of `increment` method in utils for server schema.
            // Suppose, that in future `loadRecordsAndConvertToFileRows` function will
            // be called to process chunks in parallel, so, theoretically, between fetching of fresh
            // task record above and next update below, another process can try to update the record,
            // and both processes will add `batch.length` to the same value
            task = await taskServerUtils.update(context, taskId, {
                dv: 1,
                sender: {
                    dv: 1,
                    fingerprint: TASK_WORKER_FINGERPRINT,
                },
                exportedRecordsCount: (task && task.exportedRecordsCount || 0) + batch.length,
            })
        }

        offset += EXPORT_PROCESSING_BATCH_SIZE
        // Handle case when we know total records to export and when we don't know and relying on presence of fetched records by fact
        hasMore = (task.totalRecordsCount && offset < task.totalRecordsCount) || (!task.totalRecordsCount && batch.length > 0)
    } while (hasMore)

    return rows
}

const buildUploadInputFrom = ({ stream, filename, mimetype, encoding, meta }) => {
    const uploadData = {
        createReadStream: () => {
            return stream
        },
        filename,
        mimetype,
        encoding,
        meta,
    }
    const uploadInput = new Upload()
    uploadInput.promise = new Promise(resolve => {
        resolve(uploadData)
    })
    return uploadInput
}

// TODO(antonal): write tests with mocks of `taskServerUtils`. Currently this util is tested for domain-specific usage

const exportRecords = async ({ context, loadRecordsBatch, convertRecordToFileRow, buildExportFile, task, taskServerUtils }) => (
    loadRecordsAndConvertToFileRows({
        context,
        loadRecordsBatch,
        convertRecordToFileRow,
        task,
        taskServerUtils,
    })
        .then(buildExportFile)
        .then(async ({ stream, filename, mimetype, encoding, meta }) => {
            const file = buildUploadInputFrom({ stream, filename, mimetype, encoding, meta })
            const data = {
                dv: 1,
                sender: task.sender,
                status: COMPLETED,
                file,
            }
            return await taskServerUtils.update(context, task.id, data)
        })
)

module.exports = {
    loadRecordsAndConvertToFileRows,
    exportRecords,
}