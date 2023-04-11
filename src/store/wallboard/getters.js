import { getField } from 'vuex-map-fields'

export default {
  getCallsEnabledColumns: (state) => {
    return state.callsEnabledColumns
  },

  getFilters: (state) => {
    return state.filters
  },

  getLiveCalls: (state) => {
    return filterCalls(state.calls.live, state)
  },

  getParkedCalls: (state) => {
    return filterCalls(state.calls.parked, state)
  },

  getQueuedCalls: (state) => {
    return filterCalls(state.calls.queued, state)
  },

  getSummary: (state) => {
    return state.summary
  },

  getViewMode: (state) => {
    return state.viewMode
  },

  getUsers: (state) => {
    // return only valid users to be used
    return state.users.filter(user => !user.is_destination && !user.read_only_access && user.enabled && user.active)
  },

  getField
}

/**
 * Filter calls based on currently used filters
 * @param {array} calls
 * @param {object} state
 * @returns {array}
 */
function filterCalls (calls, state) {
  return calls.filter(call => {
    // ring group filter
    const ringGroup = !state.filters.ringGroup
      ? true
      : call.ring_group_id === state.filters.ringGroup

    // agent name filter
    let agentName = true
    if (state.filters.agent) {
      const user = state.users.find(user => user.id === call.user_id)

      // checks if user name contains the term searched
      agentName = user.name.toUpperCase().includes(state.filters.agent.toUpperCase())
    }

    return ringGroup && agentName
  })
}
