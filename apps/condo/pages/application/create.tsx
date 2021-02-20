import Head from 'next/head'
import { PageContent, PageHeader, PageWrapper } from '../../containers/BaseLayout'
import { OrganizationRequired } from '../../containers/OrganizationRequired'
import React from 'react'
import { useIntl } from '@core/next/intl'
import { ApplicationForm } from '../../components/ApplicationForm'

export default () => {
    const intl = useIntl()
    const PageTitleMsg = intl.formatMessage({ id:'pages.condo.application.index.CreateApplicationModalTitle' })

    return (
        <>
            <Head>
                <title>{PageTitleMsg}</title>
            </Head>
            <PageWrapper>
                <PageHeader title={PageTitleMsg}/>
                <PageContent>
                    <OrganizationRequired>
                        <ApplicationForm/>
                    </OrganizationRequired>
                </PageContent>
            </PageWrapper>
        </>
    )
}