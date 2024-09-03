/**
 * Generated by `createschema user.OidcClient 'clientId:Text; payload:Json; name?:Text; meta?:Json'`
 */

const Ajv = require('ajv')

const { historical, versioned, uuided, tracked, softDeleted, dvAndSender, importable } = require('@open-condo/keystone/plugins')
const { GQLListSchema } = require('@open-condo/keystone/schema')

const access = require('@condo/domains/user/access/OidcClient')

const ajv = new Ajv()

const payloadJsonSchema = {
    type: 'object',
    properties: {
        client_id: {
            type: 'string',
        },
        client_secret: {
            type: 'string',
        },
        redirect_uris: {
            type: 'array',
            items: { type: 'string' },
            minItems: 1,
        },
    },
    additionalProperties: true,
    required: [
        'client_id',
        'client_secret',
        'redirect_uris',
    ],
}

const jsonPayloadValidator = ajv.compile(payloadJsonSchema)

const OidcClient = new GQLListSchema('OidcClient', {
    schemaDoc: 'The OIDC clients list',
    fields: {
        clientId: {
            schemaDoc: 'The clientId',
            type: 'Text',
            isRequired: true,
        },
        payload: {
            schemaDoc: 'The payload of the client (clientId, clientSecret, callbackUrl, ...)',
            type: 'Json',
            isRequired: true,
            hooks: {
                validateInput: ({ resolvedData, fieldPath, addFieldValidationError }) => {
                    const value = resolvedData[fieldPath]
                    if (!jsonPayloadValidator(value)) {
                        addFieldValidationError(`Invalid json structure of ${fieldPath} field`)
                    }
                },
            },
        },
        name: {
            schemaDoc: 'The human readable name for client',
            type: 'Text',
        },
        isEnabled: {
            schemaDoc:
                'A switch that allows you to disable some OIDC clients. ' +
                'If an OIDC client is disabled, it cannot be used for OIDC authorization. ' +
                'Used mainly by developers portal to create OIDC client before publishing an application, ' +
                'and enable OIDC after publishing.',
            type: 'Checkbox',
            isRequired: true,
            defaultValue: false,
        },
        canAuthorizeSuperUsers: {
            schemaDoc:
                'A switch that allows this OIDC client to authorize users with privileges, ' +
                'such as admins, support, or users with a special rights set. ' +
                'Temporary solution to allow OIDCs to be used ' +
                'to access the admin panel of mini-applications from condo ecosystem. ' +
                'Tokens with scopes should solve the logic separation problem and remove this checkbox',
            type: 'Checkbox',
            isRequired: true,
            defaultValue: false,
        },
        meta: {
            schemaDoc: 'The additional client data',
            type: 'Json',
        },
        expiresAt: {
            schemaDoc: 'The timestamp of the client expiration',
            type: 'DateTimeUtc',
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['clientId'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'oidc_client_unique_clientId',
            },
        ],
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical(), importable()],
    access: {
        read: access.canReadOidcClients,
        create: access.canManageOidcClients,
        update: access.canManageOidcClients,
        delete: false,
        auth: true,
    },
    escapeSearch: true,
})

module.exports = {
    OidcClient,
}
