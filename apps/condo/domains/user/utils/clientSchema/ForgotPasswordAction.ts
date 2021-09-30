/**
 * Generated by `createschema user.ForgotPasswordAction 'user:Relationship:User:CASCADE; token:Text; requestedAt:DateTimeUtc; expiresAt:DateTimeUtc; usedAt:DateTimeUtc;'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { ForgotPasswordAction as ForgotPasswordActionGQL } from '@condo/domains/user/gql'
import { ForgotPasswordAction, ForgotPasswordActionUpdateInput, QueryAllForgotPasswordActionsArgs } from '@app/condo/schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'user', 'token', 'requestedAt', 'expiresAt', 'usedAt']
const RELATIONS = ['user']

export interface IForgotPasswordActionUIState extends ForgotPasswordAction {
    id: string
}

function convertToUIState (item: ForgotPasswordAction): IForgotPasswordActionUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IForgotPasswordActionUIState
}

export interface IForgotPasswordActionFormState {
    id?: undefined
}

function convertToUIFormState (state: IForgotPasswordActionUIState): IForgotPasswordActionFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as IForgotPasswordActionFormState
}

function convertToGQLInput (state: IForgotPasswordActionFormState): ForgotPasswordActionUpdateInput {
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
} = generateReactHooks<ForgotPasswordAction, ForgotPasswordActionUpdateInput, IForgotPasswordActionFormState, IForgotPasswordActionUIState, QueryAllForgotPasswordActionsArgs>(ForgotPasswordActionGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
}
