export const THREADED = 1
export const UNTHREADED = 2
export const INBOX_TYPE_PERSONAL = 'personal'
export const INBOX_TYPE_CONNECTED = 'connected'
export const INBOX_TYPE_WATCHING = 'watching'

export default function () {
  return {
    activeInboxId: null,
    activeInbox: {},
    inboxes: [],
    isLoadingInboxes: false,
    inboxesUnreadCount: [],
    isLoadingInboxesUnreadCount: false,
    currentInboxesPage: 0,
    hasMoreInboxes: true,
    viewMode: THREADED,
    items: [],
    isLoadingItems: false,
    isLoadingMoreItems: false,
    currentItemsPage: 0,
    hasMoreItems: true,
    abortController: null,
    showRefreshInboxesButton: false,
    showRefreshCommunicationsButton: false,
    activeFilters: {},
    activeSort: {},
    currentSearch: null,
    isInitialLoad: false,
    activeInboxContactUnreadCount: 0,
    inboxAnnouncementViewed: false
  }
}
