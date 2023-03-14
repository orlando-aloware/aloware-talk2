import { getField } from 'vuex-map-fields'

export default {
  getFilters: (state) => {
    return state.filters
  },

  getLiveCalls: (state) => {
    return state.calls.live
  },

  getParkedCalls: (state) => {
    return state.calls.parked
  },

  getQueuedCalls: (state) => {
    return state.calls.queued
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
