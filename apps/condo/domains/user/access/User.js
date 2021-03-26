/**
 * Generated by `createschema user.User name:Text; password?:Password; isAdmin?:Checkbox; email?:Text; isEmailVerified?:Checkbox; phone?:Text; isPhoneVerified?:Checkbox; avatar?:File; meta:Json; importId:Text;`
 */
const access = require('@core/keystone/access')

async function canReadUsers ({ authentication: { item: user } }) {
    if (!user || !user.id) return false
    if (user.isAdmin) return true
    return true
}

async function canManageUsers ({ authentication: { item: user }, operation, existingItem }) {
    if (!user) return false
    if (user.isAdmin) return true
    if (operation === 'create') {
        // NOTE: only by Admins!
        return false
    } else if (operation === 'update') {
        // NOTE: allow to self-user to update
        if (existingItem.id === user.id) return true
        return true
    }
    return false
}

const readByAnyUpdateByAdminField = {
    read: true,
    create: access.userIsAdmin,
    update: access.userIsAdmin,
}

const canAccessToEmailField = access.userIsAdminOrIsThisItem
const canAccessToPhoneField = access.userIsAdminOrIsThisItem
const canAccessToPasswordField = {
    // 3. Only admins can see if a password is set. No-one can read their own or other user's passwords.
    read: access.userIsAdmin,
    create: access.userIsAdmin,
    // 4. Only authenticated users can update their own password. Admins can update anyone's password.
    update: access.userIsAdminOrIsThisItem,
}
const canAccessToIsAdminField = {
    read: true,
    create: false,
    update: false,
}
const canAccessToIsEmailVerifiedField = readByAnyUpdateByAdminField
const canAccessToIsPhoneVerifiedField = readByAnyUpdateByAdminField
const canAccessToImportIdField = readByAnyUpdateByAdminField

/*
  Rules are logical functions that used for list access, and may return a boolean (meaning
  all or no items are available) or a set of filters that limit the available items.
*/
module.exports = {
    canReadUsers,
    canManageUsers,
    canAccessToEmailField,
    canAccessToPhoneField,
    canAccessToPasswordField,
    canAccessToIsAdminField,
    canAccessToIsEmailVerifiedField,
    canAccessToIsPhoneVerifiedField,
    canAccessToImportIdField,
}
