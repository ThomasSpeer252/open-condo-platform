/**
 * Generated by `createschema banking.BankAccount 'organization:Relationship:Organization:CASCADE; tin:Text; country:Text; routingNumber:Text; number:Text; currency:Text; approvedAt?:DateTimeUtc; approvedBy?:Text; importId?:Text; territoryCode?:Text; bankName?:Text; meta?:Json; tinMeta?:Json; routingNumberMeta?:Json'`
 */

import {
    BankAccount,
    BankAccountCreateInput,
    BankAccountUpdateInput,
    QueryAllBankAccountsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/codegen/generate.hooks'
import { BankAccount as BankAccountGQL } from '@condo/domains/banking/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<BankAccount, BankAccountCreateInput, BankAccountUpdateInput, QueryAllBankAccountsArgs>(BankAccountGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
