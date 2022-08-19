/** @jsx jsx */
import React from 'react'
import { css, jsx } from '@emotion/react'
import { useRouter } from 'next/router'
import { Card, Typography } from 'antd'
import { fontSizes } from '@condo/domains/common/constants/style'
import { ExternalReport } from '@app/condo/schema'

const cardCss = css`
  box-shadow: 0 9px 28px rgba(0, 0, 0, 0.05),
  0 6px 16px rgba(0, 0, 0, 0.08),
  0 3px 6px rgba(0, 0, 0, 0.12);
  border-radius: 8px;
  cursor: pointer;
`

const CARD_HEAD_STYLE: React.CSSProperties = { fontSize: fontSizes.content, fontWeight: 700, borderBottom: 'none' }

interface IExternalReportCardProps {
    externalReport: ExternalReport
}

const ExternalReportCard = ({ externalReport }: IExternalReportCardProps): React.ReactElement => {
    const { title, description, id } = externalReport
    const { push } = useRouter()

    const onCardClick = () => {
        push(`/reports/external/${id}`)
    }

    return (
        <Card
            title={title}
            headStyle={CARD_HEAD_STYLE}
            css={cardCss}
            onClick={onCardClick}
        >
            <Typography.Text>{description}</Typography.Text>
        </Card>
    )
}

export default ExternalReportCard
