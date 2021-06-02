import {
  DEFAULT_COLUMNS,
  DEFAULT_CONTACT_LIST_ITEMS,
  OPERATORS,
  STATIC_COLUMNS
} from 'src/constants/contacts-list-types'

export default function () {
  return {
    listItems: {
      all: DEFAULT_CONTACT_LIST_ITEMS,
      'my-contacts': DEFAULT_CONTACT_LIST_ITEMS,
      unassigned: DEFAULT_CONTACT_LIST_ITEMS,
      unanswered: DEFAULT_CONTACT_LIST_ITEMS,
      'new-leads': DEFAULT_CONTACT_LIST_ITEMS
    },
    lists: {
      all: {
        id: 'all',
        headers: DEFAULT_COLUMNS,
        filters: {},
        type: 2,
        name: 'All Contacts'
      },
      'my-contacts': {
        all: 'my-contacts',
        headers: DEFAULT_COLUMNS,
        filters: {
          contact_owner: {
            value: null,
            operator: OPERATORS.IS_ANY_OF
          }
        },
        type: 2,
        name: 'My Contacts'
      },
      unassigned: {
        id: 'unassigned',
        headers: DEFAULT_COLUMNS,
        filters: {
          is_unassigned: {
            value: 1
          }
        },
        type: 2,
        name: 'Unassigned'
      },
      unanswered: {
        id: 'unanswered',
        headers: DEFAULT_COLUMNS,
        filters: {
          is_unanswered_contact: {
            value: 1
          }
        },
        type: 2,
        name: 'Unanswered'
      },
      'new-leads': {
        id: 'new-leads',
        headers: DEFAULT_COLUMNS,
        filters: {
          is_new_contact: {
            value: 1
          }
        },
        type: 2,
        name: 'New Leads'
      },
      static: {
        id: 'static',
        headers: STATIC_COLUMNS,
        filters: {}
      }
    },
    columns: null,
    folders: [],
    isFiltersOpen: false,
    opened: [],
    pinned: [],
    pinnedCounts: {
      all: 0,
      'my-contacts': 0,
      unassigned: 0,
      unanswered: 0,
      'new-leads': 0
    },
    removeContact: null,
    removeContactActionType: null,
    isBulkDelete: false,
    removeFolder: null,
    removeList: null,
    moveDialog: {
      open: false,
      id: null,
      type: 'folder',
      target: null
    },
    selectedContacts: {},
    selectedList: {
      id: 'all',
      name: 'All Contacts'
    },
    createList: {
      open: false,
      folderId: null
    },
    filters: []
  }
}
