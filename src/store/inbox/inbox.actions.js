export default {
  setContactId: ({ commit }, id) => {
    commit('SET_CONTACT_ID', id)
  },
  setSelectedCommunication: ({ commit }, communication) => {
    commit('SET_SELECTED_COMMUNICATION', communication)
  },
  setCommunications: ({ commit }, communications) => {
    commit('SET_COMMUNICATIONS', communications)
  },
  resetInboxVuex: ({ commit }) => {
    commit('RESET_INBOX_VUEX')
  },
  gettingTasksList: ({ commit }, isGetting) => {
    commit('GETTING_TASKS_LIST', isGetting)
  },
  setActiveChannel: ({ commit }, channel) => {
    commit('SET_ACTIVE_CHANNEL', channel)
  },
  setOpenTaskCount: ({ commit }, count = 0) => {
    commit('SET_OPEN_TASK_COUNT', count)
  },
  setPendingTaskCount: ({ commit }, count = 0) => {
    commit('SET_PENDING_TASK_COUNT', count)
  },
  setContacts: ({ commit }, contacts) => {
    commit('SET_CONTACTS', contacts)
  },
  setSelectedContact: ({ commit }, contact) => {
    commit('SET_SELECTED_CONTACT', contact)
  }
}
