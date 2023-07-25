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

export const mergeObjectsAndAddValues = (obj1, obj2) => {
  const result = JSON.parse(JSON.stringify(obj1))

  for (let key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      if (typeof obj2[key] === 'object' && obj1.hasOwnProperty(key) && typeof obj1[key] === 'object') {
        result[key] = mergeObjectsAndAddValues(obj1[key], obj2[key])
        continue
      }

      result[key] = (obj1[key] || 0) + obj2[key]
    }
  }

  return result
}
