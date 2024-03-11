import _ from 'lodash'
import * as LrnTypes from '../../constants/lrn-types'
import * as ContactTaskStatus from '../../constants/contact-task-status'

/**
 * Fix count format to have k suffix
 * @param {string} dateOfBirth
 * @returns {string|*}
 */
const fixCount = (num) => {
  return Math.abs(num) > 999
    ? Math.sign(num) * (Math.abs(num) / 1000).toFixed(1) + 'k'
    : Math.sign(num) * Math.abs(num)
}

/**
 * Fix date of birth
 * @param {string} dateOfBirth
 * @returns {string|*}
 */
const fixDateOfBirth = (dateOfBirth) => {
  if (dateOfBirth) {
    return dateOfBirth
  }

  return 'N/A'
}

const fixContactName = (name) => {
  if (name) {
    return name.capitalize()
  }

  return 'No Name'
}

/**
 * Fix name
 * @param {string} name
 * @returns {string|*}
 */
const fixName = (name) => {
  if (name) {
    return name
  }

  return 'N/A'
}

/**
 * Fix country
 * @param {string} country
 * @returns {string}
 */
const fixCountry = (country) => {
  if (country) {
    return _.capitalize(country)
  }

  return 'N/A'
}

/**
 * Fix state
 * @param {string} state
 * @returns {string}
 */
const fixState = (state) => {
  if (state) {
    return _.capitalize(state)
  }

  return 'N/A'
}

/**
 * Fix city
 * @param {string} city
 * @returns {string}
 */
const fixCity = (city) => {
  if (city) {
    return _.capitalize(city)
  }

  return 'N/A'
}

/**
 * Fix zipcode
 * @param {string} zipcode
 * @returns {string|*}
 */
const fixZipcode = (zipcode) => {
  if (zipcode) {
    return zipcode
  }

  return 'N/A'
}

/**
 * Fix email address
 * @param {string} email
 * @returns {string|*}
 */
const fixEmail = (email) => {
  if (email) {
    return email
  }

  return 'N/A'
}

/**
 * Fix timezone
 * @param {string} timezone
 * @returns {string|*}
 */
const fixTimezone = (timezone) => {
  if (timezone) {
    return timezone
  }

  return 'N/A'
}

/**
 * Fix lrn type
 * @param {number} lrnType
 * @returns {string}
 */
const fixLrnType = (lrnType) => {
  // LRN_TYPE_LANDLINE = 0 so it couldn't pass the if statement because 0 != true.
  if (lrnType !== null) {
    switch (lrnType) {
      case LrnTypes.LRN_TYPE_LANDLINE:
        return 'Landline'
      case LrnTypes.LRN_TYPE_WIRELESS:
        return 'Wireless'
      case LrnTypes.LRN_TYPE_VOIP:
        return 'VOIP'
      case LrnTypes.LRN_TYPE_OTHER:
        return 'Other'
      default:
        return ''
    }
  }

  return ''
}

const validLrnType = (type) => {
  return ![null, undefined].includes(type)
}

/**
 * Fix task status name, returns name
 * @param {number} taskStatusId
 * @returns {string}
 */
const fixTaskStatusName = (taskStatusId) => {
  switch (taskStatusId) {
    case ContactTaskStatus.STATUS_PENDING:
      return 'Pending'
    case ContactTaskStatus.STATUS_CLOSED:
      return 'Closed'
    case ContactTaskStatus.STATUS_NEW:
      return 'New'
    case ContactTaskStatus.STATUS_OPEN:
      return 'Open'
    case ContactTaskStatus.STATUS_ALL:
    default:
      return 'All'
  }
}

/**
 * Get task status id, returns id
 * @param {string} taskStatusName
 * @returns {number}
 */
const getTaskStatusIdByName = (taskStatusName) => {
  switch (taskStatusName) {
    case 'pending':
      return ContactTaskStatus.STATUS_PENDING
    case 'closed':
      return ContactTaskStatus.STATUS_CLOSED
    case 'new':
      return ContactTaskStatus.STATUS_NEW
    case 'open':
      return ContactTaskStatus.STATUS_OPEN
    case 'all':
    default:
      return ContactTaskStatus.STATUS_ALL
  }
}

export default ({ Vue }) => {
  const filters = {
    fixDateOfBirth,
    fixContactName,
    fixName,
    fixCountry,
    fixState,
    fixCity,
    fixZipcode,
    fixEmail,
    fixTimezone,
    fixLrnType,
    fixCount,
    validLrnType,
    fixTaskStatusName,
    getTaskStatusIdByName
  }
  Object.keys(filters).map((k) => Vue.filter(k, filters[k]))
}
