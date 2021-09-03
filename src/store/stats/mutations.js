export default {
  SET_REPORT_GROUP: (state, data) => {
    state.report_group = data
  },
  ADD_REPORT_GROUP: (state, data) => {
    state.report_group.push(data)
  },
  SET_METRICS: (state, data) => {
    state.metrics = data
  },
  REMOVE_METRICS: (state, data) => {
    let selectedKey = null
    state.metrics.forEach((metric, key) => {
      if (metric.id === data) {
        selectedKey = key
      }
    })
    state.metrics.splice(selectedKey, 1)
  },
  REMOVE_REPORT_GROUP: (state, data) => {
    let selectedKey = null
    state.report_group.forEach((rg, key) => {
      if (rg.id === data) {
        selectedKey = key
      }
    })
    state.report_group.splice(selectedKey, 1)
  }
}
