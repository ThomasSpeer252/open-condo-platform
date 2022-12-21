const WRONG_PASSWORD_ERROR = '[passwordAuth:secret:mismatch'
const EMPTY_PASSWORD_ERROR = '[passwordAuth:secret:notSet'
const WRONG_EMAIL_ERROR = '[passwordAuth:identity:notFound'
const WRONG_PHONE_ERROR = '[passwordAuth:identity:notFound'
const AUTH_BY_PASSWORD_FAILED_ERROR = '[passwordAuth:failure'

const MULTIPLE_ACCOUNTS_MATCHES = '[resetPassword:identity:multipleFound'
const TOKEN_NOT_FOUND = 'TOKEN_NOT_FOUND'
const USER_NOT_FOUND = 'USER_NOT_FOUND'
const DENIED_FOR_ADMIN = 'DENIED_FOR_ADMIN'
const DENIED_FOR_SUPPORT = 'DENIED_FOR_SUPPORT'
const WRONG_PASSWORD = 'WRONG_PASSWORD'

const UNABLE_TO_CREATE_USER = 'UNABLE_TO_CREATE_USER'

const UNABLE_TO_CREATE_CONTACT_DUPLICATE = 'UNABLE_TO_CREATE_CONTACT'
const UNABLE_TO_UPDATE_CONTACT_DUPLICATE = 'UNABLE_TO_UPDATE_CONTACT_DUPLICATE'

const PASSWORD_IS_TOO_SHORT = 'PASSWORD_IS_TOO_SHORT'
const TOKEN_EXPIRED_ERROR = '[resetPassword:token:expired'

const MIN_PASSWORD_LENGTH_ERROR = '[register:password:minLength'
const PASSWORD_TOO_SHORT = '[password:min:length'

const EMAIL_ALREADY_REGISTERED_ERROR = '[unique:email:multipleFound'
const PHONE_ALREADY_REGISTERED_ERROR = '[unique:phone:multipleFound'
const EXTERNAL_IDENTITY_ALREADY_REGISTERED_ERROR = 'EXTERNAL_IDENTITY_ALREADY_REGISTERED_ERROR'

const EMAIL_WRONG_FORMAT_ERROR = '[format:email'
const PHONE_WRONG_FORMAT_ERROR = '[format:phone'

const PHONE_IS_REQUIRED_ERROR = '[phone:required'

const PASSWORD_IS_FREQUENTLY_USED_ERROR = '[password:rejectCommon'
const CONFIRM_PHONE_ACTION_EXPIRED = '[confirm:phone:expired'
const CONFIRM_PHONE_SMS_CODE_EXPIRED = '[confirm:phone:smscode:expired'
const SMS_CODE_EXPIRED = 'SMS_CODE_EXPIRED'
const CONFIRM_PHONE_SMS_CODE_VERIFICATION_FAILED = '[confirm:phone:smscode:verify:failed'
const SMS_CODE_VERIFICATION_FAILED = 'SMS_CODE_VERIFICATION_FAILED'
const CONFIRM_PHONE_SMS_CODE_MAX_RETRIES_REACHED = '[confirm:phone:smscode:tooManyRequests'
const SMS_CODE_MAX_RETRIES_REACHED = 'SMS_CODE_MAX_RETRIES_REACHED'

const TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS'
const SMS_FOR_PHONE_DAY_LIMIT_REACHED = 'SMS_FOR_PHONE_DAY_LIMIT_REACHED'
const SMS_FOR_IP_DAY_LIMIT_REACHED = 'SMS_FOR_IP_DAY_LIMIT_REACHED'

const CAPTCHA_CHECK_FAILED = 'CAPTCHA_CHECK_FAILED'

const UNABLE_TO_FIND_CONFIRM_PHONE_ACTION = 'UNABLE_TO_FIND_CONFIRM_PHONE_ACTION'
const CANNOT_RESET_ADMIN_USER = 'CANNOT_RESET_ADMIN_USER'

const EMPTY_EXTERNAL_IDENTITY_ID_VALUE = 'EMPTY_EXTERNAL_IDENTITY_ID_VALUE'

const GQL_ERRORS = {
    TOO_MANY_REQUESTS: {
        code: 'BAD_USER_INPUT',
        type: TOO_MANY_REQUESTS,
        message: 'You have to wait {secondsRemaining} seconds to be able to send request again',
        messageForUser: 'api.user.TOO_MANY_REQUESTS',
    },
    SMS_FOR_PHONE_DAY_LIMIT_REACHED: {
        code: 'BAD_USER_INPUT',
        type: SMS_FOR_PHONE_DAY_LIMIT_REACHED,
        message: 'Too many sms requests for this phone number. Try again tomorrow',
    },
    SMS_FOR_IP_DAY_LIMIT_REACHED: {
        code: 'BAD_USER_INPUT',
        type: SMS_FOR_IP_DAY_LIMIT_REACHED,
        message: 'Too many sms requests from this ip address. Try again tomorrow',
    },
}

module.exports = {
    WRONG_PASSWORD_ERROR,
    EMPTY_PASSWORD_ERROR,
    WRONG_EMAIL_ERROR,
    MULTIPLE_ACCOUNTS_MATCHES,
    WRONG_PHONE_ERROR,
    PASSWORD_TOO_SHORT,
    AUTH_BY_PASSWORD_FAILED_ERROR,
    EMAIL_ALREADY_REGISTERED_ERROR,
    PHONE_ALREADY_REGISTERED_ERROR,
    EXTERNAL_IDENTITY_ALREADY_REGISTERED_ERROR,
    EMAIL_WRONG_FORMAT_ERROR,
    PHONE_WRONG_FORMAT_ERROR,
    PHONE_IS_REQUIRED_ERROR,
    TOKEN_NOT_FOUND,
    USER_NOT_FOUND,
    DENIED_FOR_ADMIN,
    DENIED_FOR_SUPPORT,
    WRONG_PASSWORD,
    UNABLE_TO_CREATE_CONTACT_DUPLICATE,
    UNABLE_TO_UPDATE_CONTACT_DUPLICATE,
    UNABLE_TO_CREATE_USER,
    PASSWORD_IS_TOO_SHORT,
    TOKEN_EXPIRED_ERROR,
    MIN_PASSWORD_LENGTH_ERROR,
    PASSWORD_IS_FREQUENTLY_USED_ERROR,
    CONFIRM_PHONE_ACTION_EXPIRED,
    CONFIRM_PHONE_SMS_CODE_EXPIRED,
    SMS_CODE_EXPIRED,
    CONFIRM_PHONE_SMS_CODE_VERIFICATION_FAILED,
    SMS_CODE_VERIFICATION_FAILED,
    CONFIRM_PHONE_SMS_CODE_MAX_RETRIES_REACHED,
    SMS_CODE_MAX_RETRIES_REACHED,
    TOO_MANY_REQUESTS,
    CAPTCHA_CHECK_FAILED,
    SMS_FOR_IP_DAY_LIMIT_REACHED,
    SMS_FOR_PHONE_DAY_LIMIT_REACHED,
    UNABLE_TO_FIND_CONFIRM_PHONE_ACTION,
    CANNOT_RESET_ADMIN_USER,
    EMPTY_EXTERNAL_IDENTITY_ID_VALUE,
    GQL_ERRORS,
}
