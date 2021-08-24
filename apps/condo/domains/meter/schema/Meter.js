/**
 * Generated by `createschema meter.Meter 'number:Text; billingAccountMeter?:Relationship:BillingAccountMeter:SET_NULL; property:Relationship:Property:CASCADE; unitName:Text; place?:Text; resource:Relationship:MeterResource:CASCADE;'`
 */

const { Text, Relationship, Integer, Select, Checkbox, DateTimeUtc, CalendarDay, Decimal, Password, File } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/meter/access/Meter')


const Meter = new GQLListSchema('Meter', {
    schemaDoc: 'Resource meter at a certain place in the unitName',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        number: {
            schemaDoc: 'Number of resource meter, such as "А03 9908"',
            type: Text,
            isRequired: true,
            kmigratorOptions: { unique: true, null: false },
        },

        billingAccountMeter: {
            schemaDoc: 'Link to BillingAccountMeter if it exist in billing context',
            type: Relationship,
            ref: 'BillingAccountMeter',
            kmigratorOptions: { null: true, on_delete: 'models.SET_NULL' },
        },

        property: {
            schemaDoc: 'Link to property which contains unit with this meter',
            type: Relationship,
            ref: 'Property',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        unitName: {
            schemaDoc: 'Unit with this meter',
            type: Text,
            isRequired: true,
        },

        place: {
            schemaDoc: 'Certain place in unit where meter is, such as kitchen',
            type: Text,
        },

        resource: {
            schemaDoc: 'Meter resource, such as hot water or electricity',
            type: Relationship,
            ref: 'MeterResource',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadMeters,
        create: access.canManageMeters,
        update: access.canManageMeters,
        delete: false,
        auth: true,
    },
})

module.exports = {
    Meter,
}
