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
