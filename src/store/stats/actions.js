export default {
  /**
   * Actual API calls for
   * REPORT GROUPS
   */
  setMetricLoader: ({ commit }, value) => {
    commit('TOGGLE_METRIC_LOADER', value)
  },
  setGroupMetricLoader: ({ commit }, value) => {
    commit('TOGGLE_GROUP_METRIC_LOADER', value)
  },
  addMetricGroup: ({ commit }, data) => {
    commit('ADD_METRIC_GROUP', data)
  },
  setMetricGroups: ({ commit }, data) => {
    commit('SET_METRIC_GROUPS', data)
  },
  setMetricGroupMetrics: ({ commit }, data) => {
    commit('SET_METRIC_GROUP_METRICS', data)
  },
  updateMetricGroup: ({ commit }, data) => {
    commit('UPDATE_METRIC_GROUP', data)
  },
  updateMetricGroupOrder: ({ commit }, data) => {
    commit('UPDATE_METRIC_GROUP_ORDER', data)
  },
  deleteMetricGroup: ({ commit }, metricGroupId) => {
    commit('REMOVE_METRIC_GROUP', metricGroupId)
  },
  setAvailableMetrics: ({ commit }, data) => {
    commit('SET_AVAILABLE_METRICS', data)
  },
  /**
   * Actual API calls for
   * METRICS
   */
  addMetric: ({ commit }, data) => {
    commit('ADD_METRIC', data)
  },
  updateMetric: ({ commit }, data) => {
    commit('UPDATE_METRIC', data)
  },
  updateMetricOrder: ({ commit }, data) => {
    commit('UPDATE_METRIC_ORDER', data)
  },
  deleteMetric: ({ commit }, data) => {
    commit('REMOVE_METRICS', data)
  }
}
