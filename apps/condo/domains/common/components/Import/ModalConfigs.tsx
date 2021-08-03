import React, { createContext } from 'react'
import { Alert, Progress } from 'antd'
import get from 'lodash/get'
import { Columns, ProcessedRow } from '../../utils/importer'
import XLSX from 'xlsx'

export const ModalContext = createContext({ progress: 0, error: null, isImported: false })

export const getUploadSuccessModalConfig = (title: string, content: string, okText: string) => {
    return {
        title,
        closable: true,
        content: (
            <Alert
                style={{ marginTop: 16 }}
                message={content}
                type='success'
            />
        ),
        okText,
    }
}

export const getUploadErrorModalConfig = (title: string, defaultErrorText: string, okText: string) => {
    return {
        title,
        closable: true,
        content: (
            <ModalContext.Consumer>
                {
                    ({ error }) => {
                        const errorMessage = get(error, 'message') || defaultErrorText

                        return (
                            <Alert
                                style={{ marginTop: 16 }}
                                message={errorMessage}
                                type='error'
                            />
                        )
                    }
                }
            </ModalContext.Consumer>
        ),
        okText,
    }
}

export const getUploadProgressModalConfig = (
    title: string,
    processingMessage: string,
    okText: string,
    onButtonClick: () => void
) => {
    return {
        title: title,
        closable: false,
        content: (
            <ModalContext.Consumer>
                {
                    ({ progress }) => {
                        return (
                            <>
                                <Progress
                                    format={(percent) => Math.floor(percent) + '%'}
                                    percent={progress}
                                    status={'active'}
                                />
                                <Alert
                                    style={{ marginTop: 16 }}
                                    message={processingMessage}
                                    type='info'
                                />
                            </>
                        )
                    }
                }
            </ModalContext.Consumer>
        ),
        okText: okText,
        okButtonProps: {
            type: 'primary',
            danger: true,
        },
        onOk: onButtonClick,
    }
}

function fitToColumn (arrayOfArray) {
    return arrayOfArray[0].map((_, index) => (
        { wch: Math.max(...arrayOfArray.map(row => row[index] ? row[index].toString().length : 0)) }
    ))
}

export const getPartlyLoadedModalConfig = (
    title: string,
    content: string,
    okText: string,
    cancelText: string,
    errors: Array<ProcessedRow>,
    columns: Columns) => {
    return {
        title: title,
        closable: false,
        content: (
            <Alert
                style={{ marginTop: 16 }}
                message={content}
                type='warning'
            />
        ),
        okText: okText,
        onOk: () => {
            return new Promise<void>((resolve, reject) => {
                try {
                    const data = [columns.map(column => column.name)]
                    for (let i = 0; i < errors.length; i++) {
                        const line = errors[i].row.map(cell => cell.value ? String(cell.value) : null)
                        data.push(line)
                    }
                    const wb = XLSX.utils.book_new()
                    const ws = XLSX.utils.aoa_to_sheet(data)
                    ws['!cols'] = fitToColumn(data)
                    XLSX.utils.book_append_sheet(wb, ws, 'table')
                    XLSX.writeFile(wb, 'failed_data.xlsx')
                } catch (e) {
                    reject(e)
                } finally {
                    resolve()
                }
            })
        },
        cancelText: cancelText,
    }
}
