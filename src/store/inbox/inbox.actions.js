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
  setCommunicationsCurrentPage: ({ commit }, page) => {
    commit('SET_COMMUNICATIONS_CURRENT_PAGE', page)
  },
  resetInboxVuex: ({ commit }) => {
    commit('RESET_INBOX_VUEX')
  },
  gettingTasksList: ({ commit }, isGetting) => {
    commit('GETTING_TASKS_LIST', isGetting)
  },
  gettingContactsList: ({ commit }, isGetting) => {
    commit('GETTING_CONTACTS_LIST', isGetting)
  },
  setActiveChannel: ({ commit }, channel) => {
    commit('SET_ACTIVE_CHANNEL', channel)
  },
  setTaskCount: ({ commit }, payload) => {
    commit('SET_TASK_COUNT', payload)
  },
  setOpenTaskCount: ({ commit }, count = 0) => {
    commit('SET_OPEN_TASK_COUNT', count)
  },
  setPendingTaskCount: ({ commit }, count = 0) => {
    commit('SET_PENDING_TASK_COUNT', count)
  },
  setContact: ({ commit }, payload) => {
    commit('SET_CONTACT', payload)
  },
  setContacts: ({ commit }, contacts) => {
    commit('SET_CONTACTS', contacts)
  },
  setContactsCurrentPage: ({ commit }, page) => {
    commit('SET_CONTACTS_CURRENT_PAGE', page)
  },
  setSelectedContact: ({ commit }, contact) => {
    commit('SET_SELECTED_CONTACT', contact)
  },
  setChannelClonedFilter: ({ commit }, filter) => {
    commit('SET_CHANNEL_CLONED_FILTER', filter)
  },
  updateChannelChangedFilterFields: ({ commit }, params) => {
    commit('UPDATE_CHANNEL_CHANGED_FILTER_FIELDS', params)
  },
  resetChannelChangedFilterFields: ({ commit }) => {
    commit('RESET_CHANNEL_CHANGED_FILTER_FIELDS')
  },
  toggleFilterModelForm: ({ commit }, isShown = false) => {
    commit('TOGGLE_FILTER_MODEL_FORM', isShown)
  },
  setSelectedFilter: ({ commit }, selectedFilter) => {
    commit('SET_SELECTED_FILTER', selectedFilter)
  },
  setHasMoreContacts: ({ commit }, hasMore = false) => {
    commit('SET_HAS_MORE_CONTACTS', hasMore)
  },
  setHasMoreCommunications: ({ commit }, hasMore = false) => {
    commit('SET_HAS_MORE_COMMUNICATIONS', hasMore)
  },

  setSearcherOpen: ({ commit }, isOpen = false) => {
    commit('SET_SEARCHER_OPEN', isOpen)
  }
}
