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
  setInboxes: ({ commit }, inboxes) => {
    commit('SET_INBOXES', inboxes)
  },
  setActiveInbox: ({ commit }, inbox) => {
    commit('SET_ACTIVE_INBOX', inbox)
  },
  setIsLoadingInboxes: ({ commit }, loading) => {
    commit('SET_IS_LOADING_INBOXES', loading)
  }
}
