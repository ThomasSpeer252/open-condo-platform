/**
 * Generated by `createschema property.Property 'organization:Text; name:Text; address:Text; addressMeta:Json; type:Select:building,village; map?:Json'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */

const { generateGqlQueries } = require('@condo/domains/common/utils/codegeneration/generate.gql')
const { gql } = require('graphql-tag')

const COMMON_FIELDS = 'id dv sender v deletedAt organization { id name} newId createdBy { id name } updatedBy { id name } createdAt updatedAt'

const PROPERTY_FIELDS = `{ name address addressMeta type ticketsInWork ticketsClosed unitsCount map ${COMMON_FIELDS} }`
const Property = generateGqlQueries('Property', PROPERTY_FIELDS)

const PROPERTY_RESIDENT_FIELDS = `{ organization { id } property { id } contact { id } billingAccount { id } address addressMeta unitName name email phone ${COMMON_FIELDS} }`
const PropertyResident = generateGqlQueries('PropertyResident', PROPERTY_RESIDENT_FIELDS)

const GET_TICKET_INWORK_COUNT_BY_PROPERTY_ID_QUERY = gql`
    query GetTicketInWorkCountForProperty ($propertyId: ID!) {
        inwork: _allTicketsMeta(where: { status: { type_not:  closed }, property: { id: $propertyId } }) {
            count
        }  
  }
`
const GET_TICKET_CLOSED_COUNT_BY_PROPERTY_ID_QUERY = gql`
    query GetTicketInWorkCountForProperty ($propertyId: ID!) {
        closed: _allTicketsMeta(where: { status: { type:  closed }, property: { id: $propertyId } }) {
            count
        }  
  }
`

const CHECK_PROPERTY_WITH_ADDRESS_EXIST_QUERY = gql`
    query checkPropertyWithAddressExist ($data: CheckPropertyWithAddressExistInput!) {
        result: checkPropertyWithAddressExist(data: $data) { isFound }
`

const REGISTER_RESIDENT_MUTATION = gql`
    mutation registerResident ($data: RegisterResidentInput!) {
        result: registerResident(data: $data) { id v dv sender address addressMeta unitName name email phone }
    }
`
/* AUTOGENERATE MARKER <CONST> */

module.exports = {
    Property,
    PropertyResident,
    GET_TICKET_INWORK_COUNT_BY_PROPERTY_ID_QUERY,
    GET_TICKET_CLOSED_COUNT_BY_PROPERTY_ID_QUERY,
    CHECK_PROPERTY_WITH_ADDRESS_EXIST_QUERY,
    REGISTER_RESIDENT_MUTATION,
/* AUTOGENERATE MARKER <EXPORTS> */
}
