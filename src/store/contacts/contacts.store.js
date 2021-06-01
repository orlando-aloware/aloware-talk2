import {
  DEFAULT_COLUMNS,
  DEFAULT_CONTACT_LIST_ITEMS,
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
        headers: DEFAULT_COLUMNS,
        filters: {},
        type: 2,
        name: 'All Contacts'
      },
      'my-contacts': {
        headers: DEFAULT_COLUMNS,
        filters: {
          user_id: null
        },
        type: 2,
        name: 'My Contacts'
      },
      unassigned: {
        headers: DEFAULT_COLUMNS,
        filters: {
          unassigned_leads: 1
        },
        type: 2,
        name: 'Unassigned'
      },
      unanswered: {
        headers: DEFAULT_COLUMNS,
        filters: {
          has_unread: 1
        },
        type: 2,
        name: 'Unanswered'
      },
      'new-leads': {
        headers: DEFAULT_COLUMNS,
        filters: {
          is_new_lead: 1
        },
        type: 2,
        name: 'New Leads'
      },
      static: {
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
      all: {
        new_leads_count: 0,
        total_contact_count: 0,
        unreads_count: 0
      },
      'my-contacts': {
        new_leads_count: 0,
        total_contact_count: 0,
        unreads_count: 0
      },
      unassigned: {
        new_leads_count: 0,
        total_contact_count: 0,
        unreads_count: 0
      },
      unanswered: {
        new_leads_count: 0,
        total_contact_count: 0,
        unreads_count: 0
      },
      'new-leads': { new_leads_count: 0, total_contact_count: 0, unreads_count: 0 }
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
