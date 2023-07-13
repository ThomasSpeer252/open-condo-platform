/**
 * Generated by `createschema news.OrganizationNewsItem 'organization:Relationship:Organization:CASCADE; title:Text; body:Text; type:Select:common,emergency'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const { faker } = require('@faker-js/faker')
const { get, map } = require('lodash')

const { generateGQLTestUtils, throwIfError } = require('@open-condo/codegen/generate.test.utils')

const {
    EXPORT_NEWS_RECIPIENTS_MUTATION,
    GET_NEWS_ITEMS_RECIPIENTS_COUNTERS_MUTATION,
    NewsItem: NewsItemGQL,
    NewsItemScope: NewsItemScopeGQL,
    NewsItemTemplate: NewsItemTemplateGQL,
    NewsItemUserRead: NewsItemUserReadGQL,
    NewsItemRecipientsExportTask: NewsItemRecipientsExportTaskGQL,
} = require('@condo/domains/news/gql')
const { NEWS_TYPE_COMMON } = require('@condo/domains/news/constants/newsTypes')
const { FLAT_UNIT_TYPE } = require('@condo/domains/property/constants/common')
/* AUTOGENERATE MARKER <IMPORT> */

const NewsItem = generateGQLTestUtils(NewsItemGQL)
const NewsItemScope = generateGQLTestUtils(NewsItemScopeGQL)
const NewsItemTemplate = generateGQLTestUtils(NewsItemTemplateGQL)
const NewsItemUserRead = generateGQLTestUtils(NewsItemUserReadGQL)
const NewsItemRecipientsExportTask = generateGQLTestUtils(NewsItemRecipientsExportTaskGQL)

/* AUTOGENERATE MARKER <CONST> */

const propertyMap1x9x4 = {
    dv: 1,
    type: 'building',
    sections: [
        {
            id: '1',
            type: 'section',
            index: 1,
            name: '1',
            preview: null,
            /*
                 ___________________
                | 33 | 34 | 35 | 36 |
                |____|____|____|____|
                | 29 | 30 | 31 | 32 |
                |____|____|____|____|
                | 25 | 26 | 27 | 28 |
                |____|____|____|____|
                | 21 | 22 | 23 | 24 |
                |____|____|____|____|
                | 17 | 18 | 19 | 20 |
                |____|____|____|____|
                | 13 | 14 | 15 | 16 |
                |____|____|____|____|
                |  9 | 10 | 11 | 12 |
                |____|____|____|____|
                |  5 |  6 |  7 |  8 |
                |____|____|____|____|
                |  1 |  2 |  3 |  4 |
                |____|____|____|____|
             */
            floors: map(Array(9), (...[, floor]) => {
                const unitsCount = 4
                const floorPlus1 = floor + 1
                return {
                    id: String(floorPlus1),
                    type: 'floor',
                    index: floorPlus1,
                    name: String(floorPlus1),
                    units: map(Array(unitsCount), (...[, n]) => ({
                        id: String(floor * unitsCount + n + 1),
                        type: 'unit',
                        name: null,
                        label: String(floor * unitsCount + n + 1),
                        preview: null,
                        unitType: FLAT_UNIT_TYPE,
                    })),
                }
            }),
        },
    ],
    'parking': [],
}

async function createTestNewsItem (client, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const title = faker.lorem.words(3)
    const body = faker.lorem.words(13)
    const type = NEWS_TYPE_COMMON

    const attrs = {
        dv: 1,
        sender,
        title,
        body,
        type,
        organization: { connect: { id: organization.id } },
        ...extraAttrs,
    }
    const obj = await NewsItem.create(client, attrs)
    return [obj, attrs]
}

async function updateTestNewsItem (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await NewsItem.update(client, id, attrs)
    return [obj, attrs]
}

async function publishTestNewsItem (client, id) {
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }
    return updateTestNewsItem(client, id, { dv: 1, sender, isPublished: true })
}

async function createTestNewsItemScope (client, newsItem, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!newsItem || !newsItem.id) throw new Error('no newsItem.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        newsItem: { connect: { id: newsItem.id } },
        ...extraAttrs,
    }
    const obj = await NewsItemScope.create(client, attrs)
    return [obj, attrs]
}

async function updateTestNewsItemScope (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await NewsItemScope.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestNewsItemTemplate (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const title = faker.lorem.words(3)
    const body = faker.lorem.words(19)
    const type = NEWS_TYPE_COMMON

    const attrs = {
        dv: 1,
        sender,
        title,
        body,
        type,
        ...extraAttrs,
    }
    const obj = await NewsItemTemplate.create(client, attrs)
    return [obj, attrs]
}

async function updateTestNewsItemTemplate (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const title = faker.lorem.words(3)
    const body = faker.lorem.words(19)

    const attrs = {
        dv: 1,
        sender,
        title,
        body,
        ...extraAttrs,
    }
    const obj = await NewsItemTemplate.update(client, id, attrs)
    return [obj, attrs]
}

async function createTestNewsItemUserRead (client, newsItem, user, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!newsItem || !newsItem.id) throw new Error('no newsItem.id')
    if (!user || !user.id) throw new Error('no user.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        newsItem: { connect: { id: newsItem.id } },
        user: { connect: { id: user.id } },
        ...extraAttrs,
    }
    const obj = await NewsItemUserRead.create(client, attrs)
    return [obj, attrs]
}

async function updateTestNewsItemUserRead (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await NewsItemUserRead.update(client, id, attrs)
    return [obj, attrs]
}


async function exportNewsRecipientsByTestClient (client, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        organization: { id: organization.id },
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(EXPORT_NEWS_RECIPIENTS_MUTATION, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function getNewsItemsRecipientsCountersByTestClient (client, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const { data, errors } = await client.mutate(GET_NEWS_ITEMS_RECIPIENTS_COUNTERS_MUTATION, { data: attrs })
    throwIfError(data, errors)
    return [data.result, attrs]
}

async function createTestNewsItemRecipientsExportTask (client, user, organization, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!user || !user.id) throw new Error('no user.id')
    if (!organization || !organization.id) throw new Error('no organization.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // The all-organization scope by default
    const scopes = get(extraAttrs, 'scopes', [{ property: null, unitType: null, unitName: null }])

    const attrs = {
        dv: 1,
        sender,
        user: { connect: { id: user.id } },
        organization: { connect: { id: organization.id } },
        scopes,
        ...extraAttrs,
    }
    const obj = await NewsItemRecipientsExportTask.create(client, attrs)
    return [obj, attrs]
}

async function updateTestNewsItemRecipientsExportTask (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await NewsItemRecipientsExportTask.update(client, id, attrs)
    return [obj, attrs]
}

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    propertyMap1x9x4,
    NewsItem, createTestNewsItem, updateTestNewsItem, publishTestNewsItem,
    NewsItemScope, createTestNewsItemScope, updateTestNewsItemScope,
    NewsItemTemplate, createTestNewsItemTemplate, updateTestNewsItemTemplate,
    NewsItemUserRead, createTestNewsItemUserRead, updateTestNewsItemUserRead,
    exportNewsRecipientsByTestClient,
    getNewsItemsRecipientsCountersByTestClient,
    NewsItemRecipientsExportTask, createTestNewsItemRecipientsExportTask, updateTestNewsItemRecipientsExportTask,
    /* AUTOGENERATE MARKER <EXPORTS> */
}
