/**
 * Generated by `createschema notification.MessageUserBlackList 'user?:Relationship:User:CASCADE; phone?:Text; email?:Text; description:Text'`
 */

const { Text, Relationship, Select } = require('@keystonejs/fields')
const { GQLListSchema } = require('@condo/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@condo/keystone/plugins')
const { dvAndSender } = require('@condo/domains/common/schema/plugins/dvAndSender')
const access = require('@condo/domains/notification/access/MessageUserBlackList')
const { MESSAGE_TYPES } = require('@condo/domains/notification/constants/constants')

const MessageUserBlackList = new GQLListSchema('MessageUserBlackList', {
    schemaDoc: 'Rule for blocking messages (specific type or all) for user, phone or email',
    fields: {
        user: {
            schemaDoc: 'The user to whom we want to block sending messages',
            type: Relationship,
            ref: 'User',
            kmigratorOptions: { null: true, on_delete: 'models.CASCADE' },
        },

        phone: {
            schemaDoc: 'The phone number to which we want to block sending messages',
            type: Text,
        },

        email: {
            schemaDoc: 'Email to which we want to block the sending of messages',
            type: Text,
        },

        type: {
            schemaDoc: 'The type of message we want to block (null means all types)',
            type: Select,
            options: MESSAGE_TYPES,
            dataType: 'string',
            isRequired: false,
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true },
        },

        description: {
            schemaDoc: 'The reason why the entry was added to the MessageUserBlackList',
            type: Text,
            isRequired: true,
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['user', 'type'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'message_user_black_list_unique_user_and_type',
            },
            {
                type: 'models.UniqueConstraint',
                fields: ['phone', 'type'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'message_user_black_list_unique_phone_and_type',
            },
            {
                type: 'models.UniqueConstraint',
                fields: ['email', 'type'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'message_user_black_list_unique_email_and_type',
            },
        ],
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadMessageUserBlackLists,
        create: access.canManageMessageUserBlackLists,
        update: access.canManageMessageUserBlackLists,
        delete: false,
        auth: true,
    },
})

module.exports = {
    MessageUserBlackList,
}
