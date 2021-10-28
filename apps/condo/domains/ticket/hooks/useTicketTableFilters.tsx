import React, { useMemo, useRef } from 'react'
import { ComponentType, FilterComponentSize, FiltersMeta } from '@condo/domains/common/utils/filters.utils'
import { MeterReadingWhereInput } from '@app/condo/schema'
import {
    getDayRangeFilter,
    getFilter,
    getNumberFilter,
    getStringContainsFilter,
    getTicketAttributesFilter,
} from '@condo/domains/common/utils/tables.utils'
import { TicketSource, TicketStatus } from '../utils/clientSchema'
import { useIntl } from '@core/next/intl'
import { searchEmployeeUser, searchOrganizationDivision, searchOrganizationProperty } from '../utils/clientSchema/search'
import { useOrganization } from '@core/next/organization'
import { get } from 'lodash'
import { useModalFilterClassifiers } from './useModalFilterClassifiers'

export function useTicketTableFilters (): Array<FiltersMeta<MeterReadingWhereInput>>  {
    const intl = useIntl()
    const EmergencyMessage = intl.formatMessage({ id: 'Emergency' }).toLowerCase()
    const NumberMessage = intl.formatMessage({ id: 'ticketsTable.Number' })
    const PaidMessage = intl.formatMessage({ id: 'Paid' }).toLowerCase()
    const DateMessage = intl.formatMessage({ id: 'Date' })
    const StatusMessage =  intl.formatMessage({ id: 'Status' })
    const ClientNameMessage = intl.formatMessage({ id: 'Client' })
    const DescriptionMessage = intl.formatMessage({ id: 'Description' })
    const FindWordMessage = intl.formatMessage({ id: 'filters.FindWord' })
    const AddressMessage = intl.formatMessage({ id: 'field.Address' })
    const EnterAddressMessage = intl.formatMessage({ id: 'pages.condo.meter.EnterAddress' })
    const UserNameMessage = intl.formatMessage({ id: 'filters.UserName' })
    const ShortFlatNumber = intl.formatMessage({ id: 'field.ShortFlatNumber' })
    const ExecutorMessage = intl.formatMessage({ id: 'field.Executor' })
    const ResponsibleMessage = intl.formatMessage({ id: 'field.Responsible' })
    const StartDateMessage = intl.formatMessage({ id: 'pages.condo.meter.StartDate' })
    const EndDateMessage = intl.formatMessage({ id: 'pages.condo.meter.EndDate' })
    const SourceMessage = intl.formatMessage({ id: 'field.Source' })
    const SectionMessage = intl.formatMessage({ id: 'pages.condo.property.section.Name' })
    const FloorMessage = intl.formatMessage({ id: 'pages.condo.property.floor.Name' })
    const UnitMessage = intl.formatMessage({ id: 'field.FlatNumber' })
    const PhoneMessage = intl.formatMessage({ id: 'Phone' })
    const AssigneeMessage = intl.formatMessage({ id: 'field.Responsible' })
    const SelectMessage = intl.formatMessage({ id: 'Select' })
    const PlaceClassifierLabel = intl.formatMessage({ id: 'component.ticketclassifier.PlaceLabel' })
    const CategoryClassifierLabel = intl.formatMessage({ id: 'component.ticketclassifier.CategoryLabel' })

    // const userOrganization = useOrganization()
    // const userOrganizationId = get(userOrganization, ['organization', 'id'])

    const numberFilter = getNumberFilter('number')
    const dateRangeFilter = getDayRangeFilter('createdAt')
    const statusFilter = getFilter(['status', 'id'], 'array', 'string', 'in')
    const detailsFilter = getStringContainsFilter('details')
    const propertyFilter = getFilter(['property', 'id'], 'array', 'string', 'in')
    const addressFilter = getStringContainsFilter(['property', 'address'])
    const clientNameFilter = getStringContainsFilter('clientName')
    const executorNameFilter = getStringContainsFilter(['executor', 'name'])
    const assigneeNameFilter = getStringContainsFilter(['assignee', 'name'])

    const attributeFilter = getTicketAttributesFilter(['isEmergency', 'isPaid'])

    // filters which display only in modal
    const sourceFilter = getFilter(['source', 'id'], 'array', 'string', 'in')
    // Division filter ??? maybe in

    // chips filters
    const sectionFilter = getFilter('sectionName', 'array', 'string', 'in')
    const floorFilter = getFilter('floorName', 'array', 'string', 'in')
    const unitFilter = getFilter('unitName', 'array', 'string', 'in')

    // classifier filters
    const placeClassifierFilter = getFilter(['placeClassifier', 'id'], 'array', 'string', 'in')
    const categoryClassifierFilter = getFilter(['categoryClassifier', 'id'], 'array', 'string', 'in')

    const clientPhoneFilter = getFilter('clientPhone', 'array', 'string', 'in')
    const ticketAuthorFilter = getFilter(['createdBy', 'id'], 'array', 'string', 'in')

    const { objs: statuses } = TicketStatus.useObjects({})
    const statusOptions = statuses.map(status => ({ label: status.name, value: status.id }))

    const { objs: sources } = TicketSource.useObjects({})
    const sourceOptions = sources.map(source => ({ label: source.name, value: source.id }))

    const userOrganization = useOrganization()
    const userOrganizationId = get(userOrganization, ['organization', 'id'])

    const { CategorySelect, PlaceSelect } = useModalFilterClassifiers()

    return useMemo(() => {
        return [
            {
                keyword: 'address',
                filters: [addressFilter],
                component: {
                    type: ComponentType.Input,
                },
            },
            {
                keyword: 'details',
                filters: [detailsFilter],
                component: {
                    type: ComponentType.Input,
                },
            },
            {
                keyword: 'clientName',
                filters: [clientNameFilter],
                component: {
                    type: ComponentType.Input,
                },
            },
            {
                keyword: 'number',
                filters: [numberFilter],
                component: {
                    type: ComponentType.Input,
                },
            },
            {
                keyword: 'search',
                filters: [
                    numberFilter,
                    clientNameFilter,
                    detailsFilter,
                    executorNameFilter,
                    assigneeNameFilter,
                ],
                combineType: 'OR',
            },
            {
                keyword: 'property',
                filters: [propertyFilter],
                component: {
                    type: ComponentType.GQLSelect,
                    props: {
                        search: searchOrganizationProperty(userOrganizationId),
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: EnterAddressMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: AddressMessage,
                        size: FilterComponentSize.Large,
                    },
                    columnFilterComponentWrapper: {
                        width: '400px',
                    },
                },
            },
            {
                keyword: 'createdAt',
                filters: [dateRangeFilter],
                component: {
                    type: ComponentType.DateRange,
                    props: {
                        placeholder: [StartDateMessage, EndDateMessage],
                    },
                    modalFilterComponentWrapper: {
                        label: DateMessage,
                        size: FilterComponentSize.Medium,
                    },
                },
            },
            {
                keyword: 'source',
                filters: [sourceFilter],
                component: {
                    type: ComponentType.Select,
                    options: sourceOptions,
                    props: {
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: SelectMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: SourceMessage,
                        size: FilterComponentSize.Medium,
                    },
                },
            },
            {
                keyword: 'division',
                filters: [propertyFilter],
                queryToWhereProcessor: (queryDivisions) => {
                    // Определяем участок в браузерной строке как "propertyId1, propertyId2" ->
                    // в GQLWhere нам нужен ["propertyId1", "propertyId2"], поэтому процессим
                    return queryDivisions?.map(queryDivision => queryDivision.split(',')).flat(1)
                },
                component: {
                    type: ComponentType.GQLSelect,
                    props: {
                        search: searchOrganizationDivision(userOrganizationId),
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: SelectMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: 'Участок',
                        size: FilterComponentSize.Medium,
                    },
                },
            },
            {
                keyword: 'sectionName',
                filters: [sectionFilter],
                component: {
                    type: ComponentType.ChipsInput,
                    props: {
                        placeholder: SelectMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: SectionMessage,
                        size: FilterComponentSize.Medium,
                    },
                },
            },
            {
                keyword: 'floorName',
                filters: [floorFilter],
                component: {
                    type: ComponentType.ChipsInput,
                    props: {
                        placeholder: SelectMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: FloorMessage,
                        size: FilterComponentSize.Medium,
                    },
                },
            },
            {
                keyword: 'unitName',
                filters: [unitFilter],
                component: {
                    type: ComponentType.ChipsInput,
                    props: {
                        tokenSeparators: [' '],
                        placeholder: 'Введите номер квартиры',
                    },
                    modalFilterComponentWrapper: {
                        label: UnitMessage,
                        size: FilterComponentSize.Medium,
                    },
                },
            },
            {
                keyword: 'rules',
                filters: [],
            },
            {
                keyword: 'placeClassifier',
                filters: [placeClassifierFilter],
                component: {
                    type: ComponentType.Custom,
                    modalFilterComponent: (form) => <PlaceSelect form={form} />,
                    modalFilterComponentWrapper: {
                        label: PlaceClassifierLabel,
                        size: FilterComponentSize.Medium,
                    },
                },
            },
            {
                keyword: 'categoryClassifier',
                filters: [categoryClassifierFilter],
                component: {
                    type: ComponentType.Custom,
                    modalFilterComponent: (form) => <CategorySelect form={form} />,
                    modalFilterComponentWrapper: {
                        label: CategoryClassifierLabel,
                        size: FilterComponentSize.Medium,
                    },
                },
            },
            {
                keyword: 'status',
                filters: [statusFilter],
                component: {
                    type: ComponentType.Select,
                    options: statusOptions,
                    props: {
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: SelectMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: StatusMessage,
                        size: FilterComponentSize.Medium,
                    },
                },
            },
            {
                keyword: 'attributes',
                filters: [attributeFilter],
                component: {
                    type: ComponentType.Select,
                    options: [{ label: PaidMessage, value: 'isPaid' }, { label: EmergencyMessage, value: 'isEmergency' }],
                    props: {
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: SelectMessage,
                    },
                    modalFilterComponentWrapper: {
                        label: 'Признак',
                        size: FilterComponentSize.Medium,
                    },
                },
            },
            {
                keyword: 'clientPhone',
                filters: [clientPhoneFilter],
                component: {
                    type: ComponentType.ChipsInput,
                    props: {
                        placeholder: 'Введите телефон',
                    },
                    modalFilterComponentWrapper: {
                        label: 'Телефон жителя',
                        size: FilterComponentSize.Medium,
                    },
                },
            },
            {
                keyword: 'executor',
                filters: [executorNameFilter],
                component: {
                    type: ComponentType.GQLSelect,
                    props: {
                        search: searchEmployeeUser(userOrganizationId, ({ role }) => (
                            get(role, 'canBeAssignedAsExecutor', false)
                        )),
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: 'Введите ФИО',
                    },
                    modalFilterComponentWrapper: {
                        label: ExecutorMessage,
                        size: FilterComponentSize.Medium,
                    },
                    columnFilterComponentWrapper: {
                        width: '200px',
                    },
                },
            },
            {
                keyword: 'assignee',
                filters: [assigneeNameFilter],
                component: {
                    type: ComponentType.GQLSelect,
                    props: {
                        search: searchEmployeeUser(userOrganizationId, ({ role }) => (
                            get(role, 'canBeAssignedAsResponsible', false)
                        )),
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: 'Введите ФИО',
                    },
                    modalFilterComponentWrapper: {
                        label: AssigneeMessage,
                        size: FilterComponentSize.Medium,
                    },
                    columnFilterComponentWrapper: {
                        width: '200px',
                    },
                },
            },
            {
                keyword: 'author',
                filters: [ticketAuthorFilter],
                component: {
                    type: ComponentType.GQLSelect,
                    props: {
                        search: searchEmployeeUser(userOrganizationId),
                        mode: 'multiple',
                        showArrow: true,
                        placeholder: 'Выбрать',
                    },
                    modalFilterComponentWrapper: {
                        label: UserNameMessage,
                        size: FilterComponentSize.Medium,
                    },
                },
            },
        ]
    }, [statuses, sources])
}