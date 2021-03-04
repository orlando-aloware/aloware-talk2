import _ from 'lodash'
import * as LrnTypes from '../constants/lrn-types'
import * as CampaignCallRouterBehavior from '../constants/campaign-call-router-behaviors'
import * as CommunicationCurrentStatus from '../constants/communication-current-status'
import * as CommunicationDispositionStatus from '../constants/communication-disposition-status'
import * as AgentStatus from '../constants/agent-status'

export default async ({ Vue }) => {
  // date / time / duration related
  Vue.filter('fixDate', (dt, format = 'YYYY-MM-DD') => {
    if (dt) {
      if (window.timezone) {
        return window.moment.utc(dt).tz(window.timezone).format(format)
      } else {
        return window.moment.utc(dt).local().format(format)
      }
    } else {
      return '-'
    }
  })
  Vue.filter('fixDateTime', (dt) => {
    if (dt) {
      if (window.timezone) {
        return window.moment.utc(dt).tz(window.timezone).format('MM/DD h:mm:ssa')
      } else {
        return window.moment.utc(dt).local().format('MM/DD h:mma')
      }
    } else {
      return '-'
    }
  })
  Vue.filter('fixTime', (dt, format = 'h:mma') => {
    if (dt) {
      if (window.timezone) {
        return window.moment.utc(dt, 'HH:mm:ss').tz(window.timezone).format(format)
      } else {
        return window.moment.utc(dt, 'HH:mm:ss').local().format(format)
      }
    } else {
      return '-'
    }
  })
  Vue.filter('fixTimeLocal', (dt, format = 'h:mma') => {
    if (dt) {
      if (window.timezone) {
        return window.moment(dt, 'HH:mm:ss').format(format)
      } else {
        return window.moment(dt, 'HH:mm:ss').format(format)
      }
    } else {
      return '-'
    }
  })
  Vue.filter('fixDuration', (duration) => {
    if (duration) {
      return window.moment.duration(duration, 'seconds').format('m:ss', {
        trim: false
      })
    } else {
      return '-'
    }
  })
  Vue.filter('humanizeDuration', (duration) => {
    let humanizeDuration = require('humanize-duration')
    if (duration) {
      return humanizeDuration(window.moment.duration(duration, 'seconds').asMilliseconds())
    } else {
      return '-'
    }
  })
  Vue.filter('fixFullDateUTC', (dt) => {
    if (dt) {
      if (window.timezone) {
        return window.moment(dt).utc().tz(window.timezone).format('MMM D, YYYY')
      } else {
        return window.moment(dt).utc().local().format('MMM D, YYYY')
      }
    } else {
      return '-'
    }
  })
  Vue.filter('fixFullDateLocal', (dt) => {
    if (dt) {
      if (window.timezone) {
        return window.moment(dt).utc().tz(window.timezone).format('MMM D, YYYY')
      } else {
        return window.moment(dt).utc().local().format('MMM D, YYYY')
      }
    } else {
      return '-'
    }
  })
  Vue.filter('fixFullDateUTCRelative', (dt) => {
    if (dt) {
      let now = window.moment.utc()
      let datetime = window.moment.utc(dt)

      if (now.diff(datetime) < 24 * 60 * 60 * 1000) {
        if (window.timezone) {
          return datetime.tz(window.timezone).fromNow()
        } else {
          return datetime.local().format('MMM D')
        }
      } else {
        if (window.timezone) {
          return datetime.tz(window.timezone).format('MMM D h:mma')
        } else {
          return datetime.local().format('MMM D h:mma')
        }
      }
    } else {
      return ''
    }
  })

  // credit related
  Vue.filter('fixResourceName', (type) => {
    switch (type) {
      case 'subaccount_local_pn':
        return 'Subaccount Local Phone Numbers'
      case 'local_pn':
        return 'Local Phone Numbers'
      case 'subaccount_tollfree_pn':
        return 'Subaccount Toll-free Phone Numbers'
      case 'tollfree_pn':
        return 'Toll-free Phone Numbers'
      case 'subaccount_local_min':
        return 'Subaccount Local Minutes'
      case 'local_min':
        return 'Local Minutes'
      case 'subaccount_tollfree_min':
        return 'Subaccount Toll-free Minutes'
      case 'tollfree_min':
        return 'Toll-free Minutes'
      case 'subaccount_sms':
        return 'Subaccount Text Messages'
      case 'sms':
        return 'Text Messages'
      case 'subaccount_local_sms':
        return 'Subaccount Local Text Messages'
      case 'local_sms':
        return 'Local Text Messages'
      case 'subaccount_tollfree_sms':
        return 'Subaccount Toll-free Text Messages'
      case 'tollfree_sms':
        return 'Toll-free Text Messages'
      case 'subaccount_rvm':
        return 'Subaccount Ringless Voicemail'
      case 'rvm':
        return 'Ringless Voicemail'
      case 'amd':
        return 'Automatic Machine Detection'
      case 'email':
        return 'Email'
      case 'lrn_lookup':
        return 'LRN Lookup'
      case 'subaccount_lrn_lookup':
        return 'Subaccount LRN Lookup'
      case 'intl_call':
        return 'International Minutes'
      case 'subaccount_intl_call':
        return 'Subaccount International Minutes'
      case 'intl_sms':
        return 'International Text Messages'
      case 'subaccount_intl_sms':
        return 'Subaccount International Text Messages'
      case 'promo_credit':
        return 'Promo Credits'
      case 'credit':
        return 'Credits'
      default:
        return ''
    }
  })
  Vue.filter('fixUnit', (type) => {
    switch (type) {
      case 'local_min':
        return 'minute(s)'
      case 'tollfree_min':
        return 'minute(s)'
      case 'intl_call':
        return 'minute(s)'
      default:
        return ''
    }
  })
  Vue.filter('fixCreditInfo', (credit) => {
    if (credit !== undefined) {
      if (credit === 0) {
        return credit + ' (debited from plan)'
      } else {
        return credit
      }
    } else {
      return '-'
    }
  })
  Vue.filter('fixRounding', (amount) => {
    if (amount !== undefined) {
      return parseFloat(amount).toFixed(3)
    } else {
      return '-'
    }
  })
  Vue.filter('toCurrency', (amount) => {
    if ((!!amount && amount !== undefined) || amount === 0) {
      if (amount < 0) {
        return '-$' + Math.abs(amount).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
      }
      return '$' + amount.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    } else {
      return '-'
    }
  })
  Vue.filter('removeSign', (amount) => {
    if (amount !== undefined) {
      return Math.abs(amount)
    } else {
      return '-'
    }
  })

  // communication related
  Vue.filter('fixPhone', (phoneNumber, format = null, force = false, includeSuffix = false) => {
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
  })
  Vue.filter('fixCommDirection', (direction) => {
    switch (direction) {
      case 1:
        return 'Inbound'
      case 2:
        return 'Outbound'
      default:
        return 'N/A'
    }
  })
  Vue.filter('fixCommType', (type) => {
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
  })
  Vue.filter('areaCode', (phoneNumber) => {
    return /\d{3}/.exec(Vue.options.filters.fixPhone(phoneNumber))[0]
  })
  Vue.filter('translateCurrentStatusText', (status) => {
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
  })
  Vue.filter('translateDispositionStatusText', (status) => {
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
  })

  // contact related
  Vue.filter('fixDateOfBirth', (dateOfBirth) => {
    if (dateOfBirth) {
      return dateOfBirth
    }

    return 'N/A'
  })
  Vue.filter('fixName', (name) => {
    if (name) {
      return name
    }

    return 'N/A'
  })
  Vue.filter('fixCountry', (country) => {
    if (country) {
      return _.capitalize(country)
    }

    return 'N/A'
  })
  Vue.filter('fixState', (state) => {
    if (state) {
      return _.capitalize(state)
    }

    return 'N/A'
  })
  Vue.filter('fixCity', (city) => {
    if (city) {
      return _.capitalize(city)
    }

    return 'N/A'
  })
  Vue.filter('fixZipcode', (zipcode) => {
    if (zipcode) {
      return zipcode
    }

    return 'N/A'
  })
  Vue.filter('fixEmail', (email) => {
    if (email) {
      return email
    }

    return 'N/A'
  })
  Vue.filter('fixTimezone', (timezone) => {
    if (timezone) {
      return timezone
    }

    return 'N/A'
  })
  Vue.filter('fixLrnType', (lrnType) => {
    // LRN_TYPE_LANDLINE = 0 so it couldn't pass the if statement because 0 != true.
    if (lrnType !== null) {
      switch (lrnType) {
        case LrnTypes.LRN_TYPE_LANDLINE:
          return 'Landline'
        case LrnTypes.LRN_TYPE_WIRELESS:
          return 'Wireless'
        case LrnTypes.LRN_TYPE_VOIP:
          return 'Voip'
        case LrnTypes.LRN_TYPE_OTHER:
          return 'Other'
        default:
          return 'N/A'
      }
    }

    return 'N/A'
  })
  // general
  Vue.filter('toUpperCase', (text) => {
    if (text) {
      return text.toUpperCase()
    } else {
      return ''
    }
  })
  Vue.filter('capitalize', (text) => {
    if (text) {
      return _.capitalize(text)
    } else {
      return ''
    }
  })
  Vue.filter('initials', (name) => {
    let initials = name.match(/\b\w/g) || []
    initials = ((initials.shift() || '') + (initials.pop() || '')).toUpperCase()

    return initials
  })
  Vue.filter('humanReadableBool', (boolValue) => {
    if (boolValue) {
      return 'On'
    } else {
      return 'Off'
    }
  })
  Vue.filter('humanReadableDialMode', (mode) => {
    switch (mode) {
      case 0:
        return 'Simultaneous'
      case 1:
        return 'Sequential'
      case 2:
        return 'Round-robin'
    }
    return '-'
  })
  Vue.filter('humanReadableCallRouterBehavior', (mode) => {
    switch (mode) {
      case CampaignCallRouterBehavior.CALL_ROUTER_BEHAVIOR_MODE_FAST_FORWARD:
        return 'Fast Forward'
      case CampaignCallRouterBehavior.CALL_ROUTER_BEHAVIOR_MODE_SMART_QUEUE:
        return 'Smart Queue'
      case CampaignCallRouterBehavior.CALL_ROUTER_BEHAVIOR_MODE_DEAD_END:
        return 'Dead End'
      case CampaignCallRouterBehavior.CALL_ROUTER_BEHAVIOR_MODE_IVR:
        return 'IVR'
    }
    return '-'
  })
  Vue.filter('ucfirst', (string) => {
    if (!string) {
      return '-'
    } else {
      return string.charAt(0).toUpperCase() + string.slice(1)
    }
  })
  Vue.filter('checkIfEmpty', (value) => {
    if (!value) {
      return '-'
    } else {
      return value
    }
  })
  Vue.filter('checkIfTrue', (value) => {
    if (!value) {
      return '<i class="material-icons">&#xE876;</i>'
    } else {
      return '<i class="material-icons">&#xE14C;</i>'
    }
  })
  Vue.filter('prettifyCamelCase', (value) => {
    let output = ''
    let len = value.length
    let char

    for (let i = 0; i < len; i++) {
      char = value.charAt(i)

      if (i === 0) {
        output += char.toUpperCase()
      } else if (char !== char.toLowerCase() && char === char.toUpperCase()) {
        output += ' ' + char
      } else if (char === '-' || char === '_') {
        output += ' '
      } else {
        output += char
      }
    }

    return output
  })
  Vue.filter('ucwords', (value) => {
    return (value + '')
      .replace(/^(.)|\s+(.)/g, function ($1) {
        return $1.toUpperCase()
      })
  })
  Vue.filter('filterDomain', (email) => {
    if (email) {
      return email.replace(/.*@/, '')
    } else {
      return '-'
    }
  })
  Vue.filter('fixCompanyRole', (label) => {
    if (label) {
      return label.replace('Company ', '')
    } else {
      return '-'
    }
  })
  Vue.filter('truncate', function (text, stop, clamp) {
    return text.slice(0, stop) + (stop < text.length ? clamp || '...' : '')
  })
  Vue.filter('toInt', (amount) => {
    if (amount !== undefined) {
      return parseInt(amount)
    } else {
      return '-'
    }
  })
  Vue.filter('fixOrder', (order) => {
    if (order !== '' && order !== undefined) {
      return parseInt(order) + 1
    } else {
      return '-'
    }
  })
  Vue.filter('pretty', (value) => {
    if (value) {
      return JSON.stringify(value, null, 3)
    } else {
      return ''
    }
  })
  Vue.filter('firstName', (fullName) => {
    if (fullName) {
      if (fullName.indexOf(' ') > -1) {
        let nameArr = fullName.split(/\s+/)
        return nameArr.slice(0, -1).join(' ')
      } else {
        return fullName
      }
    }

    return ''
  })
  Vue.filter('lastName', (fullName) => {
    if (fullName) {
      if (fullName.indexOf(' ') > -1) {
        let nameArr = fullName.split(/\s+/)
        return nameArr.pop()
      } else {
        return fullName
      }
    }

    return ''
  })
  Vue.filter('replaceDash', (text) => {
    if (text) {
      return text.replace('-', ' ')
    } else {
      return ''
    }
  })
  Vue.filter('agentStatusClass', (agentStatus) => {
    agentStatus = parseInt(agentStatus)
    if (agentStatus !== null) {
      switch (agentStatus) {
        case AgentStatus.AGENT_STATUS_OFFLINE:
          return 'bg-blue-grey-6'
        case AgentStatus.AGENT_STATUS_ACCEPTING_CALLS:
          return 'bg-green-6'
        case AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS:
          return 'bg-red-6'
        case AgentStatus.AGENT_STATUS_ON_BREAK:
          return 'bg-orange-6'
        case AgentStatus.AGENT_STATUS_ON_CALL:
          return 'bg-light-blue-6'
        case AgentStatus.AGENT_STATUS_ON_WRAP_UP:
          return 'bg-yellow-6'
        case AgentStatus.AGENT_STATUS_RINGING:
          return 'bg-lime-13'
        case AgentStatus.AGENT_STATUS_AUTO_DIAL:
          return 'bg-white'
        case AgentStatus.AGENT_STATUS_SENTRY:
          return 'bg-dark'
        default:
          return 'bg-grey-6'
      }
    }

    return 'bg-grey-6'
  })
}
