/**
 * Generated by `createschema news.OrganizationNewsItem 'organization:Relationship:Organization:CASCADE; title:Text; body:Text; type:Select:common,emergency'`
 */

const BadWordsNext = require('bad-words-next')
const badWordsRu = require('bad-words-next/data/ru.json')
const badWordsRuLat = require('bad-words-next/data/ru_lat.json')
const dayjs = require('dayjs')
const get = require('lodash/get')
const isEmpty = require('lodash/isEmpty')

const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { AutoIncrementInteger } = require('@open-condo/keystone/fields')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/news/access/NewsItem')
const {
    EMPTY_VALID_BEFORE_DATE,
    VALIDITY_DATE_LESS_THAN_SEND_DATE,
    EDIT_DENIED_ALREADY_SENT,
    EDIT_DENIED_PUBLISHED,
    PROFANITY_TITLE_DETECTED_MOT_ERF_KER,
    PROFANITY_BODY_DETECTED_MOT_ERF_KER,
    WRONG_SEND_DATE,
    NO_NEWS_ITEM_SCOPES,
} = require('@condo/domains/news/constants/errors')
const { NEWS_TYPES, NEWS_TYPE_EMERGENCY, NEWS_TYPE_COMMON } = require('@condo/domains/news/constants/newsTypes')
const { notifyResidentsAboutNewsItem } = require('@condo/domains/news/tasks')
const { NewsItemScope } = require('@condo/domains/news/utils/serverSchema')
const { checkBadWordsExclusions } = require('@condo/domains/news/utils/serverSchema/badWords')

const badWords = new BadWordsNext()
badWords.add(badWordsRu)
badWords.add(badWordsRuLat)

const ERRORS = {
    EMPTY_VALID_BEFORE_DATE: {
        code: BAD_USER_INPUT,
        type: EMPTY_VALID_BEFORE_DATE,
        message: 'The date the news item valid before is empty',
        messageForUser: 'api.newsItem.EMPTY_VALID_BEFORE_DATE',
        mutation: 'createNewsItem',
        variable: ['data', 'validBefore'],
    },
    VALIDITY_DATE_LESS_THAN_SEND_DATE: {
        code: BAD_USER_INPUT,
        type: VALIDITY_DATE_LESS_THAN_SEND_DATE,
        message: 'The validity date is less than send date',
        messageForUser: 'api.newsItem.VALIDITY_DATE_LESS_THAN_SEND_DATE',
        mutation: 'updateNewsItem',
    },
    EDIT_DENIED_ALREADY_SENT: {
        code: BAD_USER_INPUT,
        type: EDIT_DENIED_ALREADY_SENT,
        message: 'The sent news item is restricted from editing',
        messageForUser: 'api.newsItem.EDIT_DENIED_ALREADY_SENT',
        mutation: 'updateNewsItem',
    },
    EDIT_DENIED_PUBLISHED: {
        code: BAD_USER_INPUT,
        type: EDIT_DENIED_PUBLISHED,
        message: 'The published news item is restricted from editing',
        messageForUser: 'api.newsItem.EDIT_DENIED_PUBLISHED',
        mutation: 'updateNewsItem',
    },
    PROFANITY_TITLE_DETECTED_MOT_ERF_KER: {
        code: BAD_USER_INPUT,
        type: PROFANITY_TITLE_DETECTED_MOT_ERF_KER,
        message: 'Profanity in title detected',
        messageForUser: 'api.newsItem.PROFANITY_TITLE_DETECTED_MOT_ERF_KER',
    },
    PROFANITY_BODY_DETECTED_MOT_ERF_KER: {
        code: BAD_USER_INPUT,
        type: PROFANITY_BODY_DETECTED_MOT_ERF_KER,
        message: 'Profanity in body detected',
        messageForUser: 'api.newsItem.PROFANITY_BODY_DETECTED_MOT_ERF_KER',
    },
    WRONG_SEND_DATE: {
        code: BAD_USER_INPUT,
        type: WRONG_SEND_DATE,
        message: 'Wrong send date',
        messageForUser: 'api.newsItem.WRONG_SEND_DATE',
    },
    NO_NEWS_ITEM_SCOPES: {
        code: BAD_USER_INPUT,
        type: NO_NEWS_ITEM_SCOPES,
        message: 'The news item without scopes publishing is forbidden',
        messageForUser: 'api.newsItem.NO_NEWS_ITEM_SCOPES',
    },
}

const readOnlyFieldsWhenPublished = ['organization', 'title', 'body', 'type', 'sendAt']

const NewsItem = new GQLListSchema('NewsItem', {
    schemaDoc: 'The news item created by the organization to show on resident\'s mobile devices',
    labelResolver: ({ title, type }) => `${type === NEWS_TYPE_EMERGENCY ? '🚨' : ''} ${title}`,
    fields: {

        organization: {
            schemaDoc: 'The organization the news item created by',
            type: 'Relationship',
            ref: 'Organization',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        number: {
            schemaDoc: 'The news item number',
            type: AutoIncrementInteger,
            isRequired: false,
            autoIncrementScopeFields: ['organization'],
        },

        title: {
            schemaDoc: 'The news item title',
            type: 'Text',
            isRequired: true,
        },

        body: {
            schemaDoc: 'The news item main body',
            type: 'Text',
            isRequired: true,
        },

        type: {
            schemaDoc: 'The news item type. The `common` type generates push messages no more than 1 per hour per single user. Also, the resident may disable push messages for this type. The `emergency` type will always be accompanied by a push message and shown at the top of the news list. Also, this type always has a news item validity date.',
            type: 'Select',
            options: NEWS_TYPES,
            isRequired: true,
        },

        validBefore: {
            schemaDoc: 'Date before which the news item makes sense',
            type: 'DateTimeUtc',
        },

        sendAt: {
            schemaDoc: 'UTC (!) Date to publish the news item and to send notifications',
            type: 'DateTimeUtc',
        },

        scopes: {
            type: 'Relationship',
            ref: 'NewsItemScope.newsItem',
            many: true,
            access: {
                read: ({ authentication: { item: user } }) => (user.isAdmin || user.isSupport),
                create: false,
                update: false,
            },
        },

        sentAt: {
            schemaDoc: 'The date when newsItem was sent to residents. This is an internal field used to detect was the message has already been sent or not.',
            type: 'DateTimeUtc',
        },

        isPublished: {
            schemaDoc: 'Shows if the news item is ready to be shown and send to residents',
            type: 'Checkbox',
            defaultValue: false,
        },

        publishedAt: {
            schemaDoc: 'The date when the news item was published. It is an auto-Calculated field.',
            type: 'DateTimeUtc',
            hooks: {
                resolveInput: ({ resolvedData, fieldPath }) => (
                    resolvedData['isPublished'] ? dayjs().toISOString() : resolvedData[fieldPath]
                ),
            },
            access: {
                read: true,
                create: false,
                update: false,
            },
        },

    },
    hooks: {
        resolveInput: async (args) => {
            const { resolvedData, existingItem } = args
            const resultItemData = { ...existingItem, ...resolvedData }

            if (!get(resultItemData, 'type')) {
                resolvedData['type'] = NEWS_TYPE_COMMON
            }

            return resolvedData
        },
        validateInput: async (args) => {
            const { resolvedData, existingItem, context, operation } = args
            const resultItemData = { ...existingItem, ...resolvedData }

            const sendAt = get(resolvedData, 'sendAt')
            const sentAt = get(existingItem, 'sentAt')
            const resultSendAt = get(resultItemData, 'sendAt')
            const resultValidBefore = get(resultItemData, 'validBefore')
            const isPublished = get(existingItem, 'isPublished')
            const type = get(resultItemData, 'type')
            const resolvedIsPublished = get(resolvedData, 'isPublished')

            if (resolvedIsPublished) {
                const scopesCount = existingItem ? await NewsItemScope.count(context, { newsItem: { id: existingItem.id } }) : 0
                if (scopesCount === 0) {
                    throw new GQLError(ERRORS.NO_NEWS_ITEM_SCOPES, context)
                }
            }

            if (operation === 'update') {
                if (sentAt) {
                    throw new GQLError(ERRORS.EDIT_DENIED_ALREADY_SENT, context)
                }
                if (isPublished) {
                    for (const readOnlyField of readOnlyFieldsWhenPublished) {
                        if (!isEmpty(get(resolvedData, readOnlyField))) {
                            throw new GQLError(ERRORS.EDIT_DENIED_PUBLISHED, context)
                        }
                    }
                }
            }

            if (type === NEWS_TYPE_EMERGENCY && !resultValidBefore) {
                throw new GQLError(ERRORS.EMPTY_VALID_BEFORE_DATE, context)
            }

            if (!!sendAt && Date.parse(sendAt) < Date.parse(dayjs())) {
                throw new GQLError(ERRORS.WRONG_SEND_DATE, context)
            }

            if (!!resultSendAt && !!resultValidBefore && Date.parse(resultValidBefore) < Date.parse(resultSendAt)) {
                throw new GQLError(ERRORS.VALIDITY_DATE_LESS_THAN_SEND_DATE, context)
            }

            const titleBadWords = []
            const nextTitle = get(resolvedData, 'title')
            if (nextTitle) {
                badWords.filter(nextTitle, (badWord) => {
                    if (checkBadWordsExclusions(badWord)) return
                    titleBadWords.push(badWord)
                })
            }

            const bodyBadWords = []
            const nextBody = get(resolvedData, 'body')
            if (nextBody) {
                badWords.filter(nextBody, (badWord) => {
                    if (checkBadWordsExclusions(badWord)) return
                    bodyBadWords.push(badWord)
                })
            }

            if (titleBadWords.length > 0) {
                throw new GQLError({
                    ...ERRORS.PROFANITY_TITLE_DETECTED_MOT_ERF_KER,
                    badWords: [...titleBadWords].join(','),
                }, context)
            }
            if (bodyBadWords.length > 0) {
                throw new GQLError({
                    ...ERRORS.PROFANITY_BODY_DETECTED_MOT_ERF_KER,
                    badWords: [...bodyBadWords].join(','),
                }, context)
            }
        },

        afterChange: async ({ updatedItem }) => {
            if (
                updatedItem.isPublished
                && !updatedItem.sendAt // There is a cron task to send delayed news items
                && !updatedItem.sentAt
            ) {
                await notifyResidentsAboutNewsItem.delay(updatedItem.id)
            }
        },
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadNewsItems,
        create: access.canManageNewsItems,
        update: access.canManageNewsItems,
        delete: false,
        auth: true,
    },
})

module.exports = {
    NewsItem,
}
