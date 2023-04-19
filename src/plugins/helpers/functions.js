import * as CallbackStatus from 'src/constants/callback-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationDirections from 'src/constants/communication-direction'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'

/**
 * Checks if communication is live
 *
 * @param {Object} communication
 * @returns Boolean
 */
export const isLiveCall = (communication) => {
  if (communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
    return false
  }

  if (communication.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW) {
    return false
  }

  if (!communication.user_id) {
    return false
  }

  return true
}

/**
 * Checks if communication is parked
 *
 * @param {Object} communication
 * @returns Boolean
 */
export const isParkedCall = (communication) => {
  if (communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
    return false
  }

  if (communication.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW) {
    return false
  }

  if (!communication.user_id) {
    return false
  }

  return true
}

/**
 * Checks if communication is queued
 *
 * @param {Object} communication
 * @returns Boolean
 */
export const isQueuedCall = (communication) => {
  if (communication.callback_status === CallbackStatus.CALLBACK_STATUS_REQUESTED && communication.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW) {
    return false
  }

  if (![CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW, CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW].includes(communication.current_status2) && communication.callback_status !== CallbackStatus.CALLBACK_STATUS_REQUESTED) {
    return false
  }

  if (communication.direction !== CommunicationDirections.INBOUND) {
    return false
  }

  return true
}
