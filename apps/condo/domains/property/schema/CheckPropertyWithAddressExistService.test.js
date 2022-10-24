/**
 * Generated by `createservice property.CheckPropertyWithAddressExistService --type queries`
 */
const { makeClientWithProperty } = require('@condo/domains/property/utils/testSchema')
const { checkPropertyWithAddressExistByTestClient } = require('@condo/domains/property/utils/testSchema')
const { catchErrorFrom } = require('@condo/domains/common/utils/testSchema')

describe('CheckPropertyWithAddressExistService', () => {
    test('user finds result', async () => {
        const client = await makeClientWithProperty(true)
        const payload = {
            address: client.property.address,
            addressMeta: client.property.addressMeta,
        }
        const expectedResult = {
            isFound: true,
        }
        const [result] = await checkPropertyWithAddressExistByTestClient(client, payload)
        expect(result).toStrictEqual(expectedResult)
    })
    test('user don\'t find result', async () => {
        const client = await makeClientWithProperty(false)
        const payload = {
            address: 'address',
            addressMeta: { ...client.property.addressMeta, value: 'address' },
        }
        const expectedResult = {
            isFound: false,
        }
        const [result] = await checkPropertyWithAddressExistByTestClient(client, payload)
        expect(result).toStrictEqual(expectedResult)
    })

    describe('user get error', () => {
        test('if meta dv is not specified', async () => {
            const client = await makeClientWithProperty()
            client.property.addressMeta.dv = 2
            const payload = {
                address: client.property.address,
                addressMeta: client.property.addressMeta,
            }
            await catchErrorFrom(async () => {
                await checkPropertyWithAddressExistByTestClient(client, payload)
            }, ({ errors }) => {
                expect(errors).toMatchObject([{
                    message: 'Version number value 2 is incorrect',
                    path: ['result'],
                    extensions: {
                        query: 'checkPropertyWithAddressExist',
                        variable: ['data', 'addressMeta', 'dv'],
                        code: 'BAD_USER_INPUT',
                        type: 'DV_VERSION_MISMATCH',
                        message: 'Version number value {dv} is incorrect',
                    },
                }])
            })
        })
        test('if flat is specified without flat type', async () => {
            const client = await makeClientWithProperty(true)
            client.property.addressMeta.data.flat_type = null
            const payload = {
                address: client.property.address,
                addressMeta: client.property.addressMeta,
            }
            await catchErrorFrom(async () => {
                await checkPropertyWithAddressExistByTestClient(client, payload)
            }, ({ errors }) => {
                expect(errors).toMatchObject([{
                    message: 'Flat type is not specified',
                    path: ['result'],
                    extensions: {
                        query: 'checkPropertyWithAddressExist',
                        variable: ['data', 'addressMeta', 'flatType'],
                        code: 'BAD_USER_INPUT',
                        type: 'FLAT_WITHOUT_FLAT_TYPE',
                        message: 'Flat type is not specified',
                    },
                }])
            })
        })

        test('if not addressMeta specified', async () => {
            const client = await makeClientWithProperty(true)
            const payload = {
                address: client.property.address,
                addressMeta: null,
            }
            await catchErrorFrom(async () => {
                await checkPropertyWithAddressExistByTestClient(client, payload)
            }, ({ errors }) => {
                expect(errors[0].message).toEqual('Variable "$data" got invalid value null at "data.addressMeta"; Expected non-nullable type "AddressMetaFieldInput!" not to be null.')
            })
        })

        test('if addressMeta json has invalid format ', async () => {
            const client = await makeClientWithProperty(true)
            const payload = {
                address: client.property.address,
                addressMeta: {
                    invalidField: 'invalid data',
                },
            }
            await catchErrorFrom(async () => {
                await checkPropertyWithAddressExistByTestClient(client, payload)
            }, ({ errors }) => {
                // TODO(antonal): catch unhandled errors, thrown by validation of GraphQL schema in Apollo
                // expect(errors).toMatchObject([{
                //     message: 'Invalid JSON structure',
                //     path: ['result'],
                //     extensions: {
                //         query: 'checkPropertyWithAddressExist',
                //         variable: ['data', 'addressMeta'],
                //         code: 'BAD_USER_INPUT',
                //         type: 'WRONG_FORMAT',
                //         message: 'Invalid JSON structure',
                //         internalError: 'Variable "$data" got invalid value { invalidField: "invalid data" } at "data.addressMeta"; Field "dv" of required type "Int!" was not provided.',
                //     },
                // }])
                expect(errors[0].message).toEqual('Variable "$data" got invalid value { invalidField: "invalid data" } at "data.addressMeta"; Field "dv" of required type "Int!" was not provided.')
            })
        })
    })
})