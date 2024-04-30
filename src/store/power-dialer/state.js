import {
  DEFAULT_COLUMNS
} from 'src/constants/contacts-columns'
import {
  DEFAULT_CONTACT_LIST_ITEMS
} from 'src/constants/contacts-list-item-default'
import { OPERATORS } from 'src/constants/contacts-filter-operators'

export default function () {
  return {
    isSessionRunning: false,
    sessionCallStatuses: {
      pause: false,
      end: false,
      recording: false,
      hold: false,
      next: false,
      mute: false
    },
    countdownTimer: -1,
    flaggedCreateExisting: false,
    myQueue: null,
    myQueueListFilters: null,
    filters: [],
    opened: [],
    folders: [],
    pinned: [],
    removeFolder: null,
    lists: null,
    powerDialerListItems: {
      'all': DEFAULT_CONTACT_LIST_ITEMS,
      'my-queue': DEFAULT_CONTACT_LIST_ITEMS,
      'called': DEFAULT_CONTACT_LIST_ITEMS,
      'failed': DEFAULT_CONTACT_LIST_ITEMS,
      'scheduled': DEFAULT_CONTACT_LIST_ITEMS
    },
    filteredEndpoint: '',
    powerDialerLists: {
      'all': {
        id: 'all',
        headers: DEFAULT_COLUMNS,
        filters: {},
        name: 'All'
      },
      'my-queue': {
        all: 'my-queue',
        headers: DEFAULT_COLUMNS,
        filters: [
          {
            filters: {
              contact_owner: {
                value: null,
                operator: OPERATORS.IS_ANY_OF
              }
            },
            is_conjunction: true
          }
        ],
        name: 'My Queue'
      },
      'in-queue': {
        id: 'in-queue',
        headers: DEFAULT_COLUMNS,
        filters: [],
        name: 'In Queue'
      },
      'called': {
        id: 'called',
        headers: DEFAULT_COLUMNS,
        filters: [
          {
            filters: {
              called: {
                value: 1
              }
            },
            is_conjunction: true
          }
        ],
        name: 'Called'
      },
      'failed': {
        id: 'failed',
        headers: DEFAULT_COLUMNS,
        filters: [
          {
            filters: {
              failed: {
                value: 1
              }
            },
            is_conjunction: true
          }
        ],
        name: 'Failed'
      },
      'scheduled': {
        id: 'scheduled',
        headers: DEFAULT_COLUMNS,
        filters: [
          {
            filters: {
              scheduled: {
                value: 1
              }
            },
            is_conjunction: true
          }
        ],
        name: 'Scheduled'
      }
    },
    removeList: null,
    createList: {
      name: '',
      mode: '', // from_filters, from_bulk_menu, from_folders
      type: 1,
      open: false,
      contact_folder_id: null,
      filters: []
    },
    moveDialog: {
      open: false,
      id: null,
      type: 'folder',
      target: null
    },
    createDialog: {
      open: false,
      id: null,
      type: 'list',
      target: null
    },
    contactResources: [],
    isStartingDial: false,
    searchedListItem: '',
    currentListFilters: [],
    datatableLoader: false,
    search: '',
    contact: null,
    sessionLoader: false,
    sessionSidebarExpanded: false,
    sessionSettings: {},
    dialerSessionSettings: [],
    changingSelectedContact: false,
    activeFilter: '',
    sessionSettingGroups: {
      personal: [],
      company: []
    },
    warmupDurations: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
    powerDialerTasks: {
      in_queue: [],
      skipped: [],
      called: [],
      failed: [],
      scheduled: [],
      all: []
    },
    powerDialerTaskFilters: {
      in_queue: null,
      skipped: [],
      called: null,
      failed: null,
      scheduled: null,
      all: null
    },
    inQueueFetchTasks: {
      currentPage: 0,
      fetchedTasks: 0,
      totalTasks: 0
    },
    activeTask: {},
    hasActiveTask: false,
    taskToCall: {},
    selectedDialerSessionId: null,
    sessionPaused: false,
    selectedPdList: {},
    metrics: [],
    activeMetrics: [],
    activeList: {},
    hubspot: {},
    powerDialerActiveList: {
      data: []
    },
    ongoingSession: {
      finishedPdSession: true,
      totalSeconds: null,
      startTime: null,
      currentTime: null,
      listId: null
    },
    redialed: [],
    pdViewSource: null,
    pdViewCancelToken: null
  }
}
