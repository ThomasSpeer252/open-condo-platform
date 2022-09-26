/**
 * Generated by `createschema organization.OrganizationEmployee 'organization:Relationship:Organization:CASCADE; user:Relationship:User:SET_NULL; inviteCode:Text; name:Text; email:Text; phone:Text; role:Relationship:OrganizationEmployeeRole:SET_NULL; isAccepted:Checkbox; isRejected:Checkbox' --force`
 */
const faker = require('faker')
const { v4: uuid } = require('uuid')
const { Text, Relationship, Uuid, Checkbox } = require('@keystonejs/fields')
const { userIsAdmin } = require('@open-condo/keystone/access')
const access = require('@condo/domains/organization/access/OrganizationEmployee')
const { normalizeEmail } = require('@condo/domains/common/utils/mail')
const { GQLListSchema } = require('@open-condo/keystone/schema')
const { historical, versioned, tracked, softDeleted, uuided, dvAndSender } = require('@open-condo/keystone/plugins')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const { EMAIL_WRONG_FORMAT_ERROR } = require('@condo/domains/common/constants/errors')
const { hasDbFields, hasOneOfFields } = require('@condo/domains/common/utils/validation.utils')
const { normalizePhone } = require('@condo/domains/common/utils/phone')
const { managePropertyScopeOrganizationEmployee } = require('@condo/domains/scope/utils/serverSchema')

const OrganizationEmployee = new GQLListSchema('OrganizationEmployee', {
    schemaDoc: 'B2B customer employees',
    fields: {
        organization: { ...ORGANIZATION_OWNED_FIELD, ref: 'Organization.employees' },
        user: {
            schemaDoc: 'If user exists => invite is matched by email/phone (user can reject or accept it)',
            type: Relationship,
            ref: 'User',
            isRequired: false,
            knexOptions: { isNotNullable: false }, // Relationship only!
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
            access: {
                read: true,
                update: userIsAdmin,
                // Allow employee to assign user for the first time, when it creates another employee
                create: access.canManageOrganizationEmployees,
            },
        },
        inviteCode: {
            schemaDoc: 'Secret invite code (used for accept invite verification)',
            type: Uuid,
            defaultValue: () => uuid(),
            kmigratorOptions: { null: true, unique: true },
            access: {
                read: userIsAdmin,
                update: userIsAdmin,
                create: userIsAdmin,
            },
        },
        name: {
            factory: () => faker.fake('{{name.suffix}} {{name.firstName}} {{name.lastName}}'),
            type: Text,
        },
        email: {
            factory: () => faker.internet.exampleEmail().toLowerCase(),
            type: Text,
            isRequired: false,
            kmigratorOptions: { null: true },
            hooks: {
                resolveInput: async ({ resolvedData }) => {
                    return normalizeEmail(resolvedData['email']) || resolvedData['email']
                },
                validateInput: async ({ resolvedData, addFieldValidationError }) => {
                    if (resolvedData['email'] && normalizeEmail(resolvedData['email']) !== resolvedData['email']) {
                        addFieldValidationError(`${EMAIL_WRONG_FORMAT_ERROR}mail] invalid format`)
                    }
                },
            },
        },
        phone: {
            type: Text,
            isRequired: false,
            kmigratorOptions: { null: true },
            hooks: {
                resolveInput: async ({ resolvedData }) => {
                    if (resolvedData['phone'] === null) return null
                    return normalizePhone(resolvedData['phone'])
                },
            },
        },
        role: {
            type: Relationship,
            ref: 'OrganizationEmployeeRole',
            isRequired: true,
            knexOptions: { isNotNullable: false }, // Relationship only!
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },
        position: {
            schemaDoc: 'Free-form description of the employee\'s position',
            type: Text,
            isRequired: false,
        },
        specializations: {
            schemaDoc: 'List of work categories, that this employee can perform',
            type: Relationship,
            ref: 'TicketCategoryClassifier',
            many: true,
        },
        isAccepted: {
            type: Checkbox,
            defaultValue: false,
            knexOptions: { isNotNullable: false },
            access: {
                read: true,
                create: userIsAdmin,
                update: userIsAdmin,
            },
        },
        isRejected: {
            type: Checkbox,
            defaultValue: false,
            knexOptions: { isNotNullable: false },
            access: {
                read: true,
                create: userIsAdmin,
                update: userIsAdmin,
            },
        },
        isBlocked: {
            schemaDoc: 'Employee is blocked status, used in permissions functions, isBlocked has Free-form description of the employee\'s position over all permissions',
            type: Checkbox,
            defaultValue: false,
        },
        hasAllSpecializations: {
            schemaDoc: 'True if employee has all specializations',
            type: Checkbox,
            defaultValue: false,
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['user', 'organization'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'OrganizationEmployee_unique_user_and_organization',
            },
        ],
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadOrganizationEmployees,
        create: access.canManageOrganizationEmployees,
        update: access.canManageOrganizationEmployees,
        delete: access.canManageOrganizationEmployees,
        auth: true,
    },
    hooks: {
        validateInput: ({ resolvedData, existingItem, addValidationError, context }) => {
            if (!hasDbFields(['organization'], resolvedData, existingItem, context, addValidationError)) return
            if (!hasOneOfFields(['email', 'name', 'phone'], resolvedData, existingItem, addValidationError)) return
        },
    },
})

module.exports = {
    OrganizationEmployee,
}
