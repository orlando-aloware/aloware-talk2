const ErrorCode = Object.freeze({
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  RESOURCE_NOT_FOUND_ERROR: 'RESOURCE_NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  BAD_REQUEST: 'BAD_REQUEST'
})

export default {
  methods: {
    /**
     * Invokes and handles the errors of a Vuex API call
     * @note This could be a generic helper
     *
     * @param vuexAction
     * @param payload
     */
    async handleVuexApiCall (vuexAction, payload = null) {
      try {
        const data = payload ? await vuexAction(payload) : await vuexAction()
        return { success: true, data }
      } catch (err) {
        const apiMessage = err.response?.data?.message || err.response?.data?.error
        const error = this.getErrorObj(err.response.status, apiMessage)
        return { success: false, error }
      }
    },

    /**
     * Build an error message + code for vue components.
     * @note Can be generic if the API sends error codes, we can ditch status codes for them
     *
     * @param statusCode
     * @param apiMessage
     */
    getErrorObj (statusCode, apiMessage) {
      let message
      let code
      switch (statusCode) {
        case 400:
          message = apiMessage
          code = ErrorCode.BAD_REQUEST
          break
        case 401:
          message = 'You need to log in before proceeding'
          code = ErrorCode.AUTHENTICATION_ERROR
          break
        case 422:
          message = "We've encountered an error while validation the your inputs"
          code = ErrorCode.VALIDATION_ERROR
          break
        case 403:
          message = "Sorry, you don't have enough permission for this action"
          code = ErrorCode.AUTHORIZATION_ERROR
          break
        case 404:
          message = apiMessage
          code = ErrorCode.RESOURCE_NOT_FOUND_ERROR
          break
        default:
          message = 'Sorry, we have encountered an unknown error. Please contact our support team for support.'
          code = ErrorCode.SERVER_ERROR
      }
      return { message, code }
    }
  }
}
