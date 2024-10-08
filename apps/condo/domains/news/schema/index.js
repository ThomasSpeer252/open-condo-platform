/**
 * This file is autogenerated by `createschema news.OrganizationNewsItem 'organization:Relationship:Organization:CASCADE; title:Text; body:Text; type:Select:common,emergency'`
 * In most cases you should not change it by hands. And please don't remove `AUTOGENERATE MARKER`s
 */

const { GetNewsItemsRecipientsCountersService } = require('./GetNewsItemsRecipientsCountersService')
const { GetNewsSharingRecipientsCountersService } = require('./GetNewsSharingRecipientsCountersService')
const { GetNewsSharingRecipientsService } = require('./GetNewsSharingRecipientsService')
const { NewsItem } = require('./NewsItem')
const { NewsItemRecipientsExportTask } = require('./NewsItemRecipientsExportTask')
const { NewsItemScope } = require('./NewsItemScope')
const { NewsItemSharing } = require('./NewsItemSharing')
const { NewsItemTemplate } = require('./NewsItemTemplate')
const { NewsItemUserRead } = require('./NewsItemUserRead')
/* AUTOGENERATE MARKER <REQUIRE> */

module.exports = {
    NewsItem,
    NewsItemScope,
    NewsItemTemplate,
    NewsItemUserRead,
    GetNewsItemsRecipientsCountersService,
    NewsItemRecipientsExportTask,
    NewsItemSharing,
    GetNewsSharingRecipientsService,
    GetNewsSharingRecipientsCountersService,
/* AUTOGENERATE MARKER <EXPORTS> */
}
