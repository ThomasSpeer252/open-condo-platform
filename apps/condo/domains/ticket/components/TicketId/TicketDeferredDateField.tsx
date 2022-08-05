import { Typography } from 'antd'
import dayjs from 'dayjs'
import React from 'react'

import { useIntl } from '@core/next/intl'
import { Ticket, TicketStatusTypeType } from '@app/condo/schema'

import { PageFieldRow } from '@condo/domains/common/components/PageFieldRow'

type TicketDeferredDateFieldProps = {
    ticket: Ticket
}

export const TicketDeferredDateField: React.FC<TicketDeferredDateFieldProps> = ({ ticket }) => {
    const intl = useIntl()
    const DeferredDateMessage = intl.formatMessage({ id: 'pages.condo.ticket.id.TicketDefer.DeferredDate.field' })

    const ticketDeferredDate = ticket.deferredUntil ? dayjs(ticket.deferredUntil) : null
    const isDeferredTicket = ticket.status.type === TicketStatusTypeType.Deferred

    return isDeferredTicket && ticketDeferredDate ? (
        <PageFieldRow title={DeferredDateMessage} ellipsis={{ rows: 2 }}>
            <Typography.Text strong> {dayjs(ticketDeferredDate).format('DD MMMM YYYY')} </Typography.Text>
        </PageFieldRow>
    ) : null
}