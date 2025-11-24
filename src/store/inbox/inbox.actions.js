export default {
  // Contact selection
  setSelectedContact: ({ commit }, contact) => {
    commit('SET_SELECTED_CONTACT', contact)
  },

  // Live contacts management
  setLiveContacts: ({ commit }, contacts) => {
    commit('SET_LIVE_CONTACTS', contacts)
  },
  updateLiveContactLastCommProperties: ({ commit }, payload) => {
    commit('UPDATE_LIVE_CONTACT_LAST_COMM_PROPERTIES', payload)
  },
  removeLiveContact: ({ commit }, contactId) => {
    commit('REMOVE_LIVE_CONTACT', contactId)
  },

  // Task counts
  setOpenTaskCount: ({ commit }, count = 0) => {
    commit('SET_OPEN_TASK_COUNT', count)
  },
  setPendingTaskCount: ({ commit }, count = 0) => {
    commit('SET_PENDING_TASK_COUNT', count)
  },
  setInboxOpenTaskCount: ({ commit }, count = 0) => {
    commit('SET_INBOX_OPEN_TASK_COUNT', count)
  },
  setInboxPendingTaskCount: ({ commit }, count = 0) => {
    commit('SET_INBOX_PENDING_TASK_COUNT', count)
  },

  // Loading states
  setLoadingOpenTaskCount: ({ commit }, loading = false) => {
    commit('SET_LOADING_OPEN_TASK_COUNT', loading)
  },
  setLoadingPendingTaskCount: ({ commit }, loading = false) => {
    commit('SET_LOADING_PENDING_TASK_COUNT', loading)
  },

  // Filter preferences
  setDefaultShowMyContacts: ({ commit }, value) => {
    commit('SET_DEFAULT_SHOW_MY_CONTACTS', value)
  }
}
