/**
 * Generated by `createschema user.User 'name:Text;isAdmin:Checkbox;email:Text;password:Password;'`
 */

import {
    User,
    UserCreateInput,
    UserUpdateInput,
    QueryAllUsersArgs,
} from '@app/address-service/schema'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { User as UserGQL } from '@address-service/domains/user/gql'


const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<User, UserCreateInput, UserUpdateInput, QueryAllUsersArgs>(UserGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
