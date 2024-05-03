import {
  DEFAULT_COLUMNS,
  STATIC_COLUMNS
} from 'src/constants/contacts-columns'
import { DEFAULT_CONTACT_LIST_ITEMS } from 'src/constants/contacts-list-item-default'
import { OPERATORS } from 'src/constants/contacts-filter-operators'
import { BOOLEAN_OPERATORS } from 'src/constants/contacts-boolean-filter-operators'

export const DEFAULT_STATE = {
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
      module_type: 0,
      name: 'All Contacts'
    },
    'my-contacts': {
      id: 'my-contacts',
      headers: DEFAULT_COLUMNS,
      filters: {
        contact_owner: [
          {
            value: null,
            operator: OPERATORS.IS_ANY_OF
          }
        ]
      },
      type: 2,
      module_type: 0,
      name: 'My Contacts'
    },
    unassigned: {
      id: 'unassigned',
      headers: DEFAULT_COLUMNS,
      filters: {
        is_unassigned: [
          {
            value: 1,
            operator: BOOLEAN_OPERATORS.IS_EQUAL_TO
          }
        ]
      },
      type: 2,
      module_type: 0,
      name: 'Unassigned Contacts'
    },
    unanswered: {
      id: 'unanswered',
      headers: DEFAULT_COLUMNS,
      filters: {
        is_unanswered_contact: [
          {
            value: 1,
            operator: BOOLEAN_OPERATORS.IS_EQUAL_TO
          }
        ]
      },
      type: 2,
      module_type: 0,
      name: 'Unanswered Contacts'
    },
    'new-leads': {
      id: 'new-leads',
      headers: DEFAULT_COLUMNS,
      filters: {
        contact_task_status: [
          {
            value: [1],
            operator: OPERATORS.IS_ANY_OF
          }
        ]
      },
      type: 2,
      module_type: 0,
      name: 'New Leads'
    },
    'my-queue': {
      id: 'my-queue',
      headers: DEFAULT_COLUMNS,
      // remove as per Karl
      filters: {},
      type: 1,
      module_type: 2,
      name: 'My Queue'
    },
    static: {
      id: 'static',
      headers: STATIC_COLUMNS,
      filters: {}
    },
    unsaved: {
      id: 'unsaved',
      headers: DEFAULT_COLUMNS,
      filters: {},
      type: 2,
      module_type: 1,
      name: ''
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
  selectedList: {
    id: 'all',
    name: 'All Contacts'
  },
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
  contactPhoneNumbers: [],
  contactRingGroups: [],
  contactAttributes: [],
  isSidebarCollapsed: false,
  isContactNameEditOpen: false,
  lines: [],
  ringGroups: [],
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
  isAddPowerDialerOpen: false,
  isEnrollSequenceOpen: false,
  isAddReminderOpen: false,
  isOptoutActive: true,
  optoutText: '\nText STOP to unsubscribe.',
  changingSelectedContact: false,
  smsTemplateModal: {
    open: false,
    scope: 'user',
    template: null
  },
  search: '',
  searchedPdItem: '',
  showMenu: false,
  showContactsHeader: true,
  showContactsListSidebar: false,
  showMyContacts: false,
  showAddViewMyContacts: false,
  unsavedList: null,
  activeFolder: '',
  pinnedListsLoaded: false,
  publicListsLoaded: false,
  myListsLoaded: false,
  listContactsLoaded: false,
  previousListFilters: {},
  previouslySavedListId: null,
  previousListId: null,
  sequenceInfo: {
    sequence: null,
    workflow: null
  },
  sequenceInfoLoading: false,
  lineIncomingNumber: null,
  lineIncomingNumberLoading: false,
  communicationsSummary: {
    first_outbound_call: null,
    summaries: {
      inbound_calls_count: 0,
      outbound_calls_count: 0,
      inbound_texts_count: 0,
      outbound_texts_count: 0,
      total_count: 0
    }
  },
  isContactMixinUsed: false,
  isShortenedUrlRemembered: false,
  newCommunicationInprogressContactFetch: [],
  showContactResourceUnavailable: false,
  inProgressAxiosUniqueIds: []
}
