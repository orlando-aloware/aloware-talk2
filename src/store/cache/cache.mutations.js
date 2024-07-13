import * as CacheDefault from 'src/constants/cache-default'

export default {
  DELETE_CURRENT_COMPANY (state) {
    state.currentCompany = null
  },

  SET_CURRENT_COMPANY (state, currentCompany) {
    state.currentCompany = currentCompany
  },

  SET_TIMEZONES (state, list) {
    state.timezones = list
  },

  SET_PHONE_NUMBER (state, phoneNumber) {
    state.phoneNumber = phoneNumber
  },

  SET_IS_REDIRECTED_TO_HUBSPOT_WIDGET (state, value) {
    state.isRedirectedToHubspotWidget = value
  },

  RESET_VUEX (state) {
    // perform state reset
    state = Object.assign({}, CacheDefault.DEFAULT_STATE)
  }
}
