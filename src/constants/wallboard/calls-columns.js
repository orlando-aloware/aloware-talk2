export const COLUMNS = [
  {
    name: 'details',
    label: ' ',
    minWidth: 30
  },
  {
    name: 'disposition',
    label: ' ',
    order: 0,
    sortable: false,
    selectable: false,
    minWidth: 50
  },
  {
    name: 'incoming_number',
    label: 'Number',
    order: 1,
    sortable: true,
    selectable: true,
    draggable: true,
    minWidth: 200
  },
  {
    name: 'ring_group',
    label: 'Ring Group',
    order: 2,
    sortable: true,
    selectable: true,
    draggable: true,
    minWidth: 150
  },
  {
    name: 'workflow',
    label: 'Sequence',
    order: 3,
    sortable: true,
    selectable: true,
    draggable: true,
    minWidth: 150,
    exclude: ['parked']
  },
  {
    name: 'start',
    label: 'Start Time',
    order: 4,
    sortable: true,
    selectable: true,
    draggable: true,
    minWidth: 200
  },
  {
    name: 'talk_time',
    label: 'Talk Time',
    order: 5,
    sortable: true,
    selectable: true,
    draggable: true
  },
  {
    name: 'lead_number',
    label: 'Contact',
    order: 6,
    sortable: true,
    selectable: true,
    draggable: true,
    minWidth: 200
  },
  {
    name: 'lead_location',
    label: 'Location',
    order: 7,
    sortable: true,
    selectable: true,
    draggable: true,
    minWidth: 200
  },
  {
    name: 'attempting_users',
    label: 'Attempting',
    order: 8,
    sortable: true,
    selectable: true,
    draggable: true,
    minWidth: 300,
    exclude: ['live', 'parked']
  },
  {
    name: 'user',
    label: 'User',
    order: 9,
    sortable: true,
    selectable: true,
    draggable: true,
    minWidth: 150,
    exclude: ['queued']
  },
  {
    name: 'callback_status',
    label: 'Callback Status',
    order: 10,
    sortable: false,
    selectable: true,
    draggable: true,
    exclude: ['parked']
  },
  {
    name: 'tags',
    label: 'Tags',
    order: 11,
    sortable: false,
    selectable: true,
    draggable: true
  },
  {
    name: 'notes',
    label: 'Notes',
    order: 12,
    sortable: false,
    selectable: true,
    draggable: true,
    minWidth: 300
  },
  {
    name: 'operations',
    label: 'Operations',
    order: 13,
    sortable: false,
    selectable: true,
    draggable: true,
    minWidth: 200
  }
]
