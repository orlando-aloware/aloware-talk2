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
  setHasAnyInboxes: ({ commit }, hasAny) => {
    commit('SET_HAS_ANY_INBOXES', hasAny)
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
  setInboxesUnreadCountSingle: ({ commit }, data) => {
    commit('SET_INBOXES_UNREAD_COUNT_SINGLE', data)
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
  setViewMode: ({ commit }, value) => {
    commit('SET_VIEW_MODE', value)
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
  setActiveSort: ({ commit }, value) => {
    commit('SET_ACTIVE_SORT', value)
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
  setInboxAnnouncementViewed: ({ commit }, viewed) => {
    commit('SET_INBOX_ANNOUNCEMENT_VIEWED', viewed)
  },
  reset: ({ commit }) => {
    commit('RESET')
  },
  setUnreadCountLoaded: ({ commit }, loaded) => {
    commit('SET_UNREAD_COUNT_LOADED', loaded)
  },
  setTeamInboxTutorialComponent: ({ commit }, ref) => {
    commit('SET_TEAM_INBOX_TUTORIAL_COMPONENT', ref)
  },
  setTeamInboxEmptyStateVideoComponent: ({ commit }, ref) => {
    commit('SET_TEAM_INBOX_EMPTY_STATE_VIDEO_COMPONENT', ref)
  },
  setContactsLastUsedLines: ({ commit }, { inboxId, data }) => {
    for (const item of data) {
      const { last_line_used: lastLineUsed, contact_id: contactId } = item
      if (lastLineUsed) {
        commit('SET_CONTACTS_LAST_USED_LINE', { inboxId, contactId, lastLineUsed })
      }
    }
  },
  setTeamInboxCampaigns: ({ commit }, data) => {
    commit('SET_TEAM_INBOX_CAMPAIGNS', data)
  },
  setCampaignsIsLoading: ({ commit }, loading) => {
    commit('SET_LOADING_TEAM_INBOX_CAMPAIGNS', loading)
  }
}
