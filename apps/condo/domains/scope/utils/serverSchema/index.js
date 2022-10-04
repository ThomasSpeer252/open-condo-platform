/**
 * Generated by `createschema scope.PropertyScope 'name:Text; organization:Relationship:Organization:CASCADE;isDefault:Checkbox;'`
 * In most cases you should not change it by hands
 * Please, don't remove `AUTOGENERATE MARKER`s
 */
const get = require('lodash/get')

const { generateServerUtils } = require('@condo/domains/common/utils/codegeneration/generate.server.utils')

const { PropertyScope: PropertyScopeGQL } = require('@condo/domains/scope/gql')
const { PropertyScopeOrganizationEmployee: PropertyScopeOrganizationEmployeeGQL } = require('@condo/domains/scope/gql')
const { PropertyScopeProperty: PropertyScopePropertyGQL } = require('@condo/domains/scope/gql')
const { SpecializationScope: SpecializationScopeGQL } = require('@condo/domains/scope/gql')
const { find, getByCondition } = require('@condo/keystone/schema')
const { AssigneeScope: AssigneeScopeGQL } = require('@condo/domains/scope/gql')
/* AUTOGENERATE MARKER <IMPORT> */

const PropertyScope = generateServerUtils(PropertyScopeGQL)
const PropertyScopeOrganizationEmployee = generateServerUtils(PropertyScopeOrganizationEmployeeGQL)
const PropertyScopeProperty = generateServerUtils(PropertyScopePropertyGQL)
const SpecializationScope = generateServerUtils(SpecializationScopeGQL)
const AssigneeScope = generateServerUtils(AssigneeScopeGQL)
/* AUTOGENERATE MARKER <CONST> */

async function createDefaultPropertyScopeForNewOrganization (context, organization, dvSenderData) {
    // TODO(DOMA-4065): Узнать какое имя должно быть у дефолтного скопа, сделать переводы, доставать из организации локаль (?)
    await PropertyScope.create(context, {
        name: 'Default',
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

function mapEmployeeToVisibilityTypeToEmployees (employeeToVisibilityType, type) {
    return employeeToVisibilityType.filter(({ visibilityType }) => visibilityType === type).map(({ employee }) => employee)
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

async function manageAssigneeScope ({ context, existingItem, updatedItem }) {
    const args = { context, existingItem, updatedItem }

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

module.exports = {
    PropertyScope,
    PropertyScopeOrganizationEmployee,
    PropertyScopeProperty,
    SpecializationScope,
    createDefaultPropertyScopeForNewOrganization,
    softDeletePropertyScopeProperties,
    mapEmployeeToVisibilityTypeToEmployees,
    getPropertyScopes,
    manageAssigneeScope,
    AssigneeScope,
/* AUTOGENERATE MARKER <EXPORTS> */
}
