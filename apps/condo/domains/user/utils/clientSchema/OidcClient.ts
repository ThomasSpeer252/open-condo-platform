/**
 * Generated by `createschema user.OidcClient 'clientId:Text; payload:Json; name?:Text; meta?:Json'`
 */

import {
    OidcClient,
    OidcClientCreateInput,
    OidcClientUpdateInput,
    QueryAllOidcClientsArgs,
} from '@app/condo/schema'
import { generateNewReactHooks } from '@condo/domains/common/utils/codegeneration/new.generate.hooks'
import { OidcClient as OidcClientGQL } from '@condo/domains/user/gql'

const {
    useNewObject,
    useNewObjects,
    useNewCreate,
    useNewUpdate,
    useNewSoftDelete,
} = generateNewReactHooks<OidcClient, OidcClientCreateInput, OidcClientUpdateInput, QueryAllOidcClientsArgs>(OidcClientGQL)

export {
    useNewObject,
    useNewObjects,
    useNewCreate,
    useNewUpdate,
    useNewSoftDelete,
}
