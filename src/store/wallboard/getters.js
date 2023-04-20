import { filterCalls } from 'src/plugins/helpers/functions'

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
    return state.users
      .filter(user => {
        // only valid users
        if (user.is_destination || user.read_only_access || !user.enabled || !user.active) {
          return false
        }

        // agent name filter
        const name = !state.filters.agent
          ? true
          : user.name.toUpperCase().includes(state.filters.agent.toUpperCase())

        // status filter
        const status = state.filters.agentStatus === 'all'
          ? true
          : user.agent_status === state.filters.agentStatus

        // ring group filter
        const ringGroup = !state.filters.ringGroup
          ? true
          : user.ring_group_ids.includes(state.filters.ringGroup)

        return name && status && ringGroup
      })
  }
}
