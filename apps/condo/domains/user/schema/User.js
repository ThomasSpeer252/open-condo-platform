/**
 * Generated by `createschema user.User name:Text; password?:Password; isAdmin?:Checkbox; email?:Text; isEmailVerified?:Checkbox; phone?:Text; isPhoneVerified?:Checkbox; avatar?:File; meta:Json; importId:Text;`
 */

const { Text, Checkbox, Password, File, Select, Virtual } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/user/access/User')
const { normalizePhone } = require('@condo/domains/common/utils/phone')
const { get, isEmpty, isUndefined, isNull } = require('lodash')

const FileAdapter = require('@condo/domains/common/utils/fileAdapter')
const { updateEmployeesRelatedToUser, User: UserAPI } = require('@condo/domains/user/utils/serverSchema')
const { normalizeEmail } = require('@condo/domains/common/utils/mail')
const { STAFF, USER_TYPES } = require('@condo/domains/user/constants/common')
const { EMAIL_ALREADY_REGISTERED_ERROR, PHONE_ALREADY_REGISTERED_ERROR, EMAIL_WRONG_FORMAT_ERROR, PHONE_WRONG_FORMAT_ERROR, PHONE_IS_REQUIRED_ERROR } = require('@condo/domains/user/constants/errors')

const AVATAR_FILE_ADAPTER = new FileAdapter('avatars')

const User = new GQLListSchema('User', {
    schemaDoc: 'Individual / person / service account / impersonal company account. Used primarily for authorization purposes, optimized access control with checking of `type` field, tracking authority of performed CRUD operations. Think of `User` as a technical entity, not a business actor. Business actor entities are Resident, OrganizationEmployee etc., — they are participating in high-level business scenarios and have connected to `User`. Almost everyting, created in the system, ends up to `User` as a source of action.',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        name: {
            schemaDoc: 'Name. If impersonal account should be a company name',
            type: Text,
        },
        hasEmail: {
            type: Virtual,
            resolver: (item) => Boolean(item.email),
            args: [{ name: 'formatAs', type: 'String' }],
            access: true,
        },
        password: {
            schemaDoc: 'Password. Update only',
            type: Password,
            access: access.canAccessToPasswordField,
        },
        type: {
            schemaDoc: 'Field that allows you to distinguish CRM users from mobile app users',
            type: Select,
            dataType: 'enum',
            options: USER_TYPES,
            defaultValue: STAFF,
            isRequired: true,
        },
        // TODO(pahaz): useless! remove it or write auth checks!
        isActive: {
            schemaDoc: 'Can logged in?',
            type: Checkbox,
            defaultValue: false,
            access: access.canAccessToIsAdminField,
        },

        isAdmin: {
            schemaDoc: 'Superuser access to service data',
            type: Checkbox,
            defaultValue: false,
            access: access.canAccessToIsAdminField,
        },

        isSupport: {
            schemaDoc: 'Can access to "/admin/" panel. And do support tasks',
            type: Checkbox,
            defaultValue: false,
            access: access.canAccessToIsAdminField,
        },

        email: {
            schemaDoc: 'Email. Transformed to lower case',
            type: Text,
            access: access.canAccessToEmailField,
            kmigratorOptions: { null: true, unique: false },
            hooks: {
                resolveInput: ({ resolvedData }) => {
                    // NOTE: undefined and null are different!
                    if (isUndefined(resolvedData.email)) return undefined
                    if (isNull(resolvedData.email) || isEmpty(resolvedData.email)) return null
                    return normalizeEmail(resolvedData['email']) || resolvedData['email']
                },
                validateInput: async ({ context, operation, resolvedData, existingItem, addFieldValidationError }) => {
                    if (resolvedData['email'] && normalizeEmail(resolvedData['email']) !== resolvedData['email']) {
                        addFieldValidationError(`${EMAIL_WRONG_FORMAT_ERROR}mail] invalid format`)
                    }
                    if (resolvedData.email === null) {
                        return
                    }
                    if (get(resolvedData, 'email', '').length) {
                        let existedUsers = []
                        const userType = resolvedData.type || STAFF
                        if (operation === 'create') {
                            existedUsers = await UserAPI.getAll(context, { email: resolvedData['email'], type: userType, deletedAt: null })
                        } else if (operation === 'update' && resolvedData.email !== existingItem.email) {
                            existedUsers = await UserAPI.getAll(context, { email: resolvedData['email'], type: userType, deletedAt: null })
                        }
                        if (existedUsers && existedUsers.length > 0) {
                            addFieldValidationError(`${EMAIL_ALREADY_REGISTERED_ERROR}] user already exists`)
                        }
                    }
                },
            },
        },

        isEmailVerified: {
            schemaDoc: 'Email verification flag. User verify email by access to secret link',
            type: Checkbox,
            defaultValue: false,
            access: access.canAccessToIsEmailVerifiedField,
        },
        // Phone needs to be uniq together with type field. Keystone do not support multi fields indexes
        phone: {
            schemaDoc: 'Phone. In international E.164 format without spaces',
            type: Text,
            access: access.canAccessToPhoneField,
            hooks: {
                resolveInput: ({ resolvedData }) => {
                    // NOTE: undefined and null are different!
                    if (isUndefined(resolvedData.phone)) return undefined
                    if (isNull(resolvedData.phone) || isEmpty(resolvedData.phone)) return null
                    return normalizePhone(resolvedData['phone']) || resolvedData['phone']
                },
                validateInput: async ({ context, operation, resolvedData, existingItem, addFieldValidationError }) => {
                    if (resolvedData['phone'] && normalizePhone(resolvedData['phone']) !== resolvedData['phone']) {
                        addFieldValidationError(`${PHONE_WRONG_FORMAT_ERROR}] invalid format`)
                        return
                    }
                    if (isUndefined(resolvedData.phone) && operation === 'update') return
                    if (!resolvedData.phone) {
                        addFieldValidationError(`${PHONE_IS_REQUIRED_ERROR}] phone is required`)
                    } else if (get(resolvedData, 'phone', '').length) {
                        let existedUsers = []
                        const userType = resolvedData.type || STAFF
                        if (operation === 'create') {
                            existedUsers = await UserAPI.getAll(context, { phone: resolvedData['phone'], type: userType, deletedAt: null })
                        } else if (operation === 'update' && resolvedData.phone !== existingItem.phone) {
                            existedUsers = await UserAPI.getAll(context, { phone: resolvedData['phone'], type: userType, deletedAt: null })
                        }
                        if (existedUsers && existedUsers.length > 0) {
                            addFieldValidationError(`${PHONE_ALREADY_REGISTERED_ERROR}] user already exists`)
                        }
                    }
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
            schemaDoc: 'User loaded avatar image',
            type: File,
            adapter: AVATAR_FILE_ADAPTER,
        },

        meta: {
            schemaDoc: 'User metadata. Example: `city`, `country`, ...',
            type: Json,
            // TODO(pahaz): we should check the structure!
        },

        importRemoteSystem: {
            schemaDoc: 'External provider for users',
            type: Text,
            access: access.canAccessToImportField,
            kmigratorOptions: { null: true, unique: false },
        },
        importId: {
            schemaDoc: 'External system user id. Used for integrations',
            type: Text,
            access: access.canAccessToImportField,
            kmigratorOptions: { null: true, unique: false },
        },

    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['type', 'phone'],
                name: 'unique_type_and_phone',
            },
            {
                type: 'models.UniqueConstraint',
                fields: ['type', 'email'],
                name: 'unique_type_and_email',
            },
            {
                type: 'models.UniqueConstraint',
                fields: ['importId', 'importRemoteSystem'],
                name: 'unique_user_importid_and_importremotesystem',
            },
        ],
    },
    hooks: {
        afterChange: async ({ updatedItem, context, existingItem, operation }) => {
            if (
                operation === 'update' && existingItem &&
                (updatedItem.phone !== existingItem.phone ||
                updatedItem.email !== existingItem.email ||
                updatedItem.name !== existingItem.name)
            ) {
                await updateEmployeesRelatedToUser(context, updatedItem)
            }
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
