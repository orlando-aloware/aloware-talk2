export default {
  // toggleNewInbox: ({ commit, state }) => {
  //   const newValue = !state.newInboxEnabled
  //   commit('SET_NEW_INBOX', newValue)
  //   return {
  //     success: true,
  //     enabled: newValue
  //   }
  // },
  // initNewInbox: ({ commit }, enabled) => {
  //   commit('SET_NEW_INBOX', enabled)
  // },
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
  setViewMode: ({ commit }, viewMode) => {
    commit('SET_VIEW_MODE', viewMode)
  },
  setItems: ({ commit }, data) => {
    commit('SET_ITEMS', data.data)
    commit('SET_HAS_MORE_ITEMS', data.next_page_url !== null)
    commit('SET_CURRENT_ITEMS_PAGE', data.current_page)
  },
  setIsLoadingItems: ({ commit }, loading) => {
    commit('SET_IS_LOADING_ITEMS', loading)
  },
  resetItems: ({ commit }) => {
    commit('RESET_ITEMS')
  },
  appendItems: ({ commit }, data) => {
    commit('APPEND_ITEMS', data.data)
    commit('SET_HAS_MORE_ITEMS', data.next_page_url !== null)
    commit('SET_CURRENT_ITEMS_PAGE', data.current_page)
  },
  setIsLoadingMoreItems: ({ commit }, loading) => {
    commit('SET_IS_LOADING_MORE_ITEMS', loading)
  }
}
