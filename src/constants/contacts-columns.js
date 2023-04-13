export const COLUMN_CATEGORIES = [
  'Default Information',
  'Contact Location',
  'Contact Relevance',
  'Contact Communication Metadata'
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
    order: 0,
    required: true,
    sortable: true,
    draggable: false,
    resizable: true,
    default: true,
    minWidth: 200
  },
  {
    name: 'first_name',
    label: 'First Name',
    category: 0,
    order: 1,
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
    order: 2,
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
    order: 3,
    sortable: true,
    draggable: true,
    resizable: true,
    default: true
  },
  {
    name: 'phone_numbers',
    relationName: 'phoneNumbers',
    label: 'All Phone Numbers',
    category: 0,
    order: 4,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false,
    minWidth: 170
  },
  {
    name: 'contact_owner',
    label: 'Contact Owner',
    category: 2,
    order: 5,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'disposition_status',
    relationName: 'dispositionStatus',
    label: 'Contact Disposition',
    category: 3,
    order: 6,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'email',
    label: 'Email',
    category: 0,
    order: 7,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'company_name',
    label: 'Company Name',
    category: 2,
    order: 8,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'website',
    label: 'Website',
    category: 2,
    order: 9,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'date_of_birth',
    label: 'Date of Birth',
    category: 0,
    order: 10,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false,
    maxWidth: 170,
    minWidth: 170
  },
  {
    name: 'address',
    label: 'Address',
    category: 1,
    order: 11,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'cnam_city',
    label: 'City',
    category: 1,
    order: 12,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'cnam_state',
    label: 'State',
    category: 1,
    order: 13,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'cnam_country',
    label: 'Country',
    category: 1,
    order: 14,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'cnam_zipcode',
    label: 'Zip Code',
    category: 1,
    order: 15,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'text_authorized_at',
    label: 'TCPA Approved',
    category: 0,
    order: 16,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'created_at',
    label: 'Date Added',
    category: 0,
    order: 17,
    required: true,
    sortable: true,
    draggable: true,
    resizable: true,
    default: true,
    maxWidth: 140,
    minWidth: 140
  },
  {
    name: 'last_engagement_at',
    label: 'Last Engagement',
    category: 3,
    order: 18,
    required: true,
    sortable: true,
    draggable: true,
    resizable: true,
    default: true
  },
  {
    name: 'last_inbound_engagement_at',
    label: 'Last Inbound Engagement',
    category: 3,
    order: 19,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'last_outbound_engagement_at',
    label: 'Last Outbound Engagement',
    category: 3,
    order: 20,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'timezone',
    label: 'Timezone',
    category: 1,
    order: 21,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'intake_source',
    label: 'Intake Source',
    category: 2,
    order: 22,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'lead_source',
    relationName: 'leadSource',
    label: 'Lead Source',
    category: 2,
    order: 23,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'tags',
    relationName: 'tags',
    label: 'Tags',
    category: 2,
    order: 24,
    sortable: false,
    draggable: true,
    resizable: true,
    default: true,
    minWidth: 200
  },
  {
    name: 'inbound_calls_count',
    label: 'Inbound Calls',
    category: 3,
    order: 25,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'outbound_calls_count',
    label: 'Outbound Calls',
    category: 3,
    order: 26,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'inbound_texts_count',
    label: 'Inbound Texts',
    category: 3,
    order: 27,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'outbound_texts_count',
    label: 'Outbound Texts',
    category: 3,
    order: 28,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'communications_count',
    label: 'Number of Communications',
    category: 3,
    order: 29,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'unread_missed_calls_count',
    label: 'Unread Missed Calls',
    category: 3,
    order: 31,
    sortable: false,
    draggable: true,
    resizable: true,
    default: true,
    maxWidth: 190,
    minWidth: 190
  },
  {
    name: 'unread_voicemails_count',
    label: 'Unread Voicemails',
    category: 3,
    order: 32,
    sortable: false,
    draggable: true,
    resizable: true,
    default: true,
    maxWidth: 175,
    minWidth: 175
  },
  {
    name: 'unread_texts_count',
    label: 'Unread Messages',
    category: 3,
    order: 33,
    sortable: false,
    draggable: true,
    resizable: true,
    default: true,
    maxWidth: 170,
    minWidth: 170
  },
  {
    name: 'campaigns',
    relationName: 'campaigns',
    label: 'Lines',
    category: 2,
    order: 34,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false,
    minWidth: 170
  },
  {
    name: 'ring_groups',
    relationName: 'ringGroups',
    label: 'Ring Groups',
    category: 2,
    order: 35,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'broadcasts',
    relationName: 'broadcasts',
    label: 'Broadcasts',
    category: 2,
    order: 36,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false,
    minWidth: 170
  },
  {
    name: 'contact_lists',
    relationName: 'contactLists',
    label: 'Contact Lists',
    category: 2,
    order: 37,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false,
    maxWidth: 170,
    minWidth: 170
  },
  {
    name: 'initial_campaign_id',
    relationName: 'initialCampaign',
    label: 'Initial Line',
    category: 2,
    order: 38,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false
  },
  {
    name: 'task_status_name',
    label: 'Task Status',
    category: 2,
    order: 39,
    sortable: false,
    draggable: true,
    resizable: true,
    default: false,
    minWidth: 170
  },
  {
    id: '426108ce-7d6e-43e1-b13e-e406a9362db0',
    label: 'Actions',
    name: 'actions',
    order: 40,
    sortable: false,
    draggable: false,
    resizable: false,
    default: true,
    maxWidth: 130,
    minWidth: 130
  },
  {
    name: 'line_type',
    label: 'Line Type',
    relationName: 'primaryPhoneNumber',
    category: 0,
    order: 41,
    sortable: false,
    draggable: true,
    resizable: false,
    default: false
  }
]

export const DEFAULT_COLUMNS = ALL_COLUMNS.filter((c) => c.default)

export const STATIC_COLUMNS = ALL_COLUMNS.filter(
  (c) => c.default && c.name !== 'actions'
)

export const POWER_DIALER_DEFAULT_COLUMNS = ALL_COLUMNS.filter(
  (c) => ['checkbox', 'name', 'phone_number', 'created_at', 'tags', 'task_status_name', 'actions'].includes(c.name)
)
