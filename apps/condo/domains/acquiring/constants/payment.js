/**
 * Generated by `createschema acquiring.AcquiringIntegration 'name:Text;'`
 */

// Available payment methods
const CARD_PAYMENT_METHOD = 'CARD'
const CARD_BINDING_CARD_PAYMENT_METHOD = 'CARD_BINDING'
const CALL_CENTER_PAYMENT_METHOD = 'CARD_MOTO'
const CARD_PRESENT_PAYMENT_METHOD = 'CARD_PRESENT'
const SBRF_SBOL_PAYMENT_METHOD = 'SBRF_SBOL'
const CHINA_UNION_PAY_PAYMENT_METHOD = 'UPOP'
const FILE_BINDING_PAYMENT_METHOD = 'FILE_BINDING'
const SMS_BINDING_PAYMENT_METHOD = 'SMS_BINDING'
const P2P_PAYMENT_METHOD = 'P2P'
const P2P_BINDING_PAYMENT_METHOD = 'P2P_BINDING'
const PAYPAL_PAYMENT_METHOD = 'PAYPAL'
const MTS_PAYMENT_METHOD = 'MTS'
const APPLE_PAY_PAYMENT_METHOD = 'APPLE_PAY'
const APPLE_PAY_BINDING_PAYMENT_METHOD = 'APPLE_PAY_BINDING'
const ANDROID_PAY_PAYMENT_METHOD = 'ANDROID_PAY'
const ANDROID_PAY_BINDING_PAYMENT_METHOD = 'ANDROID_PAY_BINDING'
const GOOGLE_PAY_CARD_PAYMENT_METHOD = 'GOOGLE_PAY_CARD'
const GOOGLE_PAY_CARD_BINDING_PAYMENT_METHOD = 'GOOGLE_PAY_CARD_BINDING'
const GOOGLE_PAY_TOKENIZED_PAYMENT_METHOD = 'GOOGLE_PAY_TOKENIZED'
const GOOGLE_PAY_TOKENIZED_BINDING_PAYMENT_METHOD = 'GOOGLE_PAY_TOKENIZED_BINDING'
const SAMSUNG_PAY_PAYMENT_METHOD = 'SAMSUNG_PAY'
const SAMSUNG_PAY_BINDING_PAYMENT_METHOD = 'SAMSUNG_PAY_BINDING'
const IPOS_PAYMENT_METHOD = 'IPOS'
const SBERPAY_PAYMENT_METHOD = 'SBERPAY'
const SBERID_PAYMENT_METHOD = 'SBERID'

const AVAILABLE_PAYMENT_METHODS = [
    CARD_PAYMENT_METHOD,
    CARD_BINDING_CARD_PAYMENT_METHOD,
    CALL_CENTER_PAYMENT_METHOD,
    CARD_PRESENT_PAYMENT_METHOD,
    SBRF_SBOL_PAYMENT_METHOD,
    CHINA_UNION_PAY_PAYMENT_METHOD,
    FILE_BINDING_PAYMENT_METHOD,
    SMS_BINDING_PAYMENT_METHOD,
    P2P_PAYMENT_METHOD,
    P2P_BINDING_PAYMENT_METHOD,
    PAYPAL_PAYMENT_METHOD,
    MTS_PAYMENT_METHOD,
    APPLE_PAY_PAYMENT_METHOD,
    APPLE_PAY_BINDING_PAYMENT_METHOD,
    ANDROID_PAY_PAYMENT_METHOD,
    ANDROID_PAY_BINDING_PAYMENT_METHOD,
    GOOGLE_PAY_CARD_PAYMENT_METHOD,
    GOOGLE_PAY_CARD_BINDING_PAYMENT_METHOD,
    GOOGLE_PAY_TOKENIZED_PAYMENT_METHOD,
    GOOGLE_PAY_TOKENIZED_BINDING_PAYMENT_METHOD,
    SAMSUNG_PAY_PAYMENT_METHOD,
    SAMSUNG_PAY_BINDING_PAYMENT_METHOD,
    IPOS_PAYMENT_METHOD,
    SBERPAY_PAYMENT_METHOD,
    SBERID_PAYMENT_METHOD,
]

// MULTIPAYMENT_STATUSES
const MULTIPAYMENT_INIT_STATUS = 'CREATED'
const MULTIPAYMENT_PROCESSING_STATUS = 'PROCESSING'
const MULTIPAYMENT_DONE_STATUS = 'DONE'
const MULTIPAYMENT_ERROR_STATUS = 'ERROR'
const MULTIPAYMENT_WITHDRAWN_STATUS = 'WITHDRAWN'

const MULTIPAYMENT_STATUSES = [
    MULTIPAYMENT_INIT_STATUS,
    MULTIPAYMENT_DONE_STATUS,
    MULTIPAYMENT_PROCESSING_STATUS,
    MULTIPAYMENT_ERROR_STATUS,
    MULTIPAYMENT_WITHDRAWN_STATUS,
]

// MULTIPAYMENT STATUS TRANSITION RULES
const MULTIPAYMENT_TRANSITIONS = {
    [MULTIPAYMENT_INIT_STATUS]: [MULTIPAYMENT_PROCESSING_STATUS, MULTIPAYMENT_ERROR_STATUS, MULTIPAYMENT_DONE_STATUS],
    [MULTIPAYMENT_PROCESSING_STATUS]: [MULTIPAYMENT_PROCESSING_STATUS, MULTIPAYMENT_WITHDRAWN_STATUS, MULTIPAYMENT_DONE_STATUS, MULTIPAYMENT_ERROR_STATUS],
    [MULTIPAYMENT_WITHDRAWN_STATUS]: [MULTIPAYMENT_DONE_STATUS, MULTIPAYMENT_ERROR_STATUS],
    [MULTIPAYMENT_DONE_STATUS]: [],
    [MULTIPAYMENT_ERROR_STATUS]: [],

}

// Some of fields is required only in late-stage of multipayment,
// that's why we setting isRequired: false in schemas and checking it manually
// This is only fields, which has isRequired: false in schema, but will be required later
const MULTIPAYMENT_REQUIRED_FIELDS = {
    [MULTIPAYMENT_INIT_STATUS]: [],
    [MULTIPAYMENT_PROCESSING_STATUS]: ['explicitFee', 'explicitServiceCharge'],
    [MULTIPAYMENT_WITHDRAWN_STATUS]: ['explicitFee', 'explicitServiceCharge', 'withdrawnAt', 'cardNumber', 'paymentWay', 'transactionId'],
    [MULTIPAYMENT_DONE_STATUS]: ['explicitFee', 'explicitServiceCharge', 'withdrawnAt', 'cardNumber', 'paymentWay', 'transactionId'],
    [MULTIPAYMENT_ERROR_STATUS]: [],
}

// Fields that cannot be changed by anyone (except admin) when switching from selected status
const MULTIPAYMENT_FROZEN_BY_DEFAULT_FIELDS = ['user', 'integration', 'amountWithoutExplicitFee', 'currencyCode', 'payments']
const MULTIPAYMENT_FROZEN_FIELDS = {
    [MULTIPAYMENT_INIT_STATUS]: MULTIPAYMENT_FROZEN_BY_DEFAULT_FIELDS,
    [MULTIPAYMENT_PROCESSING_STATUS]: MULTIPAYMENT_FROZEN_BY_DEFAULT_FIELDS,
    [MULTIPAYMENT_WITHDRAWN_STATUS]: MULTIPAYMENT_FROZEN_BY_DEFAULT_FIELDS,
    [MULTIPAYMENT_DONE_STATUS]: [...MULTIPAYMENT_FROZEN_BY_DEFAULT_FIELDS, 'explicitFee', 'explicitServiceCharge', 'withdrawnAt', 'cardNumber', 'paymentWay', 'transactionId'],
    [MULTIPAYMENT_ERROR_STATUS]: MULTIPAYMENT_FROZEN_BY_DEFAULT_FIELDS,
}

// PAYMENT_STATUSES
const PAYMENT_INIT_STATUS = 'CREATED'
const PAYMENT_PROCESSING_STATUS = 'PROCESSING'
const PAYMENT_DONE_STATUS = 'DONE'
const PAYMENT_ERROR_STATUS = 'ERROR'

const PAYMENT_STATUSES = [
    PAYMENT_INIT_STATUS,
    PAYMENT_PROCESSING_STATUS,
    PAYMENT_DONE_STATUS,
    PAYMENT_ERROR_STATUS,
]

// PAYMENT STATUS TRANSITION RULES
const PAYMENT_TRANSITIONS = {
    [PAYMENT_INIT_STATUS]: [PAYMENT_PROCESSING_STATUS, PAYMENT_DONE_STATUS, PAYMENT_ERROR_STATUS],
    [PAYMENT_PROCESSING_STATUS]: [PAYMENT_PROCESSING_STATUS, PAYMENT_DONE_STATUS, PAYMENT_ERROR_STATUS],
    [PAYMENT_DONE_STATUS]: [],
    [PAYMENT_ERROR_STATUS]: [],
}

// LIST FIELDS, WHICH ARE NOT REQUIRED BY DEFAULT, BUT REQUIRED AT SOME STAGE OF PAYMENT
const PAYMENT_REQUIRED_FIELDS = {
    [PAYMENT_INIT_STATUS]: [],
    // NOTE 1: Every payment, which got in "PROCESSING" should have multipayment ref, which cannot be changed later
    // NOTE 2: Every payment, which source is not our service will be created with status "DONE", where multiPayment is not required
    // NOTE 3: Same logic for acquiring context field
    [PAYMENT_PROCESSING_STATUS]: ['explicitFee', 'explicitServiceCharge', 'multiPayment', 'context'],
    [PAYMENT_DONE_STATUS]: ['explicitFee', 'explicitServiceCharge', 'advancedAt'],
    [PAYMENT_ERROR_STATUS]: [],
}

const DEFAULT_PAYMENT_FROZEN_FIELDS = ['amount', 'currencyCode', 'accountNumber', 'period', 'receipt', 'frozenReceipt', 'context', 'organization', 'recipientBic', 'recipientBankAccount']
// LIST OF FIELDS, WHICH CANNOT BE CHANGED DURING PAYMENT STATUS UPDATES
const PAYMENT_FROZEN_FIELDS = {
    [PAYMENT_INIT_STATUS]: DEFAULT_PAYMENT_FROZEN_FIELDS,
    [PAYMENT_PROCESSING_STATUS]: [...DEFAULT_PAYMENT_FROZEN_FIELDS, 'multiPayment'],
    [PAYMENT_DONE_STATUS]: [...DEFAULT_PAYMENT_FROZEN_FIELDS, 'multiPayment', 'explicitFee', 'explicitServiceCharge', 'implicitFee'],
    [PAYMENT_ERROR_STATUS]: DEFAULT_PAYMENT_FROZEN_FIELDS,
}

const DEFAULT_MULTIPAYMENT_SERVICE_CATEGORY = 'RECEIPT'

module.exports = {
    AVAILABLE_PAYMENT_METHODS,
    MULTIPAYMENT_STATUSES,
    MULTIPAYMENT_DONE_STATUS,
    MULTIPAYMENT_PROCESSING_STATUS,
    MULTIPAYMENT_INIT_STATUS,
    MULTIPAYMENT_WITHDRAWN_STATUS,
    MULTIPAYMENT_ERROR_STATUS,
    MULTIPAYMENT_TRANSITIONS,
    MULTIPAYMENT_REQUIRED_FIELDS,
    MULTIPAYMENT_FROZEN_FIELDS,
    PAYMENT_STATUSES,
    PAYMENT_INIT_STATUS,
    PAYMENT_PROCESSING_STATUS,
    PAYMENT_ERROR_STATUS,
    PAYMENT_DONE_STATUS,
    DEFAULT_MULTIPAYMENT_SERVICE_CATEGORY,
    PAYMENT_TRANSITIONS,
    PAYMENT_REQUIRED_FIELDS,
    PAYMENT_FROZEN_FIELDS,
}