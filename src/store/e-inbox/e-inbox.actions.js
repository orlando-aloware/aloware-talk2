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
  setInboxesFirstPage: ({ commit }, inboxesFirstPage) => {
    commit('SET_INBOXES_FIRST_PAGE', inboxesFirstPage)
  }
}
