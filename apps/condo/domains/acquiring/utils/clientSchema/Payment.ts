/**
 * Generated by `createschema acquiring.Payment 'amount:Decimal; currencyCode:Text; time:DateTimeUtc; accountNumber:Text; purpose?:Text; receipts:Relationship:BillingReceipt:PROTECT; multiPayment:Relationship:MultiPayment:PROTECT; context:Relationship:AcquiringIntegrationContext:PROTECT;' --force`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { Payment as PaymentGQL } from '@condo/domains/acquiring/gql'
import { Payment, PaymentUpdateInput, QueryAllPaymentsArgs } from '../../../../schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'amount', 'currencyCode', 'explicitFee', 'implicitFee', 'advancedAt', 'accountNumber', 'purpose', 'frozenReceipt', 'status', 'period']
const RELATIONS = ['receipt', 'multiPayment', 'context', 'organization']

export interface IPaymentUIState extends Payment {
    id: string
}

function convertToUIState (item: Payment): IPaymentUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IPaymentUIState
}

export interface IPaymentFormState {
    id?: undefined
}

function convertToUIFormState (state: IPaymentUIState): IPaymentFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as IPaymentFormState
}

function convertToGQLInput (state: IPaymentFormState): PaymentUpdateInput {
    const sender = getClientSideSenderInfo()
    const result = { dv: 1, sender }
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? { connect: { id: (attrId || state[attr]) } } : state[attr]
    }
    return result
}

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
} = generateReactHooks<Payment, PaymentUpdateInput, IPaymentFormState, IPaymentUIState, QueryAllPaymentsArgs>(PaymentGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
}
