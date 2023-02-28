import { updateField } from 'vuex-map-fields'

export default {
  SET_LOADING_USERS: (state, data) => {
    state.isLoadingUsers = data
  },

  SET_LOADING_QUEUED_CALLS: (state, data) => {
    state.isLoadingQueuedCalls = data
  },

  SET_LOADING_LIVE_CALLS: (state, data) => {
    state.isLoadingLiveCalls = data
  },

  SET_LOADING_PARKED_CALLS: (state, data) => {
    state.isLoadingParkedCalls = data
  },

  updateField
}
