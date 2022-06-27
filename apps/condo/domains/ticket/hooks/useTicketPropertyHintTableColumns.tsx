import map from 'lodash/map'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import { useIntl } from '@core/next/intl'

import { getTableCellRenderer } from '@condo/domains/common/components/Table/Renders'
import { getFilterIcon } from '@condo/domains/common/components/TableFilter'
import { FiltersMeta, getFilterDropdownByKey } from '@condo/domains/common/utils/filters.utils'
import { getFilteredValue } from '@condo/domains/common/utils/helpers'
import { parseQuery } from '@condo/domains/common/utils/tables.utils'
import { IFilters } from '@condo/domains/contact/utils/helpers'
import { getTicketPropertyHintAddressesRender, renderTicketPropertyHint } from '@condo/domains/ticket/utils/clientSchema/Renders'
import { ITicketPropertyHintUIState } from '@condo/domains/ticket//utils/clientSchema/TicketPropertyHint'
import { TicketPropertyHintProperty } from '@condo/domains/ticket//utils/clientSchema'

export function useTicketPropertyHintTableColumns <T> (filterMetas: Array<FiltersMeta<T>>, ticketPropertyHints: ITicketPropertyHintUIState[]) {
    const intl = useIntl()
    const NameMessage  = intl.formatMessage({ id: 'pages.condo.property.section.form.name' })
    const HintMessage = intl.formatMessage({ id: 'Hint' })
    const BuildingsMessage = intl.formatMessage({ id: 'pages.condo.property.index.TableField.Buildings' })

    const router = useRouter()
    const { filters } = parseQuery(router.query)
    const search = getFilteredValue(filters, 'search')

    const render = useMemo(() => getTableCellRenderer(search), [search])

    const ticketPropertyHintIds = useMemo(() => map(ticketPropertyHints, 'id'), [ticketPropertyHints])
    const { objs: ticketPropertyHintsProperties } = TicketPropertyHintProperty.useObjects({
        where: {
            ticketPropertyHint: {
                id_in: ticketPropertyHintIds,
            },
        },
    })

    const renderTicketPropertyHintAddresses = useCallback((intl, ticketPropertyHint) => {
        const properties = ticketPropertyHintsProperties
            .filter(ticketPropertyHintProperty => ticketPropertyHintProperty.ticketPropertyHint.id === ticketPropertyHint.id)
            .map(ticketPropertyHintProperty => ticketPropertyHintProperty.property)

        return getTicketPropertyHintAddressesRender(search)(intl, properties)
    }, [search, ticketPropertyHintsProperties])

    return useMemo(() => {
        return [
            {
                title: BuildingsMessage,
                ellipsis: true,
                key: 'properties',
                render: (_, ticketPropertyHint) => renderTicketPropertyHintAddresses(intl, ticketPropertyHint),
                width: '35%',
            },
            {
                title: NameMessage,
                filteredValue: getFilteredValue<IFilters>(filters, 'name'),
                dataIndex: 'name',
                key: 'name',
                sorter: true,
                filterDropdown: getFilterDropdownByKey(filterMetas, 'name'),
                filterIcon: getFilterIcon,
                render,
                ellipsis: true,
            },
            {
                title: HintMessage,
                ellipsis: true,
                dataIndex: 'content',
                key: 'content',
                render: renderTicketPropertyHint,
            },
        ]
    }, [NameMessage, BuildingsMessage, HintMessage, filterMetas, filters, intl, render, renderTicketPropertyHintAddresses])
}