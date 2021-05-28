import {
  DEFAULT_COLUMNS,
  DEFAULT_CONTACT_LIST_ITEMS,
  STATIC_COLUMNS
} from 'src/constants/contacts-list-types'

export default function () {
  return {
    listItems: {
      allContacts: DEFAULT_CONTACT_LIST_ITEMS,
      myContacts: DEFAULT_CONTACT_LIST_ITEMS,
      unassigned: DEFAULT_CONTACT_LIST_ITEMS,
      unanswered: DEFAULT_CONTACT_LIST_ITEMS,
      newLeads: DEFAULT_CONTACT_LIST_ITEMS
    },
    lists: {
      allContacts: {
        headers: DEFAULT_COLUMNS,
        filters: {}
      },
      myContacts: {
        headers: DEFAULT_COLUMNS,
        filters: {
          user_id: null
        }
      },
      unassigned: {
        headers: DEFAULT_COLUMNS,
        filters: {
          unassigned_leads: 1
        }
      },
      unanswered: {
        headers: DEFAULT_COLUMNS,
        filters: {
          has_unread: 1
        }
      },
      newLeads: {
        headers: DEFAULT_COLUMNS,
        filters: {
          is_new_lead: 1
        }
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
      allContacts: {
        new_leads_count: 0,
        total_contact_count: 0,
        unreads_count: 0
      },
      myContacts: {
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
      newLeads: { new_leads_count: 0, total_contact_count: 0, unreads_count: 0 }
    },
    removeContact: null,
    removeFolder: null,
    removeList: null,
    moveDialog: {
      open: false,
      id: null,
      type: 'folder',
      target: null
    },
    createList: {
      open: false,
      folderId: null
    }
  }
}
