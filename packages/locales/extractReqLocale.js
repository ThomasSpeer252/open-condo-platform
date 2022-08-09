// TODO (DOMA-3868) Move this package to app/condo, remove this package and redeclare functions used in other packages locally
const nextCookie = require('next-cookies')
const { get } = require('lodash')

/**
 * @param req
 * @returns {null|string}
 */
const extractReqLocale = (req) => {
    try {
        const cookieLocale = nextCookie({ req }).locale
        // NOTE: Necessary for the correct work of the locale on the share page in Telegram
        const queryLocale = get(req, 'query.locale')

        const isTelegram = get(req, 'headers.user-agent', '').includes('Telegram')
        const headersLocale = get(req, 'headers.accept-language', '').slice(0, 2)
        const reqLocale = get(req, 'locale')

        return cookieLocale || (isTelegram && queryLocale) || headersLocale || reqLocale
    }
    catch {
        return null
    }
}


module.exports = {
    extractReqLocale,
}