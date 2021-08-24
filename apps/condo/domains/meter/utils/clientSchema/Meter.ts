/**
 * Generated by `createschema meter.Meter 'number:Text; billingAccountMeter?:Relationship:BillingAccountMeter:SET_NULL; account?:Relationship:BillingAccount:SET_NULL; property:Relationship:Property:CASCADE; unitName:Text; place?:Text; resource:Relationship:MeterResource:CASCADE;'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { Meter as MeterGQL } from '@condo/domains/meter/gql'
import { Meter, MeterUpdateInput, QueryAllMetersArgs } from '../../../../schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'number', 'billingAccountMeter', 'property', 'unitName', 'place', 'resource']
const RELATIONS = ['billingAccountMeter', 'account', 'property', 'resource']

export interface IMeterUIState extends Meter {
    id: string
    // TODO(codegen): write IMeterUIState or extends it from
}

function convertToUIState (item: Meter): IMeterUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IMeterUIState
}

export interface IMeterFormState {
    id?: undefined
    // TODO(codegen): write IMeterUIFormState or extends it from
}

function convertToUIFormState (state: IMeterUIState): IMeterFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as IMeterFormState
}

function convertToGQLInput (state: IMeterFormState): MeterUpdateInput {
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
} = generateReactHooks<Meter, MeterUpdateInput, IMeterFormState, IMeterUIState, QueryAllMetersArgs>(MeterGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
}
