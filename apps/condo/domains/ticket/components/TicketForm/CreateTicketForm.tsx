import { Col, Form, Row, Typography } from 'antd'
import dayjs from 'dayjs'
import isToday from 'dayjs/plugin/isToday'
import get from 'lodash/get'
import { useRouter } from 'next/router'
import React, { useCallback, useMemo } from 'react'

import { useApolloClient } from '@open-condo/next/apollo'
import { useAuth } from '@open-condo/next/auth'
import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'

import ActionBar from '@condo/domains/common/components/ActionBar'
import { Button } from '@condo/domains/common/components/Button'
import { colors } from '@condo/domains/common/constants/style'
import { getObjectValueFromQuery } from '@condo/domains/common/utils/query'
import { ClientType, getClientCardTabKey } from '@condo/domains/contact/utils/clientCard'
import { BaseTicketForm } from '@condo/domains/ticket/components/BaseTicketForm'
import { ErrorsContainer } from '@condo/domains/ticket/components/BaseTicketForm/ErrorsContainer'
import { useTicketFormContext } from '@condo/domains/ticket/components/TicketForm/TicketFormContext'
import { REQUIRED_TICKET_FIELDS } from '@condo/domains/ticket/constants/common'
import { useCacheUtils } from '@condo/domains/ticket/hooks/useCacheUtils'
import { Ticket } from '@condo/domains/ticket/utils/clientSchema'
import { getTicketDefaultDeadline } from '@condo/domains/ticket/utils/helpers'

dayjs.extend(isToday)

const OPEN_STATUS = '6ef3abc4-022f-481b-90fb-8430345ebfc2'

export const CreateTicketActionBar = ({ handleSave, isLoading, form }) => {
    const intl = useIntl()
    const CreateTicketMessage = intl.formatMessage({ id: 'CreateTicket' })
    const AddressNotSelected = intl.formatMessage({ id: 'field.Property.nonSelectedError' })

    const { ticketSetting, ticketSettingLoading } = useTicketFormContext()

    return (
        <Form.Item noStyle shouldUpdate>
            {
                ({ getFieldsValue, getFieldError }) => {
                    const { property, details, placeClassifier, categoryClassifier, deadline } = getFieldsValue(REQUIRED_TICKET_FIELDS)
                    const propertyMismatchError = getFieldError('property').find((error)=>error.includes(AddressNotSelected))
                    const isPaid = form.getFieldValue('isPaid')
                    const isEmergency = form.getFieldValue('isEmergency')
                    const isWarranty = form.getFieldValue('isWarranty')
                    const isRequiredDeadline = getTicketDefaultDeadline(ticketSetting, isPaid, isEmergency, isWarranty) !== null
                    const disabledCondition = !property
                        || !details
                        || !placeClassifier
                        || !categoryClassifier
                        || (isRequiredDeadline && !deadline)
                        || ticketSettingLoading

                    return (
                        <ActionBar isFormActionBar>
                            <Col>
                                <Row gutter={[0, 24]}>
                                    <Button
                                        key='submit'
                                        onClick={handleSave}
                                        type='sberDefaultGradient'
                                        loading={isLoading}
                                        disabled={disabledCondition}
                                        data-cy='ticket__submit-button'
                                        style={{ marginRight: '12px' }}
                                    >
                                        {CreateTicketMessage}
                                    </Button>
                                    <ErrorsContainer
                                        isVisible={disabledCondition}
                                        property={property}
                                        details={details}
                                        placeClassifier={placeClassifier}
                                        categoryClassifier={categoryClassifier}
                                        deadline={deadline}
                                        propertyMismatchError={propertyMismatchError}
                                        isRequiredDeadline={isRequiredDeadline}
                                    />
                                </Row>
                            </Col>
                        </ActionBar>
                    )
                }
            }
        </Form.Item>
    )
}

const LINK_STYLES = { color: colors.black, textDecoration: 'underline', textDecorationColor: colors.lightGrey[8] }

export const CreateTicketForm: React.FC = () => {
    const intl = useIntl()
    const SuccessNotificationDescription = intl.formatMessage({ id: 'pages.condo.ticket.notification.success.description' })

    const { organization, link } = useOrganization()
    const router = useRouter()
    const auth = useAuth() as { user: { id: string } }
    const client = useApolloClient()
    const { addTicketToQueryCacheForTicketCardList } = useCacheUtils(client.cache)

    const initialValuesFromQuery = useMemo(() => getObjectValueFromQuery(router, ['initialValues']), [router])
    const redirectToClientCard = useMemo(() => !!get(router, ['query', 'redirectToClientCard']), [router])

    const action = Ticket.useCreate(
        {
            status: { connect: { id: OPEN_STATUS } },
        },
        async (ticket) => {
            addTicketToQueryCacheForTicketCardList(ticket)
            if (redirectToClientCard) {
                const clientPhone = ticket.clientPhone
                const ticketPropertyId = get(ticket, 'property.id')
                const isResidentTicket = !!get(ticket, 'contact')
                if (clientPhone && ticketPropertyId) {
                    const clientCardTabType = isResidentTicket ? ClientType.Resident : ClientType.NotResident
                    await router.push(`/phone/${clientPhone}?tab=${getClientCardTabKey(ticketPropertyId, clientCardTabType, ticket.unitName)}`)
                }
            } else {
                await router.push('/ticket')
            }
        })

    const createAction = useCallback((variables) => {
        let deadline = get(variables, 'deadline')
        if (deadline && deadline.isToday()) {
            deadline = deadline.endOf('day')
        }
        return action({
            ...Ticket.formValuesProcessor({ ...variables, deadline }),
            organization: { connect: { id: organization.id } },
        })
    }, [organization, action])

    const initialValues = useMemo(() => ({
        ...initialValuesFromQuery,
        assignee: auth.user.id,
        executor: auth.user.id,
    }), [auth.user.id, initialValuesFromQuery])

    const getCompletedNotification = useCallback((data) => ({
        message: (
            <Typography.Text strong>
                {intl.formatMessage({ id: 'pages.condo.ticket.notification.success.message' }, { number: data.number })}
            </Typography.Text>
        ),
        description: (
            <Typography.Link style={LINK_STYLES} href={`/ticket/${data.id}`} target='_blank' rel='noreferrer'>
                {SuccessNotificationDescription}
            </Typography.Link>
        ),
    }), [SuccessNotificationDescription, intl])

    return useMemo(() => (
        <BaseTicketForm
            action={createAction}
            initialValues={initialValues}
            organization={organization}
            role={link.role}
            autoAssign
            OnCompletedMsg={getCompletedNotification}
            isExisted={false}
        >
            {({ handleSave, isLoading, form }) => <CreateTicketActionBar handleSave={handleSave} isLoading={isLoading} form={form} />}
        </BaseTicketForm>
    ), [createAction, getCompletedNotification, initialValues, link.role, organization])
}
