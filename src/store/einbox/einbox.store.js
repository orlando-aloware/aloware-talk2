export const THREADED = 1
export const UNTHREADED = 2

export default function () {
  return {
    activeInbox: null,
    newInboxEnabled: false,
    inboxes: [],
    isLoadingInboxes: false,
    currentInboxesPage: 0,
    hasMoreInboxes: true,
    viewMode: THREADED,
    items: [],
    isLoadingItems: false,
    isLoadingMoreItems: false,
    currentItemsPage: 0,
    hasMoreItems: true
  }
}
