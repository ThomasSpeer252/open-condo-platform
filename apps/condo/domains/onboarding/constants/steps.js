const uniq = require('lodash/uniq')

const TICKET_STEP_TYPE = 'ticket'
const BILLING_STEP_TYPE = 'billing'
const METER_STEP_TYPE = 'meter'
const RESIDENT_STEP_TYPE = 'resident'
const CREATE_PROPERTY_STEP_TYPE = 'createProperty'
const CREATE_PROPERTY_MAP_STEP_TYPE = 'createPropertyMap'
const CREATE_TICKET_STEP_TYPE = 'createTicket'
const UPLOAD_RECEIPTS_STEP_TYPE = 'uploadReceipts'
const CREATE_METER_STEP_TYPE = 'createMeter'
const CREATE_METER_READINGS_STEP_TYPE = 'createMeterReadings'
const VIEW_RESIDENT_APP_GUIDE_STEP_TYPE = 'viewResidentsAppGuide'
const CREATE_NEWS_STEP_TYPE = 'createNews'

const STEP_TYPES = [
    TICKET_STEP_TYPE,
    BILLING_STEP_TYPE,
    METER_STEP_TYPE,
    RESIDENT_STEP_TYPE,
    CREATE_PROPERTY_STEP_TYPE,
    CREATE_PROPERTY_MAP_STEP_TYPE,
    CREATE_TICKET_STEP_TYPE,
    UPLOAD_RECEIPTS_STEP_TYPE,
    CREATE_METER_STEP_TYPE,
    CREATE_METER_READINGS_STEP_TYPE,
    VIEW_RESIDENT_APP_GUIDE_STEP_TYPE,
    CREATE_NEWS_STEP_TYPE,
]

/**
 * Specify which tour flow step type belongs.
 * If it's a new tour flow, the type should be an object key; if it's an internal step, it should be an element in the array value.
 */
const STEP_TRANSITIONS = {
    [TICKET_STEP_TYPE]: [CREATE_PROPERTY_STEP_TYPE, CREATE_PROPERTY_MAP_STEP_TYPE, CREATE_TICKET_STEP_TYPE, VIEW_RESIDENT_APP_GUIDE_STEP_TYPE],
    [BILLING_STEP_TYPE]: [UPLOAD_RECEIPTS_STEP_TYPE, VIEW_RESIDENT_APP_GUIDE_STEP_TYPE],
    [METER_STEP_TYPE]: [CREATE_PROPERTY_STEP_TYPE, CREATE_PROPERTY_MAP_STEP_TYPE, CREATE_METER_STEP_TYPE, CREATE_METER_READINGS_STEP_TYPE, VIEW_RESIDENT_APP_GUIDE_STEP_TYPE],
    [RESIDENT_STEP_TYPE]: [CREATE_PROPERTY_STEP_TYPE, CREATE_PROPERTY_MAP_STEP_TYPE, VIEW_RESIDENT_APP_GUIDE_STEP_TYPE, CREATE_NEWS_STEP_TYPE],
}

const FIRST_LEVEL_STEPS = Object.keys(STEP_TRANSITIONS)
const SECOND_LEVEL_STEPS = uniq(Object.values(STEP_TRANSITIONS).flat())

/**
 * Steps with initial "TODO_STEP_STATUS" status (by default it's DISABLED_STEP_STATUS)
 */
const INITIAL_ENABLED_STEPS = [TICKET_STEP_TYPE, RESIDENT_STEP_TYPE, BILLING_STEP_TYPE, METER_STEP_TYPE, CREATE_PROPERTY_STEP_TYPE, UPLOAD_RECEIPTS_STEP_TYPE]

/**
 * After which type of step the step will be "TODO_STEP_STATUS" upon completion.
 * Object key - completed step
 */
const ENABLED_STEPS_AFTER_COMPLETE = {
    [CREATE_PROPERTY_STEP_TYPE]: [CREATE_PROPERTY_MAP_STEP_TYPE],
    [CREATE_PROPERTY_MAP_STEP_TYPE]: [CREATE_TICKET_STEP_TYPE, CREATE_METER_STEP_TYPE, VIEW_RESIDENT_APP_GUIDE_STEP_TYPE],
    [CREATE_TICKET_STEP_TYPE]: [VIEW_RESIDENT_APP_GUIDE_STEP_TYPE],
    [UPLOAD_RECEIPTS_STEP_TYPE]: [VIEW_RESIDENT_APP_GUIDE_STEP_TYPE, RESIDENT_STEP_TYPE],
    [CREATE_METER_STEP_TYPE]: [CREATE_METER_READINGS_STEP_TYPE],
    [CREATE_METER_READINGS_STEP_TYPE]: [VIEW_RESIDENT_APP_GUIDE_STEP_TYPE],
    [VIEW_RESIDENT_APP_GUIDE_STEP_TYPE]: [CREATE_NEWS_STEP_TYPE],
}

/**
 * Step weight for client-side sorting (Sorting in ascending order)
 */
const STEP_ORDER = {
    [TICKET_STEP_TYPE]: 100,
    [BILLING_STEP_TYPE]: 200,
    [METER_STEP_TYPE]: 300,
    [RESIDENT_STEP_TYPE]: 400,
    [CREATE_PROPERTY_STEP_TYPE]: 100,
    [CREATE_PROPERTY_MAP_STEP_TYPE]: 200,
    [CREATE_TICKET_STEP_TYPE]: 300,
    [UPLOAD_RECEIPTS_STEP_TYPE]: 100,
    [CREATE_METER_STEP_TYPE]: 250,
    [CREATE_METER_READINGS_STEP_TYPE]: 300,
    [VIEW_RESIDENT_APP_GUIDE_STEP_TYPE]: 400,
    [CREATE_NEWS_STEP_TYPE]: 500,
}

const TODO_STEP_STATUS = 'todo'
const WAITING_STEP_STATUS = 'waiting'
const DISABLED_STEP_STATUS = 'disabled'
const COMPLETED_STEP_STATUS = 'completed'

const STEP_STATUSES = [TODO_STEP_STATUS, WAITING_STEP_STATUS, DISABLED_STEP_STATUS, COMPLETED_STEP_STATUS]

const ACTIVE_STEPS_STORAGE_KEY = 'activeTourStep'

module.exports = {
    STEP_TYPES,
    STEP_TRANSITIONS,
    FIRST_LEVEL_STEPS,
    SECOND_LEVEL_STEPS,
    INITIAL_ENABLED_STEPS,
    ENABLED_STEPS_AFTER_COMPLETE,
    STEP_ORDER,
    STEP_STATUSES,
    TODO_STEP_STATUS,
    WAITING_STEP_STATUS,
    DISABLED_STEP_STATUS,
    COMPLETED_STEP_STATUS,
    TICKET_STEP_TYPE,
    BILLING_STEP_TYPE,
    METER_STEP_TYPE,
    RESIDENT_STEP_TYPE,
    CREATE_PROPERTY_STEP_TYPE,
    CREATE_PROPERTY_MAP_STEP_TYPE,
    CREATE_TICKET_STEP_TYPE,
    UPLOAD_RECEIPTS_STEP_TYPE,
    CREATE_METER_STEP_TYPE,
    CREATE_METER_READINGS_STEP_TYPE,
    VIEW_RESIDENT_APP_GUIDE_STEP_TYPE,
    CREATE_NEWS_STEP_TYPE,
    ACTIVE_STEPS_STORAGE_KEY,
}