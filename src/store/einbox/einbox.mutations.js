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
  SET_VIEW_MODE (state, viewMode) {
    state.viewMode = viewMode
  },
  SET_ITEMS (state, items) {
    state.items = items
  },
  SET_IS_LOADING_ITEMS (state, loading) {
    state.isLoadingItems = loading
  },
  SET_CURRENT_ITEMS_PAGE (state, page) {
    state.currentItemsPage = page
  },
  SET_HAS_MORE_ITEMS (state, hasMore) {
    state.hasMoreItems = hasMore
  },
  RESET_ITEMS (state) {
    state.items = []
    state.currentItemsPage = 0
    state.hasMoreItems = true
  },
  APPEND_ITEMS (state, items) {
    state.items = [...state.items, ...items]
  },
  SET_IS_LOADING_MORE_ITEMS (state, loading) {
    state.isLoadingMoreItems = loading
  }
}
