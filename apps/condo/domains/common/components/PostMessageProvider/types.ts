import type { ValidateFunction } from 'ajv'
import type { ErrorCode, ErrorReason } from './errors'
import type { 
    RequestParams as BridgeRequestParams,
    ResultResponseData as BridgeResponseData,
    ResponseEventNamesMap as BridgeEventNamesMap,
} from '@open-condo/bridge'
import type { AnalyticsParams } from '@open-condo/ui/src/components/_utils/analytics'

export const COMMON_ERROR_PREFIX = 'CondoWebAppCommonError' as const

export type RequestParamsMap = {
    // Analytics
    CondoWebSendAnalyticsEvent: AnalyticsParams
    // Bridge
    CondoWebAppGetLaunchParams: BridgeRequestParams<'CondoWebAppGetLaunchParams'>,
    CondoWebAppResizeWindow: BridgeRequestParams<'CondoWebAppResizeWindow'>
    CondoWebAppShowNotification: BridgeRequestParams<'CondoWebAppShowNotification'>
}

export type HandlerResultsMap = {
    // Analytics
    CondoWebSendAnalyticsEvent: { sent: boolean }
    // Bridge
    CondoWebAppGetLaunchParams: BridgeResponseData<'CondoWebAppGetLaunchParams'>,
    CondoWebAppResizeWindow: BridgeResponseData<'CondoWebAppResizeWindow'>
    CondoWebAppShowNotification: BridgeResponseData<'CondoWebAppShowNotification'>
}

export type AllRequestMethods = keyof RequestParamsMap
export type RequestParams<Method extends AllRequestMethods> = RequestParamsMap[Method]
export type HandlerResult<Method extends AllRequestMethods> = HandlerResultsMap[Method]
export type RequestHandler<Method extends AllRequestMethods> = (params: RequestParams<Method>) => HandlerResult<Method>
export type RequestParamValidator<Method extends AllRequestMethods> = ValidateFunction<RequestParams<Method>>
export type RequestIdType = string | number
export type RequestId = { requestId?: RequestIdType }
type ResponseEventNames<T extends AllRequestMethods, R extends string, E extends string> = Record<T, {
    result: R,
    error: E
}>
export type ResponseEventNamesMap = BridgeEventNamesMap &
ResponseEventNames<'CondoWebSendAnalyticsEvent', 'CondoWebSendAnalyticsEventResult', 'CondoWebSendAnalyticsEventError'>

export type ClientErrorResponse<Method extends AllRequestMethods, Reason extends ErrorReason> = {
    type: ResponseEventNamesMap[Method]['error'] | typeof COMMON_ERROR_PREFIX
    data: {
        errorType: 'client'
        errorCode: ErrorCode<Reason>
        errorReason: Reason
        errorMessage: string
    } & RequestId
}