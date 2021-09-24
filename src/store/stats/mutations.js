import Vue from 'vue'
import { updateField } from 'vuex-map-fields'

export default {
  SET_METRIC_GROUPS: (state, data) => {
    state.metricGroups = data
  },
  ADD_METRIC_GROUP: (state, data) => {
    state.metricGroups.unshift(data)
  },
  REMOVE_METRIC_GROUP: (state, metricGroupId) => {
    const metricGroup = state.metricGroups.find(metricGroup => metricGroup.id === metricGroupId)
    const index = metricGroup ? state.metricGroups.indexOf(metricGroup) : null
    if (index !== -1 && index !== null) {
      state.metricGroups.splice(index, 1)
    }
  },
  UPDATE_METRIC_GROUP: (state, data) => {
    const metricGroup = state.metricGroups.find(metricGroup => metricGroup.id === data.id)
    const index = metricGroup ? state.metricGroups.indexOf(metricGroup) : null
    if (index !== -1 && index !== null) {
      data.agent_metrics = metricGroup.agent_metrics
      Vue.set(state.metricGroups, index, data)
    }
    console.log('state.metrics :>> ', state.metrics)
  },
  ADD_METRIC: (state, payload) => {
    const metricGroup = state.metricGroups.find(metricGroup => metricGroup.id === payload.metricGroupId)
    const metricGroupIndex = metricGroup ? state.metricGroups.indexOf(metricGroup) : null

    if (metricGroupIndex === -1 || metricGroupIndex !== null) {
      return
    }

    state.metricGroups[metricGroupIndex].agent_metrics.push(payload.data)
  },
  UPDATE_METRIC: (state, payload) => {
    const metricGroup = state.metricGroups.find(metricGroup => metricGroup.id === payload.metricGroupId)
    const metricGroupIndex = metricGroup ? state.metricGroups.indexOf(metricGroup) : null

    if (metricGroupIndex === -1 || metricGroupIndex !== null) {
      return
    }

    const metric = state.metricGroups[metricGroupIndex].agent_metrics.find(metric => metric.id === payload.metricId)
    const metricIndex = metric ? state.metricGroups[metricGroupIndex].agent_metrics.indexOf(metric) : null

    if (metricIndex === -1 || metricIndex !== null) {
      return
    }

    Vue.set(state.metricGroups[metricGroupIndex].agent_metrics, metricIndex, payload.data)
    console.log('state.metrics :>> ', state.metrics)
  },
  REMOVE_METRICS: (state, data) => {
    const metricGroup = state.metricGroups.find(metricGroup => metricGroup.id === data.metricGroupId)
    const metricGroupIndex = metricGroup ? state.metricGroups.indexOf(metricGroup) : null
    console.log('metricGroupIndex: ', metricGroupIndex)

    if (metricGroupIndex === -1 || metricGroupIndex === null) {
      return
    }

    console.log('state.metricGroups[metricGroupIndex]: ', state.metricGroups[metricGroupIndex])
    const metric = state.metricGroups[metricGroupIndex].agent_metrics.find(metric => metric.id === data.metricId)
    const metricIndex = metric ? state.metricGroups[metricGroupIndex].agent_metrics.indexOf(metric) : null

    if (metricIndex === -1 || metricIndex !== null) {
      return
    }

    state.metricGroups[metricGroupIndex].agent_metrics.splice(metricIndex, 1)
  },
  TOGGLE_METRIC_LOADER: (state, value) => {
    state.metricLoader = value
  },
  SET_AVAILABLE_METRICS: (state, data) => {
    state.availableMetrics = data
  },
  updateField
}
