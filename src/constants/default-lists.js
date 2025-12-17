import {
  DEFAULT_COLUMNS,
  STATIC_COLUMNS,
  POWER_DIALER_DEFAULT_COLUMNS
} from 'src/constants/contacts-columns'
import { OPERATORS } from 'src/constants/contacts-filter-operators'
import { BOOLEAN_OPERATORS } from 'src/constants/contacts-boolean-filter-operators'

export const DEFAULT_STATE = {
  lists: {
    all: {
      id: 'all',
      headers: DEFAULT_COLUMNS,
      filters: [],
      type: 2,
      module_type: 0,
      name: 'All Contacts'
    },
    'my-contacts': {
      id: 'my-contacts',
      headers: DEFAULT_COLUMNS,
      filters: [
        {
          filters: {
            contact_owner: [
              {
                default: 1,
                value: null,
                operator: OPERATORS.IS_ANY_OF
              }
            ]
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
            is_unassigned: [
              {
                value: 1,
                operator: BOOLEAN_OPERATORS.IS_EQUAL_TO,
                default: 1
              }
            ]
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
            is_unanswered_contact: [
              {
                value: 1,
                operator: BOOLEAN_OPERATORS.IS_EQUAL_TO,
                default: 1
              }
            ]
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
            contact_task_status: [
              {
                value: [1],
                operator: OPERATORS.IS_ANY_OF,
                default: 1
              }
            ]
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
      headers: POWER_DIALER_DEFAULT_COLUMNS,
      filters: {},
      type: 2,
      module_type: 1,
      name: 'My Queue'
    },
    'unsaved': {
      id: 'unsaved',
      headers: DEFAULT_COLUMNS,
      filters: [],
      type: 2,
      module_type: 1,
      name: ''
    }
  }
}

export const DEFAULT_DYNAMIC_LIST_TEMPLATE_REQUEST = {
  contact_folder_id: null,
  headers: DEFAULT_COLUMNS,
  mode: '',
  name: '',
  order: 0,
  type: 2
}

export const DEFAULT_DYNAMIC_LIST_TEMPLATE_RESPONSE = {
  company_id: null,
  contact_folder_id: null,
  created_at: '',
  filters: [],
  headers: DEFAULT_COLUMNS,
  id: null,
  module_type: 1,
  name: null,
  order: null,
  type: 2,
  updated_at: ''
}
