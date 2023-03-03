import { updateField } from 'vuex-map-fields'

export default {
  SET_FILTER: (state, { filter, value }) => {
    state.filters[filter] = value
  },

  SET_USERS_LOADING: (state, data) => {
    state.isUsersLoading = data
  },

  SET_QUEUED_CALLS_LOADING: (state, data) => {
    state.isQueuedCallsLoading = data
  },

  SET_LIVE_CALLS_LOADING: (state, data) => {
    state.isLiveCallsLoading = data
  },

  SET_PARKED_CALLS_LOADING: (state, data) => {
    state.isParkedCallsLoading = data
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

  updateField
}
