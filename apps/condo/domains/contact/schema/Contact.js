/**
 * Generated by `createschema contact.Contact 'property:Relationship:Property:SET_NULL; name:Text; phone:Text; unitName?:Text; email?:Text;'`
 */

const { Text, Relationship, Checkbox } = require('@keystonejs/fields')

const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { historical, versioned, uuided, tracked, softDeleted, dvAndSender } = require('@open-condo/keystone/plugins')
const { GQLListSchema, find } = require('@open-condo/keystone/schema')

const { PHONE_WRONG_FORMAT_ERROR, EMAIL_WRONG_FORMAT_ERROR, PROPERTY_REQUIRED_ERROR } = require('@condo/domains/common/constants/errors')
const { UNIT_TYPE_FIELD } = require('@condo/domains/common/schema/fields')
const { normalizeEmail } = require('@condo/domains/common/utils/mail')
const { normalizePhone } = require('@condo/domains/common/utils/phone')
const access = require('@condo/domains/contact/access/Contact')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const { UNABLE_TO_CREATE_CONTACT_DUPLICATE, UNABLE_TO_UPDATE_CONTACT_DUPLICATE } = require('@condo/domains/user/constants/errors')

/**
 * Composite unique constraint with name `Contact_uniq` is declared in a database-level on following set of columns:
 * ("property", "unitName", "name", "phone")
 */
const ERRORS = {
    UNABLE_TO_CREATE_CONTACT_DUPLICATE: {
        mutation: 'signinResidentUser',
        code: BAD_USER_INPUT,
        type: UNABLE_TO_CREATE_CONTACT_DUPLICATE,
        message: 'Cannot create contact, because another contact with the same provided set of "property", "unitName", "phone"',
        messageForUser: 'api.contact.CONTACT_DUPLICATE_ERROR',
    },
    UNABLE_TO_UPDATE_CONTACT_DUPLICATE: {
        mutation: 'signinResidentUser',
        code: BAD_USER_INPUT,
        type: UNABLE_TO_UPDATE_CONTACT_DUPLICATE,
        message: 'Cannot update contact, because another contact with the same provided set of "property", "unitName", "phone"',
        messageForUser: 'api.contact.CONTACT_DUPLICATE_ERROR',
    },

}
const Contact = new GQLListSchema('Contact', {
    schemaDoc: 'Contact information of a person. Currently it will be related to a ticket, but in the future, it will be associated with more things',
    fields: {
        organization: ORGANIZATION_OWNED_FIELD,

        property: {
            schemaDoc: 'Property, that is a subject of an issue, reported by this person in first ticket. Meaning of this field will be revised in the future',
            type: Relationship,
            ref: 'Property',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        unitName: {
            schemaDoc: 'Property unit, that is a subject of an issue, reported by this person in first ticket. Meaning of this field will be revised in the future',
            type: Text,
            isRequired: false,
        },

        unitType: {
            ...UNIT_TYPE_FIELD,
            // Allow to set unitType to null
            knexOptions: { isNotNullable: false },
            kmigratorOptions: { null: true },
        },

        email: {
            schemaDoc: 'Normalized contact email of this person',
            type: Text,
            isRequired: false,
            hooks: {
                resolveInput: async ({ resolvedData }) => {
                    if (!resolvedData['email']) return resolvedData['email']
                    const newValue = normalizeEmail(resolvedData['email'])
                    return newValue || resolvedData['email']
                },
                validateInput: async ({ resolvedData, addFieldValidationError }) => {
                    const newValue = normalizeEmail(resolvedData['email'])
                    if (resolvedData['email'] && newValue !== resolvedData['email']) {
                        addFieldValidationError(`${EMAIL_WRONG_FORMAT_ERROR}email] invalid format`)
                    }
                },
            },
        },

        phone: {
            schemaDoc: 'Normalized contact phone of this person in E.164 format without spaces',
            type: Text,
            isRequired: true,
            hooks: {
                resolveInput: async ({ resolvedData }) => {
                    const newValue = normalizePhone(resolvedData['phone'], true)
                    return newValue || resolvedData['phone']
                },
                validateInput: async ({ resolvedData, addFieldValidationError }) => {
                    const newValue = normalizePhone(resolvedData['phone'], true)
                    if (resolvedData['phone'] && newValue !== resolvedData['phone']) {
                        addFieldValidationError(`${PHONE_WRONG_FORMAT_ERROR}phone] invalid format`)
                    }
                },
            },
        },

        name: {
            schemaDoc: 'Name or full name of this person',
            type: Text,
            isRequired: true,
            hooks: {
                validateInput: ({ resolvedData, fieldPath, addFieldValidationError }) => {
                    const value = resolvedData[fieldPath]
                    if (value === '') {
                        return addFieldValidationError('Name should not be a blank string')
                    }
                },
            },
        },

        role: {
            schemaDoc: 'The contact\'s role',
            type: Relationship,
            ref: 'ContactRole',
            isRequired: false,
            knexOptions: { isNotNullable: false }, // Relationship only!
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },

        isVerified: {
            schemaDoc: 'Contact verification flag.',
            type: Checkbox,
            defaultValue: false,
        },

    },
    hooks: {
        validateInput: async ({ resolvedData, operation, existingItem, addValidationError, context }) => {
            const newItem = { ...existingItem, ...resolvedData }
            const { property, unitName, unitType, phone } = newItem

            if (operation === 'create' && !property) {
                return addValidationError(`${ PROPERTY_REQUIRED_ERROR }] no property for contact`)
            }
            const condition = {
                property: { id: property },
                unitName: unitName || null,
                unitType,
                phone,
                deletedAt: null,
            }
            const [contact] = await find('Contact', condition)
            if (operation === 'create') {
                if (contact) {
                    throw new GQLError(ERRORS.UNABLE_TO_CREATE_CONTACT_DUPLICATE, context)
                }
            } else if (operation === 'update') {
                if (contact && contact.id !== existingItem.id) {
                    throw new GQLError(ERRORS.UNABLE_TO_UPDATE_CONTACT_DUPLICATE, context)
                }
            }
        },
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.UniqueConstraint',
                fields: ['property', 'unitName', 'unitType', 'phone'],
                condition: 'Q(deletedAt__isnull=True)',
                name: 'contact_unique_property_unitName_unitType_phone',
            },
        ],
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), dvAndSender(), historical()],
    access: {
        read: access.canReadContacts,
        create: access.canManageContacts,
        update: access.canManageContacts,
        delete: false,
        auth: true,
    },
})

module.exports = {
    Contact,
}
