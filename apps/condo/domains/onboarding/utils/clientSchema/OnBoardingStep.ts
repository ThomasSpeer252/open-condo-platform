/**
 * Generated by `createschema onboarding.OnBoardingStep 'icon:Text; title:Text; description:Text; action:Select:create,read,update,delete; entity:Text; onBoarding:Relationship:OnBoarding:SET_NULL;'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { OnBoardingStep as OnBoardingStepGQL } from '@condo/domains/onboarding/gql'
import { OnBoardingStep, OnBoardingStepUpdateInput, QueryAllOnBoardingStepsArgs } from '../../../../schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'icon', 'title', 'description', 'action', 'entity', 'onBoarding', 'completed', 'order', 'required']
const RELATIONS = ['onBoarding']

export interface IOnBoardingStepUIState extends Partial<OnBoardingStep> {
    id: string
    // TODO(codegen): write IOnBoardingStepUIState or extends it from
}

function convertToUIState (item: OnBoardingStep): IOnBoardingStepUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IOnBoardingStepUIState
}

export interface IOnBoardingStepFormState {
    id?: undefined
    completed?: boolean
    // TODO(codegen): write IOnBoardingStepUIFormState or extends it from
}

function convertToUIFormState (state: IOnBoardingStepUIState): IOnBoardingStepFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as IOnBoardingStepFormState
}

function convertToGQLInput (state: IOnBoardingStepFormState): OnBoardingStepUpdateInput {
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
} = generateReactHooks<OnBoardingStep, OnBoardingStepUpdateInput, IOnBoardingStepFormState, IOnBoardingStepUIState, QueryAllOnBoardingStepsArgs>(OnBoardingStepGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
}
