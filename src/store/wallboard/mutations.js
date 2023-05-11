import { isLiveCall, isParkedCall, isQueuedCall } from 'src/plugins/helpers/functions'

export default {
  DELETE_CALL: (state, communication) => {
    // try to delete the communication in all states
    Object.keys(state.calls)
      .forEach(disposition => {
        const index = state.calls[disposition].findIndex(comm => comm.id === communication.id)

        if (index >= 0) {
          state.calls[disposition].splice(index, 1)
        }
      })
  },

  SET_AGENT: (state, agent) => {
    const agentIndex = state.agents.findIndex(u => u.id === agent.id)

    // update agent status in store if found
    if (agentIndex >= 0) {
      state.agents.splice(agentIndex, 1, agent)
    } else {
      state.agents.push(agent)
    }
  },

  SET_AGENTS: (state, data) => {
    state.agents = data
  },

  SET_AGENTS_LOADING: (state, data) => {
    state.isAgentsLoading = data
  },

  SET_AGENT_STATUS: (state, data) => {
    const agentIndex = state.agents.findIndex(agent => agent.id === data.user_id)

    // update agent status in store if found
    if (agentIndex >= 0) {
      state.agents[agentIndex].agent_status = data.agent_status

      // update last status date field if present
      if ('last_agent_status_change' in data) {
        state.agents[agentIndex].last_agent_status_change = data.last_agent_status_change
      }
    }
  },

  SET_FILTER: (state, { filter, value }) => {
    state.filters[filter] = value
  },

  SET_LIVE_CALL: (state, communication) => {
    const index = state.calls.live.findIndex(comm => comm.id === communication.id)

    // only remove call from state if state isn't live
    if (!isLiveCall(communication)) {
      if (index >= 0) {
        state.calls.live.splice(index, 1)
      }

      return
    }

    // add or update the state otherwise
    if (index >= 0) {
      state.calls.live.splice(index, 1, communication)
    } else {
      state.calls.live.unshift(communication)
    }
  },

  SET_LIVE_CALLS: (state, data) => {
    state.calls.live = data
  },

  SET_LIVE_CALLS_LOADING: (state, data) => {
    state.isLiveCallsLoading = data
  },

  SET_OVERVIEW_DETAILED: (state, payload) => {
    state.isOverviewDetailed = payload
  },

  SET_PARKED_CALL: (state, communication) => {
    const index = state.calls.parked.findIndex(comm => comm.id === communication.id)

    // only remove call from state if state isn't parked
    if (!isParkedCall(communication)) {
      if (index >= 0) {
        state.calls.parked.splice(index, 1)
      }

      return
    }

    // add or update the state otherwise
    if (index >= 0) {
      state.calls.parked.splice(index, 1, communication)
    } else {
      state.calls.parked.unshift(communication)
    }
  },

  SET_PARKED_CALLS: (state, data) => {
    state.calls.parked = data
  },

  SET_PARKED_CALLS_LOADING: (state, data) => {
    state.isParkedCallsLoading = data
  },

  SET_QUEUED_CALL: (state, communication) => {
    const index = state.calls.queued.findIndex(comm => comm.id === communication.id)

    // only remove call from state if state isn't queued
    if (!isQueuedCall(communication)) {
      if (index >= 0) {
        state.calls.queued.splice(index, 1)
      }

      return
    }

    // add or update the state otherwise
    if (index >= 0) {
      state.calls.queued.splice(index, 1, communication)
    } else {
      state.calls.queued.unshift(communication)
    }
  },

  SET_QUEUED_CALLS: (state, data) => {
    state.calls.queued = data
  },

  SET_QUEUED_CALLS_LOADING: (state, data) => {
    state.isQueuedCallsLoading = data
  },

  SET_SUMMARY: (state, data) => {
    state.summary = { ...state.summary, ...data }
  },

  SET_SUMMARY_LOADING: (state, data) => {
    state.isSummaryLoading = data
  },

  SET_VIEW_MODE: (state, mode) => {
    if (!['compact', 'comfort'].includes(mode)) {
      throw new Error('Invalid mode!')
    }

    state.viewMode = mode
  },

  TOGGLE_CALLS_COLUMN: (state, column) => {
    const index = state.callsEnabledColumns.findIndex(c => c === column)

    if (index >= 0) {
      state.callsEnabledColumns.splice(index, 1)
    } else {
      state.callsEnabledColumns.push(column)
    }
  }
}
