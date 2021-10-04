// import qs from 'qs'

export default {
  /**
   * Actual API calls for
   * REPORT GROUPS
   */
  addMetricGroup: async ({ commit }, data) => {
    commit('ADD_METRIC_GROUP', data)
  },
  setMetricGroups: async ({ commit }, data) => {
    commit('SET_METRIC_GROUPS', data)
  },
  setMetricGroupMetrics: async ({ commit }, data) => {
    commit('SET_METRIC_GROUP_METRICS', data)
  },
  updateMetricGroup: async ({ commit }, data) => {
    commit('UPDATE_METRIC_GROUP', data)
  },
  updateMetricGroupOrder: async ({ commit }, data) => {
    commit('UPDATE_METRIC_GROUP_ORDER', data)
  },
  deleteMetricGroup: async ({ commit }, metricGroupId) => {
    commit('REMOVE_METRIC_GROUP', metricGroupId)
  },
  setAvailableMetrics: async ({ commit }, data) => {
    commit('SET_AVAILABLE_METRICS', data)
  },
  /**
   * Actual API calls for
   * METRICS
   */
  addMetric: async ({ commit }, data) => {
    commit('ADD_METRIC', data)
  },
  updateMetric: async ({ commit }, data) => {
    commit('UPDATE_METRIC', data)
  },
  updateMetricOrder: async ({ commit }, data) => {
    commit('UPDATE_METRIC_ORDER', data)
  },
  deleteMetric: async ({ commit }, data) => {
    commit('REMOVE_METRICS', data)
  }
}
