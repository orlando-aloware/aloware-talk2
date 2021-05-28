export const STATIC = 1
export const DYNAMIC = 2

export const DEFAULT_CONTACT_LIST = {
  ALL_CONTACTS: {
    id: 'all',
    link: '/contacts',
    name: 'All Contacts'
  },
  MY_CONTACTS: {
    id: 'my-contacts',
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
    id: 'new-leads',
    name: 'New Leads',
    link: '/contacts/new-leads'
  }
}

export const COLUMN_CATEGORIES = [
  'Default Information',
  'Contact Location',
  'Contact Relevance',
  'Contact Communication Metadata',
  'Custom Fields'
]

export const ALL_COLUMNS = [
  {
    default: true,
    sticky: true,
    label: 'Checkbox',
    name: 'checkbox'
  },
  {
    name: 'name',
    label: 'Name',
    category: 0,
    required: true,
    sortable: true,
    draggable: false,
    resizable: true,
    default: true,
    minWidth: 225
  },
  {
    name: 'first_name',
    label: 'First Name',
    category: 0,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false,
    minWidth: 225
  },
  {
    name: 'last_name',
    label: 'Last Name',
    category: 0,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false,
    minWidth: 225
  },
  {
    name: 'phone_number',
    label: 'Phone Number',
    category: 0,
    sortable: true,
    draggable: true,
    resizable: true,
    default: true
  },
  {
    name: 'email',
    label: 'Email',
    category: 0,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'created_at',
    label: 'Date Added',
    category: 0,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'date_of_birth',
    label: 'DOB',
    category: 0,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'text_authorized_at',
    label: 'TCPA Approved',
    category: 0,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'address',
    label: 'Address',
    category: 1,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'cnam_state',
    label: 'State',
    category: 1,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'cnam_city',
    label: 'City',
    category: 1,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'cnam_zipcode',
    label: 'Zip Code',
    category: 1,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'cnam_country',
    label: 'Country',
    category: 1,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'timezone',
    label: 'Timezone',
    category: 1,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'website',
    label: 'Website',
    category: 2,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'company_name',
    label: 'Company Name',
    category: 2,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'lead_source',
    label: 'Lead Source',
    category: 2,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'intake_source',
    label: 'Intake Source',
    category: 2,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'tags',
    label: 'Tags',
    category: 2,
    sortable: false,
    draggable: true,
    resizable: true,
    default: true,
    minWidth: 200
  },
  {
    name: 'initial_campaign_id',
    label: 'Initial Line',
    category: 2,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'unread_count',
    label: 'Unreads',
    category: 3,
    sortable: false,
    draggable: true,
    resizable: true,
    default: true,
    maxWidth: 120,
    minWidth: 120
  },
  {
    name: 'inbound_call_count',
    label: 'Inbound Calls',
    category: 3,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'outbound_call_count',
    label: 'Outbound Calls',
    category: 3,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'outbound_sms_count',
    label: 'Outbound Texts',
    category: 3,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'last_engagement_at',
    label: 'Last Engagement',
    category: 3,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'disposition_status_id',
    label: 'Call Disposition',
    category: 3,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'csf1',
    label: 'Custom Field 1',
    category: 4,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'csf2',
    label: 'Custom Field 2',
    category: 4,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    id: '426108ce-7d6e-43e1-b13e-e406a9362db0',
    label: 'Actions',
    name: 'actions',
    sortable: false,
    draggable: false,
    resizable: false,
    default: true,
    maxWidth: 120,
    minWidth: 120
  }
]

export const DEFAULT_COLUMNS = ALL_COLUMNS.filter((c) => c.default)

export const DEFAULT_FILTERS = {
  date_field: 'last_engagement_at',
  type: 'all',
  direction: 'all',
  report_type: 'date_v_campaign',
  chart_period: 'day',
  answer_status: 'all',
  export_type: 'json',
  min_talk_time: '0',
  page: '1',
  per_page: '20',
  first_time_only: '0',
  untagged_only: '0',
  exclude_automated_communications: '0',
  has_untagged_call: '0',
  is_blocked: '0',
  is_dnc: '0',
  has_unread: '0',
  is_new_lead: '0',
  unassigned_leads: '0',
  should_follow_the_sun: '0',
  not_contacted: '0',
  not_responded: '0',
  responded: '0',
  text_authorized: '0',
  has_appointments: '0',
  has_reminders: '0',
  timezone: 'Asia/Manila',
  contact_country: '',
  contact_timezone: '',
  changed: 'true',
  states_limit: '{"us":[],"ca":[]}',
  initial_line_only: '0',
  search_text: ''
}

export const DEFAULT_CONTACT_LIST_ITEMS = {
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
