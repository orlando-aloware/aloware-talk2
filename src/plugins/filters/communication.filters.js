import * as CommunicationCurrentStatus from '../../constants/communication-current-status'
import * as CommunicationDispositionStatus from '../../constants/communication-disposition-status'
import * as CallbackStatus from '../../constants/callback-status'
import * as CommunicationTransferTypes from '../../constants/communication-transfer-types'
import { LRN_TYPE_LANDLINE, LRN_TYPE_OTHER, LRN_TYPE_VOIP, LRN_TYPE_WIRELESS } from 'src/constants/lrn-types'

/**
 * Fix comm direction
 * @param {string} direction
 * @returns {string}
 */
const fixCommDirection = (direction) => {
  switch (direction) {
    case 1:
      return 'Inbound'
    case 2:
      return 'Outbound'
    default:
      return 'N/A'
  }
}

/**
 * Fix comm type
 * @param {string} type
 * @returns {string}
 */
const fixCommType = (type) => {
  switch (type) {
    case 1:
      return 'Call'
    case 2:
      return 'SMS'
    case 3:
      return 'Conference'
    case 4:
      return 'Voicemail'
    case 5:
      return 'Email'
    case 8:
      return 'Fax'
    case 10:
      return 'Note'
    case 12:
      return 'Appointment'
    case 13:
      return 'Reminder'
    default:
      return 'N/A'
  }
}

/**
 * Area code filter
 * @param Vue
 * @returns {function(*=): string}
 */
const areaCode = ({ Vue }) => (phoneNumber) => {
  return /\d{3}/.exec(Vue.options.filters.fixPhone(phoneNumber))[0]
}

/**
 * Translate current status text
 * @param {string} status
 * @returns {string}
 */
const translateCurrentStatusText = (status) => {
  switch (status) {
    // The call is currently ringing (relative to us)
    case CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_RINGING
    // Caller is hearing the greeting message
    case CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_GREETING
    // the call is in our internal queue.
    case CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_QUEUED
    // We are attempting to find an agent for this call via conferencing
    case CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_RINGALL
    // We are dialing the destination
    case CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING
    // the call hit our voicemail
    case CommunicationCurrentStatus.CURRENT_STATUS_VOICEMAIL_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_VOICEMAIL
    // Callee picked up and is hearing the whisper message.
    case CommunicationCurrentStatus.CURRENT_STATUS_WHISPERING_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_WHISPERING
    // The call was answered and is currently in progress.
    case CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS
    // The call was answered and has ended normally.
    case CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED
    // call held (parked) and caller hearing piano music
    case CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_HOLD
    // A SMS is received by our system.
    case CommunicationCurrentStatus.CURRENT_STATUS_SMS_RECEIVED_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_SMS_RECEIVED
    // A SMS is sent to the system.
    case CommunicationCurrentStatus.CURRENT_STATUS_SMS_SENT_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_SMS_SENT
    // A SMS is delivered.
    case CommunicationCurrentStatus.CURRENT_STATUS_SMS_DELIVERED_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_SMS_DELIVERED
    // A SMS is accepted.
    case CommunicationCurrentStatus.CURRENT_STATUS_SMS_ACCEPTED_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_SMS_ACCEPTED
    // A SMS is queued.
    case CommunicationCurrentStatus.CURRENT_STATUS_SMS_QUEUED_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_SMS_QUEUED
    // A SMS is sending.
    case CommunicationCurrentStatus.CURRENT_STATUS_SMS_SENDING_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_SMS_SENDING
    // A SMS is receiving.
    case CommunicationCurrentStatus.CURRENT_STATUS_SMS_RECEIVING_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_SMS_RECEIVING
    // A SMS is undelivered.
    case CommunicationCurrentStatus.CURRENT_STATUS_SMS_UNDELIVERED_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_SMS_UNDELIVERED
    // A SMS is failed.
    case CommunicationCurrentStatus.CURRENT_STATUS_SMS_FAILED_NEW:
      return CommunicationCurrentStatus.CURRENT_STATUS_SMS_FAILED
    default:
      return 'N/A'
  }
}

/**
 * Translate disposition status text
 * @param status
 * @param callbackStatus
 * @returns {string}
 */
const translateDispositionStatusText = (status, callbackStatus = null) => {
  switch (status) {
    // Call is still going on.
    case CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW:
      return CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS
    // call is abandoned without ringing target.
    case CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW:
      if (callbackStatus === CallbackStatus.CALLBACK_STATUS_REQUESTED) {
        return 'Callback Pending'
      }
      return CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED
    // target party did not answer the call.
    case CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW:
      return CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED
    // A successful call (parties talked)
    case CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW:
      return CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED
    // The call failed for some reason.
    case CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW:
      return CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED
    // The call hit a dead end.
    case CommunicationDispositionStatus.DISPOSITION_STATUS_DEADEND_NEW:
      return CommunicationDispositionStatus.DISPOSITION_STATUS_DEADEND
    // communication was rejected from carrier before sending
    case CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW:
      return CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID
    // virtual status for automation rules
    case CommunicationDispositionStatus.DISPOSITION_STATUS_PLACED_NEW:
      return CommunicationDispositionStatus.DISPOSITION_STATUS_PLACED
    // voicemail status
    case CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW:
      return CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL
    // missed + voicemail virtual status
    case CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_AND_VOICEMAIL_NEW:
      return 'Missed (Including Voicemail)'
    // attended appointment status
    case CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_ATTENDED:
      return CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_ATTENDED_NEW
    // canceled appointment status
    case CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_CANCELED:
      return CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_CANCELED_NEW
    // set appointment status
    case CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_SET:
      return CommunicationDispositionStatus.DISPOSITION_STATUS_APPOINTMENT_SET_NEW
    default:
      return 'N/A'
  }
}

const fixLrnTypeBadge = (type) => {
  switch (type) {
    case LRN_TYPE_LANDLINE:
      return 'yellow-1'
    case LRN_TYPE_WIRELESS:
      return 'blue-3'
    case LRN_TYPE_VOIP:
      return 'purple-2'
    case LRN_TYPE_OTHER:
    default:
      return 'green-3'
  }
}

/**
 * Translate transfer type
 * @param {int} transfer_types
 * @returns String
 */
const translateTransferTypeText = (transferType) => {
  switch (transferType) {
    case CommunicationTransferTypes.TRANSFER_TYPE_COLD:
      return 'Cold Transfer'
    case CommunicationTransferTypes.TRANSFER_TYPE_WARM:
      return 'Warm Transfer'
    case CommunicationTransferTypes.TRANSFER_TYPE_CONF:
      return 'Conference'
    default:
      return '--'
  }
}

/**
 * Translate callback status
 * @param {int} callbackStatus
 * @returns String
 */
const translateCallbackStatusText = (callbackStatus) => {
  switch (callbackStatus) {
    case CallbackStatus.CALLBACK_STATUS_INITIATED:
      return 'Initiated'
    case CallbackStatus.CALLBACK_STATUS_REQUESTED:
      return 'Pending'
    default:
      return '--'
  }
}

export default ({ Vue }) => {
  const filters = {
    fixCommDirection,
    fixCommType,
    areaCode: areaCode({ Vue }),
    translateCurrentStatusText,
    translateDispositionStatusText,
    fixLrnTypeBadge,
    translateTransferTypeText,
    translateCallbackStatusText
  }
  Object.keys(filters).map(k => Vue.filter(k, filters[k]))
}
