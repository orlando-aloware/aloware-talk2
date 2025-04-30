export default {
  setInboxes: ({ commit }, data) => {
    commit('SET_INBOXES', data.data)

    if (data.next_page_url) {
      commit('SET_HAS_MORE_INBOXES', data.next_page_url !== null)
    }

    if (data.current_page) {
      commit('SET_CURRENT_INBOXES_PAGE', data.current_page)
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
  setInboxesUnreadCount: ({ commit }, data) => {
    commit('SET_INBOXES_UNREAD_COUNT', data)
  },
  setIsLoadingInboxesUnreadCount: ({ commit }, loading) => {
    commit('SET_IS_LOADING_INBOXES_UNREAD_COUNT', loading)
  },
  setHasMoreInboxes: ({ commit }, hasMore) => {
    commit('SET_HAS_MORE_INBOXES', hasMore)
  },
  appendInboxes: ({ commit }, data) => {
    commit('APPEND_INBOXES', data.data)
    commit('SET_HAS_MORE_INBOXES', data.next_page_url !== null)
    commit('SET_CURRENT_INBOXES_PAGE', data.current_page)
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
  },
  setActiveFilters: ({ commit }, filters) => {
    commit('SET_ACTIVE_FILTERS', filters)
  },
  setActiveSort: ({ commit }, sort) => {
    commit('SET_ACTIVE_SORT', sort)
  },
  setCurrentSearch: ({ commit }, search) => {
    commit('SET_CURRENT_SEARCH', search)
  },
  setIsInitialLoad: ({ commit }, isInitial) => {
    commit('SET_IS_INITIAL_LOAD', isInitial)
  },
  setActiveInboxCommunicationUnreadCount: ({ commit }, data) => {
    commit('SET_ACTIVE_INBOX_COMMUNICATION_UNREAD_COUNT', data)
  },
  setTeamInboxAnnouncementViewed: ({ commit }, viewed) => {
    commit('SET_TEAM_INBOX_ANNOUNCEMENT_VIEWED', viewed)
  }
}
