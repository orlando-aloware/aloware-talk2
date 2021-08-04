export default {
  setContactId: ({ commit }, id) => {
    commit('SET_CONTACT_ID', id)
  },
  setCommunication: ({ commit }, communication) => {
    commit('SET_COMMUNICATION', communication)
  },
  resetInboxVuex: ({ commit }) => {
    commit('RESET_INBOX_VUEX')
  },
  gettingTasksList: ({ commit }, isGetting) => {
    commit('GETTING_TASKS_LIST', isGetting)
  },
  setActiveChannel: ({ commit }, channel) => {
    commit('SET_ACTIVE_CHANNEL', channel)
  }
}
