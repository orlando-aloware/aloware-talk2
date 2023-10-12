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
    sortable: true
  },
  {
    name: 'name',
    label: 'Name',
    field: 'name',
    sortable: true
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
    name: 'pending_tasks',
    label: 'Pending Tasks',
    field: 'pending_tasks',
    sortable: true,
    draggable: true
  },
  {
    name: 'total_failed',
    label: 'Failed Tasks',
    field: 'total_failed',
    sortable: true,
    draggable: true
  },
  {
    name: 'total_enrolled',
    label: 'Total Tasks',
    field: 'total_enrolled',
    sortable: true,
    draggable: true
  },
  {
    name: 'engagement_rate',
    label: 'Engagement',
    field: 'engagement_rate',
    sortable: true,
    draggable: true
  },
  {
    name: 'total_unsubscribed',
    label: 'Unsubscribed',
    field: 'total_unsubscribed',
    sortable: true,
    draggable: true
  },
  {
    name: 'target_group',
    label: 'Target Group',
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
    name: '',
    label: '',
    field: 'actions',
    maxWidth: 50
  }
]
