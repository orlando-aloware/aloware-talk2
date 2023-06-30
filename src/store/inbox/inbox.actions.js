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
  setLiveContacts: ({ commit }, contacts) => {
    commit('SET_LIVE_CONTACTS', contacts)
  },
  updateLiveContactLastCommProperties: ({ commit }, payload) => {
    commit('UPDATE_LIVE_CONTACT_LAST_COMM_PROPERTIES', payload)
  },
  removeLiveContact: ({ commit }, contactId) => {
    commit('REMOVE_LIVE_CONTACT', contactId)
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
  toggleFilterDialog: ({ commit }, isShown = false) => {
    commit('TOGGLE_FILTER_DIALOG', isShown)
  },
  setFilterDialogForView: ({ commit }, state) => {
    commit('SET_FILTER_DIALOG_FOR_VIEW', state)
  },
  setSelectedFilter: ({ commit }, selectedFilter) => {
    commit('SET_SELECTED_FILTER', selectedFilter)
  },
  setAppliedFilter: ({ commit }, filter) => {
    commit('SET_APPLIED_FILTER', filter)
  },
  setHasMoreContacts: ({ commit }, hasMore = false) => {
    commit('SET_HAS_MORE_CONTACTS', hasMore)
  },
  setHasMoreCommunications: ({ commit }, hasMore = false) => {
    commit('SET_HAS_MORE_COMMUNICATIONS', hasMore)
  },

  setSearcherOpen: ({ commit }, isOpen = false) => {
    commit('SET_SEARCHER_OPEN', isOpen)
  },
  setLoadingOpenTaskCount: ({ commit }, loading = false) => {
    commit('SET_LOADING_OPEN_TASK_COUNT', loading)
  },
  setLoadingPendingTaskCount: ({ commit }, loading = false) => {
    commit('SET_LOADING_PENDING_TASK_COUNT', loading)
  },
  setInboxShowMyContacts: ({ commit }, value) => {
    commit('SET_INBOX_SHOW_MY_CONTACTS', value)
  },
  setDefaultShowMyContacts: ({ commit }, value) => {
    commit('SET_DEFAULT_SHOW_MY_CONTACTS', value)
  },
  setIsInboxFiltersLoaded: ({ commit }, value) => {
    commit('SET_IS_INBOX_FILTERS_LOADED', value)
  },
  setPinnedViews: ({ commit }, value) => {
    commit('SET_PINNED_VIEWS', value)
  }
}
