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
export function filterCalls (calls, state) {
  return calls.filter(call => {
    // ring group filter
    const ringGroup = !state.filters.ringGroup
      ? true
      : call.ring_group_id === state.filters.ringGroup

    // agent name filter
    let agentName = true

    if (state.filters.agent) {
      // skip this call if agent name filter is filled, but the call doesnt contain a user
      if (!call.user_id) {
        return false
      }

      const agent = state.agents.find(agent => agent.id === call.user_id)

      // checks if agent name contains the term searched
      agentName = agent.name.toUpperCase().includes(state.filters.agent.toUpperCase())
    }

    return ringGroup && agentName
  })
}

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

/**
 * Deeply clones an object, handling circular references safely.
 * @param {Object} value The object to clone.
 * @returns {Object} A deep clone of the object.
 */
export const cloneDeep = (value, map = new WeakMap()) => {
  // Base case: if the value is not an object (or is null), return it directly.
  // This handles primitive types which do not need cloning.
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
