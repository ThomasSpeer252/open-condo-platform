/**
 * Generated by `createservice billing.BillingReceiptsService --type queries`
 */

const { basename } = require('path')

const { faker } = require('@faker-js/faker')
const Big = require('big.js')

const { ResidentBillingReceipt, PUBLIC_FILE, PRIVATE_FILE } = require('@condo/domains/billing/utils/testSchema')
const {
    TestUtils,
    ResidentTestMixin,
    ContactTestMixin,
} = require('@condo/domains/billing/utils/testSchema/testUtils')


const HOUSING_CATEGORY = '928c97ef-5289-4daa-b80e-4b9fed50c629'
const OVERHAUL_CATEGORY = 'c0b9db6a-c351-4bf4-aa35-8e5a500d0195'

describe('AllResidentBillingReceiptsService', () => {
    let utils

    beforeAll(async () => {
        utils = new TestUtils([ResidentTestMixin, ContactTestMixin])
        await utils.init()
    })

    describe('Several organizations cases', () => {

        let anotherUtils

        beforeAll(async () => {
            anotherUtils = new TestUtils([ResidentTestMixin])
            await anotherUtils.init()
        })

        test('should correctly set serviceConsumer to output result for several organizations with equal account number', async () => {
            const accountNumber = faker.random.alphaNumeric(12)
            const [[{ id: housingReceiptId }]] = await utils.createReceipts([
                utils.createJSONReceipt({ accountNumber, category: { id: HOUSING_CATEGORY } }),
            ])
            const [[{ id: overhaulReceiptId }]] = await anotherUtils.createReceipts([
                utils.createJSONReceipt({ accountNumber, category: { id: OVERHAUL_CATEGORY } }),
            ])
            const resident = await utils.createResident()
            const [{ id: housingConsumerId }] = await utils.createServiceConsumer(resident, accountNumber)
            const [{ id: overhaulConsumerId }] = await anotherUtils.createServiceConsumer(resident, accountNumber)
            const receipts = await ResidentBillingReceipt.getAll(utils.clients.resident)
            expect(receipts.some(({ id, serviceConsumer }) => id === overhaulReceiptId && serviceConsumer.id === overhaulConsumerId )).toBeTruthy()
            expect(receipts.some(({ id, serviceConsumer }) => id === housingReceiptId && serviceConsumer.id === housingConsumerId)).toBeTruthy()
        })

        test('two different clients (husband and wife) can get the same receipt', async () => {
            const accountNumber = faker.random.alphaNumeric(12)
            const [[{ id: receiptId }]] = await utils.createReceipts([
                utils.createJSONReceipt({ accountNumber, category: { id: HOUSING_CATEGORY } }),
            ])
            const husband = await utils.createResident()
            const wife = await anotherUtils.createResident()
            await utils.createServiceConsumer(husband, accountNumber)
            await utils.createServiceConsumer(wife, accountNumber)
            const husbandReceipts = await ResidentBillingReceipt.getAll(utils.clients.resident)
            const husbandReceipt = husbandReceipts.find(({ id }) => id === receiptId)
            const wifeReceipts = await ResidentBillingReceipt.getAll(anotherUtils.clients.resident)
            const wifeReceipt = wifeReceipts.find(({ id }) => id === receiptId)
            expect(husbandReceipt).not.toBeNull()
            expect(wifeReceipt).not.toBeNull()
        })

        test('can not get receipts for another resident', async () => {
            const accountNumber = faker.random.alphaNumeric(12)
            await utils.createReceipts([
                utils.createJSONReceipt({ accountNumber }),
            ])
            const [[{ id: anotherReceiptId }]] = await anotherUtils.createReceipts([
                utils.createJSONReceipt({ accountNumber }),
            ])
            const resident = await utils.createResident()
            await utils.createServiceConsumer(resident, accountNumber)
            const anotherResident = await anotherUtils.createResident()
            await anotherUtils.createServiceConsumer(anotherResident, accountNumber)
            const receipts = await ResidentBillingReceipt.getAll(utils.clients.resident, {
                serviceConsumer: { resident: { id: anotherResident.id } },
            })
            expect(receipts.some(({ id }) => id === anotherReceiptId)).toBeFalsy()
        })

    })

    describe('Inspect fields for resident',  () => {

        test('returns all required fields', async () => {
            const accountNumber = faker.random.alphaNumeric(12)
            const services = [
                { id: faker.random.alphaNumeric(5), name: faker.random.alphaNumeric(12), toPay: String(utils.randomNumber(3)), toPayDetails: null },
                { id: faker.random.alphaNumeric(5), name: faker.random.alphaNumeric(12), toPay: String(utils.randomNumber(3)), toPayDetails: null },
            ]
            const [[{ id: newReceiptId }]] = await utils.createReceipts([
                utils.createJSONReceipt({ accountNumber, services }),
            ])
            const resident = await utils.createResident()
            await utils.createServiceConsumer(resident, accountNumber)
            const residentBillingReceipts = await ResidentBillingReceipt.getAll(utils.clients.resident)
            const receipt = residentBillingReceipts.find(({ id }) => id === newReceiptId)
            expect(receipt.services).toEqual(services)
            expect(receipt.raw).toBeUndefined()
            expect(receipt).toMatchObject({
                id: expect.any(String),
                toPay: expect.any(String),
                paid: expect.any(String),
                period: expect.any(String),
                recipient: {
                    name: expect.any(String),
                    tin: expect.any(String),
                    bic: expect.any(String),
                    bankAccount: expect.any(String),
                },
                serviceConsumer: {
                    id: expect.any(String),
                },
                services: expect.any(Array),
                currencyCode: expect.any(String),
                category: { id: expect.any(String), name: expect.any(String) },
                isPayable: expect.any(Boolean),
            })
        })

        test('resident can get the same receipt when he recreates the service consumer', async () => {
            const accountNumber = faker.random.alphaNumeric(12)
            const [[{ id: newReceiptId }]] = await utils.createReceipts([
                utils.createJSONReceipt({ accountNumber }),
            ])
            const resident = await utils.createResident()
            const [{ id: consumerId }] = await utils.createServiceConsumer(resident, accountNumber)
            const residentBillingReceipts = await ResidentBillingReceipt.getAll(utils.clients.resident)
            const receipt = residentBillingReceipts.find(({ id }) => id === newReceiptId)
            expect(receipt).toBeDefined()
            await utils.updateServiceConsumer(consumerId, { deletedAt: new Date().toISOString() })
            await utils.createServiceConsumer(resident, accountNumber)
            const residentBillingReceiptsAfterConsumerReCreation = await ResidentBillingReceipt.getAll(utils.clients.resident)
            const receiptAfterConsumerReCreation = residentBillingReceiptsAfterConsumerReCreation.find(({ id }) => id === newReceiptId)
            expect(receiptAfterConsumerReCreation).toBeDefined()
        })

        test('returns public version of file', async () => {
            const accountNumber = faker.random.alphaNumeric(12)
            const [[{ id: newReceiptId }]] = await utils.createReceipts([
                utils.createJSONReceipt({ accountNumber }),
            ])
            await utils.createBillingReceiptFile(newReceiptId)
            const resident = await utils.createResident()
            await utils.createServiceConsumer(resident, accountNumber)
            const residentBillingReceipts = await ResidentBillingReceipt.getAll(utils.clients.resident)
            const receipt = residentBillingReceipts.find(({ id }) => id === newReceiptId)
            expect(receipt.file.file.originalFilename).toContain(basename(PUBLIC_FILE))
        })

        test('returns empty file if there is no public version', async () => {
            const accountNumber = faker.random.alphaNumeric(12)
            const [[{ id: newReceiptId }]] = await utils.createReceipts([
                utils.createJSONReceipt({ accountNumber }),
            ])
            await utils.createBillingReceiptFile(newReceiptId, { publicDataFile: null })
            const resident = await utils.createResident()
            await utils.createServiceConsumer(resident, accountNumber)
            const residentBillingReceipts = await ResidentBillingReceipt.getAll(utils.clients.resident)
            const receipt = residentBillingReceipts.find(({ id }) => id === newReceiptId)
            expect(receipt.file).toBeNull()
        })

        test('returns sensitive file if resident is verified', async () => {
            const accountNumber = faker.random.alphaNumeric(12)
            const addressUnit = {
                unitName: faker.random.alphaNumeric(12),
                unitType: 'flat',
            }
            const [[{ id: newReceiptId }]] = await utils.createReceipts([
                utils.createJSONReceipt({
                    accountNumber,
                    address: utils.property.address,
                    addressMeta: addressUnit,
                }),
            ])
            await utils.createBillingReceiptFile(newReceiptId)
            const resident = await utils.createResident(addressUnit)
            await utils.createContact({
                phone: utils.clients.resident.userAttrs.phone,
                ...addressUnit,
                isVerified: true,
            })
            await utils.createServiceConsumer(resident, accountNumber)
            const residentBillingReceipts = await ResidentBillingReceipt.getAll(utils.clients.resident)
            const receipt = residentBillingReceipts.find(({ id }) => id === newReceiptId)
            expect(receipt.file.file.originalFilename).toContain(basename(PRIVATE_FILE))
        })

        test('returns public file for deleted verified contact', async () => {
            const accountNumber = faker.random.alphaNumeric(12)
            const addressUnit = {
                unitName: faker.random.alphaNumeric(12),
                unitType: 'flat',
            }
            const [[{ id: newReceiptId }]] = await utils.createReceipts([
                utils.createJSONReceipt({
                    accountNumber,
                    address: utils.property.address,
                    addressMeta: addressUnit,
                }),
            ])
            await utils.createBillingReceiptFile(newReceiptId)
            const resident = await utils.createResident(addressUnit)
            const [{ id: contactId }] = await utils.createContact({
                phone: utils.clients.resident.userAttrs.phone,
                ...addressUnit,
                isVerified: true,
            })
            await utils.updateContact(contactId, { deletedAt: new Date().toISOString() })
            await utils.createServiceConsumer(resident, accountNumber)
            const residentBillingReceipts = await ResidentBillingReceipt.getAll(utils.clients.resident)
            const receipt = residentBillingReceipts.find(({ id }) => id === newReceiptId)
            expect(receipt.file.file.originalFilename).toContain(basename(PUBLIC_FILE))
        })
    })

    describe('Filter receipts', () => {
        test('can filter by serviceConsumer', async () => {
            const accountNumberForConsumer1 = faker.random.alphaNumeric(12)
            const accountNumberForConsumer2 = faker.random.alphaNumeric(12)
            await utils.createReceipts([
                utils.createJSONReceipt({ accountNumber: accountNumberForConsumer1 }),
                utils.createJSONReceipt({ accountNumber: accountNumberForConsumer2 }),
            ])
            const resident1 = await utils.createResident()
            const [consumer1] = await utils.createServiceConsumer(resident1, accountNumberForConsumer1)
            const resident2 = await utils.createResident()
            const [consumer2] = await utils.createServiceConsumer(resident2, accountNumberForConsumer2)
            const receipts = await ResidentBillingReceipt.getAll(utils.clients.resident, {
                serviceConsumer: { resident: { id: resident1.id } },
            })
            const receiptForConsumer1 = receipts.find(({ serviceConsumer: { id } }) => id === consumer1.id)
            const receiptForConsumer2 = receipts.find(({ serviceConsumer: { id } }) => id === consumer2.id)
            expect(receiptForConsumer1).toBeDefined()
            expect(receiptForConsumer2).not.toBeDefined()
        })
        test('can filter by period', async () => {
            const accountNumber = faker.random.alphaNumeric(12)
            const [[{ id: janReceiptId }, { id: febReceiptId }]] = await utils.createReceipts([
                utils.createJSONReceipt({ accountNumber, month: 1, year: 2024 }),
                utils.createJSONReceipt({ accountNumber, month: 2, year: 2024 }),
            ])
            const resident = await utils.createResident()
            await utils.createServiceConsumer(resident, accountNumber)
            const receipts = await ResidentBillingReceipt.getAll(utils.clients.resident, {
                period: '2024-01-01',
            })
            const janReceipt = receipts.find(({ id, period }) => period === '2024-01-01' && janReceiptId === id)
            const febReceipt = receipts.find(({ id, period }) => period === '2024-02-01' && febReceiptId === id)
            expect(janReceipt).toBeDefined()
            expect(febReceipt).not.toBeDefined()
        })
    })

    describe('Sort receipts', () => {
        test('Can be sorted by period DESC and ASC', async () => {
            const current = utils.createPeriod()
            const monthAgo = utils.createPeriod(-1)
            const twoMonthsAgo = utils.createPeriod(-2)
            const accountNumber = faker.random.alphaNumeric(12)
            const baseReceipt = utils.createJSONReceipt({ accountNumber, month: current.month, year: current.year, importId: null })
            const [receipts] = await utils.createReceipts([
                baseReceipt,
                { ...baseReceipt, month: monthAgo.month, year: monthAgo.year },
                { ...baseReceipt, month: twoMonthsAgo.month, year: twoMonthsAgo.year },
            ])
            const receiptsIds = receipts.map(({ id }) => id)
            const resident = await utils.createResident()
            await utils.createServiceConsumer(resident, accountNumber)
            const residentBillingReceiptsDESC = (await ResidentBillingReceipt.getAll(utils.clients.resident, { }, { sortBy: 'period_DESC' }))
                .filter(({ id }) => receiptsIds.includes(id))
            expect(residentBillingReceiptsDESC[0].id).toEqual(receiptsIds[0])
            expect(residentBillingReceiptsDESC[1].id).toEqual(receiptsIds[1])
            expect(residentBillingReceiptsDESC[2].id).toEqual(receiptsIds[2])
            const residentBillingReceiptsASC = (await ResidentBillingReceipt.getAll(utils.clients.resident, { }, { sortBy: 'period_ASC' }))
                .filter(({ id }) => receiptsIds.includes(id))
            expect(residentBillingReceiptsASC[0].id).toEqual(receiptsIds[2])
            expect(residentBillingReceiptsASC[1].id).toEqual(receiptsIds[1])
            expect(residentBillingReceiptsASC[2].id).toEqual(receiptsIds[0])
        })
    })

    describe('Paid logics', () => {

        test('after partial payment allows to pay the rest amount', async () => {
            const accountNumber = faker.random.alphaNumeric(12)
            const total = '5000.00'
            const partialPay = '2600.00'
            const jsonReceipt = utils.createJSONReceipt({ accountNumber, toPay: total })
            const [[{ id: receiptId }]] = await utils.createReceipts([jsonReceipt])
            const resident = await utils.createResident()
            const [{ id: serviceConsumerId }] = await utils.createServiceConsumer(resident, accountNumber)
            const receiptsBeforePayment = await ResidentBillingReceipt.getAll(utils.clients.resident, {
                serviceConsumer: { resident: { id: resident.id } },
            })
            const receiptBeforePayment = receiptsBeforePayment.find(({ id }) => id === receiptId )
            expect(Big(receiptBeforePayment.toPay).toFixed(2)).toEqual(Big(total).toFixed(2))
            expect(receiptBeforePayment.isPayable).toBeTruthy()
            await utils.payForReceipt(receiptId, serviceConsumerId, partialPay)
            const receiptsAfterPayment = await ResidentBillingReceipt.getAll(utils.clients.resident, {
                serviceConsumer: { resident: { id: resident.id } },
            })
            const receiptAfterPayment = receiptsAfterPayment.find(({ id }) => id === receiptId )
            expect(Big(receiptAfterPayment.paid).toFixed(2)).toEqual(Big(partialPay).toFixed(2))
            expect(receiptAfterPayment.isPayable).toBeTruthy()
        })

        test('paid field is not calculated when payment was made before receipt creation', async () => {
            const accountNumber = faker.random.alphaNumeric(12)
            const total = '5000.00'
            const partialPay = '2600.00'
            const jsonReceipt = utils.createJSONReceipt({ accountNumber, toPay: total })
            const resident = await utils.createResident()
            await utils.createServiceConsumer(resident, accountNumber)
            await utils.partialPayForVirtualReceipt(jsonReceipt, partialPay)
            const [[{ id: receiptId }]] = await utils.createReceipts([jsonReceipt])
            const receiptsAfterPayment = await ResidentBillingReceipt.getAll(utils.clients.resident, {
                serviceConsumer: { resident: { id: resident.id } },
            })
            const receiptAfterPayment = receiptsAfterPayment.find(({ id }) => id === receiptId )
            expect(Big(receiptAfterPayment.paid).toFixed(2)).toEqual(Big(0).toFixed(2))
        })

        test('paid field calculated when several payments was made', async () => {
            const accountNumber = faker.random.alphaNumeric(12)
            const total = '5000.00'
            const paidAmounts = ['2000.00', '1000.00']
            const jsonReceipt = utils.createJSONReceipt({ accountNumber, toPay: total })
            const [[{ id: receiptId }]] = await utils.createReceipts([jsonReceipt])
            const resident = await utils.createResident()
            const [{ id: serviceConsumerId }] = await utils.createServiceConsumer(resident, accountNumber)
            for (const amount of paidAmounts) {
                await utils.payForReceipt(receiptId, serviceConsumerId, amount)
            }
            const receiptsAfterPayment = await ResidentBillingReceipt.getAll(utils.clients.resident, {
                serviceConsumer: { resident: { id: resident.id } },
            })
            const receiptAfterPayment = receiptsAfterPayment.find(({ id }) => id === receiptId )
            expect(Big(receiptAfterPayment.paid).toFixed(2)).toEqual(paidAmounts.reduce((sum, amount) => Big(sum).add(Big(amount)).toFixed(2), '0.00'))
            expect(receiptAfterPayment.isPayable).toBeTruthy()
        })

        test('paid field calculated when organization bank info changed', async () => {
            const accountNumber = faker.random.alphaNumeric(12)
            const total = '5000.00'
            const jsonReceipt = utils.createJSONReceipt({ accountNumber, toPay: total })
            const [[{ id: receiptId }]] = await utils.createReceipts([jsonReceipt])
            const resident = await utils.createResident()
            const [serviceConsumer] = await utils.createServiceConsumer(resident, accountNumber)
            const receiptsBeforePayment = await ResidentBillingReceipt.getAll(utils.clients.resident, {
                serviceConsumer: { resident: { id: resident.id } },
            })
            const receiptBeforePayment = receiptsBeforePayment.find(({ id }) => id === receiptId )
            expect(Big(receiptBeforePayment.toPay).toFixed(2)).toEqual(Big(total).toFixed(2))
            expect(receiptBeforePayment.isPayable).toBeTruthy()

            await utils.payForReceipt(receiptId, serviceConsumer.id)
            const receiptsAfterPayment = await ResidentBillingReceipt.getAll(utils.clients.resident, {
                serviceConsumer: { resident: { id: resident.id } },
            })
            const receiptAfterPayment = receiptsAfterPayment.find(({ id }) => id === receiptId )
            expect(Big(receiptAfterPayment.paid).toFixed(2)).toEqual(Big(total).toFixed(2))
            expect(receiptAfterPayment.isPayable).toBeTruthy()

            const jsonReceiptNewBankInfo = utils.createJSONReceipt({
                importId: jsonReceipt.importId,
                month: jsonReceipt.month,
                year: jsonReceipt.year,
                toPay: total,
                address: jsonReceipt.address,
                services: jsonReceipt.services,
                tin: jsonReceipt.tin,
                accountNumber,
            })
            const [[{ id: receiptNewBankInfoId }]] = await utils.createReceipts([jsonReceiptNewBankInfo])
            const receiptsAfterBankInfoChange = await ResidentBillingReceipt.getAll(utils.clients.resident, {
                serviceConsumer: { resident: { id: resident.id } },
            })
            const receiptAfterBankInfoChange = receiptsAfterBankInfoChange.find(({ id }) => id === receiptNewBankInfoId )
            expect(Big(receiptAfterBankInfoChange.paid).toFixed(2)).toEqual(Big(total).toFixed(2))
            expect(receiptAfterBankInfoChange.isPayable).toBeTruthy()
        })
    })

})