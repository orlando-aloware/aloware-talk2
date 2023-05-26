export const DEFAULT_LIST_ALL_CONTACTS = 1
export const DEFAULT_LIST_MY_CONTACTS = 2
export const DEFAULT_LIST_UNASSIGNED_CONTACTS = 3
export const DEFAULT_LIST_UNANSWERED_CONTACTS = 4
export const DEFAULT_LIST_NEW_LEADS = 5
export const DEFAULT_PINNED_LIST = {
  ALL_CONTACTS: {
    id: 'all',
    name: 'All Contacts',
    link: '/contacts',
    listType: DEFAULT_LIST_ALL_CONTACTS
  },
  MY_CONTACTS: {
    id: 'my-contacts',
    name: 'My Contacts',
    link: '/contacts/lists/my-contacts',
    listType: DEFAULT_LIST_MY_CONTACTS
  },
  UNASSIGNED: {
    id: 'unassigned',
    name: 'Unassigned Contacts',
    link: '/contacts/lists/unassigned',
    listType: DEFAULT_LIST_UNASSIGNED_CONTACTS
  },
  UNANSWERED: {
    id: 'unanswered',
    name: 'Unanswered Contacts',
    link: '/contacts/list/unanswered',
    listType: DEFAULT_LIST_UNANSWERED_CONTACTS
  },
  NEWLEADS: {
    id: 'new-leads',
    name: 'New Leads',
    link: '/contacts/lists/new-leads',
    listType: DEFAULT_LIST_NEW_LEADS
  }
}
