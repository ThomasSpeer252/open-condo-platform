/*
* refs to: https://doma.atlassian.net/browse/SBERDOMA-97
* */

const { RU_LOCALE, EN_LOCALE } = require('@condo/domains/common/constants/locale')
const STATUS_IDS = {
    OPEN: '6ef3abc4-022f-481b-90fb-8430345ebfc2',
    IN_PROGRESS: 'aa5ed9c2-90ca-4042-8194-d3ed23cb7919',
    DECLINED: 'f0fa0093-8d86-4e69-ae1a-70a2914da82f',
    COMPLETED: '5b9decd7-792c-42bb-b16d-822142fd2d69',
    DEFERRED: 'c14a58e0-6b5d-4ec2-b91c-980a90509c7f',
    CLOSED: 'c14a58e0-6b5d-4ec2-b91c-980a90111c7d',
}

const DEFAULT_STATUS_TRANSITIONS = {
    'dv':1,
    [STATUS_IDS.OPEN]: [STATUS_IDS.IN_PROGRESS, STATUS_IDS.DEFERRED, STATUS_IDS.DECLINED],
    [STATUS_IDS.IN_PROGRESS]: [STATUS_IDS.DEFERRED, STATUS_IDS.COMPLETED, STATUS_IDS.OPEN, STATUS_IDS.DECLINED],
    [STATUS_IDS.COMPLETED]: [STATUS_IDS.OPEN, STATUS_IDS.CLOSED],
    [STATUS_IDS.DECLINED]: [],
    [STATUS_IDS.DEFERRED]: [STATUS_IDS.OPEN, STATUS_IDS.DECLINED],
}

const COUNTRY_RELATED_STATUS_TRANSITIONS = {
    [RU_LOCALE]: DEFAULT_STATUS_TRANSITIONS,
    [EN_LOCALE]: DEFAULT_STATUS_TRANSITIONS,
}

module.exports = {
    STATUS_IDS,
    DEFAULT_STATUS_TRANSITIONS,
    COUNTRY_RELATED_STATUS_TRANSITIONS,
}
