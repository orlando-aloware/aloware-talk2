export default {
  getReportGroups: async ({ commit }) => {
    // Actual API call
    let res1 = await window.axios.get(`http://localhost:3000/report`)
    let res2 = await window.axios.get(`http://localhost:3000/metrics`)
    commit('SET_REPORT_GROUP', res1.data)
    commit('SET_METRICS', res2.data)
  },
  deleteMetrics: async ({ commit }, id = '') => {
    // Actual API call
    let res = await window.axios.delete(`http://localhost:3000/metrics/${id}`)
    if (res.status === 200) {
      commit('REMOVE_METRICS', id)
    }
  }
}
