export default {
  SET_ACTIVE_INBOX (state, inbox) {
    state.activeInbox = inbox
  },
  SET_NEW_INBOX (state, enabled) {
    state.newInboxEnabled = enabled
  },
  SET_INBOXES (state, inboxesFirstPage) {
    state.inboxes = [ ...inboxesFirstPage ]
  },
  SET_IS_LOADING_INBOXES (state, loading) {
    state.isLoadingInboxes = loading
  },
  SET_CURRENT_INBOXES_PAGE (state, page) {
    state.currentInboxesPage = page
  },
  SET_HAS_MORE_INBOXES (state, hasMore) {
    state.hasMoreInboxes = hasMore
  },
  SET_COMMUNICATION_TYPE (state, communicationType) {
    state.communicationType = communicationType
  },
  SET_COMMUNICATIONS (state, communications) {
    state.communications = communications
  },
  SET_IS_LOADING_COMMUNICATIONS (state, loading) {
    state.isLoadingCommunications = loading
  },
  SET_CURRENT_COMMUNICATIONS_PAGE (state, page) {
    state.currentCommunicationsPage = page
  },
  SET_HAS_MORE_COMMUNICATIONS (state, hasMore) {
    state.hasMoreCommunications = hasMore
  },
  RESET_COMMUNICATIONS_STATE (state) {
    state.communications = []
    state.currentCommunicationsPage = 0
    state.hasMoreCommunications = true
  },
  APPEND_COMMUNICATIONS (state, communications) {
    state.communications = [...state.communications, ...communications]
  },
  SET_IS_LOADING_MORE_COMMUNICATIONS (state, loading) {
    state.isLoadingMoreCommunications = loading
  }
}
