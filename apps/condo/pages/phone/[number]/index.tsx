import { Col, Row, Tabs, Typography } from 'antd'
import { Gutter } from 'antd/es/grid/row'
import { EllipsisConfig } from 'antd/es/typography/Base'
import get from 'lodash/get'
import uniqBy from 'lodash/uniqBy'
import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { CSSProperties, useCallback, useMemo, useState } from 'react'
import { BuildingUnitSubType, Contact as ContactType, SortTicketsBy, Ticket as TicketType } from '@app/condo/schema'

import styled from '@emotion/styled'
import { useIntl } from '@open-condo/next/intl'
import { useOrganization } from '@open-condo/next/organization'

import ActionBar from '@condo/domains/common/components/ActionBar'
import { Button } from '@condo/domains/common/components/Button'
import { PageContent, PageWrapper } from '@condo/domains/common/components/containers/BaseLayout'
import { PlusIcon } from '@condo/domains/common/components/icons/PlusIcon'
import { DEFAULT_PAGE_SIZE, Table } from '@condo/domains/common/components/Table/Index'
import { Tag } from '@condo/domains/common/components/Tag'
import { colors, fontSizes, gradients, shadows } from '@condo/domains/common/constants/style'
import { updateQuery } from '@condo/domains/common/utils/filters.utils'
import { getPageIndexFromOffset, parseQuery } from '@condo/domains/common/utils/tables.utils'
import { ClientType, getClientCardTabKey, redirectToForm } from '@condo/domains/contact/utils/clientCard'
import { Contact } from '@condo/domains/contact/utils/clientSchema'
import { OrganizationRequired } from '@condo/domains/organization/components/OrganizationRequired'
import { OrganizationEmployee } from '@condo/domains/organization/utils/clientSchema'
import { getPropertyAddressParts } from '@condo/domains/property/utils/helpers'
import { TicketResidentFeatures } from '@condo/domains/ticket/components/TicketId/TicketResidentFeatures'
import { TicketPropertyHintCard } from '@condo/domains/ticket/components/TicketPropertyHint/TicketPropertyHintCard'
import { useClientCardTicketTableColumns } from '@condo/domains/ticket/hooks/useClientCardTicketTableColumns'
import { Ticket } from '@condo/domains/ticket/utils/clientSchema'

//#region Constants, types and styles
const TAG_STYLE: CSSProperties = { borderRadius: '100px' }
const STREET_PARAGRAPH_STYLE: CSSProperties = { margin: 0 }
const ADDRESS_POSTFIX_ELLIPSIS: EllipsisConfig = { rows: 2 }
const ADDRESS_POSTFIX_STYLE: CSSProperties = { margin: 0, fontSize: fontSizes.label }
const ROW_BIG_GUTTER: [Gutter, Gutter] = [0, 60]
const ROW_MEDIUM_GUTTER: [Gutter, Gutter] = [0, 40]
const ROW_MEDIUM_SMALL_GUTTER: [Gutter, Gutter] = [0, 24]
const ROW_SMALL_GUTTER: [Gutter, Gutter] = [0, 12]
const ADD_ADDRESS_TEXT_STYLE: CSSProperties = { marginTop: '12px' }
const HINT_CARD_STYLE = { maxHeight: '3em' }
const EMAIL_TEXT_STYLES = { fontSize: fontSizes.content }
const TICKET_SORT_BY = [SortTicketsBy.CreatedAtDesc]
const PLUS_ICON_WRAPPER_CLASS = 'plusIconWrapper'

interface IClientContactProps {
    lastTicket: TicketType,
    contact?: ContactType
}

const StyledTabs = styled(Tabs)`
  &.ant-tabs-top > .ant-tabs-nav::before {
    border-bottom: none;
  }

  & .ant-tabs-nav {
    white-space: initial;
  }

  & .ant-tabs-nav-list .ant-tabs-ink-bar {
    display: none;
  }

  & .ant-tabs-nav-more {
    display: none;
  }
`
const StyledClientTab = styled.div<{ active: boolean }>`
  width: 258px;
  height: 150px;
  box-shadow: ${shadows.small};
  border-radius: 12px;
  background: ${props => props.active ? gradients.sberActionGradient : 'inherit'};
  padding: 1px;

  & > div {
    border-radius: 11px;
    height: 100%;
    padding: 20px;
    background-color: #FFFFFF;
  }
`
const StyledAddAddressButton = styled(Button)`
  width: 258px;
  height: 150px;
  box-shadow: ${shadows.small};
  border-radius: 12px;
  border: 1px dashed ${colors.inputBorderHover};
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 600;

  & .anticon {
    margin: 0;
  }
  
  &:hover {
    border: inherit;

    & .${PLUS_ICON_WRAPPER_CLASS} {
      background-color: ${colors.black};
      color: ${colors.white};
    }
  }
`
const PlusIconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 100px;
  background-color: ${colors.backgroundLightGrey};
  color: ${colors.black};
  transition: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
`
const StyledLink = styled.span`
  color: ${colors.black};

  &:hover {
    color: ${colors.black};
    cursor: pointer;
  }

  display: block;
  width: max-content;

  font-size: ${fontSizes.label};
  text-decoration: none;
  border-bottom: 1px solid ${colors.lightGrey[6]};
`
//#endregion

//#region Address and Client Tab cards
const AddAddressTabTitle = () => {
    const intl = useIntl()
    const AddAddressMessage = intl.formatMessage({ id: 'pages.clientCard.addAddress' })

    return (
        <StyledAddAddressButton>
            <PlusIconWrapper className={PLUS_ICON_WRAPPER_CLASS}>
                <PlusIcon/>
            </PlusIconWrapper>
            <Typography.Paragraph style={ADD_ADDRESS_TEXT_STYLE}>
                {AddAddressMessage}
            </Typography.Paragraph>
        </StyledAddAddressButton>
    )
}

const ClientTabTitle = ({ active, type, property, unitName }) => {
    const intl = useIntl()
    const ContactMessage = intl.formatMessage({ id: 'Contact' })
    const NotResidentMessage = intl.formatMessage({ id: 'pages.condo.ticket.filters.isResidentContact.false' })
    const DeletedMessage = intl.formatMessage({ id: 'Deleted' })
    const FlatMessage = intl.formatMessage({ id: 'field.ShortFlatNumber' })

    const typeToMessage = useMemo(() => ({
        [ClientType.Resident]: ContactMessage,
        [ClientType.NotResident]: NotResidentMessage,
    }), [ContactMessage, NotResidentMessage])

    const { text, postfix } = getPropertyAddressParts(property, DeletedMessage)
    const streetAndFlatMessage = unitName ? `${text} ${FlatMessage} ${unitName}` : text.substring(0, text.length - 1)

    return (
        <StyledClientTab active={active}>
            <Row gutter={ROW_SMALL_GUTTER}>
                <Col span={24}>
                    <Tag type='gray' style={TAG_STYLE}>
                        {typeToMessage[type]}
                    </Tag>
                </Col>
                <Col span={24}>
                    <Typography.Paragraph
                        ellipsis
                        title={streetAndFlatMessage}
                        strong
                        style={STREET_PARAGRAPH_STYLE}
                    >
                        {streetAndFlatMessage}
                    </Typography.Paragraph>
                    <Typography.Paragraph
                        ellipsis={ADDRESS_POSTFIX_ELLIPSIS}
                        title={postfix}
                        type='secondary'
                        style={ADDRESS_POSTFIX_STYLE}
                    >
                        {postfix}
                    </Typography.Paragraph>
                </Col>
            </Row>
        </StyledClientTab>
    )
}
//#endregion

//#region Contact and Not resident client Tab content
const ClientContent: React.FC<IClientContactProps> = ({ lastTicket, contact }) => {
    const name = get(contact, 'name', get(lastTicket, 'clientName'))
    const email = get(contact, 'email', get(lastTicket, 'clientEmail'))

    return (
        <Row>
            <Col span={24}>
                <Row justify='space-between'>
                    <Typography.Title level={3}>{name}</Typography.Title>
                    {
                        contact && lastTicket && (
                            <TicketResidentFeatures ticket={lastTicket}/>
                        )
                    }
                </Row>
            </Col>
            {
                email && (
                    <Col span={24}>
                        <Typography.Text style={EMAIL_TEXT_STYLES}>
                            {email}
                        </Typography.Text>
                    </Col>
                )
            }
        </Row>
    )
}

const ClientCardTabContent = ({
    property,
    searchTicketsQuery,
    handleTicketCreateClick,
    canManageContacts,
    handleContactEditClick = null,
    contact = null,
}) => {
    const intl = useIntl()
    const ShowAllPropertyTicketsMessage = intl.formatMessage({ id: 'pages.clientCard.showAllPropertyTickets' })
    const ContactTicketsMessage = intl.formatMessage({ id: 'pages.clientCard.contactTickets' })
    const CreateTicketMessage = intl.formatMessage({ id: 'CreateTicket' })
    const EditContactMessage = intl.formatMessage({ id: 'pages.clientCard.editContact' })

    const router = useRouter()

    const { offset } = parseQuery(router.query)
    const currentPageIndex = getPageIndexFromOffset(offset, DEFAULT_PAGE_SIZE)
    const {
        loading: isTicketsFetching,
        count: total,
        objs: tickets,
    } = Ticket.useObjects({
        sortBy: TICKET_SORT_BY,
        where: searchTicketsQuery,
        first: DEFAULT_PAGE_SIZE,
        skip: (currentPageIndex - 1) * DEFAULT_PAGE_SIZE,
    })
    const lastCreatedTicket = get(tickets, 0)

    const columns = useClientCardTicketTableColumns(tickets)

    const handleShowAllPropertyTicketsMessage = useCallback(async () => {
        await updateQuery(router, { property: [property.id] }, null, null, '/ticket')
    }, [property.id, router])

    const handleRowAction = useCallback((record) => {
        return {
            onClick: async () => {
                await router.push(`/ticket/${record.id}/`)
            },
        }
    }, [router])

    const handleCreateTicket = useCallback(() => handleTicketCreateClick(lastCreatedTicket),
        [handleTicketCreateClick, lastCreatedTicket])

    return (
        <Row gutter={ROW_BIG_GUTTER}>
            <Col span={24}>
                <Row gutter={ROW_MEDIUM_GUTTER}>
                    <Col span={24}>
                        <StyledLink onClick={handleShowAllPropertyTicketsMessage}>
                            {ShowAllPropertyTicketsMessage}
                        </StyledLink>
                    </Col>
                    <Col span={24}>
                        <ClientContent lastTicket={lastCreatedTicket} contact={contact}/>
                    </Col>
                    <Col span={24}>
                        <TicketPropertyHintCard
                            propertyId={property.id}
                            hintContentStyle={HINT_CARD_STYLE}
                        />
                    </Col>
                </Row>
            </Col>
            <Col span={24}>
                <Row gutter={ROW_MEDIUM_SMALL_GUTTER}>
                    <Col span={24}>
                        <Typography.Title level={4}>
                            {ContactTicketsMessage}
                        </Typography.Title>
                    </Col>
                    <Col span={24}>
                        <Table
                            totalRows={total}
                            loading={isTicketsFetching}
                            dataSource={tickets}
                            columns={columns}
                            onRow={handleRowAction}
                            data-cy='ticket__table'
                        />
                    </Col>
                </Row>
            </Col>
            <ActionBar>
                <Button
                    key='submit'
                    onClick={handleCreateTicket}
                    type='sberDefaultGradient'
                >
                    {CreateTicketMessage}
                </Button>
                {
                    canManageContacts && handleContactEditClick && (
                        <Button
                            key='submit'
                            onClick={handleContactEditClick}
                            type='sberDefaultGradient'
                            secondary
                        >
                            {EditContactMessage}
                        </Button>
                    )
                }
            </ActionBar>
        </Row>
    )
}

const ContactClientTabContent = ({ property, unitName, phone, canManageContacts }) => {
    const router = useRouter()

    const { objs: contacts } = Contact.useObjects({
        where: {
            property: { id: property.id },
            unitName,
            phone,
        },
    })
    const contact = get(contacts, 0, null)

    const searchTicketsQuery = useMemo(() => ({
        property: { id: get(property, 'id', null) },
        unitName,
        contact: { id: get(contact, 'id') },
    }), [contact, property, unitName])

    const handleTicketCreateClick = useCallback(async () => {
        const initialValues = {
            property: get(property, 'id'),
            unitName,
            contact: get(contact, 'id'),
            clientName: get(contact, 'name'),
            clientPhone: get(contact, 'phone'),
            unitType: BuildingUnitSubType.Flat,
            isResidentTicket: true,
        }

        await redirectToForm({
            router,
            formRoute: '/ticket/create',
            initialValues,
        })
    }, [contact, property, router, unitName])

    const handleContactEditClick = useCallback(async () => {
        await redirectToForm({
            router,
            formRoute: `/contact/${get(contact, 'id')}/update`,
        })
    }, [contact, router])

    return (
        <ClientCardTabContent
            property={property}
            searchTicketsQuery={searchTicketsQuery}
            handleTicketCreateClick={handleTicketCreateClick}
            handleContactEditClick={handleContactEditClick}
            canManageContacts={canManageContacts}
            contact={contact}
        />
    )
}

const NotResidentClientTabContent = ({ property, unitName, phone }) => {
    const router = useRouter()

    const searchTicketsQuery = useMemo(() => ({
        property: { id: get(property, 'id', null) },
        unitName,
        clientPhone: phone,
        isResidentTicket: false,
        clientName_not: null,
    }), [phone, property, unitName])

    const handleTicketCreateClick = useCallback(async (ticket) => {
        const initialValues = {
            property: get(property, 'id'),
            unitName,
            clientName: get(ticket, 'clientName'),
            clientPhone: get(ticket, 'clientPhone'),
            unitType: BuildingUnitSubType.Flat,
            isResidentTicket: false,
        }

        await redirectToForm({
            router,
            formRoute: '/ticket/create',
            initialValues,
        })
    }, [property, router, unitName])

    return (
        <ClientCardTabContent
            property={property}
            searchTicketsQuery={searchTicketsQuery}
            handleTicketCreateClick={handleTicketCreateClick}
            canManageContacts={false}
        />
    )
}

const ClientTabContent = ({ type, phone, property, unitName, canManageContacts }) => {
    return type === ClientType.Resident ? (
        <ContactClientTabContent
            phone={phone}
            property={property}
            unitName={unitName}
            canManageContacts={canManageContacts}
        />
    ) : (
        <NotResidentClientTabContent
            phone={phone}
            property={property}
            unitName={unitName}
        />
    )
}
//#endregion

//#region Page Content
const ClientCardPageContent = ({ phoneNumber, tabsData, canManageContacts }) => {
    const intl = useIntl()
    const ClientCardTitle = intl.formatMessage({ id: 'pages.clientCard.Title' }, {
        phone: phoneNumber,
    })

    const router = useRouter()
    const { tab } = parseQuery(router.query)

    const [activeTab, setActiveTab] = useState(tab)

    const handleTabChange = useCallback(async (newKey) => {
        if (newKey === 'addAddress') {
            return await redirectToForm({
                router,
                formRoute: '/contact/create',
                initialValues: {
                    phone: phoneNumber,
                },
            })
        }

        setActiveTab(newKey)
        const newRoute = `${router.route.replace('[number]', phoneNumber)}?tab=${newKey}`

        return router.push(newRoute)
    }, [phoneNumber, router])

    const renderedTabs = useMemo(() =>
        tabsData.map(({ type, property, unitName }) => {
            const key = getClientCardTabKey(property.id, type, unitName)

            const Tab = (
                <ClientTabTitle
                    type={type}
                    property={property}
                    unitName={unitName}
                    active={activeTab === key}
                />
            )

            return (
                <Tabs.TabPane tab={Tab} key={key}>
                    <ClientTabContent
                        type={type}
                        property={property}
                        phone={phoneNumber}
                        unitName={unitName}
                        canManageContacts={canManageContacts}
                    />
                </Tabs.TabPane>
            )
        })
    , [activeTab, canManageContacts, phoneNumber, tabsData])

    return (
        <>
            <Head>
                <title>{ClientCardTitle}</title>
            </Head>
            <PageWrapper>
                <PageContent>
                    <Row gutter={ROW_BIG_GUTTER}>
                        <Col span={24}>
                            <Typography.Title>{ClientCardTitle}</Typography.Title>
                        </Col>
                        <Col span={24}>
                            <StyledTabs
                                onChange={handleTabChange}
                                moreIcon={null}
                                defaultActiveKey={tab}
                                activeKey={tab}
                            >
                                {
                                    canManageContacts && (
                                        <Tabs.TabPane key='addAddress' tab={<AddAddressTabTitle/>}/>
                                    )
                                }
                                {renderedTabs}
                            </StyledTabs>
                        </Col>
                    </Row>
                </PageContent>
            </PageWrapper>
        </>
    )
}

export const ClientCardPageContentWrapper = ({ baseQuery, canManageContacts }) => {
    const router = useRouter()
    const phoneNumber = get(router, ['query', 'number']) as string

    const { objs: contacts } = Contact.useObjects({
        where: {
            ...baseQuery,
            phone: phoneNumber,
        },
    })

    const { objs: tickets } = Ticket.useObjects({
        where: {
            ...baseQuery,
            clientPhone: phoneNumber,
            isResidentTicket: false,
        },
    })

    const { objs: employees } = OrganizationEmployee.useObjects({
        where: {
            ...baseQuery,
            phone: phoneNumber,
        },
    })

    const employeeTickets = useMemo(() =>
        tickets.filter(ticket => !!employees.find(employee => employee.phone === ticket.clientPhone)),
    [employees, tickets])
    const notResidentTickets = useMemo(() =>
        tickets.filter(ticket => !employeeTickets.find(employeeTicket => employeeTicket.id === ticket.id)),
    [employeeTickets, tickets])

    const tabsData = useMemo(() => {
        const contactsData = contacts.map(contact => ({
            type: ClientType.Resident,
            property: contact.property,
            unitName: contact.unitName,
        }))
        const notResidentData = uniqBy(notResidentTickets.map(ticket => ({
            type: ClientType.NotResident,
            property: ticket.property,
            unitName: ticket.unitName,
        })), 'property.id')

        return [...contactsData, ...notResidentData]
    }, [contacts, notResidentTickets])

    return (
        <ClientCardPageContent
            phoneNumber={phoneNumber}
            tabsData={tabsData}
            canManageContacts={canManageContacts}
        />
    )
}

const ClientCardPage = () => {
    const { organization, link } = useOrganization()
    const organizationId = get(organization, 'id', null)
    const canManageContacts = !!get(link, 'role.canManageContacts')

    const baseQuery = { organization: { id: organizationId } }

    return (
        <ClientCardPageContentWrapper baseQuery={baseQuery} canManageContacts={canManageContacts}/>
    )
}
//#endregion

ClientCardPage.requiredAccess = OrganizationRequired

export default ClientCardPage