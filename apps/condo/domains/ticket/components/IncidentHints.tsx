import {
    Incident as IIncident,
    IncidentClassifier as IIncidentClassifier,
    IncidentClassifierIncidentWhereInput,
    IncidentClassifierWhereInput,
    IncidentStatusType,
    IncidentWhereInput,
    SortIncidentsBy,
} from '@app/condo/schema'
import { Col, Row, RowProps } from 'antd'
import dayjs from 'dayjs'
import get from 'lodash/get'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { IntlShape } from 'react-intl/src/types'

import { useIntl } from '@open-condo/next/intl'
import { Alert, Typography, TypographyParagraphProps } from '@open-condo/ui'

import { Incident, IncidentClassifierIncident, IncidentProperty } from '@condo/domains/ticket/utils/clientSchema'


const INCIDENTS_GUTTER: RowProps['gutter'] = [0, 24]
const DESCRIPTION_GUTTER: RowProps['gutter'] = [0, 14]
const DETAILS_ELLIPSIS_CONFIG: TypographyParagraphProps['ellipsis'] = { rows: 7 }

type ClassifierDataType = Pick<IIncidentClassifier, 'category' | 'problem'>

type IncidentHintsProps = {
    propertyId: string
    organizationId: string
    classifier?: ClassifierDataType
}

type IncidentHintProps = {
    incident: IIncident
}

const formatDate = (intl: IntlShape, date?: string) => {
    if (!date) return '…'
    return dayjs(date).format('DD.MM.YYYY HH.mm')
}

const IncidentHint: React.FC<IncidentHintProps> = (props) => {
    const intl = useIntl()
    const MoreLabel = intl.formatMessage({ id: 'incident.hints.more.label' })

    const { incident } = props

    return (
        <Alert
            showIcon
            type='warning'
            description={
                <Row gutter={DESCRIPTION_GUTTER}>
                    <Col span={24}>
                        <Row>
                            <Col span={24}>
                                <Typography.Paragraph strong ellipsis={DETAILS_ELLIPSIS_CONFIG}>
                                    {get(incident, 'details', '')}
                                </Typography.Paragraph>
                            </Col>
                            <Col span={24}>
                                <Typography.Text>
                                    {formatDate(intl, incident.workStart)} — {formatDate(intl, incident.workFinish)}
                                </Typography.Text>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={24}>
                        <Typography.Link
                            href={`/incident/${incident.id}`}
                            size='large'
                            target='_blank'
                        >
                            {MoreLabel}
                        </Typography.Link>
                    </Col>
                </Row>
            }
        />
    )
}

/**
 *
 * logic getting incident hints:
 *
 * 1 - search IncidentProperties by propertyId
 *
 * 2 - search Incidents by IncidentProperties
 * 2.1 - search all actual Incidents
 * 2.2 - search last 3 not actual Incidents
 *
 * 3 - filter Incidents by IncidentClassifierIncident
 * 3.1 - search IncidentClassifierIncident by ( TicketCategoryClassifier and TicketProblemClassifier ) and Incidents
 * 3.2 - filter Incidents
 *
 * 4 - show Incidents
 */
export const IncidentHints: React.FC<IncidentHintsProps> = (props) => {
    const { propertyId, classifier, organizationId } = props

    const [allIncidents, setAllIncidents] = useState<IIncident[]>([])
    const [incidentsToShow, setIncidentsToShow] = useState<IIncident[]>([])

    const { refetch: refetchAllIncidentProperties } = IncidentProperty.useAllObjects({}, { skip: true })
    const { refetch: refetchIncidents } = Incident.useObjects({}, { skip: true })
    const { refetch: refetchAllIncidentClassifierIncidents } = IncidentClassifierIncident.useAllObjects({}, { skip: true })

    const categoryId = useMemo(() => get(classifier, 'category.id', null), [classifier]) as string | null
    const problemId = useMemo(() => get(classifier, 'problem.id', null), [classifier]) as string | null

    const fetchIncidentProperties = useCallback(async (propertyId: string) => {
        const res = await refetchAllIncidentProperties({
            where: {
                property: {
                    id: propertyId,
                    deletedAt: null,
                },
                deletedAt: null,
            },
        })

        return get(res, 'data.objs', [])
    }, [])

    const fetchIncidents = useCallback(async (sortBy: SortIncidentsBy[], incidentIds: string[], organizationId: string, status?: IncidentStatusType, count?: number) => {
        if (count === 0) {
            return []
        }

        const where: IncidentWhereInput = {
            organization: { id: organizationId },
            AND: [
                {
                    OR: [
                        { id_in: incidentIds },
                        { hasAllProperties: true },
                    ],
                },
            ],
        }

        if (status) {
            where.status = status
        }

        const res = await refetchIncidents({ where, sortBy, first: count })

        return get(res, 'data.objs', [])
    }, [])

    const fetchIncidentClassifierIncidents = useCallback(async (incidentIds: string[], categoryId?: string, problemId?: string) => {
        if (incidentIds.length < 1) {
            return []
        }

        const where: IncidentClassifierIncidentWhereInput = {
            incident: { id_in: incidentIds },
            deletedAt: null,
        }

        if (categoryId || problemId) {
            const AND: IncidentClassifierWhereInput['AND'] = []
            if (categoryId) {
                AND.push({
                    category: { id: categoryId },
                })
            }
            if (problemId) {
                AND.push({
                    OR: [
                        { problem_is_null: true },
                        { problem: { id: problemId } },
                    ],
                })
            }
            where.classifier = {
                AND,
            }
        }

        const res = await refetchAllIncidentClassifierIncidents({
            where,
        })

        return get(res, 'data.objs', [])
    }, [])

    const getAllIncidents = useCallback(async (propertyId: string, organizationId: string) => {
        const incidentProperties = await fetchIncidentProperties(propertyId)
        const incidentIds = incidentProperties.map(item => item.incident.id)
        const actualIncidents = await fetchIncidents(
            [SortIncidentsBy.WorkStartAsc, SortIncidentsBy.CreatedAtAsc],
            incidentIds, organizationId, IncidentStatusType.Actual
        )
        const notActualLastIncidents = await fetchIncidents(
            [SortIncidentsBy.WorkFinishDesc, SortIncidentsBy.CreatedAtDesc],
            incidentIds, organizationId, IncidentStatusType.NotActual, 3
        )
        const incidents = [...actualIncidents, ...notActualLastIncidents]
        setAllIncidents(incidents)
    }, [fetchIncidentProperties, fetchIncidents])

    const getIncidentsToShow = useCallback(async (incidents: IIncident[], categoryId?: string, problemId?: string) => {
        if (!categoryId && !problemId) {
            // NOTE: if we have not categoryId and problemId then we can show all incidents (without request to server)
            setIncidentsToShow(incidents)
        } else {
            const incidentClassifierIncidents = await fetchIncidentClassifierIncidents(incidents.map(item => item.id), categoryId, problemId)
            const incidentIdsFormIncidentClassifiers = incidentClassifierIncidents.map(item => item.incident.id)
            const filteredIncidents = incidents.filter((incident) => incidentIdsFormIncidentClassifiers.includes(incident.id))
            setIncidentsToShow(filteredIncidents)
        }
    }, [fetchIncidentClassifierIncidents])

    useEffect(() => {
        // NOTE: we should refetch all incidents if only was updated propertyId or organizationId
        getAllIncidents(propertyId, organizationId)
    }, [getAllIncidents, propertyId, organizationId])

    useEffect(() => {
        // NOTE: if we only change categoryId or problemId then we should not refetch all incidents
        getIncidentsToShow(allIncidents, categoryId, problemId)
    }, [allIncidents, categoryId, problemId, getIncidentsToShow])

    return (
        <Row gutter={INCIDENTS_GUTTER}>
            {
                incidentsToShow.map(incident => (
                    <Col span={24} key={incident.id}>
                        <IncidentHint incident={incident} />
                    </Col>
                ))
            }
        </Row>
    )
}
