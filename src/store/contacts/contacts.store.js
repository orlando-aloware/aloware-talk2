import {
  DEFAULT_COLUMNS,
  STATIC_COLUMNS
} from 'src/constants/contacts-columns'
import { DEFAULT_CONTACT_LIST_ITEMS } from 'src/constants/contacts-list-item-default'
import { OPERATORS } from 'src/constants/contacts-filter-operators'

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
    removeListActionType: null,
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
    selectedContacts: {},
    selectedList: {
      id: 'all',
      name: 'All Contacts',
      contactCount: 0
    },
    shouldUpdateSelectedListContactCount: false,
    selectedStaticList: {
      id: null,
      name: '',
      type: null,
      hasEdit: 0,
      hasDelete: 0
    },
    createList: {
      name: '',
      mode: '', // from_filters, from_bulk_menu, from_folders
      type: 1,
      open: false,
      contact_folder_id: null,
      filters: []
    },
    selectList: {
      contact_list_id: null,
      open: false,
      search_value: ''
    },
    filters: [],
    currentListFilters: {},
    contact: {},
    contactClone: {},
    changedContactProperties: [],
    contactPhoneNumbers: [],
    contactRingGroups: [],
    contactAttributes: [],
    isSidebarCollapsed: false,
    isContactNameEditOpen: false,
    contactSelectedPhone: null,
    selectedLine: null,
    messageComposer: {
      mode: 'sms',
      sms: {
        body: '',
        phone_number: null,
        attachments: [],
        gif_url: '',
        schedule_date: null
      },

      fax: {
        filename: ''
      },

      email: {
        subject: '',
        body: '',
        attachments: []
      },
      note: {
        body: '',
        type: 10,
        date: null,
        time: null,
        timezone: null
      }
    },
    isScheduleMessageOpen: false,
    isScheduledMessageListOpen: false,
    isAddAppointmentOpen: false,
    isAppointmentSubmitted: false,
    isEnrollSequenceOpen: false,
    isAddReminderOpen: false,
    changingSelectedContact: false,
    smsTemplateModal: {
      open: false,
      scope: 'user',
      template: null
    },
    search: '',
    searchedPdItem: '',
    showMenu: false
  }
}
