export default {
  setInboxes: ({ commit, state }, data) => {
    commit('SET_INBOXES', data.data)

    // set all types to false at once
    if (data.next_page_url === null) {
      Object.keys(state.hasMoreInboxes).forEach(type => {
        commit('SET_HAS_MORE_INBOXES', { type, hasMore: false })
      })
    }
  },
  resetInboxes: ({ commit }) => {
    commit('RESET_INBOXES')
  },
  setActiveInboxId: ({ commit }, inboxId) => {
    commit('SET_ACTIVE_INBOX_ID', inboxId)
  },
  setActiveInbox: ({ commit }, inbox) => {
    commit('SET_ACTIVE_INBOX', inbox)
  },
  setIsLoadingInboxes: ({ commit }, loading) => {
    commit('SET_IS_LOADING_INBOXES', loading)
  },
  appendInboxes: ({ commit, state }, { data, type }) => {
    // append only new inboxes
    commit('APPEND_INBOXES', data.data.filter(inbox => !state.inboxes.find(i => i.id === inbox.id)))
    // sort inboxes by name
    commit('SET_INBOXES', [...state.inboxes.sort((a, b) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1)])
    commit('SET_HAS_MORE_INBOXES', { hasMore: data.next_page_url !== null, type })
    commit('SET_CURRENT_INBOXES_PAGE', { page: data.current_page, type })
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
  },
  setAbortController: ({ commit }, abortController) => {
    commit('SET_ABORT_CONTROLLER', abortController)
  },
  setShowRefreshInboxesButton: ({ commit }, show) => {
    commit('SET_SHOW_REFRESH_INBOXES_BUTTON', show)
  },
  setShowRefreshCommunicationsButton: ({ commit }, show) => {
    commit('SET_SHOW_REFRESH_COMMUNICATIONS_BUTTON', show)
  }
}
