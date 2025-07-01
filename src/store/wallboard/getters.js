import { filterCalls } from 'src/plugins/helpers/functions'

export default {
  getAgents: (state, getters, rootState) => {
    return rootState.users
      .filter(agent => {
        // only valid agents
        if (agent.is_destination || agent.read_only_access || !agent.enabled || !agent.active) {
          return false
        }

        // agent name filter
        if (state.filters.agent && !agent.name.toUpperCase().includes(state.filters.agent.toUpperCase())) {
          return false
        }

        // status filter
        if (state.filters.agentStatus !== 'all' && agent.agent_status !== state.filters.agentStatus) {
          return false
        }

        // ring group filter
        if (state.filters.ringGroup) {
          // check if ring group has teams configured and agent is in the team
          const ringGroup = rootState.ringGroups?.find((rg) => rg.id === state.filters.ringGroup)
          let isAgentInRingGroupTeam = false
          if (ringGroup) {
            for (const team of ringGroup?.teams ?? []) {
              if (team.users?.some((teamUser) => teamUser.id === agent.id)) {
                isAgentInRingGroupTeam = true
                break
              }
            }
          }

          if (!isAgentInRingGroupTeam && !agent.ring_group_ids.includes(state.filters.ringGroup)) {
            return false
          }
        }

        // team filter
        if (state.filters.teamId) {
          const team = rootState?.teams?.find(team => team.id === state.filters.teamId)
          if (!team || !team.users.includes(agent.id)) {
            return false
          }
        }

        return true
      })
  },

  getCallsEnabledColumns: (state) => {
    return state.callsEnabledColumns
  },

  getFilters: (state) => {
    return state.filters
  },

  getLiveCalls: (state, getters, rootState) => {
    return filterCalls(state.calls.live, rootState)
  },

  getParkedCalls: (state, getters, rootState) => {
    return filterCalls(state.calls.parked, rootState)
  },

  getQueuedCalls: (state, getters, rootState) => {
    return filterCalls(state.calls.queued, rootState)
  },

  getSummary: (state) => {
    return state.summary
  },

  getViewMode: (state) => {
    return state.viewMode
  }
}
