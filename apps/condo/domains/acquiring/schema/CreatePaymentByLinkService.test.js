/**
 * Generated by `createservice acquiring.CreatePaymentByLinkService`
 */

const { faker } = require('@faker-js/faker')
const Big = require('big.js')
const dayjs = require('dayjs')

const {
    makeLoggedInAdminClient, makeClient, expectToThrowAuthenticationErrorToResult, catchErrorFrom,
    expectToThrowAccessDeniedErrorToResult,
} = require('@open-condo/keystone/test.utils')

const { CONTEXT_FINISHED_STATUS } = require('@condo/domains/acquiring/constants/context')
const { PAYMENT_DONE_STATUS } = require('@condo/domains/acquiring/constants/payment')
const {
    Payment,
    createPaymentByLinkByTestClient,
    addAcquiringIntegrationAndContext, MultiPayment,
    registerMultiPaymentForVirtualReceiptByTestClient,
    updateTestPayment,
    generateVirtualReceipt,
} = require('@condo/domains/acquiring/utils/testSchema')
const { createTestBankAccount } = require('@condo/domains/banking/utils/testSchema')
const {
    createValidRuTin10,
    createValidRuRoutingNumber, createValidRuNumber,
} = require('@condo/domains/banking/utils/testSchema/bankAccount')
const {
    createTestBillingProperty,
    createTestBillingRecipient,
    createTestBillingReceipt, createTestBillingAccount,
    addBillingIntegrationAndContext, createTestRecipient,
} = require('@condo/domains/billing/utils/testSchema')
const { createTestOrganization } = require('@condo/domains/organization/utils/testSchema')
const { createTestProperty } = require('@condo/domains/property/utils/testSchema')
const {
    makeClientWithSupportUser,
    makeClientWithResidentUser,
    makeClientWithStaffUser,
    makeClientWithServiceUser,
} = require('@condo/domains/user/utils/testSchema')

function generateQRCode (qrCodeData = {}, { version = '0001', encodingTag = '2' } = {}) {
    const bic = createValidRuRoutingNumber()

    const qrCodeObj = {
        PersonalAcc: createValidRuNumber(bic),
        PayeeINN: createValidRuTin10(),
        Sum: faker.random.numeric(6),
        LastName: faker.random.alpha(10),
        PaymPeriod: '07.2023',
        BIC: bic,
        PersAcc: faker.random.numeric(8),
        PayerAddress: 'г Москва, ул Тверская, д 14, кв 2',
        ...qrCodeData,
    }

    return [`ST${version}${encodingTag}|${Object.keys(qrCodeObj).map((k) => `${k}=${qrCodeObj[k]}`).join('|')}`, qrCodeObj]
}

async function createOrganizationAndPropertyAndQrCode (client, houseNumber, flatNumber, PaymPeriod) {
    const [organization] = await createTestOrganization(client)

    const [property] = await createTestProperty(client, { id: organization.id }, {},
        true, {
            city: 'Москва',
            city_with_type: 'г Москва',
            street: 'Тверская',
            street_with_type: 'ул Тверская',
            house: `${houseNumber}`,
            block: '',
            block_type: '',
            region_with_type: '',
            flat: `${flatNumber}`,
            flat_type: 'кв',
        })

    const [qrCode, qrCodeAttrs] = generateQRCode({
        PayerAddress: `г Москва, ул Тверская, д ${houseNumber}, кв ${flatNumber}`,
        PayeeINN: organization.tin,
        PaymPeriod,
    })

    return { organization, property, qrCode, qrCodeAttrs }
}

async function createBillingReceiptAndAllDependencies (admin, organization, qrCodeAttrs, month) {
    const { billingIntegrationContext } = await addBillingIntegrationAndContext(admin, organization, {}, { status: CONTEXT_FINISHED_STATUS })
    const {
        acquiringIntegrationContext,
    } = await addAcquiringIntegrationAndContext(admin, organization, {}, { status: CONTEXT_FINISHED_STATUS })

    const [bankAccount] = await createTestBankAccount(admin, organization, {
        number: qrCodeAttrs.PersonalAcc,
        routingNumber: qrCodeAttrs.BIC,
    })
    const [billingProperty] = await createTestBillingProperty(admin, billingIntegrationContext)
    const [billingAccount] = await createTestBillingAccount(admin, billingIntegrationContext, billingProperty, { number: qrCodeAttrs.PersAcc })
    const [billingRecipient] = await createTestBillingRecipient(admin, billingIntegrationContext, {
        bankAccount: qrCodeAttrs.PersonalAcc,
        bic: qrCodeAttrs.BIC,
    })
    const [billingReceipt] = await createTestBillingReceipt(admin, billingIntegrationContext, billingProperty, billingAccount, {
        period: `2024-${month}-01`,
        receiver: { connect: { id: billingRecipient.id } },
        recipient: createTestRecipient({
            bic: billingRecipient.bic,
        }),
        toPay: Big(qrCodeAttrs.Sum).div(100),
    })

    return { billingReceipt, billingAccount, bankAccount, acquiringIntegrationContext }
}

describe('CreatePaymentByLinkService', () => {
    let qrCode, qrCodeObj
    let admin, support, user, anonymous, staff, service

    beforeAll(async () => {
        const generateIpLike = () => Array(4).fill(null).map(() => faker.random.numeric(3)).join('.')
        admin = await makeLoggedInAdminClient()
        support = await makeClientWithSupportUser()
        user = await makeClientWithResidentUser()
        anonymous = await makeClient()
        staff = await makeClientWithStaffUser()
        service = await makeClientWithServiceUser()

        // to prevent blocking localhost while testing locally
        admin.setHeaders({ 'x-forwarded-for': generateIpLike() })
        support.setHeaders({ 'x-forwarded-for': generateIpLike() })
        user.setHeaders({ 'x-forwarded-for': generateIpLike() })
        anonymous.setHeaders({ 'x-forwarded-for': generateIpLike() })
        staff.setHeaders({ 'x-forwarded-for': generateIpLike() })
        service.setHeaders({ 'x-forwarded-for': generateIpLike() })

        qrCodeObj = {
            PersonalAcc: '40702810801500116391',
            PayeeINN: faker.random.numeric(8),
            Sum: faker.random.numeric(6),
            LastName: faker.random.alpha(10),
            PaymPeriod: '07.2023',
            BIC: '044525999',
            PersAcc: faker.random.numeric(8),
            PayerAddress: 'г Москва, ул Тверская, д 14, кв 2',
        }

        const [newQrCode] = generateQRCode(qrCodeObj)
        qrCode = newQrCode
    })

    test('user: create multiPayment when scanned receipt is the last receipt in out database', async () => {
        const {
            organization,
            qrCode,
            qrCodeAttrs,
        } = await createOrganizationAndPropertyAndQrCode(admin, 16, 6, '07.2023')

        const { billingIntegrationContext } = await addBillingIntegrationAndContext(admin, organization, {}, { status: CONTEXT_FINISHED_STATUS })
        const { acquiringIntegration } = await addAcquiringIntegrationAndContext(admin, organization, {}, { status: CONTEXT_FINISHED_STATUS })

        await createTestBankAccount(admin, organization, {
            number: qrCodeAttrs.PersonalAcc,
            routingNumber: qrCodeAttrs.BIC,
        })
        const [billingProperty] = await createTestBillingProperty(admin, billingIntegrationContext)
        const [billingAccount] = await createTestBillingAccount(admin, billingIntegrationContext, billingProperty, { number: qrCodeAttrs.PersAcc })
        const [billingRecipient] = await createTestBillingRecipient(admin, billingIntegrationContext, {
            bankAccount: qrCodeAttrs.PersonalAcc,
            bic: qrCodeAttrs.BIC,
        })
        const [billingReceipt] = await createTestBillingReceipt(admin, billingIntegrationContext, billingProperty, billingAccount, {
            period: '2023-07-01',
            receiver: { connect: { id: billingRecipient.id } },
            recipient: createTestRecipient({
                bic: billingRecipient.bic,
            }),
            toPay: Big(qrCodeAttrs.Sum).div(100),
        })

        const [data] = await createPaymentByLinkByTestClient(admin, { qrCode })

        expect(data.multiPaymentId).toBeDefined()
        expect(data.unitName).toBeDefined()
        expect(data.accountNumber).toEqual(qrCodeAttrs.PersAcc)
        expect(data.address).toBeDefined()
        expect(data.acquiringIntegrationHostUrl).toBe(acquiringIntegration.hostUrl)
        expect(data.currencyCode).toBe(billingIntegrationContext.integration.currencyCode)

        const multiPayment = await MultiPayment.getOne(admin, { id: data.multiPaymentId })
        expect(multiPayment).toBeDefined()
        expect(data.totalAmount).toEqual(multiPayment.amount)
        expect(data.amount).toEqual(multiPayment.amountWithoutExplicitFee)

        const payments = await Payment.getAll(admin, {
            multiPayment: { id: multiPayment.id },
        })

        expect(payments).toHaveLength(1)
        expect(payments[0].receipt).toBeDefined()
        expect(payments[0].accountNumber).toBe(billingReceipt.account.number)
        expect(payments[0].recipientBic).toBe(billingReceipt.receiver.bic)
        expect(payments[0].amount).toBe(Big(qrCodeAttrs.Sum).div(100).toFixed(8))
    })

    test('user: create multiPayment when scanned receipt is older than the last receipt in our database', async () => {
        const {
            organization,
            qrCode,
            qrCodeAttrs,
        } = await createOrganizationAndPropertyAndQrCode(admin, 15, 3, '06.2023')

        const { billingIntegrationContext } = await addBillingIntegrationAndContext(admin, organization, {}, { status: CONTEXT_FINISHED_STATUS })
        const { acquiringIntegrationContext } = await addAcquiringIntegrationAndContext(admin, organization, {}, { status: CONTEXT_FINISHED_STATUS })

        const [bankAccount] = await createTestBankAccount(admin, organization, {
            number: qrCodeAttrs.PersonalAcc,
            routingNumber: qrCodeAttrs.BIC,
        })
        const [billingProperty] = await createTestBillingProperty(admin, billingIntegrationContext)
        const [billingAccount] = await createTestBillingAccount(admin, billingIntegrationContext, billingProperty, { number: qrCodeAttrs.PersAcc })
        const [billingRecipient] = await createTestBillingRecipient(admin, billingIntegrationContext, {
            bankAccount: qrCodeAttrs.PersonalAcc,
            bic: qrCodeAttrs.BIC,
        })
        await createTestBillingReceipt(admin, billingIntegrationContext, billingProperty, billingAccount, {
            period: '2023-07-01',
            receiver: { connect: { id: billingRecipient.id } },
            recipient: createTestRecipient({
                bic: billingRecipient.bic,
            }),
        })

        const [data] = await createPaymentByLinkByTestClient(user, { qrCode }) // NOSONAR code duplications is normal for tests

        expect(data.multiPaymentId).toBeDefined()
        expect(data.address).toBeDefined()
        expect(data.accountNumber).toEqual(qrCodeAttrs.PersAcc)
        expect(data.unitName).toBeDefined()
        expect(data.acquiringIntegrationHostUrl).toBe(acquiringIntegrationContext.integration.hostUrl)
        expect(data.currencyCode).toBe(billingIntegrationContext.integration.currencyCode)

        const multiPayment = await MultiPayment.getOne(admin, { id: data.multiPaymentId })
        expect(multiPayment).toBeDefined()

        const payments = await Payment.getAll(admin, {
            multiPayment: { id: multiPayment.id },
        })

        expect(payments).toHaveLength(1)
        expect(payments[0].accountNumber).toBe(qrCodeAttrs.PersAcc)
        expect(payments[0].recipientBic).toBe(bankAccount.routingNumber)
        expect(payments[0].receipt).toBeDefined()
    })

    test('user: create virtual multiPayment when scanned receipt is newer than the last receipt in our database', async () => {
        const {
            organization,
            qrCode,
            qrCodeAttrs,
        } = await createOrganizationAndPropertyAndQrCode(admin, 15, 3, '07.2023')

        await createTestBankAccount(admin, organization, {
            number: qrCodeAttrs.PersonalAcc,
            routingNumber: qrCodeAttrs.BIC,
        })

        const { billingIntegrationContext } = await addBillingIntegrationAndContext(admin, organization, {}, { status: CONTEXT_FINISHED_STATUS })
        const { acquiringIntegration } = await addAcquiringIntegrationAndContext(admin, organization, {}, { status: CONTEXT_FINISHED_STATUS })

        const [billingProperty] = await createTestBillingProperty(admin, billingIntegrationContext)
        const [billingAccount] = await createTestBillingAccount(admin, billingIntegrationContext, billingProperty, { number: qrCodeAttrs.PersAcc })
        const [billingRecipient] = await createTestBillingRecipient(admin, billingIntegrationContext, {
            bankAccount: qrCodeAttrs.PersonalAcc,
            bic: qrCodeAttrs.BIC,
        })
        await createTestBillingReceipt(admin, billingIntegrationContext, billingProperty, billingAccount, {
            period: '2023-06-01',
            receiver: { connect: { id: billingRecipient.id } },
        })

        const [data] = await createPaymentByLinkByTestClient(user, { qrCode }) // NOSONAR code duplications is normal for tests

        expect(data.address).toBeDefined()
        expect(data.multiPaymentId).toBeDefined()
        expect(data.unitName).toBeDefined()
        expect(data.accountNumber).toEqual(qrCodeAttrs.PersAcc)
        expect(data.acquiringIntegrationHostUrl).toBe(acquiringIntegration.hostUrl)
        expect(data.currencyCode).toBe(billingIntegrationContext.integration.currencyCode)

        const multiPayment = await MultiPayment.getOne(admin, { id: data.multiPaymentId })
        expect(multiPayment).toBeDefined()

        const payments = await Payment.getAll(admin, {
            multiPayment: { id: multiPayment.id },
        })

        expect(payments[0].accountNumber).toBe(qrCodeAttrs.PersAcc)
        expect(payments[0].recipientBic).toBe(qrCodeAttrs.BIC)
        expect(payments[0].currencyCode).toBe(billingIntegrationContext.integration.currencyCode)
        expect(payments[0].receipt).toBeNull()
    })

    test('user: create virtual multiPayment if no receipts found', async () => {
        const {
            organization,
            qrCode,
            qrCodeAttrs,
        } = await createOrganizationAndPropertyAndQrCode(admin, 14, 4, '07.2023')

        const { billingIntegrationContext } = await addBillingIntegrationAndContext(admin, organization, {}, { status: CONTEXT_FINISHED_STATUS })
        const { acquiringIntegration } = await addAcquiringIntegrationAndContext(admin, organization, {}, { status: CONTEXT_FINISHED_STATUS })

        const [billingProperty] = await createTestBillingProperty(admin, billingIntegrationContext)
        await createTestBillingAccount(admin, billingIntegrationContext, billingProperty, { number: qrCodeAttrs.PersAcc })
        await createTestBillingRecipient(admin, billingIntegrationContext, { bankAccount: qrCodeAttrs.PersonalAcc })
        await createTestBillingRecipient(admin, billingIntegrationContext)
        const [bankAccount] = await createTestBankAccount(admin, organization, {
            number: qrCodeAttrs.PersonalAcc,
            routingNumber: qrCodeAttrs.BIC,
        })

        const [data] = await createPaymentByLinkByTestClient(user, { qrCode }) // NOSONAR code duplications is normal for tests

        expect(data.address).toBeDefined()
        expect(data.accountNumber).toEqual(qrCodeAttrs.PersAcc)
        expect(data.multiPaymentId).toBeDefined()
        expect(data.unitName).toBeDefined()
        expect(data.acquiringIntegrationHostUrl).toBe(acquiringIntegration.hostUrl)
        expect(data.currencyCode).toBe(billingIntegrationContext.integration.currencyCode)

        const multiPayment = await MultiPayment.getOne(admin, { id: data.multiPaymentId })
        expect(multiPayment).toBeDefined()

        const payments = await Payment.getAll(admin, {
            multiPayment: { id: multiPayment.id },
        })

        expect(payments[0].accountNumber).toBe(qrCodeAttrs.PersAcc)
        expect(payments[0].recipientBic).toBe(bankAccount.routingNumber)
        expect(payments[0].receipt).toBeNull()
    })

    test('should throw if no Bank Account or Billing Recipient found', async () => {
        const [organization] = await createTestOrganization(admin)
        const [property] = await createTestProperty(admin, organization)
        const [qrCode] = generateQRCode({ PayeeINN: organization.tin, PayerAddress: `${property.address}, кв. 1` })

        await addBillingIntegrationAndContext(admin, organization, {}, { status: CONTEXT_FINISHED_STATUS })
        await addAcquiringIntegrationAndContext(admin, organization, {}, { status: CONTEXT_FINISHED_STATUS })

        const payload = { qrCode }

        await catchErrorFrom(async () => {
            await createPaymentByLinkByTestClient(user, payload)
        }, ({ errors }) => {

            expect(errors).toMatchObject([{
                message: 'Provided bank account is not in the system',
                path: ['result'],
                extensions: {
                    mutation: 'createPaymentByLink',
                    code: 'BAD_USER_INPUT',
                    type: 'WRONG_FORMAT',
                    message: 'Provided bank account is not in the system',
                },
            }])
        })

    })

    test('anonymous: can\'t execute', async () => {
        await expectToThrowAuthenticationErrorToResult(async () => {
            await createPaymentByLinkByTestClient(anonymous, { qrCode })
        })
    })

    test('support: can\'t execute', async () => {
        await expectToThrowAccessDeniedErrorToResult(async () => {
            await createPaymentByLinkByTestClient(support, { qrCode })
        })
    })

    test('staff: can\'t execute', async () => {
        await expectToThrowAccessDeniedErrorToResult(async () => {
            await createPaymentByLinkByTestClient(staff, { qrCode })
        })
    })

    test('service: can\'t execute', async () => {
        await expectToThrowAccessDeniedErrorToResult(async () => {
            await createPaymentByLinkByTestClient(service, { qrCode })
        })
    })

    describe('Filter out duplicates', () => {
        test('scanned receipt period equals the last billing receipt in out database', async () => {
            const {
                organization,
                qrCode,
                qrCodeAttrs,
            } = await createOrganizationAndPropertyAndQrCode(admin, 16, 6, '07.2024')

            // create the receipt
            const {
                billingAccount: { number: accountNumber },
                bankAccount,
                acquiringIntegrationContext,
            } = await createBillingReceiptAndAllDependencies(admin, organization, qrCodeAttrs, '07')

            // register multi payment
            const receipt = generateVirtualReceipt({
                period: '2024-07-01',
                bankAccount,
                accountNumber,
            })
            const [result] = await registerMultiPaymentForVirtualReceiptByTestClient(admin, receipt, {
                id: acquiringIntegrationContext.id,
            })
            expect(result).toBeDefined()
            expect(result).toHaveProperty('dv', 1)
            expect(result).toHaveProperty('multiPaymentId')

            // get payments
            const payments = await Payment.getAll(admin, {
                multiPayment: {
                    id: result.multiPaymentId,
                },
            })
            expect(payments).toBeDefined()
            expect(payments).toHaveLength(1)

            // mark payment as payed
            await updateTestPayment(admin, payments[0].id, {
                status: PAYMENT_DONE_STATUS,
                advancedAt: dayjs().toISOString(),
            })

            await catchErrorFrom(async () => {
                await createPaymentByLinkByTestClient(admin, { qrCode })
            }, (error) => {
                expect(error.message).toContain('Provided receipt already paid')
            })
        })
        test('scanned receipt period less the last billing receipt in out database', async () => {
            const {
                organization,
                qrCode,
                qrCodeAttrs,
            } = await createOrganizationAndPropertyAndQrCode(admin, 16, 6, '06.2024')

            // create the receipt
            const {
                billingAccount: { number: accountNumber },
                bankAccount,
                acquiringIntegrationContext,
            } = await createBillingReceiptAndAllDependencies(admin, organization, qrCodeAttrs, '07')

            // register multi payment
            const receipt = generateVirtualReceipt({
                period: '2024-07-01',
                bankAccount,
                accountNumber,
            })
            const [result] = await registerMultiPaymentForVirtualReceiptByTestClient(admin, receipt, {
                id: acquiringIntegrationContext.id,
            })
            expect(result).toBeDefined()
            expect(result).toHaveProperty('dv', 1)
            expect(result).toHaveProperty('multiPaymentId')

            // get payments
            const payments = await Payment.getAll(admin, {
                multiPayment: {
                    id: result.multiPaymentId,
                },
            })
            expect(payments).toBeDefined()
            expect(payments).toHaveLength(1)

            // mark payment as payed
            await updateTestPayment(admin, payments[0].id, {
                status: PAYMENT_DONE_STATUS,
                advancedAt: dayjs().toISOString(),
            })

            await catchErrorFrom(async () => {
                await createPaymentByLinkByTestClient(admin, { qrCode })
            }, (error) => {
                expect(error.message).toContain('Provided receipt already paid')
            })
        })
        test('scanned receipt period great the last billing receipt in out database', async () => {
            const {
                organization,
                qrCode,
                qrCodeAttrs,
            } = await createOrganizationAndPropertyAndQrCode(admin, 16, 6, '08.2024')

            // create the receipt
            const {
                billingAccount: { number: accountNumber },
                bankAccount,
                acquiringIntegrationContext,
            } = await createBillingReceiptAndAllDependencies(admin, organization, qrCodeAttrs, '07')

            // register multi payment
            const receipt = generateVirtualReceipt({
                period: '2024-08-01',
                bankAccount,
                accountNumber,
            })
            const [result] = await registerMultiPaymentForVirtualReceiptByTestClient(admin, receipt, {
                id: acquiringIntegrationContext.id,
            })
            expect(result).toBeDefined()
            expect(result).toHaveProperty('dv', 1)
            expect(result).toHaveProperty('multiPaymentId')

            // get payments
            const payments = await Payment.getAll(admin, {
                multiPayment: {
                    id: result.multiPaymentId,
                },
            })
            expect(payments).toBeDefined()
            expect(payments).toHaveLength(1)

            // mark payment as payed
            await updateTestPayment(admin, payments[0].id, {
                status: PAYMENT_DONE_STATUS,
                advancedAt: dayjs().toISOString(),
            })

            await catchErrorFrom(async () => {
                await createPaymentByLinkByTestClient(admin, { qrCode })
            }, (error) => {
                expect(error.message).toContain('Provided receipt already paid')
            })
        })
        test('scanned receipt not in out database', async () => {
            const {
                organization,
                qrCode,
                qrCodeAttrs,
            } = await createOrganizationAndPropertyAndQrCode(admin, 16, 6, '07.2024')

            // create billing entities
            const { billingIntegrationContext } = await addBillingIntegrationAndContext(admin, organization, {}, { status: CONTEXT_FINISHED_STATUS })
            const {
                acquiringIntegrationContext,
            } = await addAcquiringIntegrationAndContext(admin, organization, {}, { status: CONTEXT_FINISHED_STATUS })

            const [bankAccount] = await createTestBankAccount(admin, organization, {
                number: qrCodeAttrs.PersonalAcc,
                routingNumber: qrCodeAttrs.BIC,
            })
            const [billingProperty] = await createTestBillingProperty(admin, billingIntegrationContext)
            const [billingAccount] = await createTestBillingAccount(admin, billingIntegrationContext, billingProperty, { number: qrCodeAttrs.PersAcc })
            await createTestBillingRecipient(admin, billingIntegrationContext, {
                bankAccount: qrCodeAttrs.PersonalAcc,
                bic: qrCodeAttrs.BIC,
            })

            // register multi payment
            const receipt = generateVirtualReceipt({
                period: '2024-07-01',
                bankAccount,
                accountNumber: billingAccount.number,
            })
            const [result] = await registerMultiPaymentForVirtualReceiptByTestClient(admin, receipt, {
                id: acquiringIntegrationContext.id,
            })
            expect(result).toBeDefined()
            expect(result).toHaveProperty('dv', 1)
            expect(result).toHaveProperty('multiPaymentId')

            // get payments
            const payments = await Payment.getAll(admin, {
                multiPayment: {
                    id: result.multiPaymentId,
                },
            })
            expect(payments).toBeDefined()
            expect(payments).toHaveLength(1)

            // mark payment as payed
            await updateTestPayment(admin, payments[0].id, {
                status: PAYMENT_DONE_STATUS,
                advancedAt: dayjs().toISOString(),
            })

            await catchErrorFrom(async () => {
                await createPaymentByLinkByTestClient(admin, { qrCode })
            }, (error) => {
                expect(error.message).toContain('Provided receipt already paid')
            })
        })
    })
})
