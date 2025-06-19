import { THREADED, DEFAULT_FILTERS } from './teaminbox.store'

export default {
  SET_ACTIVE_INBOX_ID (state, inbox) {
    state.activeInboxId = inbox
  },
  SET_ACTIVE_INBOX (state, inbox) {
    state.activeInbox = inbox
  },
  SET_INBOXES (state, inboxesFirstPage) {
    state.inboxes = [ ...inboxesFirstPage ]
  },
  SET_HAS_ANY_INBOXES (state, hasAny) {
    state.hasAnyInboxes = hasAny
  },
  RESET_INBOXES (state) {
    state.inboxes = []
  },
  SET_IS_LOADING_INBOXES (state, loading) {
    state.isLoadingInboxes = loading
  },
  SET_INBOXES_UNREAD_COUNT (state, inboxesUnreadCount) {
    state.inboxesUnreadCount = [ ...inboxesUnreadCount ]
  },
  SET_IS_LOADING_INBOXES_UNREAD_COUNT (state, loading) {
    state.isLoadingInboxesUnreadCount = loading
  },
  SET_INBOXES_UNREAD_COUNT_SINGLE (state, data) {
    const index = state.inboxesUnreadCount.findIndex((inbox) => inbox.ring_group_id === data.ring_group_id)

    if (index !== -1) {
      state.inboxesUnreadCount[index] = {
        ring_group_id: data.ring_group_id,
        unread_count: data.unread_count
      }
    } else {
      state.inboxesUnreadCount.push({
        ring_group_id: data.ring_group_id,
        unread_count: data.unread_count
      })
    }
  },
  SET_CURRENT_INBOXES_PAGE (state, page) {
    state.currentInboxesPage = page
  },
  SET_HAS_MORE_INBOXES (state, hasMore) {
    state.hasMoreInboxes = hasMore
  },
  APPEND_INBOXES (state, inboxes) {
    state.inboxes = [ ...state.inboxes, ...inboxes ]
  },
  SET_VIEW_MODE (state, viewMode) {
    state.viewMode = viewMode
  },
  SET_ITEMS (state, items) {
    // Look for all the items and don't add the ones that do not have a contact.id
    const itemsWithContactId = items.filter((item) => item.contact.id)
    state.items = itemsWithContactId
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
    // Look for all the items and don't add the ones that do not have a contact.id
    const itemsWithContactId = items.filter((item) => item.contact.id)
    const allItems = [...state.items, ...itemsWithContactId]
    state.items = allItems
  },
  SET_IS_LOADING_MORE_ITEMS (state, loading) {
    state.isLoadingMoreItems = loading
  },
  SET_ABORT_CONTROLLER (state, abortController) {
    state.abortController = abortController
  },
  SET_SHOW_REFRESH_INBOXES_BUTTON (state, show) {
    state.showRefreshInboxesButton = show
  },
  SET_SHOW_REFRESH_COMMUNICATIONS_BUTTON (state, show) {
    state.showRefreshCommunicationsButton = show
  },
  SET_ACTIVE_SORT (state, sort) {
    state.activeSort = sort
  },
  SET_CURRENT_SEARCH (state, search) {
    state.currentSearch = search
  },
  SET_IS_INITIAL_LOAD (state, isInitial) {
    state.isInitialLoad = isInitial
  },
  SET_ACTIVE_INBOX_COMMUNICATION_UNREAD_COUNT (state, count) {
    state.activeInboxContactUnreadCount = count
  },
  SET_INBOX_ANNOUNCEMENT_VIEWED (state, viewed) {
    state.inboxAnnouncementViewed = viewed
  },
  SET_UNREAD_COUNT_LOADED (state, loaded) {
    state.unreadCountLoaded = loaded
  },
  SET_TEAM_INBOX_TUTORIAL_COMPONENT (state, ref) {
    state.teamInboxTutorialComponent = ref
  },
  SET_TEAM_INBOX_EMPTY_STATE_VIDEO_COMPONENT (state, ref) {
    state.teamInboxEmptyStateVideoComponent = ref
  },
  SET_CONTACTS_LAST_USED_LINE (state, { inboxId, contactId, lastLineUsed }) {
    state.contactsLastUsedLines.set(`${inboxId}-${contactId}`, lastLineUsed)
  },
  RESET (state) {
    state.inboxes = []
    state.isLoadingInboxes = false
    state.inboxesUnreadCount = []
    state.isLoadingInboxesUnreadCount = false
    state.currentInboxesPage = 0
    state.items = []
    state.isLoadingItems = false
    state.currentItemsPage = 0
    state.abortController = null
    state.showRefreshInboxesButton = false
    state.showRefreshCommunicationsButton = false
    state.currentSearch = null
    state.isInitialLoad = false
    state.activeInboxContactUnreadCount = 0
    state.unreadCountLoaded = false
    state.viewMode = THREADED
    state.activeFilters = DEFAULT_FILTERS
    state.activeSort = {}
    state.teamInboxTutorialComponent = null
    state.contactsLastUsedLines = new Map()
  }
}
