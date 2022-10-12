/**
 * Generated by `createschema organization.OrganizationLink 'from:Relationship:Organization:CASCADE; to:Relationship:Organization:SET_NULL;'`
 */

import {
    OrganizationLink,
    OrganizationLinkCreateInput,
    OrganizationLinkUpdateInput,
    QueryAllOrganizationLinksArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/codegen/generate.hooks'
import { OrganizationLink as OrganizationLinkGQL } from '@condo/domains/organization/gql'

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<OrganizationLink, OrganizationLinkCreateInput, OrganizationLinkUpdateInput, QueryAllOrganizationLinksArgs>(OrganizationLinkGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
}
