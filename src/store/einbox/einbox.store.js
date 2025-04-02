export const THREADED = 1
export const UNTHREADED = 2
export const INBOX_TYPE_CONNECTED = 'connected'
export const INBOX_TYPE_WATCHING = 'watching'

export default function () {
  return {
    activeInboxId: null,
    activeInbox: {},
    inboxes: [],
    isLoadingInboxes: false,
    currentInboxesPage: {
      [INBOX_TYPE_CONNECTED]: 1,
      [INBOX_TYPE_WATCHING]: 1
    },
    hasMoreInboxes: {
      [INBOX_TYPE_CONNECTED]: true,
      [INBOX_TYPE_WATCHING]: true
    },
    viewMode: THREADED,
    items: [],
    isLoadingItems: false,
    isLoadingMoreItems: false,
    currentItemsPage: 0,
    hasMoreItems: true,
    abortController: null,
    showRefreshInboxesButton: false,
    showRefreshCommunicationsButton: false
  }
}
