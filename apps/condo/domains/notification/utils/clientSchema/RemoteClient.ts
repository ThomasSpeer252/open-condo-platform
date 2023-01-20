/**
 * Generated by `createschema notification.RemoteClient 'deviceId:Text; pushToken?:Text; pushTransport?:Select:firebase,apple,huawei; owner?:Relationship:User:SET_NULL; meta?:Json'`
 */

import {
    RemoteClient,
    RemoteClientCreateInput,
    RemoteClientUpdateInput,
    QueryAllRemoteClientsArgs,
} from '@app/condo/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { RemoteClient as RemoteClientGQL } from '@condo/domains/notification/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<RemoteClient, RemoteClientCreateInput, RemoteClientUpdateInput, QueryAllRemoteClientsArgs>(RemoteClientGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
