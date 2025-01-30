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
  setCommunications: ({ commit }, data) => {
    console.log('data in actions', data)
    commit('SET_COMMUNICATIONS', data.data)
    commit('SET_HAS_MORE_COMMUNICATIONS', data.next_page_url !== null)
    commit('SET_CURRENT_COMMUNICATIONS_PAGE', data.current_page)
  },
  setIsLoadingCommunications: ({ commit }, loading) => {
    commit('SET_IS_LOADING_COMMUNICATIONS', loading)
  },
  resetCommunications: ({ commit }) => {
    commit('RESET_COMMUNICATIONS_STATE')
  },
  appendCommunications: ({ commit }, data) => {
    commit('APPEND_COMMUNICATIONS', data.data)
    commit('SET_HAS_MORE_COMMUNICATIONS', data.next_page_url !== null)
    commit('SET_CURRENT_COMMUNICATIONS_PAGE', data.current_page)
  },
  setIsLoadingMoreCommunications: ({ commit }, loading) => {
    commit('SET_IS_LOADING_MORE_COMMUNICATIONS', loading)
  }
}
