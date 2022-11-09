/**
 * Generated by `createservice onboarding.CreateOnBoardingService`
 */

const { GQLCustomSchema } = require('@open-condo/keystone/schema')
const access = require('@condo/domains/onboarding/access/CreateOnBoardingService')
const { OnBoarding } = require('@condo/domains/onboarding/utils/serverSchema')
const { OnBoardingStep } = require('@condo/domains/onboarding/utils/serverSchema')
const { ONBOARDING_TYPES, ONBOARDING_STEPS } = require('@condo/domains/onboarding/constants')
const { GQLError, GQLErrorCode: { BAD_USER_INPUT } } = require('@open-condo/keystone/errors')
const { ROLE_IS_NOT_SUPPORTED } = require('../constants/errors')

const ERRORS = {
    ROLE_IS_NOT_SUPPORTED_TO_CREATE_ONBOARDING: {
        mutation: 'createOnBoardingByType',
        variable: ['data', 'type'],
        code: BAD_USER_INPUT,
        type: ROLE_IS_NOT_SUPPORTED,
        message: 'Role "{type}" is not supported to create OnBoarding for',
    },
    ROLE_IS_NOT_SUPPORTED_TO_CREATE_ONBOARDING_STEP: {
        mutation: 'createOnBoardingByType',
        variable: ['data', 'type'],
        code: BAD_USER_INPUT,
        type: ROLE_IS_NOT_SUPPORTED,
        message: 'Step transitions are not defined for role "{type}"',
    },
}

const CreateOnBoardingService = new GQLCustomSchema('CreateOnBoardingService', {
    types: [
        {
            access: true,
            type: `enum OnBoardingType { ${ONBOARDING_TYPES.join(' ')} }`,
        },
        {
            access: true,
            type: 'input CreateOnBoardingInput { dv: Int!, sender: JSON!, type: OnBoardingType, userId:ID! }',
        },
    ],
    mutations: [
        {
            access: access.canCreateOnBoarding,
            schema: 'createOnBoardingByType(data: CreateOnBoardingInput!): OnBoarding',
            doc: {
                summary: 'Creates OnBoarding and set of OnBoardingStep records for specified role and user',
                errors: ERRORS,
            },
            resolver: async (parent, args, context) => {
                const { data } = args
                const { type, dv, sender, userId } = data

                if (!ONBOARDING_TYPES.includes(type)) {
                    throw new GQLError({
                        ...ERRORS.ROLE_IS_NOT_SUPPORTED_TO_CREATE_ONBOARDING,
                        messageInterpolation: {
                            type,
                        },
                    }, context)
                }

                const onBoardingStepData = ONBOARDING_STEPS[type]

                if (!onBoardingStepData) {
                    throw new GQLError({
                        ...ERRORS.ROLE_IS_NOT_SUPPORTED_TO_CREATE_ONBOARDING_STEP,
                        messageInterpolation: {
                            type,
                        },
                    }, context)
                }

                const onBoarding = await OnBoarding.create(context, {
                    dv,
                    type,
                    sender,
                    stepsTransitions: onBoardingStepData.transitions,
                    user: {
                        connect: {
                            id: userId,
                        },
                    },
                })

                for (let i = 0; i < onBoardingStepData.steps.length; i++) {
                    const currentStep = onBoardingStepData.steps[i]
                    const key = `${currentStep.action}.${currentStep.entity}`

                    await OnBoardingStep.create(context, {
                        dv,
                        sender,
                        title: `onboarding.step.title.${key}`,
                        description: `onboarding.step.description.${key}`,
                        ...currentStep,
                        onBoarding: { connect: { id: onBoarding.id } },
                    })
                }

                return onBoarding
            },
        },
    ],
})

module.exports = {
    CreateOnBoardingService,
}
