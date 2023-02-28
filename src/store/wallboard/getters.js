import { getField } from 'vuex-map-fields'

export default {
  getUsers: (state) => {
    return state.users
  },

  getQueuedCalls: (state) => {
    return state.calls.queued
  },

  getLiveCalls: (state) => {
    return state.calls.live
  },

  getParkedCalls: (state) => {
    return state.calls.parked
  },

  getField
}
