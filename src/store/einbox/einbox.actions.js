export default {
  toggleNewInbox: ({ commit, state }) => {
    const newValue = !state.newInboxEnabled
    commit('SET_NEW_INBOX', newValue)
    return {
      success: true,
      enabled: newValue
    }
  },
  initNewInbox: ({ commit }, enabled) => {
    commit('SET_NEW_INBOX', enabled)
  },
  setInboxes: ({ commit }, data) => {
    commit('SET_INBOXES', data.data)
    commit('SET_HAS_MORE_INBOXES', data.next_page_url !== null)
    commit('SET_CURRENT_INBOXES_PAGE', data.current_page)
  },
  setActiveInbox: ({ commit }, inbox) => {
    commit('SET_ACTIVE_INBOX', inbox)
  },
  setIsLoadingInboxes: ({ commit }, loading) => {
    commit('SET_IS_LOADING_INBOXES', loading)
  },
  setHasMoreInboxes: ({ commit }, hasMore) => {
    commit('SET_HAS_MORE_INBOXES', hasMore)
  },
  setCommunicationType: ({ commit }, communicationType) => {
    commit('SET_COMMUNICATION_TYPE', communicationType)
  },
  setContacts: ({ commit }, data) => {
    commit('SET_CONTACTS', data.data)
    commit('SET_HAS_MORE_CONTACTS', data.next_page_url !== null)
    commit('SET_CURRENT_CONTACTS_PAGE', data.current_page)
  },
  setIsLoadingContacts: ({ commit }, loading) => {
    commit('SET_IS_LOADING_CONTACTS', loading)
  },
  resetContacts: ({ commit }) => {
    commit('RESET_CONTACTS_STATE')
  },
  appendContacts: ({ commit }, data) => {
    commit('APPEND_CONTACTS', data.data)
    commit('SET_HAS_MORE_CONTACTS', data.next_page_url !== null)
    commit('SET_CURRENT_CONTACTS_PAGE', data.current_page)
  },
  setIsLoadingMoreContacts: ({ commit }, loading) => {
    commit('SET_IS_LOADING_MORE_CONTACTS', loading)
  }
}
