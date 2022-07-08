/**
 * Generated by `createschema billing.BillingAccount 'context:Relationship:BillingIntegrationOrganizationContext:CASCADE; importId?:Text; property:Relationship:BillingProperty:CASCADE; bindingId:Text; number:Text; unit:Text; raw:Json; meta:Json'`
 */

import {
    BillingAccount,
    BillingAccountCreateInput,
    BillingAccountUpdateInput,
    QueryAllBillingAccountsArgs,
} from '@app/condo/schema'
import { generateNewReactHooks } from '@condo/domains/common/utils/codegeneration/new.generate.hooks'
import { BillingAccount as BillingAccountGQL } from '@condo/domains/billing/gql'

const {
    useNewObject,
    useNewObjects,
    useNewCreate,
    useNewUpdate,
    useNewSoftDelete,
} = generateNewReactHooks<BillingAccount, BillingAccountCreateInput, BillingAccountUpdateInput, QueryAllBillingAccountsArgs>(BillingAccountGQL)

export {
    useNewObject,
    useNewObjects,
    useNewCreate,
    useNewUpdate,
    useNewSoftDelete,
}
