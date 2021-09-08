
import { updateField } from 'vuex-map-fields'

export default {
  SET_REPORT_GROUP: (state, data) => {
    state.report_group = data
  },
  ADD_REPORT_GROUP: (state, data) => {
    state.report_group.push(data)
  },
  REMOVE_REPORT_GROUP: (state, data) => {
    let selectedKey = null
    state.report_group.forEach((rg, key) => {
      if (rg.id === data) {
        selectedKey = key
      }
    })
    state.report_group.splice(selectedKey, 1)
  },
  SET_METRICS: (state, data) => {
    state.metrics = data
  },
  ADD_METRIC: (state, data) => {
    state.metrics.push(data)
  },
  UPDATE_METRICS: (state, data) => {
    state.metrics.forEach((met, index) => {
      if (met.id === data.id) {
        state.metrics[index] = data
      }
    })
    console.log('state.metrics :>> ', state.metrics)
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
  TOGGLE_METRIC_LOADER: (state, value) => {
    state.metric_loader = value
  },
  updateField
}
