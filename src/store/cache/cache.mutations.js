export default {
  DELETE_CURRENT_COMPANY (state) {
    state.currentCompany = null
  },

  SET_CURRENT_COMPANY (state, currentCompany) {
    state.currentCompany = currentCompany
  }
}
