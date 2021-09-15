/**
 * Generated by `createservice user.SigninAsUserService`
 */
const { throwAuthenticationError } = require('@condo/domains/common/utils/apolloErrorFormatter')

async function canSigninAsUser ({ authentication: { item: user } }) {
    if (!user) return throwAuthenticationError()
    if (user.isAdmin) return true
    if (user.isSupport) return true
    return false
}

module.exports = {
    canSigninAsUser,
}
