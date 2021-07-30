import Router from 'next/router'

import { useIntl } from '@core/next/intl'
import { Form, Input, Typography } from 'antd'
import { Button } from '@condo/domains/common/components/Button'
import AuthLayout, { AuthPage } from '@condo/domains/user/components/containers/AuthLayout'
import React, { useState, useEffect } from 'react'
import { MIN_PASSWORD_LENGTH } from '@condo/domains/user/constants/common'
import { getQueryParams } from '@condo/domains/common/utils/url.utils'
import { runMutation } from '@condo/domains/common/utils/mutations.utils'
import { useLazyQuery, useMutation } from '@core/next/apollo'
import { CHANGE_PASSWORD_WITH_TOKEN_MUTATION, CHECK_PASSWORD_RECOVERY_TOKEN } from '@condo/domains/user/gql'
import { useAuth } from '@core/next/auth'
import { BasicEmptyListView } from '@condo/domains/common/components/EmptyListView'
import { ButtonHeaderAction } from '@condo/domains/common/components/HeaderActions'
import { useValidations } from '@condo/domains/common/hooks/useValidations'
import { useContext } from 'react'
import { AuthLayoutContext } from '@condo/domains/user/components/containers/AuthLayout'
import { Loader } from '@condo/domains/common/components/Loader'

const INPUT_STYLE = { width: '20em' }

const ChangePasswordPage: AuthPage = () => {
    const [form] = Form.useForm()
    const { token } = getQueryParams()
    const initialValues = { token, password: '', confirm: '' }
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [changePassword] = useMutation(CHANGE_PASSWORD_WITH_TOKEN_MUTATION)
    const auth = useAuth()

    const intl = useIntl()
    const SaveMsg = intl.formatMessage({ id: 'Save' })
    const PasswordMsg = intl.formatMessage({ id: 'pages.auth.signin.field.Password' })
    const ResetTitle = intl.formatMessage({ id: 'pages.auth.ResetTitle' })
    const CreateNewPasswordMsg = intl.formatMessage({ id: 'pages.auth.reset.CreateNewPasswordMsg' })
    const ConfirmPasswordMsg = intl.formatMessage({ id: 'pages.auth.register.field.ConfirmPassword' })
    const AndSignInMsg = intl.formatMessage({ id: 'pages.auth.reset.AndSignInMsg' })
    const PleaseInputYourPasswordMsg = intl.formatMessage({ id: 'pages.auth.PleaseInputYourPassword' })
    const PasswordIsTooShortMsg = intl.formatMessage({ id: 'pages.auth.PasswordIsTooShort' })
    const PleaseConfirmYourPasswordMsg = intl.formatMessage({ id: 'pages.auth.PleaseConfirmYourPassword' })
    const TwoPasswordDontMatchMsg = intl.formatMessage({ id: 'pages.auth.TwoPasswordDontMatch' })
    const ChangePasswordTokenErrorLabel = intl.formatMessage({ id: 'pages.auth.ChangePasswordTokenErrorLabel' })
    const ChangePasswordTokenErrorMessage = intl.formatMessage({ id: 'pages.auth.ChangePasswordTokenErrorMessage' })
    const ChangePasswordTokenErrorConfirmLabel = intl.formatMessage({ id: 'pages.auth.ChangePasswordTokenErrorConfirmLabel' })

    const ErrorToFormFieldMsgMapping = {}

    const { requiredValidator, changeMessage } = useValidations()
    const minPasswordLength = {
        min: MIN_PASSWORD_LENGTH,
        message: PasswordIsTooShortMsg,
    }
    const validations = {
        password: [changeMessage(requiredValidator, PleaseInputYourPasswordMsg), minPasswordLength],
    }
    const authLayoutContext = useContext(AuthLayoutContext)

    const onFinish = (values: typeof initialValues) => {
        setIsSaving(true)
        const { token, password } = values
        return runMutation({
            mutation: changePassword,
            variables: { data: { token, password } },
            onCompleted: async ({ data: { result } }) => {
                try {
                    await authLayoutContext.signInByEmail({
                        email: result.email,
                        password: form.getFieldValue('password'),
                    })
                    await auth.refetch()
                    Router.push( '/')
                }
                finally {
                    setIsSaving(false)
                }
            },
            intl,
            form,
            ErrorToFormFieldMsgMapping,
        }).catch(() => {
            setIsSaving(false)
        })
    }
    const [checkPasswordRecoveryToken] = useLazyQuery(CHECK_PASSWORD_RECOVERY_TOKEN, {
        onError: error => {
            setRecoveryTokenError(error)
            setIsLoading(false)
        },
        onCompleted: () => {
            setRecoveryTokenError(null)
            setIsLoading(false)
        },
    })
    const [recoveryTokenError, setRecoveryTokenError] = useState<Error | null>(null)
    useEffect(() => {
        checkPasswordRecoveryToken({ variables: { data: { token } } })
    }, [])
    if (isLoading){
        return <Loader size="large" delay={0} fill />
    }
    if (recoveryTokenError) {
        return (
            <BasicEmptyListView>
                <Typography.Title level={3}>{ChangePasswordTokenErrorLabel}</Typography.Title>
                <Typography.Text style={{ fontSize: '16px' }}>{ChangePasswordTokenErrorMessage}</Typography.Text>
                <Button
                    type='sberPrimary'
                    style={{ marginTop: '16px' }}
                    onClick={() => Router.push('/auth/forgot')}
                >{ChangePasswordTokenErrorConfirmLabel}</Button>
            </BasicEmptyListView>
        )
    }


    return (
        <div >
            <Typography.Title style={{ textAlign: 'left' }}>{ResetTitle}</Typography.Title>
            <Typography.Paragraph style={{ textAlign: 'left' }} >{CreateNewPasswordMsg}</Typography.Paragraph>

            <Form
                form={form}
                name="change-password"
                onFinish={onFinish}
                initialValues={initialValues}
                colon={false}
                style={{ marginTop: '40px' }}
                requiredMark={false}
            >
                <Form.Item name="token" style={{ display: 'none' }}>
                    <Input type="hidden" />
                </Form.Item>
                <Form.Item
                    name="password"
                    label={PasswordMsg}
                    labelAlign='left'
                    labelCol={{ flex: 1 }}
                    rules={validations.password}
                >
                    <Input.Password style={INPUT_STYLE}/>
                </Form.Item>
                <Form.Item
                    name="confirm"
                    label={ConfirmPasswordMsg}
                    labelAlign='left'
                    labelCol={{ flex: 1 }}
                    style={{ marginTop: '40px' }}
                    dependencies={['password']}
                    rules={[
                        changeMessage(requiredValidator, PleaseConfirmYourPasswordMsg),
                        ({ getFieldValue }) => ({
                            validator (_, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve()
                                }
                                return Promise.reject(TwoPasswordDontMatchMsg)
                            },
                        }),
                    ]}
                >
                    <Input.Password  style={INPUT_STYLE}/>
                </Form.Item>
                <div style={{ marginTop: '60px', display: 'flex', justifyContent: 'flex-start' }}>
                    <Form.Item >
                        <Button
                            key='submit'
                            type='sberPrimary'
                            loading={isSaving}
                            htmlType="submit"
                        >
                            {SaveMsg}
                        </Button>
                        <Typography.Text type='secondary' style={{ marginLeft: '20px' }}>
                            {AndSignInMsg}
                        </Typography.Text>
                    </Form.Item>
                </div>
            </Form>
        </div>
    )
}

ChangePasswordPage.headerAction = <ButtonHeaderAction descriptor={{ id: 'pages.auth.Register' }} path={'/auth/register'}/>

ChangePasswordPage.container = AuthLayout

export default ChangePasswordPage
