import { DEFAULT_COLUMNS } from 'src/constants/columns'

export default function () {
  return {
    listItems: {
      allContacts: {
        current_page: 1,
        data: [],
        first_page_url: null,
        from: 1,
        new_leads_count: 0,
        next_page_url: null,
        path: null,
        per_page: 20,
        prev_page_url: null,
        to: 20,
        total_contact_count: 0,
        unreads_count: 0
      },
      myContacts: {
        current_page: 1,
        data: [],
        first_page_url: null,
        from: 1,
        new_leads_count: 0,
        next_page_url: null,
        path: null,
        per_page: 20,
        prev_page_url: null,
        to: 20,
        total_contact_count: 0,
        unreads_count: 0
      },
      unassigned: {
        current_page: 1,
        data: [],
        first_page_url: null,
        from: 1,
        new_leads_count: 0,
        next_page_url: null,
        path: null,
        per_page: 20,
        prev_page_url: null,
        to: 20,
        total_contact_count: 0,
        unreads_count: 0
      },
      unanswered: {
        current_page: 1,
        data: [],
        first_page_url: null,
        from: 1,
        new_leads_count: 0,
        next_page_url: null,
        path: null,
        per_page: 20,
        prev_page_url: null,
        to: 20,
        total_contact_count: 0,
        unreads_count: 0
      },
      newleads: {
        current_page: 1,
        data: [],
        first_page_url: null,
        from: 1,
        new_leads_count: 0,
        next_page_url: null,
        path: null,
        per_page: 20,
        prev_page_url: null,
        to: 20,
        total_contact_count: 0,
        unreads_count: 0
      }
    },
    lists: {
      allContacts: {
        headers: DEFAULT_COLUMNS,
        filters: []
      },
      myContacts: {
        headers: DEFAULT_COLUMNS,
        filters: []
      },
      unassigned: {
        headers: DEFAULT_COLUMNS,
        filters: []
      },
      unanswered: {
        headers: DEFAULT_COLUMNS,
        filters: []
      },
      newleads: {
        headers: DEFAULT_COLUMNS,
        filters: []
      }
    },
    columnsUpdating: null,
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
      newleads: { new_leads_count: 0, total_contact_count: 0, unreads_count: 0 }
    },
    removeContact: null,
    removeFolder: null,
    removeList: null
  }
}
