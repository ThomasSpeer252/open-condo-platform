/**
 * Generated by `createschema scope.PropertyScope 'name:Text; organization:Relationship:Organization:CASCADE;isDefault:Checkbox;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const get = require('lodash/get')


const { PropertyScope: PropertyScopeGQL } = require('@condo/domains/scope/gql')
const { PropertyScopeOrganizationEmployee: PropertyScopeOrganizationEmployeeGQL } = require('@condo/domains/scope/gql')
const { PropertyScopeProperty: PropertyScopePropertyGQL } = require('@condo/domains/scope/gql')
const { find } = require('@condo/keystone/schema')
const { AssigneeScope: AssigneeScopeGQL } = require('@condo/domains/scope/gql')
const { generateServerUtils, execGqlWithoutAccess } = require('@condo/codegen/generate.server.utils')
const { EXPORT_PROPERTY_SCOPE_MUTATION } = require('@condo/domains/scope/gql')
const { GqlWithKnexLoadList } = require('@condo/domains/common/utils/serverSchema')
/* AUTOGENERATE MARKER <IMPORT> */

const PropertyScope = generateServerUtils(PropertyScopeGQL)
const PropertyScopeOrganizationEmployee = generateServerUtils(PropertyScopeOrganizationEmployeeGQL)
const PropertyScopeProperty = generateServerUtils(PropertyScopePropertyGQL)
const AssigneeScope = generateServerUtils(AssigneeScopeGQL)
/* AUTOGENERATE MARKER <CONST> */


async function exportPropertyScope (context, data) {
    if (!context) throw new Error('no context')
    if (!data) throw new Error('no data')
    if (!data.sender) throw new Error('no data.sender')

    return await execGqlWithoutAccess(context, {
        query: EXPORT_PROPERTY_SCOPE_MUTATION,
        variables: { data: { dv: 1, ...data } },
        errorMessage: '[error] Unable to exportPropertyScope',
        dataPath: 'obj',
    })
}

async function createDefaultPropertyScopeForNewOrganization (context, organization, dvSenderData) {
    await PropertyScope.create(context, {
        name: 'pages.condo.settings.propertyScope.default.name',
        organization: { connect: { id: organization.id } },
        hasAllProperties: true,
        hasAllEmployees: true,
        ...dvSenderData,
    })
}

async function softDeletePropertyScopeProperties (context, updatedItem) {
    const { dv, sender, id } = updatedItem

    const propertyScopeProperties = await PropertyScopeProperty.getAll(context, {
        property: { id },
    })

    for (const propertyScopeProperty of propertyScopeProperties) {
        await PropertyScopeProperty.update(context, propertyScopeProperty.id, {
            deletedAt: 'true',
            dv, sender,
        })
    }
}

async function softDeletePropertyScopeOrganizationEmployee (context, updatedItem) {
    const { dv, sender, id } = updatedItem

    const propertyScopeEmployees = await PropertyScopeOrganizationEmployee.getAll(context, {
        employee: { id },
        deletedAt: null,
    })

    for (const propertyScopeEmployee of propertyScopeEmployees) {
        await PropertyScopeOrganizationEmployee.update(context, propertyScopeEmployee.id, {
            deletedAt: 'true',
            dv, sender,
        })
    }
}

async function getPropertyScopes (employeeIds) {
    const propertyScopeEmployees = await find('PropertyScopeOrganizationEmployee', {
        employee: { id_in: employeeIds },
        deletedAt: null,
    })

    const propertyScopeIds = propertyScopeEmployees.map(propertyScopeEmployee => propertyScopeEmployee.propertyScope)
    const propertyScopes = await find('PropertyScope', {
        OR: [
            { id_in: propertyScopeIds },
            { hasAllEmployees: true },
        ],
        deletedAt: null,
    })

    const propertyScopeProperties = await find('PropertyScopeProperty', {
        propertyScope: { id_in: propertyScopes.map(scope => scope.id) },
        deletedAt: null,
    })

    return propertyScopes.map(scope => {
        const properties = propertyScopeProperties
            .filter(({ propertyScope }) => propertyScope === scope.id)
            .map(({ property }) => property)
        const employees = propertyScopeEmployees
            .filter(({ propertyScope }) => propertyScope === scope.id)
            .map(({ employee }) => employee)

        return { ...scope, properties, employees }
    })
}

/**
 * Checks changes in the current assignee field and another assignee field (for example, assignee and executor in the ticket).
 1) Creates an AssigneeScope if the user is specified in assigneeField and there is no such AssigneeScope yet.
 2) Removes the AssigneeScope if the user was removed from the assigneeField and in another assigneeField not this user
 3) When updating assigneeField, deletes the AssigneeScope for the old user and creates an AssigneeScope for the new one
 */
async function createOrDeleteAssigneeScope ({ assigneeField, otherAssigneeField, context, existingItem, updatedItem }) {
    const existingAssigneeFieldId = get(existingItem, assigneeField)
    const existingOtherAssigneeFieldId = get(existingItem, otherAssigneeField)
    const updatedAssigneeFieldId = get(updatedItem, assigneeField)
    const updatedOtherAssigneeFieldId = get(updatedItem, otherAssigneeField)
    
    const isAssigneeFieldChanged = existingAssigneeFieldId !== updatedAssigneeFieldId
    const isOtherAssigneeFieldChanged = existingOtherAssigneeFieldId !== updatedOtherAssigneeFieldId

    if (!isAssigneeFieldChanged && !isOtherAssigneeFieldChanged) {
        return
    }
    
    const ticketId = updatedItem.id
    const { dv, sender } = updatedItem
    
    const assigneeScopes = await find('AssigneeScope', {
        ticket: { id: ticketId },
        deletedAt: null,
    })

    if (isAssigneeFieldChanged) {
        const isAssigneeFieldConnected = !existingAssigneeFieldId && updatedAssigneeFieldId
        const isAssigneeFieldDisconnected = existingAssigneeFieldId && !updatedAssigneeFieldId
        const isAssigneeFieldUpdated = existingAssigneeFieldId && updatedAssigneeFieldId

        const existedAssigneeFieldAssigneeScope = assigneeScopes.find(assigneeScope => assigneeScope.user === existingAssigneeFieldId)
        const updatedAssigneeFieldAssigneeScope = assigneeScopes.find(assigneeScope => assigneeScope.user === updatedAssigneeFieldId)

        if (isAssigneeFieldConnected && !updatedAssigneeFieldAssigneeScope) {
            await AssigneeScope.create(context, {
                user: { connect: { id: updatedAssigneeFieldId } },
                ticket: { connect: { id: ticketId } },
                dv,
                sender,
            })
        } else if (isAssigneeFieldDisconnected && existedAssigneeFieldAssigneeScope) {
            const isSameUserInOtherAssigneeField = existingOtherAssigneeFieldId && isOtherAssigneeFieldChanged ?
                existingAssigneeFieldId === updatedOtherAssigneeFieldId : existingAssigneeFieldId === existingOtherAssigneeFieldId

            if (!isSameUserInOtherAssigneeField) {
                await AssigneeScope.softDelete(context, existedAssigneeFieldAssigneeScope.id, {
                    dv, sender,
                })
            }
        } else if (isAssigneeFieldUpdated && existedAssigneeFieldAssigneeScope) {
            const isSameUserInOtherAssigneeField = existingOtherAssigneeFieldId && isOtherAssigneeFieldChanged ?
                existingAssigneeFieldId === updatedOtherAssigneeFieldId : existingAssigneeFieldId === existingOtherAssigneeFieldId

            if (!isSameUserInOtherAssigneeField) {
                await AssigneeScope.softDelete(context, existedAssigneeFieldAssigneeScope.id, {
                    dv, sender,
                })
                await AssigneeScope.create(context, {
                    user: { connect: { id: updatedAssigneeFieldId } },
                    ticket: { connect: { id: ticketId } },
                    dv,
                    sender,
                })
            }
        }
    }
}

async function manageAssigneeScope (args) {
    await createOrDeleteAssigneeScope({
        assigneeField: 'assignee',
        otherAssigneeField: 'executor',
        ...args,
    })

    await createOrDeleteAssigneeScope({
        assigneeField: 'executor',
        otherAssigneeField: 'assignee',
        ...args,
    })
}

const loadPropertyScopesForExcelExport = async ({ where = {}, sortBy = ['createdAt_DESC'] }) => {
    const propertyScopesLoader = new GqlWithKnexLoadList({
        listKey: 'PropertyScope',
        fields: 'id name hasAllProperties hasAllEmployees',
        sortBy,
        where,
    })
    return await propertyScopesLoader.load()
}

const loadPropertyScopePropertiesForExcelExport = async ({ where = {}, sortBy = ['createdAt_DESC'] }) => {
    const propertyScopePropertyLoader = new GqlWithKnexLoadList({
        listKey: 'PropertyScopeProperty',
        fields: 'id',
        singleRelations: [
            ['Property', 'property', 'address'],
            ['PropertyScope', 'propertyScope', 'id'],
        ],
        sortBy,
        where,
    })
    return await propertyScopePropertyLoader.load()
}

const loadPropertyScopeEmployeesForExcelExport = async ({ where = {}, sortBy = ['createdAt_DESC'] }) => {
    const propertyScopeEmployeesLoader = new GqlWithKnexLoadList({
        listKey: 'PropertyScopeOrganizationEmployee',
        fields: 'id',
        singleRelations: [
            ['OrganizationEmployee', 'employee', 'name', 'employeeName'],
            ['OrganizationEmployee', 'employee', 'id'],
            ['OrganizationEmployee', 'employee', 'hasAllSpecializations', 'hasAllSpecializations'],
            ['PropertyScope', 'propertyScope', 'id'],
        ],
        sortBy,
        where,
    })
    return await propertyScopeEmployeesLoader.load()
}

const loadOrganizationEmployeeSpecializationsForExcelExport = async ({ where = {}, sortBy = ['createdAt_DESC'] }) => {
    const organizationEmployeeSpecializationsLoader = new GqlWithKnexLoadList({
        listKey: 'OrganizationEmployeeSpecialization',
        fields: 'id',
        singleRelations: [
            ['TicketCategoryClassifier', 'specialization', 'name'],
            ['OrganizationEmployee', 'employee', 'id'],
        ],
        sortBy,
        where,
    })
    return await organizationEmployeeSpecializationsLoader.load()
}

module.exports = {
    PropertyScope,
    PropertyScopeOrganizationEmployee,
    PropertyScopeProperty,
    createDefaultPropertyScopeForNewOrganization,
    getPropertyScopes,
    manageAssigneeScope,
    softDeletePropertyScopeProperties,
    softDeletePropertyScopeOrganizationEmployee,
    AssigneeScope,
    exportPropertyScope,
    loadPropertyScopesForExcelExport,
    loadPropertyScopePropertiesForExcelExport,
    loadPropertyScopeEmployeesForExcelExport,
    loadOrganizationEmployeeSpecializationsForExcelExport,
/* AUTOGENERATE MARKER <EXPORTS> */
}
