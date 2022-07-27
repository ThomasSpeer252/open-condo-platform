/**
 * Generated by `createschema meter.MeterReadingFilterTemplate 'name:Text; employee:Relationship:OrganizationEmployee:CASCADE; filters:Json'`
 */

const { Text, Relationship } = require('@keystonejs/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const access = require('@condo/domains/meter/access/MeterReadingFilterTemplate')
const { METER_READING_FILTER_FIELD } = require('./fields/MeterReadingFilters')
const { dvAndSender } = require('../../common/schema/plugins/dvAndSender')


const MeterReadingFilterTemplate = new GQLListSchema('MeterReadingFilterTemplate', {
    schemaDoc: 'Employee specific meter reading filter template',
    fields: {
        name: {
            schemaDoc: 'Meter reading filter template name',
            type: Text,
            isRequired: true,
        },

        employee: {
            schemaDoc: 'Link to employee, who created this template',
            type: Relationship,
            ref: 'OrganizationEmployee',
            isRequired: true,
            knexOptions: { isNotNullable: true },
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        fields: METER_READING_FILTER_FIELD,
    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical(), dvAndSender()],
    access: {
        read: access.canReadMeterReadingFilterTemplates,
        create: access.canManageMeterReadingFilterTemplates,
        update: access.canManageMeterReadingFilterTemplates,
        delete: false,
        auth: true,
    },
})

module.exports = {
    MeterReadingFilterTemplate,
}
