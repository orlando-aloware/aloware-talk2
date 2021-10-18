export const STATIC = 1
export const DYNAMIC = 2

export const DEFAULT_FILTER_LIST = {
  IN_QUEUE: {
    id: 'in-queue',
    name: 'In Queue',
    link: '/in-queue/'
  },
  CALLED: {
    id: 'called',
    name: 'Called',
    link: '/called/'
  },
  FAILED: {
    id: 'failed',
    name: 'Failed',
    link: '/failed/'
  },
  SCHEDULED: {
    id: 'scheduled',
    name: 'Scheduled',
    link: '/scheduled/'
  },
  All: {
    id: 'all',
    name: 'All',
    link: '/all/'
  }
}

export const DIRECTORY_LIST = [
  {
    id: 1,
    label: 'Interested Leads',
    disabled: false,
    children: []
  },
  {
    id: 2,
    label: 'Outbound Sales 1',
    disabled: false,
    children: [
      {
        id: 312,
        label: 'Google Map Scraping',
        disabled: false,
        children: [
          {
            id: 4,
            label: 'Untitled List',
            disabled: false,
            children: []
          },
          {
            id: 5112,
            label: 'Chicago',
            disabled: false,
            children: []
          },
          {
            id: 6,
            label: 'Important Contacts',
            disabled: false,
            children: []
          }
        ]
      },
      {
        id: 7,
        label: 'ZoomInfo List Aug\'21',
        disabled: false,
        children: [
          {
            id: 8,
            label: 'Temporary List',
            disabled: false,
            children: []
          },
          {
            id: 9,
            label: 'New York',
            disabled: false,
            children: []
          }
        ]
      }
    ]
  },
  {
    id: 10,
    label: 'Company Wide Outbound Sales',
    disabled: false,
    children: [
      {
        id: 11,
        label: 'Missed Calls',
        disabled: false,
        children: []
      }
    ]
  }
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
    minWidth: 150
  },
  {
    name: 'phone_number',
    label: 'Phone Number',
    category: 0,
    order: 1,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false,
    minWidth: 150
  },
  {
    name: 'date_added',
    label: 'Date Added',
    category: 0,
    order: 2,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false,
    minWidth: 150
  },
  {
    name: 'tags',
    label: 'Tags',
    category: 0,
    order: 3,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false,
    minWidth: 150
  },
  {
    name: 'status',
    label: 'Status',
    category: 0,
    order: 4,
    sortable: true,
    draggable: true,
    resizable: true,
    default: false,
    minWidth: 150
  },
  {
    name: 'actions',
    label: 'Phone Number',
    category: 0,
    order: 5,
    sortable: false,
    draggable: false,
    resizable: false,
    default: false,
    minWidth: 50
  }
]

export const WARM_UP_PERIOD_LIST = [
  'No Warm Up'
]
