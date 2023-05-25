import _ from 'lodash'
import numeral from 'numeral'
import numFormat from 'vue-filter-number-format'
import * as CampaignCallRouterBehavior from '../../constants/campaign-call-router-behaviors'
import * as AgentStatus from '../../constants/agent-status'

/**
 * Convert to uppercase
 * @param {string} text
 * @returns {string|*|string|string}
 */
const toUpperCase = (text) => {
  if (text) {
    return text.toUpperCase()
  } else {
    return ''
  }
}

/**
 * Capitalize text
 * @param {string} text
 * @returns {string}
 */
const capitalize = (text) => {
  if (text) {
    return _.capitalize(text)
  } else {
    return ''
  }
}

/**
 * Initialise text
 * @param {string} name
 * @returns {string|*|string}
 */
const initials = (name) => {
  const initials = name.match(/\b\w/g) || []
  return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase()
}

/**
 * Convert to human readable boolean e.g yes,no
 * @param {boolean} boolValue
 * @returns {string}
 */
const humanReadableBool = (boolValue) => {
  if (boolValue) {
    return 'On'
  } else {
    return 'Off'
  }
}

/**
 * Convert to human readable dial mode
 * @param {number} mode
 * @returns {string}
 */
const humanReadableDialMode = (mode) => {
  switch (mode) {
    case 0:
      return 'Simultaneous'
    case 1:
      return 'Sequential'
    case 2:
      return 'Round-robin'
  }
  return '-'
}

/**
 * Human readable call router behaviour
 * @param {string} mode
 * @returns {string}
 */
const humanReadableCallRouterBehavior = (mode) => {
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
}

/**
 * Converts first character of the string to uppercase.
 * @param {string} string
 * @returns {string}
 */
const ucfirst = (string) => {
  if (!string) {
    return '-'
  } else {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }
}

/**
 * Checks if the value is empty
 * @param {string} value
 * @returns {string|*}
 */
const checkIfEmpty = (value) => {
  if (!value) {
    return '-'
  } else {
    return value
  }
}

/**
 * Checks if value is true. Returns HTML string.
 * @param {string} value
 * @returns {string}
 */
const checkIfTrue = (value) => {
  if (!value) {
    return '<i class="material-icons">&#xE876;</i>'
  } else {
    return '<i class="material-icons">&#xE14C;</i>'
  }
}

/**
 * Prettify camel case
 * @param {string} value
 * @returns {string}
 */
const prettifyCamelCase = (value) => {
  const output = { data: '' }
  const len = value.length
  const char = { data: '' }

  const index = { i: 0 }
  for (index.i = 0; index.i < len; index.i++) {
    char.data = value.charAt(index.i)

    if (index.i === 0) {
      output.data += char.data.toUpperCase()
    } else if (char.data !== char.data.toLowerCase() && char.data === char.data.toUpperCase()) {
      output.data += ' ' + char.data
    } else if (char.data === '-' || char.data === '_') {
      output.data += ' '
    } else {
      output.data += char.data
    }
  }

  return output.data
}

/**
 * Converts first character of the words to uppercase.
 * @param {string} value
 * @returns {string}
 */
const ucwords = (value) => {
  return (value + '')
    .replace(/^(.)|\s+(.)/g, function ($1) {
      return $1.toUpperCase()
    })
}

/**
 * Filter domain
 * @param {string} email
 * @returns {string|*}
 */
const filterDomain = (email) => {
  if (email) {
    return email.replace(/.*@/, '')
  } else {
    return '-'
  }
}

/**
 * Fix company role text
 * @param {string} label
 * @returns {string|*}
 */
const fixCompanyRole = (label) => {
  if (label) {
    return label.replace('Company ', '')
  } else {
    return '-'
  }
}

/**
 * Truncates text
 * @param {string} text
 * @param {number} stop
 * @param {number} clamp
 * @returns {*}
 */
const truncate = (text, stop, clamp) => {
  return text.slice(0, stop) + (stop < text.length ? clamp || '...' : '')
}

/**
 * Formats to integer
 * @param {string|number} amount
 * @returns {string|number}
 */
const toInt = (amount) => {
  if (amount !== undefined) {
    return parseInt(amount)
  } else {
    return '-'
  }
}

/**
 * Formats the number
 * @param {string|number} numeral
 * @returns {string}
 */
const numberFormat = numFormat(numeral)

/**
 * Fix order
 * @param {string|number} order
 * @returns {string|number}
 */
const fixOrder = (order) => {
  if (order !== '' && order !== undefined) {
    return parseInt(order) + 1
  } else {
    return '-'
  }
}

/**
 * Prettify JSON object
 * @param {*} value
 * @returns {string}
 */
const pretty = (value) => {
  if (value) {
    return JSON.stringify(value, null, 3)
  } else {
    return ''
  }
}

/**
 * Formats full name
 * @param {string} fullName
 * @returns {string|*}
 */
const firstName = (fullName) => {
  if (fullName) {
    if (fullName.indexOf(' ') > -1) {
      const nameArr = fullName.split(/\s+/)
      return nameArr.slice(0, -1).join(' ')
    } else {
      return fullName
    }
  }

  return ''
}

/**
 * Formats last name
 * @param {string} fullName
 * @returns {string|*}
 */
const lastName = (fullName) => {
  if (fullName) {
    if (fullName.indexOf(' ') > -1) {
      const nameArr = fullName.split(/\s+/)
      return nameArr.pop()
    } else {
      return fullName
    }
  }

  return ''
}

/**
 * Replace dashes
 * @param {string} text
 * @returns {string|*}
 */
const replaceDash = (text) => {
  if (text) {
    return text.replace('-', ' ')
  } else {
    return ''
  }
}

/**
 * Get bg class from agent status
 * @param {number} agentStatus
 * @returns {string}
 */
const agentStatusClass = (agentStatus) => {
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
}

/**
 * readableArrayValue
 * @param {Array} value
 * @returns {string|*}
 */
const readableArrayValue = (value) => {
  if (value.length === 0) {
    return ''
  }
  if (value.length >= 2) {
    const last = value.pop()
    return value.join(', ') + ', or ' + last
  } else {
    return value.pop()
  }
}

const fixBooleanType = (val) => {
  return val ? 'Yes' : 'No'
}

const nl2br = (value, noValue = true) => {
  if (!value) {
    return noValue ? '-' : ''
  } else {
    const breakTag = '<br />'
    return (value + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2')
  }
}

const strLimit = (string, limit, appendEllipsis = true) => {
  if (string) {
    return string.slice(0, limit) + (appendEllipsis && string.length > limit ? '...' : '')
  }
  return string
}

const momentFormat = (datetime, format, toUserTimezone = false) => {
  if (toUserTimezone) {
    return window.moment.utc(datetime).tz(window.timezone).format(format)
  }
  return window.moment(datetime).format(format)
}

const textTruncate = (text, lines, maxLength = 43) => {
  if (text) {
    const texts = { data: text.split('<br />').filter(Boolean) }
    if (texts.data.length >= 2) {
      texts.data = texts.data.slice(0, 2).join('<br />')
    } else {
      texts.data = text
    }
    const newMaxLength = maxLength * lines
    texts.data = texts.data.substring(0, (texts.data.length > newMaxLength ? newMaxLength : texts.data.length))
    const hasEllipse = texts.data.length < text.length
    texts.data = texts.data.replace(/^\s*<br\s*\/?>|<br\s*\/?>\s*$/g, '').trim()
    return texts.data + (hasEllipse ? '…' : '')
  }
  return text
}

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
    phoneNumber = phoneNumber.toString()
    phoneNumber = phoneNumber.replace(/\s+/g, '')
    phoneNumber = phoneNumber.replace('#', '')
    phoneNumber = phoneNumber.replace('.', '')

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

    if (phoneNumber.includes('power_dialer_task:')) {
      return phoneNumber
    }

    if (phoneNumber.includes('call:')) {
      return phoneNumber
    }

    if (phoneNumber.includes('barge:')) {
      return phoneNumber
    }

    if (phoneNumber.includes('whisper:')) {
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
    const pos = phoneNumber.indexOf('w')
    const suffix = { data: '' }
    if (pos !== -1) {
      suffix.data = phoneNumber.substring(pos, phoneNumber.length - 1).trim()
      phoneNumber = phoneNumber.substring(0, pos).trim()
    }

    if (phoneNumber.toString().length <= 9) {
      return force ? '-' : false
    }

    const locale = window.guessLocale(phoneNumber)

    if (!locale) {
      return force ? '-' : false
    }

    const tel = window.phoneUtil.parse(phoneNumber, locale)

    if (['US', 'CA'].includes(locale) && !format) {
      format = 'NATIONAL'
    }

    if (!format) {
      format = 'E164'
    }

    const formattedPhoneNumber = { data: null }

    if (format === 'INTERNATIONAL') {
      formattedPhoneNumber.data = window.phoneUtil.format(tel, window.PNF.INTERNATIONAL).toString()
    } else if (format === 'E164') {
      formattedPhoneNumber.data = window.phoneUtil.format(tel, window.PNF.E164).toString()
    } else {
      formattedPhoneNumber.data = window.phoneUtil.format(tel, window.PNF.NATIONAL).toString()
    }

    // if we have to include suffix
    if (includeSuffix) {
      formattedPhoneNumber.data = formattedPhoneNumber.data + suffix.data
    }

    return formattedPhoneNumber.data
  } else {
    return ''
  }
}

const numberPlusFormatter = (value, limit = 99) => {
  if (value >= limit) {
    return limit + '+'
  }
  return value
}

// eslint-disable-next-line no-return-assign,no-sequences
const sortObjectByKey = obj => Object.keys(obj).sort().reduce((res, key) => (res[key] = obj[key], res), {})

const objAlphabeticalOrder = (object, sortProp) => {
  object = object.sort((a, b) => {
    const textA = a[sortProp].toUpperCase()
    const textB = b[sortProp].toUpperCase()
    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0
  })

  return object
}

/**
 * Return duration in string format
 * @param {Number} duration
 * @param {Boolean} shouldDisplaySeconds
 * @returns String
 */
const fullDuration = (duration, shouldDisplaySeconds = true) => {
  if (duration === undefined) {
    return '-'
  }

  let seconds = duration
  let hour = Math.floor(seconds / 3600)
  let min = Math.floor(seconds / 60 % 60)
  let sec = Math.floor(seconds % 60)

  if (hour) {
    if (shouldDisplaySeconds) {
      return `${hour}h ${min}m ${sec}s`
    }

    return `${hour}h ${min}m`
  } else if (!hour && min) {
    if (shouldDisplaySeconds) {
      return `${min}m ${sec}s`
    }

    return `${min}m`
  }

  return `${sec}s`
}

/**
 * Converts date to short text ("8 Jan 2023")
 *
 * @param {Date} date
 * @returns String
 */
const fullShortDate = (date) => {
  return window.moment(date).format('MMM D, YYYY')
}

export default ({ Vue }) => {
  const filters = {
    fixPhone,
    toUpperCase,
    capitalize,
    initials,
    humanReadableBool,
    humanReadableDialMode,
    humanReadableCallRouterBehavior,
    ucfirst,
    checkIfEmpty,
    checkIfTrue,
    prettifyCamelCase,
    ucwords,
    filterDomain,
    fixCompanyRole,
    truncate,
    toInt,
    'numFormat': numberFormat,
    fixOrder,
    pretty,
    firstName,
    lastName,
    replaceDash,
    agentStatusClass,
    readableArrayValue,
    fixBooleanType,
    nl2br,
    strLimit,
    momentFormat,
    textTruncate,
    numberPlusFormatter,
    sortObjectByKey,
    objAlphabeticalOrder,
    fullDuration,
    fullShortDate
  }
  Object.keys(filters).map(k => Vue.filter(k, filters[k]))
}
