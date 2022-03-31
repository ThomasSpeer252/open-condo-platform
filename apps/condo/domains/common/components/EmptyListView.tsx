import { Empty, EmptyProps, Space, Typography } from 'antd'
import { useRouter } from 'next/router'
import { Button } from './Button'
import { EmptyIcon } from './EmptyIcon'
import React, { CSSProperties } from 'react'

export interface IEmptyListProps {
    label: string,
    message: string,
    createRoute: string,
    createLabel: string,
}

export interface IBasicEmptyListProps extends EmptyProps {
    image?: string
    children?: React.ReactNode
    containerStyle?: CSSProperties,
    imageStyle?: CSSProperties,
    spaceSize?: number,
}

const DEFAULT_CONTAINER_STYLE: CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
}

export const BasicEmptyListView: React.FC<IBasicEmptyListProps> = ({
    image,
    children,
    containerStyle,
    spaceSize,
    imageStyle,
    ...other
}) => {
    return (
        <div style={{ ...DEFAULT_CONTAINER_STYLE, ...containerStyle }}>
            <Empty
                style={{ maxWidth: '350px' }}
                image={image ? image : <EmptyIcon/>}
                imageStyle={{ height: '200px', ...imageStyle }}
                description={
                    <Space direction={'vertical'} size={spaceSize || 0}>
                        {children}
                    </Space>
                }
                {...other}
            />
        </div>
    )
}

export const EmptyListView: React.FC<IEmptyListProps> = ({ label, message, createRoute, createLabel }) => {
    const router = useRouter()
    return (
        <BasicEmptyListView image="dino/searching@2x.png" spaceSize={16} imageStyle={{ height: 200 }}>
            <Typography.Title level={4}>
                {label}
            </Typography.Title>
            <Typography.Text type={'secondary'}>
                {message}
            </Typography.Text>
            <Button
                type={'sberDefaultGradient'}
                style={{ marginTop: '24px' }}
                onClick={() => router.push(createRoute)}
            >
                {createLabel}
            </Button>
        </BasicEmptyListView>
    )
}

export default EmptyListView
