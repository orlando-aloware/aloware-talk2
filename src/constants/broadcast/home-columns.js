export const COLUMNS = [
  {
    name: 'checkbox',
    label: '',
    field: ''
  },
  {
    name: 'id',
    label: 'Id',
    field: 'id',
    sortable: true,
    resizable: true
  },
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    sortable: true,
    minWidth: 390,
    resizable: true
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    sortable: true,
    draggable: true
  },
  {
    name: 'scheduled_time',
    label: 'Scheduled Time',
    field: 'run_at',
    sortable: false,
    draggable: true
  },
  {
    name: 'total_enrolled',
    label: 'Total Messages',
    field: 'total_enrolled',
    sortable: true,
    draggable: true
  },
  {
    name: 'pending_tasks',
    label: 'Pending Messages',
    field: 'pending_tasks',
    sortable: true,
    draggable: true
  },
  {
    name: 'total_failed',
    label: 'Failed Messages',
    field: 'total_failed',
    sortable: true,
    draggable: true
  },
  {
    name: 'total_replied',
    label: 'Replies',
    field: 'total_replied',
    sortable: true,
    draggable: true
  },
  {
    name: 'total_unsubscribed',
    label: 'Opt-Out',
    field: 'total_unsubscribed',
    sortable: true,
    draggable: true
  },
  {
    name: 'target_group',
    label: 'Contacts',
    field: 'target_group',
    draggable: true
  },
  {
    name: 'campaign_id',
    label: 'Line Used',
    field: 'campaign_id',
    sortable: true,
    draggable: true
  },
  {
    name: 'throttle_limit',
    label: 'Throttling',
    field: 'throttle_limit',
    sortable: true,
    draggable: true
  },
  {
    name: 'date_created',
    label: 'Date Created',
    field: 'created_at',
    sortable: false,
    draggable: true
  },
  {
    name: 'notes',
    label: 'Notes',
    field: 'notes',
    sortable: false,
    draggable: true,
    minWidth: 150,
    resizable: true
  },
  {
    name: '',
    label: '',
    field: 'actions',
    maxWidth: 50,
    sticky: true,
    stickyRight: true
  }
]
