/**
 * Generated by `createservice user.ResetUserService --type mutations`
 */

/**
 * Reset user mutation removes phone, email and password from user, making it impossible to use this user.
 *
 * Mutation also sets name to "Deleted User" and do not set deletedAt.
 * Reason for this is the fact that if we soft-delete user, then we are about to face a lot of "user is null" kind of errors in unpredictable places.
 * Name is changed so we can distinguish reset users.
 *
 * Telegram uses the same approach: if user is deleted, then all his messages and other content are available, but his name is now "Deleted user"
 *
 * Primary use cases:
 * 1. QA Wants to test SMS services, but dont want to get multiple phone numbers
 * 2. User wants to remove all his data from our system.
 */

const { GQLCustomSchema, getById } = require('@core/keystone/schema')

const access = require('@condo/domains/user/access/ResetUserService')
const { DELETED_USER_NAME } = require('@condo/domains/user/constants')
const { User } = require('@condo/domains/user/utils/serverSchema')

const { GQLError, GQLErrorCode: { BAD_USER_INPUT, FORBIDDEN } } = require('@core/keystone/errors')
const { DV_VERSION_MISMATCH } = require('@condo/domains/common/constants/errors')
const { USER_NOT_FOUND, CANNOT_RESET_ADMIN_USER } = require('../constants/errors')

const errors = {
    DV_VERSION_MISMATCH: {
        mutation: 'resetUser',
        variable: ['data', 'dv'],
        code: BAD_USER_INPUT,
        type: DV_VERSION_MISMATCH,
        message: 'Unsupported value for dv',
    },
    USER_NOT_FOUND: {
        mutation: 'resetUser',
        variable: ['data', 'user', 'id'],
        code: BAD_USER_INPUT,
        type: USER_NOT_FOUND,
        message: 'Could not find User by provided id',
    },
    CANNOT_RESET_ADMIN_USER: {
        mutation: 'resetUser',
        variable: ['data', 'user', 'id'],
        code: FORBIDDEN,
        type: CANNOT_RESET_ADMIN_USER,
        message: 'You cannot reset admin user',
    },
}


const ResetUserService = new GQLCustomSchema('ResetUserService', {
    types: [
        {
            access: true,
            type: 'input ResetUserInput { dv: Int! sender: SenderFieldInput! user: UserWhereUniqueInput!}',
        },
        {
            access: true,
            type: 'type ResetUserOutput { status: String! }',
        },
    ],
    
    mutations: [
        {
            access: access.canResetUser,
            schema: 'resetUser(data: ResetUserInput!): ResetUserOutput!',
            doc: {
                summary: 'Used by QA for cleaning existing test user record to avoid utilizing every time new phone and email, which is hard to obtain again and again for every manual testing procedure',
                errors,
            },
            resolver: async (parent, args, context, info, extra = {}) => {
                const { data } = args
                const { dv, user } = data

                if (dv !== 1) {
                    throw new GQLError(errors.DV_VERSION_MISMATCH, context)
                }

                const userEntity = await getById('User', user.id)
                if (!userEntity) {
                    throw new GQLError(errors.USER_NOT_FOUND, context)
                }

                if (userEntity.isAdmin) {
                    throw new GQLError(errors.CANNOT_RESET_ADMIN_USER, context)
                }

                await User.update(context, user.id, {
                    phone: null,
                    email: null,
                    password: null,
                    name: DELETED_USER_NAME,
                    isPhoneVerified: false,
                    isEmailVerified: false,
                    importId: null,
                    importRemoteSystem: null,
                    isAdmin: false,
                    isSupport: false,
                })

                return { status: 'ok' }
            },
        },
    ],
    
})

module.exports = {
    ResetUserService,
}
