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
  }
}
