export default {
  setCurrentCompany ({ commit }, currentCompany) {
    commit('SET_CURRENT_COMPANY', currentCompany)
  },

  deleteCurrentCompany ({ commit }) {
    commit('DELETE_CURRENT_COMPANY')
  }
}
