import { DEFAULT_COLUMNS, OPERATORS, STATIC_COLUMNS } from 'src/constants/contacts-list-types'

export const DEFAULT_STATE = {
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
      type: 2,
      name: 'My Contacts'
    },
    unassigned: {
      id: 'unassigned',
      headers: DEFAULT_COLUMNS,
      filters: [
        {
          filters: {
            is_unassigned: {
              value: 1
            }
          },
          is_conjunction: true
        }
      ],
      type: 2,
      name: 'Unassigned'
    },
    unanswered: {
      id: 'unanswered',
      headers: DEFAULT_COLUMNS,
      filters: [
        {
          filters: {
            is_unanswered_contact: {
              value: 1
            }
          },
          is_conjunction: true
        }
      ],
      type: 2,
      name: 'Unanswered'
    },
    'new-leads': {
      id: 'new-leads',
      headers: DEFAULT_COLUMNS,
      filters: [
        {
          filters: {
            is_new_contact: {
              value: 1
            }
          },
          is_conjunction: true
        }
      ],
      type: 2,
      name: 'New Leads'
    },
    static: {
      id: 'static',
      headers: STATIC_COLUMNS,
      filters: {}
    }
  }
}
