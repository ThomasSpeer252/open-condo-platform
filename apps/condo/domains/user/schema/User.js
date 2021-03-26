/**
 * Generated by `createschema user.User name:Text; password?:Password; isAdmin?:Checkbox; email?:Text; isEmailVerified?:Checkbox; phone?:Text; isPhoneVerified?:Checkbox; avatar?:File; meta:Json; importId:Text;`
 */

const { Text, Checkbox, Password, File } = require('@keystonejs/fields')
const { LocalFileAdapter } = require('@keystonejs/file-adapters')

const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const conf = require('@core/config')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/user/access/User')


// TODO(pahaz): we should change it to Remote S3 like storage! #scalability
const AVATAR_FILE_ADAPTER = new LocalFileAdapter({
    src: `${conf.MEDIA_ROOT}/avatars`,
    path: `${conf.MEDIA_URL}/avatars`,
})

const User = new GQLListSchema('User', {
    schemaDoc: 'Individual / person / service account / impersonal company account',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        name: {
            schemaDoc: 'Name. If impersonal account should be a company name',
            type: Text,
        },

        password: {
            schemaDoc: 'Password. Update only',
            type: Password,
            access: access.canAccessToPasswordField,
        },

        isAdmin: {
            schemaDoc: 'Can access to "/admin/" panel?',
            type: Checkbox,
            defaultValue: false,
            access: access.canAccessToIsAdminField,
        },

        email: {
            schemaDoc: 'Email. Transformed to lower case',
            type: Text,
            access: access.canAccessToEmailField,
            kmigratorOptions: { null: true, unique: true },
            hooks: {
                resolveInput: ({ resolvedData }) => {
                    return resolvedData['email'] && resolvedData['email'].toLowerCase()
                },
            },
        },

        isEmailVerified: {
            schemaDoc: 'Email verification flag. User verify email by access to secret link',
            type: Checkbox,
            defaultValue: false,
            access: access.canAccessToIsEmailVerifiedField,
        },

        phone: {
            schemaDoc: 'Phone. In international E.164 format without spaces',
            type: Text,
            access: access.canAccessToPhoneField,
            kmigratorOptions: { null: true, unique: true },
            hooks: {
                resolveInput: ({ resolvedData }) => {
                    return resolvedData['phone'] && resolvedData['phone'].toLowerCase().replace(/[^+0-9]/g, '')
                },
            },
        },

        isPhoneVerified: {
            schemaDoc: 'Phone verification flag. User verify phone by access to secret sms message',
            type: Checkbox,
            defaultValue: false,
            access: access.canAccessToIsPhoneVerifiedField,
        },

        avatar: {
            schemaDoc: 'User loaded avarat image',
            type: File,
            adapter: AVATAR_FILE_ADAPTER,
        },

        meta: {
            schemaDoc: 'User metadata',
            type: Json,
            // TODO(pahaz): we should check the structure!
        },

        // TODO(pahaz): should we also add remote system?
        importId: {
            schemaDoc: 'External system user id. Used for integrations',
            type: Text,
            access: access.canAccessToImportIdField,
            kmigratorOptions: { null: true, unique: true },
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadUsers,
        create: access.canManageUsers,
        update: access.canManageUsers,
        delete: false,
        auth: true,
    },
})

module.exports = {
    User,
}
