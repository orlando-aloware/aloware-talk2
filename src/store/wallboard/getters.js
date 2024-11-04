import { filterCalls } from 'src/plugins/helpers/functions'

export default {
  getAgents: (state) => {
    return state.agents
      .filter(agent => {
        // only valid agents
        if (agent.is_destination || agent.read_only_access || !agent.enabled || !agent.active) {
          return false
        }

        // agent name filter
        const name = !state.filters.agent
          ? true
          : agent.name.toUpperCase().includes(state.filters.agent.toUpperCase())

        // status filter
        const status = state.filters.agentStatus === 'all'
          ? true
          : agent.agent_status === state.filters.agentStatus

        // ring group filter
        const ringGroup = !state.filters.ringGroup
          ? true
          : agent.ring_group_ids.includes(state.filters.ringGroup)

        return name && status && ringGroup
      })
  },

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
  }
}
