// list of recurrent payment statuses
const RECURRENT_PAYMENT_INIT_STATUS = 'CREATED'
const RECURRENT_PAYMENT_PROCESSING_STATUS = 'PROCESSING'
const RECURRENT_PAYMENT_DONE_STATUS = 'DONE'
const RECURRENT_PAYMENT_ERROR_NEED_RETRY_STATUS = 'ERROR_NEED_RETRY'
const RECURRENT_PAYMENT_ERROR_STATUS = 'ERROR'

const RECURRENT_PAYMENT_STATUSES = [
    RECURRENT_PAYMENT_INIT_STATUS,
    RECURRENT_PAYMENT_PROCESSING_STATUS,
    RECURRENT_PAYMENT_DONE_STATUS,
    RECURRENT_PAYMENT_ERROR_NEED_RETRY_STATUS,
    RECURRENT_PAYMENT_ERROR_STATUS,
]

module.exports = {
    RECURRENT_PAYMENT_INIT_STATUS,
    RECURRENT_PAYMENT_PROCESSING_STATUS,
    RECURRENT_PAYMENT_DONE_STATUS,
    RECURRENT_PAYMENT_ERROR_NEED_RETRY_STATUS,
    RECURRENT_PAYMENT_ERROR_STATUS,
    RECURRENT_PAYMENT_STATUSES,
}
