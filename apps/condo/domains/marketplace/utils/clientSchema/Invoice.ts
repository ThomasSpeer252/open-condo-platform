/**
 * Generated by `createschema marketplace.Invoice 'number:Integer; property:Relationship:Property:PROTECT; unitType:Text; unitName:Text; accountNumber:Text; toPay:Decimal; items:Json; contact?:Relationship:Contact:SET_NULL; client?:Relationship:User:SET_NULL; clientName?:Text; clientPhone?:Text; clientEmail?:Text'`
 */

import {
    Invoice, InvoiceContext,
    InvoiceCreateInput,
    InvoiceUpdateInput,
    QueryAllInvoicesArgs,
} from '@app/condo/schema'
import { get, isNull, isUndefined, pickBy } from 'lodash'
import isEmpty from 'lodash/isEmpty'

import { generateReactHooks } from '@open-condo/codegen/generate.hooks'

import { INVOICE_PAYMENT_TYPES, INVOICE_STATUSES } from '@condo/domains/marketplace/constants'
import { Invoice as InvoiceGQL } from '@condo/domains/marketplace/gql'


const RELATIONS = ['property', 'contact', 'ticket', 'context']
const DISCONNECT_ON_NULL = ['property', 'contact', 'ticket']
const IGNORE_FORM_FIELDS = ['payerData', 'toPay']

export type InvoiceRowType = {
    count: number
    isMin: boolean
    name: string
    toPay: string
    sku?: string
}

export type InvoiceFormValuesType = {
    payerData?: boolean
    rows?: InvoiceRowType[]
    paymentType?: typeof INVOICE_PAYMENT_TYPES[number]
    status?: typeof INVOICE_STATUSES[number]
    clientName?: string
    clientPhone?: string
    contact?: string
    property?: string
    unitName?: string
    unitType?: string
}

export function convertToFormState (invoice: Invoice, intl): InvoiceFormValuesType | undefined {
    const FromMessage = intl.formatMessage({ id: 'global.from' }).toLowerCase()
    const ContractPriceMessage = intl.formatMessage({ id: 'pages.condo.marketplace.invoice.form.contractPrice' }).toLowerCase()

    const initialRows = get(invoice, 'rows') && invoice.rows
        .map(({ count, isMin, name, toPay, sku }) => {
            let toPayValue
            if (isMin) {
                if (toPay === '0') {
                    toPayValue = { isMin: true, toPay: ContractPriceMessage }
                } else {
                    toPayValue = { isMin: true, toPay: `${FromMessage} ${toPay.replace('.', ',')}` }
                }
            } else {
                toPayValue = { isMin: false, toPay: toPay.replace('.', ',') }
            }

            return { count, name, sku, ...toPayValue }
        })

    return {
        payerData: !!(get(invoice, 'contact.id') || get(invoice, 'property') || get(invoice, 'clientPhone')),
        paymentType: get(invoice, 'paymentType'),
        status: get(invoice, 'status'),
        contact: get(invoice, 'contact.id'),
        property: get(invoice, 'property.id'),
        unitName: get(invoice, 'unitName'),
        unitType: get(invoice, 'unitType'),
        clientName: get(invoice, 'clientName'),
        clientPhone: get(invoice, 'clientPhone'),
        rows: initialRows || [],
    }
}

type InvoiceMutationType = InvoiceUpdateInput | InvoiceCreateInput

export function formValuesProcessor (formValues: InvoiceFormValuesType, context: InvoiceContext, intl): InvoiceMutationType {
    const FromMessage = intl.formatMessage({ id: 'global.from' }).toLowerCase()
    const ContractPriceMessage = intl.formatMessage({ id: 'pages.condo.marketplace.invoice.form.contractPrice' }).toLowerCase()

    const result: InvoiceMutationType = {}

    for (const key of Object.keys(formValues)) {
        if (IGNORE_FORM_FIELDS.includes(key)) continue
        const isRelation = RELATIONS.includes(key)

        if (isRelation) {
            if (DISCONNECT_ON_NULL.includes(key) && formValues[key] === null) {
                result[key] = { disconnectAll: true }
            } else if (formValues[key]) {
                result[key] = { connect: { id: formValues[key] } }
            }
        } else if (!isUndefined(formValues[key])) {
            if (key === 'rows' && !isNull(formValues[key])) {
                const rows = formValues[key].map(({ name, toPay, count, sku }) => {
                    const baseFields = { name, count }
                    let toPayFields
                    if (toPay === ContractPriceMessage) {
                        toPayFields = { toPay: '0', isMin: true }
                    } else if (toPay.startsWith(FromMessage)) {
                        const toPayValue = toPay.split(' ')[1].replace(',', '.')
                        toPayFields = { toPay: toPayValue, isMin: true }
                    } else {
                        toPayFields = { toPay: toPay.replace(',', '.'), isMin: false }
                    }

                    const otherFields = pickBy({
                        sku,
                        currencyCode: context.currencyCode,
                        vatPercent: context.vatPercent,
                        salesTaxPercent: context.salesTaxPercent,
                    }, (value) => !isEmpty(value))

                    return { ...baseFields, ...toPayFields, ...otherFields }
                })

                const toPay = rows.every(row => !row.isMin) ?
                    rows.reduce((acc, row) => {
                        acc += +row.toPay * row.count
                        return acc
                    }, 0) : 0

                formValues['rows'] = rows
                result['toPay'] = String(toPay)
            }

            result[key] = formValues[key]
        }
    }

    return result
}

export function getMoneyRender (intl, currencyCode?: string) {
    const FromMessage = intl.formatMessage({ id: 'global.from' }).toLowerCase()

    return function render (text: string, isMin: boolean) {
        const formattedParts = intl.formatNumberToParts(parseFloat(text),  currencyCode ? { style: 'currency', currency: currencyCode } : {})
        const formattedValue = formattedParts.map((part) => {
            return part.value
        }).join('')

        return isMin ? `${FromMessage} ${formattedValue}` : formattedValue
    }
}

export function prepareTotalPriceFromInput (intl, count, rawPrice) {
    const FromMessage = intl.formatMessage({ id: 'global.from' }).toLowerCase()
    const ContractPriceMessage = intl.formatMessage({ id: 'pages.condo.marketplace.invoice.form.contractPrice' }).toLowerCase()

    if (!rawPrice) {
        return { total: 0 }
    }
    const price = rawPrice.replace(',', '.')
    if (!isNaN(+price)) {
        return { total: +price * count }
    }

    const splittedRawPrice = price.split(' ')
    if (splittedRawPrice.length === 2 && splittedRawPrice[0] === FromMessage && !isNaN(+splittedRawPrice[1])) {
        return { isMin: true, total: +splittedRawPrice[1] * count }
    }
    if (splittedRawPrice.length === 1 && splittedRawPrice[0] === ContractPriceMessage) {
        return { isMin: true, total: 0 }
    }

    return { error: true }
}

export function calculateRowsTotalPrice (intl, rows) {
    let hasMinPrice
    let hasError
    const totalPrice = rows.reduce((acc, row) => {
        const rawPrice = row.toPay
        const count = row.count
        const { error, isMin, total } = prepareTotalPriceFromInput(intl, count, rawPrice)
        if (!hasError && error) {
            hasError = true
        }
        if (!hasMinPrice && isMin) {
            hasMinPrice = true
        }

        return acc + total
    }, 0)

    return { hasMinPrice, hasError, totalPrice }
}

const {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useCount,
} = generateReactHooks<Invoice, InvoiceCreateInput, InvoiceUpdateInput, QueryAllInvoicesArgs>(InvoiceGQL)

export {
    useObject,
    useObjects,
    useCreate,
    useUpdate,
    useSoftDelete,
    useCount,
}
