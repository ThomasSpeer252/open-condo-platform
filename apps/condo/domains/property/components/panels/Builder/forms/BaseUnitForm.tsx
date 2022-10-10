import React from 'react'
import { RowProps } from 'antd'
import { MapEdit } from '@condo/domains/property/components/panels/Builder/MapConstructor'
import { css } from '@emotion/react'

export interface IPropertyMapModalForm {
    builder: MapEdit
    refresh(): void
}

export const MODAL_FORM_ROW_GUTTER: RowProps['gutter'] = [0, 24]
export const MODAL_FORM_ROW_BUTTONS_GUTTER: RowProps['gutter'] = [0, 16]
export const MODAL_FORM_EDIT_GUTTER: RowProps['gutter'] = [0, 28]
export const MODAL_FORM_BUTTON_STYLE: React.CSSProperties = { marginTop: '12px' }
export const MODAL_FORM_CHECKBOX_STYLE: React.CSSProperties = { marginTop: '20px' }
export const TEXT_BUTTON_STYLE: React.CSSProperties = { cursor: 'pointer', marginTop: '8px', display: 'block' }
export const FULL_SIZE_UNIT_STYLE: React.CSSProperties = { width: '100%', marginTop: '8px', display: 'block' }
export const MODAL_FORM_BUTTON_GUTTER: RowProps['gutter'] = [0, 16]
export const INPUT_STYLE = { width: '100%' }
export const BUTTON_SPACE_SIZE = 28

export const FormModalCss = css`
  & .ant-space,
  & button {
    width: 100%;
  }
`
