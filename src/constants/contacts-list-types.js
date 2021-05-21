export const STATIC = 1
export const DYNAMIC = 2

export const DEFAULT_CONTACT_LIST = {
  ALL_CONTACTS: {
    id: 'allContacts',
    link: '/contacts',
    name: 'All Contacts'
  },
  MY_CONTACTS: {
    id: 'myContacts',
    link: '/contacts/my-contacts',
    name: 'My Contacts'
  },
  UNASSIGNED: {
    id: 'unassigned',
    name: 'Unassigned Contacts',
    link: '/contacts/unassigned'
  },
  UNANSWERED: {
    id: 'unanswered',
    name: 'Unanswered Contacts',
    link: '/contacts/unanswered'
  },
  NEWLEADS: {
    id: 'newLeads',
    name: 'New Leads',
    link: '/contacts/new-leads'
  }
}
