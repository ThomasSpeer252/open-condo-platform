/**
 * Generated by `createschema acquiring.AcquiringIntegration 'name:Text;'`
 */

import {
    AcquiringIntegration,
    AcquiringIntegrationCreateInput,
    AcquiringIntegrationUpdateInput,
    QueryAllAcquiringIntegrationsArgs,
} from '@app/condo/schema'
import { generateNewReactHooks } from '@condo/domains/common/utils/codegeneration/new.generate.hooks'
import { AcquiringIntegration as AcquiringIntegrationGQL } from '@condo/domains/acquiring/gql'

const {
    useNewObject,
    useNewObjects,
    useNewCreate,
    useNewUpdate,
    useNewSoftDelete,
} = generateNewReactHooks<AcquiringIntegration, AcquiringIntegrationCreateInput, AcquiringIntegrationUpdateInput, QueryAllAcquiringIntegrationsArgs>(AcquiringIntegrationGQL)

export {
    useNewObject,
    useNewObjects,
    useNewCreate,
    useNewUpdate,
    useNewSoftDelete,
}
