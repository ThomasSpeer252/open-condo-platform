/**
 * Generated by `createschema acquiring.AcquiringIntegrationAccessRight 'user:Relationship:User:PROTECT;'`
 */

const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const access = require('@condo/domains/acquiring/access/AcquiringIntegrationAccessRight')
const { ACQUIRING_INTEGRATION_FIELD } = require('@condo/domains/acquiring/schema/fields/relations')
const { SERVICE_USER_FIELD } = require('@condo/domains/miniapp/schema/fields/accessRight')
const { dvAndSender } = require('../../common/schema/plugins/dvAndSender')


const AcquiringIntegrationAccessRight = new GQLListSchema('AcquiringIntegrationAccessRight', {
    schemaDoc: 'Link between Acquiring integration and user, the existence of this connection means that this user has the rights to perform actions on behalf of the integration',
    fields: {
        integration: {
            ...ACQUIRING_INTEGRATION_FIELD,
            ref: 'AcquiringIntegration.accessRights',
        },

        user: SERVICE_USER_FIELD,
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadAcquiringIntegrationAccessRights,
        create: access.canManageAcquiringIntegrationAccessRights,
        update: access.canManageAcquiringIntegrationAccessRights,
        delete: false,
        auth: true,
    },
})

module.exports = {
    AcquiringIntegrationAccessRight,
}
