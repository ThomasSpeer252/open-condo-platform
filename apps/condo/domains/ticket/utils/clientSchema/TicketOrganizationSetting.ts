/**
 * Generated by `createschema ticket.TicketOrganizationSetting 'organization:Relationship:Organization:CASCADE; defaultDeadline?:Integer; paidDeadline?:Integer; emergencyDeadline?:Integer; warrantyDeadline?:Integer;'`
 */

import isNull from 'lodash/isNull'
import isUndefined from 'lodash/isUndefined'

import {
    TicketOrganizationSetting,
    TicketOrganizationSettingCreateInput,
    TicketOrganizationSettingUpdateInput,
    QueryAllTicketOrganizationSettingsArgs,
} from '@app/condo/schema'
import { generateReactHooks } from '@condo/codegen/generate.hooks'
import { TicketOrganizationSetting as TicketOrganizationSettingGQL } from '@condo/domains/ticket/gql'
import { TICKET_DEFAULT_DEADLINE_DURATION_FIELDS } from '@condo/domains/ticket/constants/common'

import { convertDaysToDuration, convertDurationToDays } from '../helpers'

export interface ITicketOrganizationSettingFormState {
    id?: undefined
    defaultDeadlineDuration?: string
    paidDeadlineDuration?: string
    emergencyDeadlineDuration?: string
    warrantyDeadlineDuration?: string
}

type TicketOrganizationSettingMutationType = TicketOrganizationSettingCreateInput | TicketOrganizationSettingUpdateInput

function convertToFormState (ticketOrganizationSetting: TicketOrganizationSetting): ITicketOrganizationSettingFormState | undefined {
    if (!ticketOrganizationSetting) return
    const result: ITicketOrganizationSettingFormState = {}

    for (const key of Object.keys(ticketOrganizationSetting)) {
        if (TICKET_DEFAULT_DEADLINE_DURATION_FIELDS.includes(key)) {
            if (!isNull(ticketOrganizationSetting[key])) {
                result[key] = convertDurationToDays(ticketOrganizationSetting[key])
            } else {
                result[key] = ticketOrganizationSetting[key]
            }
        } else {
            result[key] = ticketOrganizationSetting[key]
        }
    }

    return result
}

function formValuesProcessor (formValues: ITicketOrganizationSettingFormState): TicketOrganizationSettingMutationType {
    const result: TicketOrganizationSettingMutationType = {}
    for (const key of Object.keys(formValues)) {
        if (!isUndefined(formValues[key])) {
            if (TICKET_DEFAULT_DEADLINE_DURATION_FIELDS.includes(key)) {
                if (!isNull(formValues[key])) {
                    result[key] = convertDaysToDuration(formValues[key])
                } else {
                    result[key] = formValues[key]
                }
            } else {
                result[key] = formValues[key]
            }
        }
    }

    return result
}

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
} = generateReactHooks<TicketOrganizationSetting, TicketOrganizationSettingCreateInput, TicketOrganizationSettingUpdateInput, QueryAllTicketOrganizationSettingsArgs>(TicketOrganizationSettingGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    convertToFormState,
    formValuesProcessor,
}
