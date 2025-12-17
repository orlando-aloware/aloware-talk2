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

  // Filter preferences
  setDefaultShowMyContacts: ({ commit }, value) => {
    commit('SET_DEFAULT_SHOW_MY_CONTACTS', value)
  }
}
