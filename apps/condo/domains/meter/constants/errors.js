const VALUE_LESS_THAN_PREVIOUS_ERROR = '[value:lessThanPrevious:'
const EXISTING_METER_NUMBER_IN_SAME_ORGANIZATION = '[unique:alreadyExists:number]'
const EXISTING_METER_ACCOUNT_NUMBER_IN_OTHER_UNIT = '[unique:alreadyExists:accountNumber]'
const B2B_APP_NOT_CONNECTED = '[b2bApp:notConnected] Linked B2B app must be connected to organization'
const B2C_APP_NOT_AVAILABLE = '[b2cApp:notAvailable] Linked B2C app have is not available on meter\'s property address'

const METER_NUMBER_HAVE_INVALID_VALUE = 'METER_NUMBER_HAVE_INVALID_VALUE'
const METER_ACCOUNT_NUMBER_HAVE_INVALID_VALUE = 'METER_ACCOUNT_NUMBER_HAVE_INVALID_VALUE'
const METER_RESOURCE_OWNED_BY_ANOTHER_ORGANIZATION = 'METER_RESOURCE_OWNED_BY_ANOTHER_ORGANIZATION'
const SAME_NUMBER_AND_RESOURCE_EXISTS_IN_ORGANIZATION = 'SAME_NUMBER_AND_RESOURCE_EXISTS_IN_ORGANIZATION'
const SAME_ACCOUNT_NUMBER_EXISTS_IN_OTHER_UNIT = 'SAME_ACCOUNT_NUMBER_EXISTS_IN_OTHER_UNIT'
const NUMBER_OF_TARIFFS_NOT_VALID = 'NUMBER_OF_TARIFFS_NOT_VALID'

const INVALID_START_DATE_TIME = 'INVALID_START_DATE_TIME'
const INVALID_END_DATE_TIME = 'INVALID_END_DATE_TIME'
const INVALID_PERIOD = 'INVALID_PERIOD'

const TOO_MUCH_READINGS = 'TOO_MUCH_READINGS'
const ORGANIZATION_NOT_FOUND = 'ORGANIZATION_NOT_FOUND'
const PROPERTY_NOT_FOUND = 'PROPERTY_NOT_FOUND'
const INVALID_METER_VALUES = 'INVALID_METER_VALUES'
const MULTIPLE_METERS_FOUND = 'MULTIPLE_METERS_FOUND'
const INVALID_ACCOUNT_NUMBER = 'INVALID_ACCOUNT_NUMBER'
const INVALID_METER_NUMBER = 'INVALID_METER_NUMBER'
const INVALID_DATE = 'INVALID_DATE'

const METER_READING_DATE_IN_FUTURE = 'METER_READING_DATE_IN_FUTURE'

module.exports = {
    VALUE_LESS_THAN_PREVIOUS_ERROR,
    EXISTING_METER_NUMBER_IN_SAME_ORGANIZATION,
    EXISTING_METER_ACCOUNT_NUMBER_IN_OTHER_UNIT,
    B2B_APP_NOT_CONNECTED,
    B2C_APP_NOT_AVAILABLE,
    METER_NUMBER_HAVE_INVALID_VALUE,
    METER_ACCOUNT_NUMBER_HAVE_INVALID_VALUE,
    METER_RESOURCE_OWNED_BY_ANOTHER_ORGANIZATION,
    SAME_NUMBER_AND_RESOURCE_EXISTS_IN_ORGANIZATION,
    SAME_ACCOUNT_NUMBER_EXISTS_IN_OTHER_UNIT,
    NUMBER_OF_TARIFFS_NOT_VALID,
    INVALID_START_DATE_TIME,
    INVALID_END_DATE_TIME,
    INVALID_PERIOD,
    TOO_MUCH_READINGS,
    ORGANIZATION_NOT_FOUND,
    PROPERTY_NOT_FOUND,
    INVALID_METER_VALUES,
    MULTIPLE_METERS_FOUND,
    INVALID_ACCOUNT_NUMBER,
    INVALID_METER_NUMBER,
    INVALID_DATE,
    METER_READING_DATE_IN_FUTURE,
}
