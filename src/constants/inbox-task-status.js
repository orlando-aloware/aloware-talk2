import * as ContactTaskStatus from './contact-task-status'

// This is a combination of open, pending and closed
export const STATUS_ALL = 'all'
export const STATUS_ALL_IDS = [
  ContactTaskStatus.STATUS_OPEN,
  ContactTaskStatus.STATUS_PENDING,
  ContactTaskStatus.STATUS_CLOSED
]

// When the user opens the Inbox, this is the status that will be loaded by default
export const DEFAULT_STATUS = STATUS_ALL
