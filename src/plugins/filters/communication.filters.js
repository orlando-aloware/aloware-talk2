import * as CommunicationCurrentStatus from '../../constants/communication-current-status'
import * as CommunicationDispositionStatus from '../../constants/communication-disposition-status'

/**
 * Fix phone number
 * @param phoneNumber
 * @param format
 * @param force
 * @param includeSuffix
 * @returns {string|boolean|*}
 */
const fixPhone = (
  phoneNumber,
  format = null,
  force = false,
  includeSuffix = false
) => {
  if (phoneNumber) {
    phoneNumber = phoneNumber.replace('#', '')
    phoneNumber = phoneNumber.replace(/\s+/g, '')

    if (phoneNumber.toLowerCase() === 'restricted') {
      return phoneNumber
    }

    if (phoneNumber.toLowerCase() === 'anonymous') {
      return phoneNumber
    }

    if (phoneNumber.toLowerCase() === 'unknown') {
      return phoneNumber
    }

    if (phoneNumber === '+266696687') {
      return phoneNumber
    }

    if (phoneNumber === '8656696') {
      return phoneNumber
    }

    if (phoneNumber.includes('unhold:')) {
      return phoneNumber
    }

    if (phoneNumber.includes('auto_dial_task:')) {
      return phoneNumber
    }

    if (phoneNumber.includes('call:')) {
      return phoneNumber
    }

    if (phoneNumber.includes('hs:')) {
      return phoneNumber
    }

    // sip uri used instead of phone number
    if (phoneNumber.indexOf('@') > -1) {
      return phoneNumber
    }

    // Use substring() and indexOf() functions to remove
    // portion of string after certain character (w => wait)
    let pos = phoneNumber.indexOf('w')
    let suffix = ''
    if (pos !== -1) {
      suffix = phoneNumber.substring(pos, phoneNumber.length - 1).trim()
      phoneNumber = phoneNumber.substring(0, pos).trim()
    }

    if (phoneNumber.toString().length <= 9) {
      return false
    }

    let locale = window.guessLocale(phoneNumber)

    if (!locale) {
      return false
    }

    let tel = window.phoneUtil.parse(phoneNumber, locale)

    if (['US', 'CA'].includes(locale) && !format) {
      format = 'NATIONAL'
    } else {
      format = 'E164'
    }

    let formattedPhoneNumber

    if (format === 'INTERNATIONAL') {
      formattedPhoneNumber = window.phoneUtil.format(tel, window.PNF.INTERNATIONAL).toString()
    } else if (format === 'E164') {
      formattedPhoneNumber = window.phoneUtil.format(tel, window.PNF.E164).toString()
    } else {
      formattedPhoneNumber = window.phoneUtil.format(tel, window.PNF.NATIONAL).toString()
    }

    // if we have to include suffix
    if (includeSuffix) {
      formattedPhoneNumber = formattedPhoneNumber + suffix
    }

    return formattedPhoneNumber
  } else {
    return ''
  }
}

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
      return 'RVM'
    case 5:
      return 'Email'
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
 * @returns {string}
 */
const translateDispositionStatusText = (status) => {
  switch (status) {
    // Call is still going on.
    case CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW:
      return CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS
    // call is abandoned without ringing target.
    case CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW:
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
    default:
      return 'N/A'
  }
}

export default ({ Vue }) => {
  const filters = {
    fixPhone,
    fixCommDirection,
    fixCommType,
    areaCode: areaCode({ Vue }),
    translateCurrentStatusText,
    translateDispositionStatusText
  }
  Object.keys(filters).map(k => Vue.filter(k, filters[k]))
}
