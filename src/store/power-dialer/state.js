import {
  DEFAULT_COLUMNS
} from 'src/constants/contacts-columns'
import {
  DEFAULT_CONTACT_LIST_ITEMS
} from 'src/constants/contacts-list-item-default'
import { OPERATORS } from 'src/constants/contacts-filter-operators'

export default function () {
  return {
    filters: [],
    opened: [],
    folders: [],
    pinned: [],
    removeFolder: null,
    lists: null,
    powerDialerListItems: {
      'all': DEFAULT_CONTACT_LIST_ITEMS,
      'my-queue': DEFAULT_CONTACT_LIST_ITEMS,
      'in-queue': DEFAULT_CONTACT_LIST_ITEMS,
      'called': DEFAULT_CONTACT_LIST_ITEMS,
      'failed': DEFAULT_CONTACT_LIST_ITEMS,
      'scheduled': DEFAULT_CONTACT_LIST_ITEMS
    },
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
        filters: [
          // {
          //   filters: {
          //     in_queue: {
          //       value: 1
          //     }
          //   },
          //   is_conjunction: true
          // }
        ],
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
    // powerDialerList: null,
    contactResources: [],
    contacts: [],
    selectedContacts: {},
    isStartingDial: false,
    searchedListItem: '',
    currentListFilters: [],
    currentList: null,
    datatableLoader: false,
    search: '',
    contact: null,
    sessionLoader: false
  }
}
