// import qs from 'qs'

export default {
  getReportGroups: async ({ commit }) => {
    // Actual API call
    let res1 = await window.axios.get(`http://localhost:3000/reports`)
    let res2 = await window.axios.get(`http://localhost:3000/metrics`)
    commit('SET_REPORT_GROUP', res1.data)
    commit('SET_METRICS', res2.data)
  },
  createReportGroup: async ({ commit }, params = {}) => {
    let res = await window.axios.post('http://localhost:3000/reports', params)
    if (res.status === 201) {
      commit('ADD_REPORT_GROUP', res.data)
    }
  },
  updateReportGroup: async ({ commit }, params = {}) => {
    let res = await window.axios.patch(`http://localhost:3000/reports/${params.id}`, params)
    console.log('res :>> ', res)
  },
  deleteReportGroup: async ({ commit }, id = '') => {
    let res = await window.axios.delete(`http://localhost:3000/reports/${id}`)
    if (res.status === 200) {
      commit('REMOVE_REPORT_GROUP', id)
    }
  },
  deleteMetrics: async ({ commit }, id = '') => {
    // Actual API call
    let res = await window.axios.delete(`http://localhost:3000/metrics/${id}`)
    if (res.status === 200) {
      commit('REMOVE_METRICS', id)
    }
  }
}
