import React, { useEffect } from 'react'
import { find, get, map } from 'lodash'
import { useIntl } from '@core/next/intl'
import { Alert, FormInstance } from 'antd'
import { Division } from '@condo/domains/division/utils/clientSchema'
import { formatAddressWithoutCityFrom } from '@condo/domains/property/utils/helpers'

const getResponsibleAndExecutorFrom = (divisions, categoryClassifier) => {
    let responsible
    let executor
    const division = divisions[0]
    if (division) {
        responsible = division.responsible
        if (categoryClassifier) {
            executor = division.executors.find(({ specializations }) => (
                specializations.some(({ id }) => id === categoryClassifier)
            ))
        } else {
            executor = get(division.executors[0], 'id')
        }
    }
    return {
        executorUserId: get(executor, ['user', 'id']),
        responsibleUserId: get(responsible, ['user', 'id']),
    }
}

interface ITicketAutoAssignment {
    organizationId: string,
    propertyId: string,
    categoryClassifier: string,
    form: FormInstance,
}

const AutoAssignerByDivisions: React.FC<ITicketAutoAssignment> = ({ organizationId, propertyId, categoryClassifier, form }) => {
    const intl = useIntl()
    const FoundOneDivisionMessage = intl.formatMessage({ id: 'ticket.assignments.divisions.found.one' })
    const FoundManyDivisionsMessage = intl.formatMessage({ id: 'ticket.assignments.divisions.found.many' })
    const AssignedResponsibleMessage = intl.formatMessage({ id: 'ticket.assignments.divisions.assigned.responsible' })
    const AssignedExecutorMessage = intl.formatMessage({ id: 'ticket.assignments.divisions.assigned.executor.found' })
    const SelectCategoryClassifierToAssignExecutorMessage = intl.formatMessage({ id: 'ticket.assignments.divisions.selectCategoryClassifier' })
    const NotAssignedExecutorMessage = intl.formatMessage({ id: 'ticket.assignments.divisions.assigned.executor.notFound' })

    const { loading, error, objs: divisions } = Division.useObjects({
        where: {
            organization: { id: organizationId },
            properties_some: {
                id: propertyId,
            },
        },
    }, {
        fetchPolicy: 'network-only',
    })

    const { responsibleUserId, executorUserId } = getResponsibleAndExecutorFrom(divisions, categoryClassifier)

    useEffect(() => {
        form.setFieldsValue({
            assignee: responsibleUserId,
            executor: executorUserId,
        })
    }, [responsibleUserId, executorUserId, form])

    if (loading || !divisions) {
        return null
    }

    if (error) {
        console.error(error)
        return null
    }

    if (divisions.length === 0) {
        return null
    }

    const division = divisions[0]

    const property = find(division.properties, { id: propertyId })

    const addressWithoutCity = formatAddressWithoutCityFrom(property.addressMeta)

    let message
    if (divisions.length === 1) {
        const division = divisions[0]
        message = FoundOneDivisionMessage
            .replace('{address}', addressWithoutCity)
            .replace('{division}', division.name)
    } else if (divisions.length > 1) {
        const divisionNames = map(divisions, 'name').map(name => `«${name}»`).join(', ')
        message = FoundManyDivisionsMessage
            .replace('{address}', addressWithoutCity)
            .replace('{divisions}', divisionNames)
    }

    if (responsibleUserId) {
        message += '. ' + AssignedResponsibleMessage
    }

    message += executorUserId
        ? AssignedExecutorMessage
        : categoryClassifier
            ? NotAssignedExecutorMessage
            : SelectCategoryClassifierToAssignExecutorMessage

    return (
        <Alert
            type={executorUserId ? 'info' : 'warning'}
            message={message}
            showIcon
        />
    )
}

export {
    AutoAssignerByDivisions,
}