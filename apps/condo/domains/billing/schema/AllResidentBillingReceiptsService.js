/**
 * Generated by `createservice billing.BillingReceiptsService --type queries`
 */

const { ServiceConsumer, Resident } = require('@condo/domains/resident/utils/serverSchema')
const { BillingReceipt } = require('@condo/domains/billing/utils/serverSchema')
const { GQLCustomSchema } = require('@core/keystone/schema')
const access = require('../access/AllResidentBillingReceipts')
const { generateQuerySortBy } = require('@condo/domains/common/utils/codegeneration/generate.gql')
const { generateQueryWhereInput } = require('@condo/domains/common/utils/codegeneration/generate.gql')
const _ = require('lodash')

const fieldsObj = {
    id: 'ID',
    period: 'String',
    toPay: 'String',
    printableNumber: 'String',
}


const GetAllResidentBillingReceiptsService = new GQLCustomSchema('GetAllResidentBillingReceiptsService', {
    types: [
        {
            access: true,
            type: generateQueryWhereInput('ResidentBillingReceipt', fieldsObj),
        },
        {
            access: true,
            type: generateQuerySortBy('ResidentBillingReceipt', Object.keys(fieldsObj)),
        },
        {
            access: true,
            type: 'type allResidentBillingReceiptsOutput { dv: String!, recipient: JSON!, id: ID!, period: String!, toPay: String!, printableNumber: String, toPayDetails: JSON, services: JSON }',
        },
    ],
    
    queries: [
        {
            access: access.canGetAllResidentBillingReceipts,
            schema: 'allResidentBillingReceipts (where: ResidentBillingReceiptWhereInput, first: Int, skip: Int, sortBy: [SortResidentBillingReceiptsBy!]): [allResidentBillingReceiptsOutput]',
            resolver: async (parent, args, context, info, extra = {}) => {
                const { where, first, skip, sortBy } = args

                const userId = _.get(context, ['authedItem', 'id'])
                if (!userId) { // impossible, but who knows
                    throw new Error('Invalid user id!')
                }

                const [resident] = await Resident.getAll(context, { user: { id: userId } })
                if (!resident) {
                    throw new Error('No resident found for this user!')
                }

                const serviceConsumers = await ServiceConsumer.getAll(context, { resident: { id: resident.id } })
                if (!Array.isArray(serviceConsumers) || !serviceConsumers.length) {
                    throw new Error('No serviceConsumer found for this user!')
                }

                const billingReceipts = []
                for (let i = 0; i < serviceConsumers.length; ++i) {
                    const receiptsQuery = { ...where, account: { id: serviceConsumers[i].billingAccount.id } }
                    const billingReceiptsForConsumer = await BillingReceipt.getAll(
                        context,
                        receiptsQuery,
                        {
                            sortBy, first, skip,
                        }
                    )
                    billingReceipts.push(billingReceiptsForConsumer)
                }

                return billingReceipts.flat().map(
                    receipt => ({
                        id: receipt.id,
                        dv: receipt.dv,
                        recipient: receipt.recipient,
                        period: receipt.period,
                        toPay: receipt.toPay,
                        toPayDetails: receipt.toPayDetails,
                        services: receipt.services,
                        printableNumber: receipt.printableNumber,
                    })
                )
            },
        },
    ],
})

module.exports = {
    GetAllResidentBillingReceiptsService,
}
