export default {
  SET_AGENT_STATUS: (state, data) => {
    const userIndex = state.users.findIndex(user => user.id === data.user_id)

    // update user status in store if found
    if (userIndex >= 0) {
      state.users[userIndex].agent_status = data.agent_status

      // update last status date field if present
      if ('last_agent_status_change' in data) {
        state.users[userIndex].last_agent_status_change = data.last_agent_status_change
      }
    }
  },

  SET_FILTER: (state, { filter, value }) => {
    state.filters[filter] = value
  },

  SET_LIVE_CALLS_LOADING: (state, data) => {
    state.isLiveCallsLoading = data
  },

  SET_LIVE_CALLS: (state, data) => {
    state.calls.live = data
  },

  SET_PARKED_CALLS_LOADING: (state, data) => {
    state.isParkedCallsLoading = data
  },

  SET_PARKED_CALLS: (state, data) => {
    state.calls.parked = data
  },

  SET_QUEUED_CALLS_LOADING: (state, data) => {
    state.isQueuedCallsLoading = data
  },

  SET_QUEUED_CALLS: (state, data) => {
    state.calls.queued = data
  },

  SET_SUMMARY: (state, data) => {
    state.summary = { ...state.summary, ...data }
  },

  SET_SUMMARY_LOADING: (state, data) => {
    state.isSummaryLoading = data
  },

  SET_VIEW_MODE: (state, mode) => {
    state.viewMode = mode
  },

  SET_USER: (state, user) => {
    const userIndex = state.users.findIndex(u => u.id === user.id)

    // update user status in store if found
    if (userIndex >= 0) {
      state.users.splice(userIndex, 1, user)
    } else {
      state.users.push(user)
    }
  },

  SET_USERS: (state, data) => {
    state.users = data
  },

  SET_USERS_LOADING: (state, data) => {
    state.isUsersLoading = data
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
