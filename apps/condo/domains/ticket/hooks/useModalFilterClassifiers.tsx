import { useApolloClient } from '@core/next/apollo'
import { ClassifiersQueryLocal, TicketClassifierTypes } from '../utils/clientSchema/classifierSearch'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { uniqBy } from 'lodash'
import { FormInstance, Select } from 'antd'
import { useRouter } from 'next/router'
import { parseQuery } from '@condo/domains/common/utils/tables.utils'
import { useIntl } from '@core/next/intl'

const { Option } = Select

interface Options {
    id: string
    name: string
}

const useTicketClassifierSelect = ({
    onChange,
    keyword,
}) => {
    const intl = useIntl()
    const SelectMessage = intl.formatMessage({ id: 'Select' })

    const [classifiers, setClassifiersFromRules] = useState([])
    const [searchClassifiers, setSearchClassifiers] = useState([])
    const [stateForm, setForm] = useState<FormInstance>(null)

    const classifiersRef = useRef(null)
    const optionsRef = useRef([])

    const router = useRouter()

    const setClassifiers = (classifiers) => {
        setClassifiersFromRules(classifiers)
        setSearchClassifiers([])
    }

    function setSelected (value) {
        stateForm && stateForm.setFieldsValue({ [keyword]: value })
    }

    useEffect(() => {
        optionsRef.current = uniqBy([...classifiers, ...searchClassifiers], 'id')
    }, [classifiers, searchClassifiers])

    const handleChange = (form: FormInstance, value) => {
        onChange && onChange(value)
        form.setFieldsValue({ [keyword]: value })
    }

    const SelectComponent = useCallback( (props) => {
        const { disabled, style, form } = props

        if (!stateForm)
            setForm(stateForm)

        return (
            <Select
                showSearch
                showArrow
                allowClear
                style={style}
                onChange={(value) => handleChange(form, value)}
                optionFilterProp={'title'}
                disabled={disabled}
                value={form.getFieldValue(keyword)}
                showAction={['focus', 'click']}
                mode={'multiple'}
                placeholder={SelectMessage}
                getPopupContainer={() => document.getElementById('filtersPopupContainer')}
            >
                {
                    optionsRef.current.map(classifier => (
                        <Option value={classifier.id} key={classifier.id} title={classifier.name}>
                            {classifier.name}
                        </Option>
                    ))
                }
            </Select>
        )
    }, [router.query])

    return {
        SelectComponent,
        set: {
            all: setClassifiers,
            one: setSelected,
            search: setSearchClassifiers,
        },
        ref: classifiersRef,
    }
}

const PLACE_CLASSIFIER_KEYWORD = 'placeClassifier'
const CATEGORY_CLASSIFIER_KEYWORD = 'categoryClassifier'

export function useModalFilterClassifiers () {
    const client = useApolloClient()
    const ClassifierLoader = new ClassifiersQueryLocal(client)

    const ClassifierLoaderRef = useRef<ClassifiersQueryLocal>()
    const ruleRef = useRef({ place: [], category: [] })

    const router = useRouter()
    const { filters } = parseQuery(router.query)

    const onUserSelect = (id, type) => {
        ruleRef.current = { ...ruleRef.current, [type]: id }
        updateLevels({ [type]: id })
    }

    const {
        set: categorySet,
        SelectComponent: CategorySelect,
    } = useTicketClassifierSelect({
        onChange: (id) => onUserSelect(id, TicketClassifierTypes.category),
        keyword: CATEGORY_CLASSIFIER_KEYWORD,
    })

    const {
        set: placeSet,
        SelectComponent: PlaceSelect,
    } = useTicketClassifierSelect({
        onChange: (id) => onUserSelect(id, TicketClassifierTypes.place),
        keyword: PLACE_CLASSIFIER_KEYWORD,
    })

    const Setter = {
        place: placeSet,
        category: categorySet,
    }

    useEffect(() => {
        ClassifierLoaderRef.current = ClassifierLoader

        const initialPlaceClassifierIds = Array.isArray(filters[PLACE_CLASSIFIER_KEYWORD]) ?
            [...filters[PLACE_CLASSIFIER_KEYWORD]] : [filters[PLACE_CLASSIFIER_KEYWORD]]

        const initialCategoryClassifierIds = Array.isArray(filters[CATEGORY_CLASSIFIER_KEYWORD]) ?
            [...filters[CATEGORY_CLASSIFIER_KEYWORD]] : [filters[CATEGORY_CLASSIFIER_KEYWORD]]

        ClassifierLoaderRef.current.init().then(() => {
            if (initialPlaceClassifierIds.length > 0 || initialCategoryClassifierIds.length > 0) {
                ruleRef.current = {
                    place: initialPlaceClassifierIds,
                    category: initialCategoryClassifierIds,
                }
                updateLevels()
            } else {
                [TicketClassifierTypes.place, TicketClassifierTypes.category].forEach(type => {
                    ClassifierLoaderRef.current.search('', type).then(classifiers => {
                        Setter[type].all(classifiers)
                    })
                })

                ruleRef.current = {
                    place: [],
                    category: [],
                }
            }
        })

        return () => {
            ClassifierLoaderRef.current.clear()
        }
    }, [router.query])


    const loadLevels = async () => {
        const { place, category } = ruleRef.current

        const loadedRules = await Promise.all([
            { category, type: 'place' },
            { place, type: 'category' },
        ].map(selector => {
            const { type, ...querySelectors } = selector
            return new Promise<[string, Options[]]>(resolve => {
                const query = {}
                for (const key in querySelectors) {
                    if (querySelectors[key]) {
                        query[key] = { ids: querySelectors[key] }
                    }
                }

                ClassifierLoaderRef.current
                    .findRulesByIds(query, type, ruleRef.current[type])
                    .then(data => {
                        resolve([type, ClassifierLoaderRef.current.rulesToOptions(data, type)])
                    })
            })
        }))

        const result = Object.fromEntries(loadedRules)
        return result
    }

    const updateLevels = async (selected = {} ) => {
        ruleRef.current = { ...ruleRef.current, ...selected }
        const options = await loadLevels()

        Object.keys(Setter).forEach(type => {
            Setter[type].all(options[type])
            const isExisted = options[type].find(option => ruleRef.current[type] && ruleRef.current[type].includes(option.id))
            Setter[type].one(isExisted ? ruleRef.current[type] : null)
        })
    }

    return { CategorySelect, PlaceSelect }
}