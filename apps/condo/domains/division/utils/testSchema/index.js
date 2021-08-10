/**
 * Generated by `createschema division.Division 'name:Text; organization:Relationship:Organization:CASCADE; responsible:Relationship:OrganizationEmployee:PROTECT;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const faker = require('faker')

const { generateServerUtils, execGqlWithoutAccess } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')

const { generateGQLTestUtils, throwIfError } = require('@condo/domains/common/utils/codegeneration/generate.test.utils')

const { Division: DivisionGQL } = require('@condo/domains/division/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const Division = generateGQLTestUtils(DivisionGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createTestDivision (client, organization, responsible, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!organization || !organization.id) throw new Error('no organization.id')
    if (!responsible || !responsible.id) throw new Error('no responsible.id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): write createTestDivision logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        organization: { connect: { id: organization.id } },
        responsible: { connect: { id: responsible.id } },
        ...extraAttrs,
    }
    const obj = await Division.create(client, attrs)
    return [obj, attrs]
}

async function updateTestDivision (client, id, extraAttrs = {}) {
    if (!client) throw new Error('no client')
    if (!id) throw new Error('no id')
    const sender = { dv: 1, fingerprint: faker.random.alphaNumeric(8) }

    // TODO(codegen): check the updateTestDivision logic for generate fields

    const attrs = {
        dv: 1,
        sender,
        ...extraAttrs,
    }
    const obj = await Division.update(client, id, attrs)
    return [obj, attrs]
}

/* AUTOGENERATE MARKER <FACTORY> */

module.exports = {
    Division, createTestDivision, updateTestDivision,
/* AUTOGENERATE MARKER <EXPORTS> */
}
