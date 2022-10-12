/**
 * Generated by `createschema billing.BillingIntegrationOrganizationContext 'integration:Relationship:BillingIntegration:PROTECT; organization:Relationship:Organization:CASCADE; settings:Json; state:Json' --force`
 */

import {
    BillingIntegrationOrganizationContext,
    BillingIntegrationOrganizationContextCreateInput,
    BillingIntegrationOrganizationContextUpdateInput,
    QueryAllBillingIntegrationOrganizationContextsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/codegen/generate.hooks'
import { BillingIntegrationOrganizationContext as BillingIntegrationOrganizationContextGQL } from '@condo/domains/billing/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<BillingIntegrationOrganizationContext, BillingIntegrationOrganizationContextCreateInput, BillingIntegrationOrganizationContextUpdateInput, QueryAllBillingIntegrationOrganizationContextsArgs>(BillingIntegrationOrganizationContextGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
