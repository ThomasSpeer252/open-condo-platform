/**
 * Generated by `createschema notification.Message 'organization?:Relationship:Organization:CASCADE; property?:Relationship:Property:CASCADE; ticket?:Relationship:Ticket:CASCADE; user:Relationship:User:CASCADE; type:Text; meta:Json; channels:Json; status:Select:sending,planned,sent,canceled; deliveredAt:DateTimeUtc;'`
 */

const JSON_NO_REQUIRED_ATTR_ERROR = '[json:noRequiredAttr:'
const JSON_SUSPICIOUS_ATTR_NAME_ERROR = '[json:suspiciousAttrName:'
const JSON_UNKNOWN_ATTR_NAME_ERROR = '[json:unknownAttrName:'

const SMS_TRANSPORT = 'sms'
const EMAIL_TRANSPORT = 'email'
const TELEGRAM_TRANSPORT = 'telegram'
const PUSH_TRANSPORT = 'push'
const MESSAGE_TRANSPORTS = [SMS_TRANSPORT, EMAIL_TRANSPORT, TELEGRAM_TRANSPORT, PUSH_TRANSPORT]

const INVITE_NEW_EMPLOYEE_MESSAGE_TYPE = 'INVITE_NEW_EMPLOYEE'
const SHARE_TICKET_MESSAGE_TYPE = 'SHARE_TICKET'
const DIRTY_INVITE_NEW_EMPLOYEE_MESSAGE_TYPE = 'DIRTY_INVITE_NEW_EMPLOYEE'
const REGISTER_NEW_USER_MESSAGE_TYPE = 'REGISTER_NEW_USER'
const RESET_PASSWORD_MESSAGE_TYPE = 'RESET_PASSWORD'
const SMS_VERIFY_CODE_MESSAGE_TYPE = 'SMS_VERIFY'
const DEVELOPER_IMPORTANT_NOTE_TYPE = 'DEVELOPER_IMPORTANT_NOTE_TYPE'
const CUSTOMER_IMPORTANT_NOTE_TYPE = 'CUSTOMER_IMPORTANT_NOTE_TYPE'
const MESSAGE_FORWARDED_TO_SUPPORT_TYPE = 'MESSAGE_FORWARDED_TO_SUPPORT'
const TICKET_ASSIGNEE_CONNECTED_TYPE = 'TICKET_ASSIGNEE_CONNECTED'
const TICKET_EXECUTOR_CONNECTED_TYPE = 'TICKET_EXECUTOR_CONNECTED'
const TICKET_WITHOUT_RESIDENT_CREATED_TYPE = 'TICKET_WITHOUT_RESIDENT_CREATED'
const TICKET_STATUS_OPENED_TYPE = 'TICKET_STATUS_OPENED'
const TICKET_STATUS_IN_PROGRESS_TYPE = 'TICKET_STATUS_IN_PROGRESS'
const TICKET_STATUS_COMPLETED_TYPE = 'TICKET_STATUS_COMPLETED'
const TICKET_STATUS_RETURNED_TYPE = 'TICKET_STATUS_RETURNED'
const TICKET_STATUS_DECLINED_TYPE = 'TICKET_STATUS_DECLINED'
const TICKET_COMMENT_ADDED_TYPE = 'TICKET_COMMENT_ADDED'
const METER_VERIFICATION_DATE_REMINDER_TYPE = 'METER_VERIFICATION_DATE_REMINDER'
const METER_SUBMIT_READINGS_REMINDER_TYPE = 'METER_SUBMIT_READINGS_REMINDER'
const METER_VERIFICATION_DATE_EXPIRED_TYPE = 'METER_VERIFICATION_DATE_EXPIRED'
const RESIDENT_ADD_BILLING_ACCOUNT_TYPE = 'RESIDENT_ADD_BILLING_ACCOUNT'
const BILLING_RECEIPT_AVAILABLE_TYPE = 'BILLING_RECEIPT_AVAILABLE'
const BILLING_RECEIPT_AVAILABLE_NO_ACCOUNT_TYPE = 'BILLING_RECEIPT_AVAILABLE_NO_ACCOUNT'
const BILLING_RECEIPT_ADDED_TYPE = 'BILLING_RECEIPT_ADDED'
const BILLING_RECEIPT_ADDED_WITH_DEBT_TYPE = 'BILLING_RECEIPT_ADDED_WITH_DEBT'
const BILLING_RECEIPT_ADDED_WITH_NO_DEBT_TYPE = 'BILLING_RECEIPT_ADDED_WITH_NO_DEBT'
const RESIDENT_UPGRADE_APP_TYPE = 'RESIDENT_UPGRADE_APP'
const STAFF_UPGRADE_APP_TYPE = 'STAFF_UPGRADE_APP'

const MESSAGE_TYPES = [
    INVITE_NEW_EMPLOYEE_MESSAGE_TYPE,
    DIRTY_INVITE_NEW_EMPLOYEE_MESSAGE_TYPE,
    REGISTER_NEW_USER_MESSAGE_TYPE,
    RESET_PASSWORD_MESSAGE_TYPE,
    SMS_VERIFY_CODE_MESSAGE_TYPE,
    SHARE_TICKET_MESSAGE_TYPE,
    DEVELOPER_IMPORTANT_NOTE_TYPE,
    CUSTOMER_IMPORTANT_NOTE_TYPE,
    MESSAGE_FORWARDED_TO_SUPPORT_TYPE,
    TICKET_ASSIGNEE_CONNECTED_TYPE,
    TICKET_EXECUTOR_CONNECTED_TYPE,
    TICKET_WITHOUT_RESIDENT_CREATED_TYPE,
    TICKET_STATUS_OPENED_TYPE,
    TICKET_STATUS_IN_PROGRESS_TYPE,
    TICKET_STATUS_COMPLETED_TYPE,
    TICKET_STATUS_RETURNED_TYPE,
    TICKET_STATUS_DECLINED_TYPE,
    TICKET_COMMENT_ADDED_TYPE,
    METER_VERIFICATION_DATE_REMINDER_TYPE,
    METER_SUBMIT_READINGS_REMINDER_TYPE,
    METER_VERIFICATION_DATE_EXPIRED_TYPE,
    RESIDENT_ADD_BILLING_ACCOUNT_TYPE,
    BILLING_RECEIPT_AVAILABLE_TYPE,
    BILLING_RECEIPT_AVAILABLE_NO_ACCOUNT_TYPE,
    BILLING_RECEIPT_ADDED_TYPE,
    BILLING_RECEIPT_ADDED_WITH_DEBT_TYPE,
    BILLING_RECEIPT_ADDED_WITH_NO_DEBT_TYPE,
    RESIDENT_UPGRADE_APP_TYPE,
    STAFF_UPGRADE_APP_TYPE,
]

/**
 * If some messages types has limited variety of transports, please set it here.
 * The rest of types must have templates for all transports or at least default template.
 */
const MESSAGE_TYPES_TRANSPORTS = {
    [INVITE_NEW_EMPLOYEE_MESSAGE_TYPE]: [EMAIL_TRANSPORT],
    [MESSAGE_FORWARDED_TO_SUPPORT_TYPE]: [EMAIL_TRANSPORT],
    [SHARE_TICKET_MESSAGE_TYPE]: [EMAIL_TRANSPORT],
}

const SMS_FORBIDDEN_SYMBOLS_REGEXP = /[&#|«»]+/gim

//TODO: maybe we should gather all data about messages types in the single object
//TODO(DOMA-2778) add recursive validation for internal objects like [TICKET_EXECUTOR_CONNECTED_TYPE].data
const MESSAGE_META = {
    [INVITE_NEW_EMPLOYEE_MESSAGE_TYPE]: {
        dv: { defaultValue: '', required: true },
        inviteCode: { defaultValue: '', required: true },
        userName: { defaultValue: 'USERNAME', required: false },
        userEmail: { defaultValue: '', required: false },
        userPhone: { defaultValue: '', required: false },
        organizationName: { defaultValue: 'ORGANIZATION', required: false },
    },
    [SHARE_TICKET_MESSAGE_TYPE]: {
        dv: { defaultValue: '', required: true },
        ticketNumber: { defaultValue: '', required: true },
        date: { defaultValue: '', required: true },
        id: { defaultValue: '', required: true },
        details: { defaultValue: '', required: true },
    },
    [DIRTY_INVITE_NEW_EMPLOYEE_MESSAGE_TYPE]: {
        dv: { defaultValue: '', required: true },
        organizationName: { defaultValue: 'ORGANIZATION', required: false },
    },
    [REGISTER_NEW_USER_MESSAGE_TYPE]: {
        dv: { defaultValue: '', required: true },
        userPhone: { defaultValue: '', required: false },
        userPassword: { defaultValue: '', required: false },
    },
    [RESET_PASSWORD_MESSAGE_TYPE]: {
        dv: { defaultValue: '', required: true },
        token: { defaultValue: '', required: true },
        userName: { defaultValue: 'USERNAME', required: false },
        userEmail: { defaultValue: '', required: false },
    },
    [SMS_VERIFY_CODE_MESSAGE_TYPE]: {
        dv: { defaultValue: '', required: true },
        smsCode: { defaultValue: '', required: true },
    },
    [DEVELOPER_IMPORTANT_NOTE_TYPE]: {
        dv: { defaultValue: '', required: true },
        type: { defaultValue: 'UNKNOWN', required: true },
        data: { defaultValue: null, required: true },
    },
    [CUSTOMER_IMPORTANT_NOTE_TYPE]: {
        dv: { defaultValue: '', required: true },
        type: { defaultValue: 'UNKNOWN', required: true },
        data: { defaultValue: null, required: true },
    },
    [MESSAGE_FORWARDED_TO_SUPPORT_TYPE]: {
        dv: { defaultValue: '', required: true },
        text: { defaultValue: null, required: true },
        os: { defaultValue: null, required: true },
        appVersion: { defaultValue: null, required: true },
        organizationsData: { defaultValue: [], isRequired: false },
        attachments: { defaultValue: [], isRequired: false },
    },
    [TICKET_ASSIGNEE_CONNECTED_TYPE]: {
        dv: { defaultValue: '', required: true },
        data: {
            ticketId: { defaultValue: '', required: true },
            ticketNumber: { defaultValue: '', required: true },
            userId: { defaultValue: '', required: true },
            url: { defaultValue: '', required: true },
        },
    },
    [TICKET_EXECUTOR_CONNECTED_TYPE]: {
        dv: { defaultValue: '', required: true },
        data: {
            ticketId: { defaultValue: '', required: true },
            ticketNumber: { defaultValue: '', required: true },
            userId: { defaultValue: '', required: true },
            url: { defaultValue: '', required: true },
        },
    },
    [TICKET_WITHOUT_RESIDENT_CREATED_TYPE]: {
        dv: { defaultValue: '', required: true },
        data: { },
    },
    [TICKET_STATUS_OPENED_TYPE]: {
        dv: { defaultValue: '', required: true },
        data: {
            ticketId: { defaultValue: '', required: true },
            ticketNumber: { defaultValue: '', required: true },
            userId: { defaultValue: '', required: true },
            url: { defaultValue: '', required: true },
            residentId: { defaultValue: '', required: true },
        },
    },
    [TICKET_STATUS_IN_PROGRESS_TYPE]: {
        dv: { defaultValue: '', required: true },
        data: {
            ticketId: { defaultValue: '', required: true },
            ticketNumber: { defaultValue: '', required: true },
            userId: { defaultValue: '', required: true },
            url: { defaultValue: '', required: true },
            residentId: { defaultValue: '', required: true },
        },
    },
    [TICKET_STATUS_COMPLETED_TYPE]: {
        dv: { defaultValue: '', required: true },
        data: {
            ticketId: { defaultValue: '', required: true },
            ticketNumber: { defaultValue: '', required: true },
            userId: { defaultValue: '', required: true },
            url: { defaultValue: '', required: true },
            residentId: { defaultValue: '', required: true },
        },
    },
    [TICKET_STATUS_RETURNED_TYPE]: {
        dv: { defaultValue: '', required: true },
        data: {
            ticketId: { defaultValue: '', required: true },
            ticketNumber: { defaultValue: '', required: true },
            userId: { defaultValue: '', required: true },
            url: { defaultValue: '', required: true },
            residentId: { defaultValue: '', required: true },
        },
    },
    [TICKET_STATUS_DECLINED_TYPE]: {
        dv: { defaultValue: '', required: true },
        data: {
            ticketId: { defaultValue: '', required: true },
            ticketNumber: { defaultValue: '', required: true },
            userId: { defaultValue: '', required: true },
            url: { defaultValue: '', required: true },
            residentId: { defaultValue: '', required: true },
        },
    },
    [TICKET_COMMENT_ADDED_TYPE]: {
        dv: { defaultValue: '', required: true },
        data: {
            ticketId: { defaultValue: '', required: true },
            ticketNumber: { defaultValue: '', required: true },
            userId: { defaultValue: '', required: true },
            commentId: { defaultValue: '', required: true },
            url: { defaultValue: '', required: true },
            residentId: { defaultValue: '', required: true },
        },
    },
    [METER_VERIFICATION_DATE_REMINDER_TYPE]: {
        dv: { required: true },
        data: {
            reminderDate: { required: true },
            meterId: { required: true },
            userId: { required: true },
            residentId: { required: true },
            url: { required: true },
        },
    },
    [RESIDENT_ADD_BILLING_ACCOUNT_TYPE]: {
        dv: { required: true },
        data: {
            userId: { required: true },
            url: { required: true },
            residentId: { required: true },
            residentIds: { required: true },
        },
    },
    [BILLING_RECEIPT_AVAILABLE_TYPE]: {
        dv: { required: true },
        data: {
            receiptId: { required: true },
            userId: { required: true },
            accountId: { required: true },
            url: { required: true },
            residentId: { required: true },
            period: { required: true },
        },
    },
    [BILLING_RECEIPT_AVAILABLE_NO_ACCOUNT_TYPE]: {
        dv: { required: true },
        data: {
            userId: { required: true },
            url: { required: true },
            residentId: { required: true },
            residentIds: { required: true },
            propertyId: { required: true },
            period: { required: true },
        },
    },
    [BILLING_RECEIPT_ADDED_TYPE]: {
        dv: { defaultValue: '', required: true },
        data: {
            residentId: { defaultValue: '', required: true },
            userId: { defaultValue: '', required: true },
            url: { defaultValue: '', required: true },
            billingReceiptId: { defaultValue: '', required: true },
            billingAccountId: { defaultValue: '', required: true },
            billingPropertyId: { defaultValue: '', required: true },
            period: { required: true },
        },
    },
    [BILLING_RECEIPT_ADDED_WITH_DEBT_TYPE]: {
        dv: { defaultValue: '', required: true },
        data: {
            residentId: { defaultValue: '', required: true },
            userId: { defaultValue: '', required: true },
            url: { defaultValue: '', required: true },
            billingReceiptId: { defaultValue: '', required: true },
            billingAccountId: { defaultValue: '', required: true },
            billingPropertyId: { defaultValue: '', required: true },
            period: { required: true },
            category: { required: true },
            toPay: { required: true },
            currencyCode: { required: true },
        },
    },
    [BILLING_RECEIPT_ADDED_WITH_NO_DEBT_TYPE]: {
        dv: { defaultValue: '', required: true },
        data: {
            residentId: { defaultValue: '', required: true },
            userId: { defaultValue: '', required: true },
            url: { defaultValue: '', required: true },
            billingReceiptId: { defaultValue: '', required: true },
            billingAccountId: { defaultValue: '', required: true },
            billingPropertyId: { defaultValue: '', required: true },
            period: { required: true },
        },
    },
    [METER_SUBMIT_READINGS_REMINDER_TYPE]: {
        dv: { required: true },
        data: {
            meterId: { required: true },
            userId: { required: true },
            residentId: { required: true },
            url: { defaultValue: '', required: true },
        },
    },
    [METER_VERIFICATION_DATE_EXPIRED_TYPE]: {
        dv: { required: true },
        data: {
            meterId: { required: true },
            resource: { required: true },
            userId: { required: true },
            residentId: { required: true },
            url: { defaultValue: '', required: true },
        },
    },
    [RESIDENT_UPGRADE_APP_TYPE]: {
        dv: { required: true },
        data: {
            userId: { required: true },
            userType: { required: true },
            url: { defaultValue: '', required: true },
        },
    },
    [STAFF_UPGRADE_APP_TYPE]: {
        dv: { required: true },
        data: {
            userId: { required: true },
            userType: { required: true },
            url: { defaultValue: '', required: true },
        },
    },
}

const MESSAGE_SENDING_STATUS = 'sending'
const MESSAGE_RESENDING_STATUS = 'resending'
const MESSAGE_PROCESSING_STATUS = 'processing'
const MESSAGE_ERROR_STATUS = 'error'
const MESSAGE_DELIVERED_STATUS = 'delivered'
const MESSAGE_CANCELED_STATUS = 'canceled'
const MESSAGE_SENT_STATUS = 'sent'
const MESSAGE_READ_STATUS = 'read'
const MESSAGE_STATUSES = [
    MESSAGE_SENDING_STATUS,
    MESSAGE_RESENDING_STATUS,
    MESSAGE_PROCESSING_STATUS,
    MESSAGE_ERROR_STATUS,
    MESSAGE_SENT_STATUS,
    MESSAGE_DELIVERED_STATUS,
    MESSAGE_READ_STATUS,
    MESSAGE_CANCELED_STATUS,
]

const DEVICE_PLATFORM_ANDROID = 'android'
const DEVICE_PLATFORM_IOS = 'ios'
const DEVICE_PLATFORM_WEB = 'web'
const DEVICE_PLATFORM_TYPES = [DEVICE_PLATFORM_ANDROID, DEVICE_PLATFORM_IOS, DEVICE_PLATFORM_WEB]

const PUSH_TRANSPORT_FIREBASE = 'firebase'
const PUSH_TRANSPORT_APPLE = 'apple'
const PUSH_TRANSPORT_HUAWEI = 'huawei'
const PUSH_TRANSPORT_TYPES = [PUSH_TRANSPORT_FIREBASE, PUSH_TRANSPORT_APPLE, PUSH_TRANSPORT_HUAWEI]
const PUSH_FAKE_TOKEN_SUCCESS = 'PUSH_FAKE_TOKEN_SUCCESS'
const PUSH_FAKE_TOKEN_FAIL = 'PUSH_FAKE_TOKEN_FAIL'

const FIREBASE_CONFIG_ENV = 'FIREBASE_CONFIG_JSON'
const FIREBASE_CONFIG_TEST_PUSHTOKEN_ENV = 'FIREBASE_PUSH_TOKEN_TEST'

const DEFAULT_TEMPLATE_FILE_EXTENSION = 'njk'
const DEFAULT_TEMPLATE_FILE_NAME = `default.${DEFAULT_TEMPLATE_FILE_EXTENSION}`

module.exports = {
    JSON_NO_REQUIRED_ATTR_ERROR,
    JSON_SUSPICIOUS_ATTR_NAME_ERROR,
    JSON_UNKNOWN_ATTR_NAME_ERROR,
    SMS_TRANSPORT,
    EMAIL_TRANSPORT,
    TELEGRAM_TRANSPORT,
    PUSH_TRANSPORT,
    MESSAGE_TRANSPORTS,
    REGISTER_NEW_USER_MESSAGE_TYPE,
    SMS_VERIFY_CODE_MESSAGE_TYPE,
    INVITE_NEW_EMPLOYEE_MESSAGE_TYPE,
    RESET_PASSWORD_MESSAGE_TYPE,
    DEVELOPER_IMPORTANT_NOTE_TYPE,
    MESSAGE_TYPES,
    MESSAGE_META,
    MESSAGE_SENDING_STATUS,
    MESSAGE_RESENDING_STATUS,
    MESSAGE_PROCESSING_STATUS,
    MESSAGE_ERROR_STATUS,
    MESSAGE_SENT_STATUS,
    MESSAGE_DELIVERED_STATUS,
    MESSAGE_READ_STATUS,
    MESSAGE_CANCELED_STATUS,
    DIRTY_INVITE_NEW_EMPLOYEE_MESSAGE_TYPE,
    MESSAGE_STATUSES,
    SHARE_TICKET_MESSAGE_TYPE,
    CUSTOMER_IMPORTANT_NOTE_TYPE,
    PUSH_TRANSPORT_TYPES,
    MESSAGE_FORWARDED_TO_SUPPORT_TYPE,
    TICKET_ASSIGNEE_CONNECTED_TYPE,
    TICKET_EXECUTOR_CONNECTED_TYPE,
    TICKET_WITHOUT_RESIDENT_CREATED_TYPE,
    TICKET_STATUS_OPENED_TYPE,
    TICKET_STATUS_IN_PROGRESS_TYPE,
    TICKET_STATUS_COMPLETED_TYPE,
    TICKET_STATUS_RETURNED_TYPE,
    TICKET_STATUS_DECLINED_TYPE,
    TICKET_COMMENT_ADDED_TYPE,
    PUSH_TRANSPORT_FIREBASE,
    PUSH_TRANSPORT_APPLE,
    PUSH_TRANSPORT_HUAWEI,
    PUSH_FAKE_TOKEN_SUCCESS,
    PUSH_FAKE_TOKEN_FAIL,
    FIREBASE_CONFIG_ENV,
    FIREBASE_CONFIG_TEST_PUSHTOKEN_ENV,
    DEFAULT_TEMPLATE_FILE_EXTENSION,
    DEFAULT_TEMPLATE_FILE_NAME,
    MESSAGE_TYPES_TRANSPORTS,
    SMS_FORBIDDEN_SYMBOLS_REGEXP,
    METER_VERIFICATION_DATE_REMINDER_TYPE,
    METER_SUBMIT_READINGS_REMINDER_TYPE,
    METER_VERIFICATION_DATE_EXPIRED_TYPE,
    BILLING_RECEIPT_AVAILABLE_TYPE,
    BILLING_RECEIPT_AVAILABLE_NO_ACCOUNT_TYPE,
    RESIDENT_ADD_BILLING_ACCOUNT_TYPE,
    BILLING_RECEIPT_ADDED_TYPE,
    BILLING_RECEIPT_ADDED_WITH_DEBT_TYPE,
    BILLING_RECEIPT_ADDED_WITH_NO_DEBT_TYPE,
    DEVICE_PLATFORM_TYPES,
    DEVICE_PLATFORM_ANDROID,
    DEVICE_PLATFORM_IOS,
    DEVICE_PLATFORM_WEB,
    RESIDENT_UPGRADE_APP_TYPE,
    STAFF_UPGRADE_APP_TYPE,
}
