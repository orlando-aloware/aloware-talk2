export default {
  SET_ACTIVE_INBOX (state, inbox) {
    state.activeInbox = inbox
  },
  SET_NEW_INBOX (state, enabled) {
    state.newInboxEnabled = enabled
  },
  SET_INBOXES_FIRST_PAGE (state, inboxesFirstPage) {
    state.inboxesFirstPage = inboxesFirstPage
  }
}
