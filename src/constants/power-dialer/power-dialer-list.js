export const STATIC = 1
export const DYNAMIC = 2

export const DEFAULT_FILTER_LIST = {
  IN_QUEUE: {
    id: 'in-queue',
    name: 'In Queue',
    link: '/in-queue/',
    order: 1
  },
  CALLED: {
    id: 'called',
    name: 'Called',
    link: '/called/',
    order: 2
  },
  FAILED: {
    id: 'failed',
    name: 'Failed',
    link: '/failed/',
    order: 3
  },
  SCHEDULED: {
    id: 'scheduled',
    name: 'Scheduled',
    link: '/scheduled/',
    order: 4
  },
  All: {
    id: 'all',
    name: 'All',
    link: '/all/',
    order: 5
  }
}

export const WARM_UP_PERIOD_LIST = [
  'No Warm Up'
]
