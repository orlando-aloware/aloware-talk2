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
  SET_CONTACTS (state, contacts) {
    state.contacts = contacts
  },
  SET_IS_LOADING_CONTACTS (state, loading) {
    state.isLoadingContacts = loading
  },
  SET_CURRENT_CONTACTS_PAGE (state, page) {
    state.currentContactsPage = page
  },
  SET_HAS_MORE_CONTACTS (state, hasMore) {
    state.hasMoreContacts = hasMore
  },
  RESET_CONTACTS_STATE (state) {
    state.contacts = []
    state.currentContactsPage = 0
    state.hasMoreContacts = true
  },
  APPEND_CONTACTS (state, contacts) {
    state.contacts = [...state.contacts, ...contacts]
  },
  SET_IS_LOADING_MORE_CONTACTS (state, loading) {
    state.isLoadingMoreContacts = loading
  }
}
