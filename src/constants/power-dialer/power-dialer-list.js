export const STATIC = 1
export const DYNAMIC = 2

export const DEFAULT_FILTER_LIST = {
  IN_QUEUE: {
    id: 'in-queue',
    name: 'In Queue',
    link: '/in-queue/',
    meta: 'in_queue',
    order: 1,
    status: 'STATUS_QUEUED'
  },
  CALLED: {
    id: 'called',
    name: 'Called',
    link: '/called/',
    meta: 'called',
    order: 2,
    status: 'STATUS_COMPLETED'
  },
  FAILED: {
    id: 'failed',
    name: 'Failed',
    link: '/failed/',
    meta: 'failed',
    order: 3,
    status: 'STATUS_FAILED'
  },
  SCHEDULED: {
    id: 'scheduled',
    name: 'Scheduled',
    link: '/scheduled/',
    meta: 'scheduled',
    order: 4,
    status: 'STATUS_SCHEDULED'
  },
  ALL: {
    id: 'all',
    name: 'All',
    link: '/all/',
    meta: 'all',
    order: 5,
    status: 'STATUS_ALL'
  }
}

export const WARM_UP_PERIOD_LIST = { text: 'No Warm Up', value: 0 }
