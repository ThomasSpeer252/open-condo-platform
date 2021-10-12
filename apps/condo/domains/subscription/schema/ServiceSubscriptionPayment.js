/**
 * Generated by `createschema subscription.ServiceSubscriptionPayment 'type:Select:default,sbbol; status:Select:processing,done,error,stopped,cancelled; externalId:Text; amount:Decimal; currency:Select:rub; organization:Relationship:Organization:CASCADE; subscription:Relationship:ServiceSubscription:CASCADE; meta:Json;'`
 */

const { Text, Relationship, Integer, Select, Checkbox, DateTimeUtc, CalendarDay, Decimal, Password, File } = require('@keystonejs/fields')
const { Json } = require('@core/keystone/fields')
const { GQLListSchema } = require('@core/keystone/schema')
const { historical, versioned, uuided, tracked, softDeleted } = require('@core/keystone/plugins')
const { SENDER_FIELD, DV_FIELD } = require('@condo/domains/common/schema/fields')
const access = require('@condo/domains/subscription/access/ServiceSubscriptionPayment')
const { ORGANIZATION_OWNED_FIELD } = require('@condo/domains/organization/schema/fields')
const { values } = require('lodash')
const { SUBSCRIPTION_PAYMENT_STATUS, SUBSRIPTION_PAYMENT_STATUS_TRANSITIONS } = require('../constants')
const { WRONG_PAYMENT_STATUS_TRANSITION_ERROR } = require('../constants/errors')


const ServiceSubscriptionPayment = new GQLListSchema('ServiceSubscriptionPayment', {
    schemaDoc: 'Payment request for service subscription',
    fields: {
        dv: DV_FIELD,
        sender: SENDER_FIELD,

        type: {
            schemaDoc: 'Origin of subscription, either through our system or through external system or marketplace',
            type: Select,
            options: 'default,sbbol',
            isRequired: true,
        },

        status: {
            schemaDoc: 'Reduced set of statuses from a set of statuses in external system, that contains much more of them. Based on this status a system will filter payment request for subsequent fetching of statuses from remote system. Statuses meanings is following: "created" means, that the payment was just created in our system and its status in remote system in unknown yet; "stopped" means, that the payment is stuck somewhere during processing, for example, because of lack of information, but everything else was correct; "cancelled" means, that a client has refused to pay.',
            type: Select,
            options: values(SUBSCRIPTION_PAYMENT_STATUS),
            isRequired: true,
            hooks: {
                validateInput: async ({ operation, resolvedData, existingItem, addFieldValidationError }) => {
                    if (operation === 'update' && resolvedData.status !== existingItem.status ) {
                        if (!SUBSRIPTION_PAYMENT_STATUS_TRANSITIONS[existingItem.status].includes(resolvedData.status)) {
                            addFieldValidationError(WRONG_PAYMENT_STATUS_TRANSITION_ERROR + ` ServiceSubscriptionPayment(id=${existingItem.id}) cannot change status from '${existingItem.status}' to '${resolvedData.status}'`)
                        }
                    }
                },
            },
        },

        externalId: {
            schemaDoc: 'Unique identifier in remote system, if this payment request belong to payment requests for subscription from remote system (non-default). It is not required, because the payment can be created and processed in our system only',
            type: Text,
        },

        amount: {
            schemaDoc: 'Amount in specified currency',
            type: Decimal,
            isRequired: true,
            knexOptions: {
                scale: 2,
            },
        },

        currency: {
            schemaDoc: 'Currency of amount',
            type: Select,
            options: 'RUB',
            isRequired: true,
        },

        organization: ORGANIZATION_OWNED_FIELD,

        subscription: {
            schemaDoc: 'Subscription, to pay for',
            type: Relationship,
            ref: 'ServiceSubscription',
            isRequired: true,
            knexOptions: { isNotNullable: true }, // Required relationship only!
            kmigratorOptions: { null: false, on_delete: 'models.CASCADE' },
        },

        meta: {
            schemaDoc: 'Data from remote system',
            type: Json,
        },

    },
    plugins: [uuided(), versioned(), tracked(), softDeleted(), historical()],
    access: {
        read: access.canReadServiceSubscriptionPayments,
        create: access.canManageServiceSubscriptionPayments,
        update: access.canManageServiceSubscriptionPayments,
        delete: false,
        auth: true,
    },
    kmigratorOptions: {
        constraints: [
            {
                type: 'models.CheckConstraint',
                check: 'Q(type__in=["default", "sbbol"])',
                name: 'service_subscription_payment_type_check',
            },
            {
                type: 'models.CheckConstraint',
                check: `Q(status__in=[${values(SUBSCRIPTION_PAYMENT_STATUS).map(status => `"${status}"`).join(', ')}])`,
                name: 'service_subscription_payment_status_check',
            },
            {
                type: 'models.CheckConstraint',
                check: 'Q(currency__in=["RUB"])',
                name: 'service_subscription_payment_currency_check',
            },
            {
                type: 'models.CheckConstraint',
                check: 'Q(amount__gt=0)',
                name: 'service_subscription_payment_positive_amount_check',
            },
        ],
    },
})

module.exports = {
    ServiceSubscriptionPayment,
}
