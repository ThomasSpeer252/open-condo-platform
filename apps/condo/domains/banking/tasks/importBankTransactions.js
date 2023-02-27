const { get } = require('lodash')

const conf = require('@open-condo/config')
const { getLogger } = require('@open-condo/keystone/logging')
const { getSchemaCtx } = require('@open-condo/keystone/schema')
const { createTask } = require('@open-condo/keystone/tasks')

const { BANK_INTEGRATION_IDS, _1C_CLIENT_BANK_EXCHANGE } = require('@condo/domains/banking/constants')
const {
    BankIntegration,
    BankAccount,
    BankIntegrationContext,
    BankTransaction,
    BankContractorAccount,
    BankSyncTask,
} = require('@condo/domains/banking/utils/serverSchema')
const { convertFrom1CExchangeToSchema } = require('@condo/domains/banking/utils/serverSchema/converters/convertFrom1CExchangeToSchema')
const { TASK_PROCESSING_STATUS, TASK_COMPLETED_STATUS } = require('@condo/domains/common/constants/tasks')
const { sleep } = require('@condo/domains/common/utils/sleep')

// Avoids producing "BankSyncTaskHistoryRecord" record for each iteration in the processing loop, when we update progress
// Practically, we need to
const TASK_PROGRESS_UPDATE_INTERVAL = 10 * 1000 // 10sec

// Rough solution to offload server in case of processing many thousands of records
const SLEEP_TIMEOUT = conf.WORKER_BATCH_OPERATIONS_SLEEP_TIMEOUT || 200

const DV_SENDER = { dv: 1, sender: { dv: 1, fingerprint: 'importBankTransactions' } }

const logger = getLogger('importBankTransactions')


const importBankTransactionsWorker = async (taskId, bankSyncTaskUtils) => {
    if (!taskId) throw new Error('taskId is undefined')
    const { keystone: context } = await getSchemaCtx('BankSyncTask')
    let task = await bankSyncTaskUtils.getOne(context, { id: taskId })
    if (!task) {
        throw new Error(`Cannot find BankSyncTask by id="${taskId}"`)
    }

    const { file, organization, property } = task

    let conversionResult
    try {
        const fileUpload = await Promise.resolve(file)
        const fileStream = fileUpload.createReadStream()
        conversionResult = await convertFrom1CExchangeToSchema(fileStream)
        fileStream.close()
    } catch (error) {
        throw new Error(`Cannot parse uploaded file in 1CClientBankExchange format. Error: ${error.message}`)
    }
    const { bankAccountData, bankTransactionsData } = conversionResult
    const integration = await BankIntegration.getOne(context, { id: BANK_INTEGRATION_IDS['1CClientBankExchange'] })
    let bankAccount = await BankAccount.getOne(context, {
        number: bankAccountData.number,
        organization: { id: organization.id },
    })
    let integrationContext
    if (!bankAccount) {
        if (!integration) {
            throw new Error('Cannot find BankIntegration with id "61e3d767-bd62-40e3-a503-f885b242d262" corresponding to import from file in "1CClientBankExchange" format')
        }
        integrationContext = await BankIntegrationContext.create(context, {
            ...DV_SENDER,
            integration: { connect: { id: integration.id } },
            organization: { connect: { id: organization.id } },
        })
        const data = {
            ...DV_SENDER,
            number: bankAccountData.number,
            routingNumber: bankAccountData.routingNumber,
            tin: organization.tin,
            country: organization.country,
            currencyCode: 'RUB',
            meta: bankAccountData.meta,
            organization: { connect: { id: organization.id } },
            integrationContext: { connect: { id: integrationContext.id } },
        }
        if (property) data.property = { connect: { id: property.id } }
        bankAccount = await BankAccount.create(context, data)
    } else {
        const bankAccountUpdatePayload = {
            meta: bankAccountData.meta,
        }
        if (bankAccount.integrationContext) {
            if (get(bankAccount, ['integrationContext', 'integration', 'id']) !== BANK_INTEGRATION_IDS['1CClientBankExchange']) {
                throw new Error('Another integration is used for this bank account, that fetches transactions in a different way. You cannot import transactions from file in this case')
            }
            integrationContext = bankAccount.integrationContext
        } else {
            integrationContext = await BankIntegrationContext.create(context, {
                ...DV_SENDER,
                integration: { connect: { id: integration.id } },
                organization: { connect: { id: organization.id } },
            })
            bankAccountUpdatePayload.integrationContext = {
                connect: { id: integrationContext.id },
            }
        }

        bankAccount = await BankAccount.update(context, bankAccount.id, {
            ...DV_SENDER,
            ...bankAccountUpdatePayload,
        })
    }

    const taskUpdatePayload = {
        totalCount: bankTransactionsData.length,
        processedCount: 0,
    }
    if (!task.account) {
        taskUpdatePayload.account = { connect: { id: bankAccount.id } }
    }
    if (!task.integrationContext) {
        taskUpdatePayload.integrationContext = { connect: { id: integrationContext.id } }
    }
    await bankSyncTaskUtils.update(context, taskId, taskUpdatePayload)


    let lastProgress = Date.now()
    const transactions = []
    let duplicatedTransactions = []
    
    for (let i = 0; i < bankTransactionsData.length; i++) {

        // User can cancel the task at any time, in this all operations should be stopped
        task = await bankSyncTaskUtils.getOne(context, { id: taskId })
        const taskStatus = get(task, 'status')
        if (!task || taskStatus !== TASK_PROCESSING_STATUS) {
            logger.info({ msg: 'status != processing. Aborting processing bank transactions loop', taskStatus, taskSchemaName: bankSyncTaskUtils.gql.SINGULAR_FORM, taskId })
            return
        }
        
        const transactionData = bankTransactionsData[i]
        const existingTransaction = await BankTransaction.getOne(context, {
            number: transactionData.number,
            date: transactionData.date.format('YYYY-MM-DD'),
            organization: {
                id: organization.id,
            },
        })
        if (existingTransaction) {
            duplicatedTransactions.push(transactionData.number)
            continue
        }
        const payload = {
            ...DV_SENDER,
            number: transactionData.number,
            date: transactionData.date.format('YYYY-MM-DD'),
            isOutcome: transactionData.isOutcome,
            purpose: transactionData.purpose,
            currencyCode: 'RUB',
            amount: transactionData.amount.toString(),
            importId: transactionData.number,
            importRemoteSystem: _1C_CLIENT_BANK_EXCHANGE,
            organization: { connect: { id: organization.id } },
            account: { connect: { id: bankAccount.id } },
            integrationContext: { connect: { id: integrationContext.id } },
            meta: transactionData.meta,
        }
        if (transactionData.contractorAccount) {
            let existingContractorAccount = await BankContractorAccount.getOne(context, {
                organization: { id: organization.id },
                number: transactionData.contractorAccount.number,
                tin: transactionData.contractorAccount.tin,
            })
            let contractorAccountId
            if (existingContractorAccount) {
                contractorAccountId = existingContractorAccount.id
            } else {
                const newContractorAccount = await BankContractorAccount.create(context, {
                    ...DV_SENDER,
                    ...transactionData.contractorAccount,
                    country: organization.country,
                    currencyCode: 'RUB',
                    organization: { connect: { id: organization.id } },
                })
                contractorAccountId = newContractorAccount.id
            }
            payload.contractorAccount = { connect: { id: contractorAccountId } }
        }

        const createdBankTransaction = await BankTransaction.create(context, payload)
        transactions.push(createdBankTransaction)

        if (Date.now() - lastProgress > TASK_PROGRESS_UPDATE_INTERVAL) {
            lastProgress = Date.now()
            task = await bankSyncTaskUtils.update(context, taskId, {
                ...DV_SENDER,
                processedCount: i,
            })
        }

        await sleep(SLEEP_TIMEOUT)
    }

    await bankSyncTaskUtils.update(context, taskId, {
        ...DV_SENDER,
        processedCount: transactions.length,
        status: TASK_COMPLETED_STATUS,
        meta: {
            duplicatedTransactions,
        },
    })

    return {
        account: bankAccount,
        integrationContext,
        transactions,
    }
}

module.exports = {
    importBankTransactionsTask: createTask('bankSyncTask', async (taskId) => {
        await importBankTransactionsWorker(taskId, BankSyncTask)
    }),
    importBankTransactionsWorker,
}
