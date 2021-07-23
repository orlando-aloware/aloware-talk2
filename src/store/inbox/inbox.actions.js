export default {
  setContactId: ({ commit }, id) => {
    commit('SET_CONTACT_ID', id)
  },
  resetInboxVuex: ({ commit }) => {
    commit('RESET_INBOX_VUEX')
  }
}
