import moment from 'moment'

export const THREADED = 1
export const UNTHREADED = 2
export const INBOX_TYPE_PERSONAL = 'personal'
export const INBOX_TYPE_CONNECTED = 'connected'
export const INBOX_TYPE_WATCHING = 'watching'
export const SEARCH_FIELDS = ['lead_number', 'contact.name', 'campaign.name']
export const DEFAULT_FILTERS = {
  channels: [],
  campaigns: [],
  directions: [],
  my_contact: false,
  unread_only: false,
  task_status: [],
  mention: false,
  date_range: 'Last 30 Days',
  from_date: moment().subtract(30, 'days').startOf('day').format('YYYY-MM-DD HH:mm:ss'),
  to_date: moment().endOf('day').format('YYYY-MM-DD HH:mm:ss')
}

export default function () {
  return {
    activeInboxId: null,
    activeInbox: {},
    inboxes: [],
    hasAnyInboxes: false, // Flag to track if user has any inboxes (from initial load)
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
    activeFilters: { ...DEFAULT_FILTERS },
    selectedFilter: null,
    activeSort: {},
    currentSearch: null,
    isInitialLoad: false,
    activeInboxContactUnreadCount: 0,
    inboxAnnouncementViewed: false,
    unreadCountLoaded: false,
    teamInboxTutorialComponent: null,
    teamInboxEmptyStateVideoComponent: null,
    contactsLastUsedLines: new Map()
  }
}
