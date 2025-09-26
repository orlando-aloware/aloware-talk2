import * as CallbackStatus from 'src/constants/callback-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationDirections from 'src/constants/communication-direction'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'

/**
 * Filter calls based on currently used filters
 * @param {array} calls
 * @param {object} state
 * @returns {array}
 */
export function filterCalls (calls, state, rootState) {
  return calls.filter(call => {
    if (state.filters.campaignId && call.campaign_id !== state.filters.campaignId) {
      return false
    }

    // ring group filter
    if (state.filters.ringGroup && call.ring_group_id !== state.filters.ringGroup) {
      return false
    }

    if (state.filters.agent) {
      // skip this call if agent name filter is filled, but the call doesn't contain a user
      if (!call.user_id) {
        return false
      }

      const agent = call.user ? call.user : rootState.users.find(agent => agent.id === call.user_id)

      // checks if agent name contains the term searched
      if (!agent.name.toUpperCase().includes(state.filters.agent.toUpperCase())) {
        return false
      }
    }

    // team filter
    if (state.filters.teamId) {
      // skip this call if team filter is filled, but the call doesn't contain a user
      if (!call.user_id) {
        return false
      }

      const agent = rootState.users.find(agent => agent.id === call.user_id)

      // checks if agent belongs to the selected team
      const team = rootState?.teams?.find(team => team.id === state.filters.teamId)
      if (!team || !team.users?.includes(agent.id)) {
        return false
      }
    }

    return true
  })
}

/**
 * Checks if communication is live
 *
 * @param {Object} communication
 * @returns Boolean
 */
export const isLiveCall = (communication) => {
  if (!communication) {
    return false
  }

  if (communication.disposition_status2 && communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
    return false
  }

  if (communication.current_status2 && communication.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW) {
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

export const checkIsNumeric = (value) => {
  let regex = /^-{0,1}\d*\.{0,1}\d+$/

  return regex.test(value)
}

export const mergeObjectsAndAddValues = (obj1, obj2) => {
  const result = JSON.parse(JSON.stringify(obj1))

  for (let key in obj2) {
    if (obj2 && obj2.hasOwnProperty(key)) {
      if (typeof obj2[key] === 'object' &&
        obj1 && obj1.hasOwnProperty(key) &&
        typeof obj1[key] === 'object') {
        result[key] = mergeObjectsAndAddValues(obj1[key], obj2[key])
        continue
      }

      const value = (obj1[key] || 0)

      if (checkIsNumeric(value) && checkIsNumeric(obj2[key])) {
        result[key] = value + obj2[key]
      }
    }
  }

  return result
}

/**
 * Deeply clones an object, handling circular references safely.
 * @param {Object} value The object to clone.
 * @returns {Object} A deep clone of the object.
 */
export const cloneDeep = (value, map = new WeakMap()) => {
  if (value === null || typeof value !== 'object') {
    return value
  }

  // Circular reference check: if this object has already been visited, return its cloned version.
  // This prevents infinite loops when cloning objects that reference themselves, directly or indirectly.
  if (map.has(value)) {
    return map.get(value)
  }

  // Determine the structure of the clone based on whether the value is an array or an object.
  // This keeps array values as arrays and object values as objects.
  const clone = Array.isArray(value) ? [] : {}

  // Store the clone in the map with the original object as the key.
  // This allows us to reference it later if we encounter a circular reference.
  map.set(value, clone)

  // Recursively clone each property of the object.
  // This ensures that nested objects and arrays are deeply cloned.
  Object.keys(value).forEach(key => {
    clone[key] = cloneDeep(value[key], map)
  })

  // Return the cloned object, which is now a deep clone of the original,
  // with circular references safely handled.
  return clone
}

/**
 * Sets a cookie with the given name, value, and expiration days.
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value of the cookie.
 * @param {number} days - The number of days until the cookie expires.
 */
export function setCookie (name, value, days) {
  const date = new Date()
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
  const expires = '; expires=' + date?.toUTCString()
  const domain = getTopLevelDomain()
  document.cookie = `${name}=${value || ''}${expires}; path=/; domain=${domain}`
}

/**
 * Retrieves the value of a cookie by its name.
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {string|null} The value of the cookie, or null if not found.
 */
export function getCookie (name) {
  const nameEQ = name + '='

  const ca = document?.cookie?.split(';')
  if (!ca) {
    return null
  }

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === ' ') c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

/**
 * Gets the top-level domain of the current page.
 * @returns {string|null} The top-level domain, or null if it can't be determined.
 */
export function getTopLevelDomain () {
  const hostParts = window?.location?.hostname?.split('.')
  if (!hostParts || hostParts.length <= 1) {
    return null
  }

  return '.' + hostParts.slice(1).join('.')
}

/**
 * Converts a query object to a query string
 * @param {Object} query
 * @returns {string}
 */
export const getQueryString = (query) => {
  if (!query) {
    return ''
  }

  return `?${Object.entries(query).map(([key, value]) => `${key}=${value}`).join('&')}`
}
