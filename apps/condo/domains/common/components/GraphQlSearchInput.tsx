// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react'
import { Select, SelectProps, Typography } from 'antd'
import isFunction from 'lodash/isFunction'
import uniqBy from 'lodash/uniqBy'
import { ApolloClient } from '@apollo/client'
import { useApolloClient } from '@core/next/apollo'

import { WhereType } from '../utils/tables.utils'


type GraphQlSearchInputOption = {
    value: string
    text: string
    data?: any
}

export type RenderOptionFunc = (option: GraphQlSearchInputOption) => JSX.Element

// TODO: add apollo cache shape typings
export interface ISearchInputProps extends SelectProps<string> {
    search: (client: ApolloClient<Record<string, unknown>>, queryArguments: string) => Promise<Array<Record<string, unknown>>>
    onSelect?: (...args: Array<unknown>) => void
    onChange?: (...args: Array<unknown>) => void
    mode?: 'multiple' | 'tag'
    value?: string | string[]
    placeholder?: string
    label?: string
    showArrow?: boolean
    allowClear?: boolean
    disabled?: boolean
    autoFocus?: boolean
    initialValue?: string | string[]
    getInitialValueQuery?: (initialValue: string | string[]) => WhereType
    formatLabel?: (option: GraphQlSearchInputOption) => JSX.Element
    renderOptions?: (items: any[], renderOption: RenderOptionFunc) => JSX.Element[]
    /**
        searchAgainDependencies - Dependencies that should cause objects to be searched again in GraphQlSearchInput.
        This may be necessary, for example, when an argument is passed to the search function that may change.
        If we pass this argument to the searchAgainDependencies array, then the search will be repeated with a new argument.
     */
    searchAgainDependencies?: unknown[]
}

export const GraphQlSearchInput: React.FC<ISearchInputProps> = (props) => {
    const {
        search,
        onSelect,
        formatLabel,
        renderOptions,
        autoClearSearchValue,
        searchAgainDependencies = [],
        initialValue,
        getInitialValueQuery,
        ...restProps
    } = props
    const client = useApolloClient()
    const [selected, setSelected] = useState('')
    const [isLoading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [value, setValue] = useState('')

    const renderOption = (option) => {
        let optionLabel = option.text

        if (formatLabel) {
            optionLabel = formatLabel(option)
        }
        const value = ['string', 'number'].includes(typeof option.value) ? option.value : JSON.stringify(option)

        return (
            <Select.Option key={option.key || value} value={value}>
                <Typography.Text title={option.text}>{optionLabel}</Typography.Text>
            </Select.Option>
        )
    }

    const options = renderOptions
        ? renderOptions(data, renderOption)
        : data.map(renderOption)

    const loadInitialOptions = useCallback(async () => {
        const initialValueQuery = isFunction(getInitialValueQuery) ? getInitialValueQuery(initialValue) : { id_in: initialValue }

        if (Array.isArray(initialValue) && initialValue.length) {
            const initialOptions = await search(client, null, initialValueQuery, initialValue.length)

            setData(data => uniqBy([...initialOptions, ...data], 'value'))
        }
    }, [initialValue, getInitialValueQuery, client, search])

    useEffect(() => {
        loadInitialOptions().catch(err => console.error('failed to load initial options', err))
    }, [loadInitialOptions])

    useEffect(() => {
        handleSearch('')
    }, [...searchAgainDependencies])

    async function handleSearch (value) {
        if (!search) return
        setLoading(true)

        const data = await search(
            client,
            (selected && (!props.mode || props.mode !== 'multiple'))
                ? selected + ' ' + value
                : value,
        )

        setLoading(false)
        if (data.length) setData(data)
        setValue(value)
    }

    function handleSelect (value, option) {
        setSelected(option.children)

        if (props.mode === 'multiple') {
            setValue('')
        }

        if (onSelect) {
            onSelect(value, option)
        }
    }

    function handleClear () {
        setSelected('')
    }

    return (
        <Select
            showSearch
            autoClearSearchValue={autoClearSearchValue || false}
            allowClear={true}
            optionFilterProp={'title'}
            defaultActiveFirstOption={false}
            onSearch={handleSearch}
            onSelect={handleSelect}
            onClear={handleClear}
            searchValue={value}
            loading={isLoading}
            {...restProps}
        >
            {options}
        </Select>
    )
}
