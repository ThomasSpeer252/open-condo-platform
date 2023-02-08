/**
 * Generated by `createschema ticket.Incident 'organization; number; details:Text; status; textForResident:Text; workStart:DateTimeUtc; workFinish:DateTimeUtc; isScheduled:Checkbox; isEmergency:Checkbox; hasAllProperties:Checkbox;'`
 */

const dayjs = require('dayjs')

const { GQLError } = require('@open-condo/keystone/errors')
const { GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const { WRONG_VALUE } = require('@condo/domains/common/constants/errors')
const { storeChangesIfUpdated, buildSetOfFieldsToTrackFrom } = require('@condo/domains/common/utils/serverSchema/changeTrackable')
const { normalizeText } = require('@condo/domains/common/utils/text')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const access = require('@condo/domains/ticket/access/Incident')
const { OMIT_INCIDENT_CHANGE_TRACKABLE_FIELDS } = require('@condo/domains/ticket/constants')
const { INCIDENT_STATUSES, INCIDENT_STATUS_ACTUAL } = require('@condo/domains/ticket/constants/incident')
const {
    createIncidentChange,
    incidentRelatedManyToManyResolvers,
    incidentChangeDisplayNameResolversForSingleRelations,
} = require('@condo/domains/ticket/utils/serverSchema/IncidentChange')


const ERRORS = {
    WORK_FINISH_EARLY_THAN_WORK_START: {
        code: BAD_USER_INPUT,
        type: WRONG_VALUE,
        message: 'The value of the "workFinish" field must be greater than the "workStart" field',
        messageForUser: 'api.incident.WORK_FINISH_EARLY_THAN_WORK_START',
    },
}

const Incident = new GQLListSchema('Incident', {
    schemaDoc: 'Entries of mass planned and emergency incidents with water, electricity, etc.',
    fields: {

        organization: ORGANIZATION_OWNED_FIELD,

        number: {
            schemaDoc: 'Autogenerated incident human readable ID',
            type: 'AutoIncrementInteger',
            kmigratorOptions: { unique: true, null: false },
        },

        details: {
            schemaDoc: 'Text description of the incident',
            type: 'Text',
            isRequired: true,
            kmigratorOptions: { null: false },
            hooks: {
                resolveInput: async ({ resolvedData, fieldPath }) => {
                    return normalizeText(resolvedData[fieldPath])
                },
            },
        },

        status: {
            schemaDoc: 'Incident status.',
            type: 'Select',
            isRequired: true,
            options: INCIDENT_STATUSES.join(','),
            defaultValue: INCIDENT_STATUS_ACTUAL,
        },

        textForResident: {
            schemaDoc: 'Text that employees should say to residents',
            type: 'Text',
            hooks: {
                resolveInput: async ({ resolvedData, fieldPath }) => {
                    return normalizeText(resolvedData[fieldPath])
                },
            },
        },

        workStart: {
            schemaDoc: 'Start date of work related to the incident (seconds and milliseconds are forced to zero)',
            type: 'DateTimeUtc',
            isRequired: true,
            kmigratorOptions: { null: false },
            hooks: {
                resolveInput: async (props) => {
                    const { resolvedData, fieldPath } = props
                    const workStart = resolvedData[fieldPath]
                    if (workStart) {
                        // NOTE: We do forced zeroing of seconds and milliseconds so that there are no problems
                        return dayjs(workStart).set('seconds', 0).set('milliseconds', 0)
                    }
                    return workStart
                },
            },
        },

        workFinish: {
            schemaDoc: 'Finish date of work related to the incident (seconds and milliseconds are forced to zero)',
            type: 'DateTimeUtc',
            hooks: {
                resolveInput: async (props) => {
                    const { resolvedData, fieldPath } = props
                    const workFinish = resolvedData[fieldPath]
                    if (workFinish) {
                        // NOTE: We do forced zeroing of seconds and milliseconds so that there are no problems
                        return dayjs(workFinish).set('seconds', 0).set('milliseconds', 0)
                    }
                    return workFinish
                },
                validateInput: async (props) => {
                    const { resolvedData, existingItem, fieldPath, context } = props
                    const newItem = { ...existingItem, ...resolvedData }
                    if (!newItem[fieldPath]) return

                    const workFinish = dayjs(newItem[fieldPath])
                    const workStart = dayjs(newItem.workStart)
                    const isValidFinishDate = workFinish.diff(workStart) >= 0

                    if (workFinish && workStart && !isValidFinishDate) {
                        throw new GQLError(ERRORS.WORK_FINISH_EARLY_THAN_WORK_START, context)
                    }
                },
            },
        },

        isScheduled: {
            schemaDoc: 'Scheduled works',
            type: 'Checkbox',
            isRequired: true,
            defaultValue: false,
        },

        isEmergency: {
            schemaDoc: 'Emergency work',
            type: 'Checkbox',
            isRequired: true,
            defaultValue: false,
        },

        hasAllProperties: {
            schemaDoc: 'True if incident includes all properties in organization',
            type: 'Checkbox',
            defaultValue: false,
        },

    },
    hooks: {
        afterChange: async (...args) => {
            /**
             * Creates a new IncidentChange item
             */
            await storeChangesIfUpdated(
                buildSetOfFieldsToTrackFrom(Incident.schema, { except: OMIT_INCIDENT_CHANGE_TRACKABLE_FIELDS }),
                createIncidentChange,
                incidentChangeDisplayNameResolversForSingleRelations,
                incidentRelatedManyToManyResolvers,
                []
            )(...args)
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadIncidents,
        create: access.canManageIncidents,
        update: access.canManageIncidents,
        delete: false,
        auth: true,
    },
})

module.exports = {
    Incident,
    ERRORS,
}
