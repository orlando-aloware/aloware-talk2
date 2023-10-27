export default {
  setBusinessInformationFieldsEmpty ({ commit }) {
    commit('SET_BUSINESS_INFORMATION_FIELDS_EMPTY')
  },

  setKycFilled ({ commit }) {
    commit('SET_KYC_FILLED')
  },

  setFieldErrors ({ commit }, errors) {
    commit('SET_FIELD_ERRORS', errors)
  },

  cleanFieldError ({ commit }, field) {
    commit('CLEAN_FIELD_ERROR', field)
  },

  setPreFilledData ({ commit }, data) {
    commit('SET_PRE_FILLED_DATA', data)
  }
}
