/**
 * Generated by `createschema user.OidcClient 'clientId:Text; payload:Json; name?:Text; meta?:Json'`
 */

import { pick, get } from 'lodash'

import { getClientSideSenderInfo } from '@condo/domains/common/utils/userid.utils'
import { generateReactHooks } from '@condo/domains/common/utils/codegeneration/generate.hooks'

import { OidcClient as OidcClientGQL } from '@condo/domains/user/gql'
import { OidcClient, OidcClientUpdateInput, QueryAllOidcClientsArgs } from '@app/condo/schema'

const FIELDS = ['id', 'deletedAt', 'createdAt', 'updatedAt', 'createdBy', 'updatedBy', 'clientId', 'payload', 'name', 'meta', 'expiresAt']
const RELATIONS = []

export interface IOidcClientUIState extends OidcClient {
    id: string
}

function convertToUIState (item: OidcClient): IOidcClientUIState {
    if (item.dv !== 1) throw new Error('unsupported item.dv')
    return pick(item, FIELDS) as IOidcClientUIState
}

export interface IOidcClientFormState {
    id?: undefined
}

function convertToUIFormState (state: IOidcClientUIState): IOidcClientFormState | undefined {
    if (!state) return
    const result = {}
    for (const attr of Object.keys(state)) {
        const attrId = get(state[attr], 'id')
        result[attr] = (RELATIONS.includes(attr) && state[attr]) ? attrId || state[attr] : state[attr]
    }
    return result as IOidcClientFormState
}

function convertToGQLInput (state: IOidcClientFormState): OidcClientUpdateInput {
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
} = generateReactHooks<OidcClient, OidcClientUpdateInput, IOidcClientFormState, IOidcClientUIState, QueryAllOidcClientsArgs>(OidcClientGQL, { convertToGQLInput, convertToUIState })

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useDelete,
    convertToUIFormState,
}
