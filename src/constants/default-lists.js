import {
  DEFAULT_COLUMNS,
  STATIC_COLUMNS
} from 'src/constants/contacts-columns'
import {
  PD_DEFAULT_COLUMNS
} from 'src/constants/power-dialer/power-dialer-list'
import { OPERATORS } from 'src/constants/contacts-filter-operators'

export const DEFAULT_STATE = {
  lists: {
    all: {
      id: 'all',
      headers: DEFAULT_COLUMNS,
      filters: {},
      type: 2,
      module_type: 0,
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
      module_type: 0,
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
      module_type: 0,
      name: 'Unassigned Contacts'
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
      module_type: 0,
      name: 'Unanswered Contacts'
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
      module_type: 0,
      name: 'New Leads'
    },
    static: {
      id: 'static',
      headers: STATIC_COLUMNS,
      filters: {}
    },
    'my-queue': {
      id: 'my-queue',
      headers: PD_DEFAULT_COLUMNS,
      filters: {},
      type: 2,
      module_type: 1,
      name: 'My Queue'
    }
  }
}
