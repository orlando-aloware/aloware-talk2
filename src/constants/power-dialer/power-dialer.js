export const DEFAULT_POWER_DIALER_QUEUE_LISTS = [
  {
    id: 'my-queue',
    name: 'My Queue',
    link: '/my-queue/'
  }
]

export const POWER_DIALER_FILTERS = {
  'in-queue': 1,
  'in-progress': 2,
  'called': 3,
  'failed': 4,
  'scheduled': 5
}

export const POWER_DIALER_ROUTE_META_ID = {
  'power-dialer': 'power-dialer',
  'queue-filter': 'power-dialer-queue-filter',
  'list': 'power-dialer-list',
  'list-filter': 'power-dialer-list-filter',
  'add-list': 'power-dialer-add-list',
  'add-queue-list': 'power-dialer-add-queue-list',
  'session': 'power-dialer-session'
}
