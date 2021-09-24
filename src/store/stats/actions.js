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
  updateMetricGroup: async ({ commit }, data) => {
    commit('UPDATE_METRIC_GROUP', data)
  },
  deleteMetricGroup: async ({ commit }, metricGroupId) => {
    commit('REMOVE_METRIC_GROUP', metricGroupId)
  },
  updateMetric: async ({ commit }, params = {}) => {
    await window.axios.patch(`/api/v2/agents/${params.userId}/statistics/metric-groups/${params.metricGroupId}/order`)
    commit('UPDATE_METRIC', params.metricGroupId)
    // await console.log(`REQUEST PAYLOAD: .../metric-group/${params.id}/order?direction=${params.direction}&step=${params.step}`)
  },
  setAvailableMetrics: async ({ commit }, data) => {
    commit('SET_AVAILABLE_METRICS', data)
  },
  /**
   * Actual API calls for
   * METRICS
   */
  addMetric: async ({ commit }, payload) => {
    commit('ADD_METRIC', payload)
  },
  updateMetrics: async ({ commit }, params = {}) => {
    await window.axios.patch(`/api/v2/agents/${params.userId}/statistics/metric-groups/${params.metricGroupId}/metrics/{metric_id}`, params.data)
  },
  deleteMetric: async ({ commit }, params = {}) => {
    // Actual API call
    let res = await window.axios.delete(`/api/v2/agents/${params.userId}/statistics/metric-groups/${params.metricGroupId}/metrics/${params.metricId}`)
    if (res.status === 200) {
      commit('REMOVE_METRICS', params.metricId)
    }
    return res
  }
}
