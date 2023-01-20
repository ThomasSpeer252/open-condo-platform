import styled from '@emotion/styled'
import { Space, Typography } from 'antd'
import classnames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import { useIntl } from '@open-condo/next/intl'

import { Tooltip } from '@condo/domains/common/components/Tooltip'
import { transitions } from '@condo/domains/common/constants/style'
import { INoOrganizationToolTipWrapper } from '@condo/domains/onboarding/hooks/useNoOrganizationToolTip'


import { ClientRenderedIcon } from './icons/ClientRenderedIcon'
import { TrackingEventType, useTracking } from './TrackingContext'

import { colors } from '../constants/style'

const IconWrapper = styled.div``

interface IMenuItemWrapperProps {
    padding?: string
    isCollapsed?: boolean
    labelFontSize?: string
}

const MenuItemWrapper = styled.div<IMenuItemWrapperProps>`
  cursor: pointer;
  padding: ${props => props.padding ? props.padding : '12px 0'};
  display: flex;
  border-radius: 8px;
  flex-direction: row;
  align-items: center;
  justify-content: ${({ isCollapsed }) => isCollapsed ? 'center' : 'flex-start'};
  vertical-align: center;

  .label {
    font-size: ${props => props.labelFontSize ? props.labelFontSize : '16px'};
    transition: ${transitions.allDefault};
    white-space: nowrap;
  }

  .icon {
    color: ${colors.textSecondary};
    font-size: 20px;
    transition: ${transitions.allDefault};
  }

  &:hover {
    .icon {
      color: ${colors.black};
    }
  }

  &.active {
    .label {
      font-weight: 700;
    }

    .icon {
      color: ${colors.black};
    }
  }

  &.disabled {
    opacity: 0.4;
  }
`

interface IMenuItemProps {
    path?: string
    icon: React.ElementType
    label: string
    disabled?: boolean
    hideInMenu?: boolean
    menuItemWrapperProps?: IMenuItemWrapperProps
    isCollapsed?: boolean
    onClick?: () => void
    eventName?: string

    toolTipDecorator? (params: INoOrganizationToolTipWrapper): JSX.Element
}

const makeLink = (content: JSX.Element, path: string) => {
    return (
        <Link href={path}>
            <a>
                {content}
            </a>
        </Link>
    )
}

const addToolTipForCollapsedMenu = (content: JSX.Element, Message: string) => (
    <Tooltip title={Message} placement='right'>
        {content}
    </Tooltip>
)

export const MenuItem: React.FC<IMenuItemProps> = (props) => {
    const {
        path,
        icon,
        label,
        hideInMenu,
        disabled,
        menuItemWrapperProps,
        isCollapsed,
        toolTipDecorator = null,
        onClick,
        eventName,
    } = props
    const { route } = useRouter()
    const intl = useIntl()
    const { getTrackingWrappedCallback } = useTracking()

    const [isActive, setIsActive] = useState(false)

    useEffect(() => {
        const regex = new RegExp(`^${path}`)
        setIsActive(path === '/' ? route === path : regex.test(route))
    }, [route, path])

    const handleClick = useMemo(
        () => getTrackingWrappedCallback(eventName, null, onClick),
        [eventName, getTrackingWrappedCallback, onClick]
    )

    if (hideInMenu) {
        return null
    }

    const Message = intl.formatMessage({ id: label })

    const menuItemClassNames = classnames({
        'active': isActive,
        'disabled': disabled,
    })

    const linkContent = isCollapsed
        ? (
            <IconWrapper className='icon'>
                <ClientRenderedIcon icon={icon}/>
            </IconWrapper>
        )
        : (
            <Space size={14}>
                <IconWrapper className='icon'>
                    <ClientRenderedIcon icon={icon}/>
                </IconWrapper>
                <Typography.Text className='label'>
                    {Message}
                </Typography.Text>
            </Space>
        )

    const menuItem = (
        <MenuItemWrapper onClick={handleClick} className={menuItemClassNames} isCollapsed={isCollapsed} {...menuItemWrapperProps}>
            {(isCollapsed && !disabled) ? addToolTipForCollapsedMenu(linkContent, Message) : linkContent}
        </MenuItemWrapper>
    )

    const nextjsLink = !path || disabled ? menuItem : makeLink(menuItem, path)

    return toolTipDecorator ? toolTipDecorator({ element: nextjsLink, placement: 'right' }) : nextjsLink
}
