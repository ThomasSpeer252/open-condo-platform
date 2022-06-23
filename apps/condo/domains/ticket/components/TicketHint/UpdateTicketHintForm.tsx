import { get } from 'lodash'
import { useRouter } from 'next/router'
import React, { useMemo } from 'react'

import { useIntl } from '@core/next/intl'

import ActionBar from '@condo/domains/common/components/ActionBar'
import { Button } from '@condo/domains/common/components/Button'
import { Loader } from '@condo/domains/common/components/Loader'
import { TicketHint } from '@condo/domains/ticket/utils/clientSchema'

import { BaseTicketHintForm } from './BaseTicketHintForm'

export const UpdateTicketHintForm = ({ id }) => {
    const intl = useIntl()
    const SaveLabel = intl.formatMessage({ id: 'Save' })

    const router = useRouter()
    const { obj: ticketHint, loading } = TicketHint.useObject({ where: { id } })
    const action = TicketHint.useUpdate({}, () => {
        router.push('/settings?tab=hint')
    })
    const updateAction = (value) => action(value, ticketHint)
    const organizationId = useMemo(() => get(ticketHint, ['organization', 'id']), [ticketHint])

    if (loading) {
        return (
            <Loader fill size={'large'}/>
        )
    }

    return (
        <BaseTicketHintForm
            action={updateAction}
            organizationId={organizationId}
            initialValues={TicketHint.convertToUIFormState(ticketHint)}
            mode={'update'}
        >
            {({ handleSave, isLoading }) => (
                <ActionBar>
                    <Button
                        key='submit'
                        onClick={handleSave}
                        type='sberDefaultGradient'
                        loading={isLoading}
                    >
                        {SaveLabel}
                    </Button>
                </ActionBar>
            )}
        </BaseTicketHintForm>
    )
}