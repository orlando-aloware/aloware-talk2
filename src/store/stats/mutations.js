import Vue from 'vue'
import { updateField } from 'vuex-map-fields'

export default {
  SET_METRIC_GROUPS: (state, data) => {
    state.metricGroups = data
  },
  SET_METRIC_GROUP_METRICS: (state, data) => {
    // Vue.set(state.metricGroups = data
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

    if (index === -1 || index === null) {
      return
    }

    data.agent_metrics = metricGroup.agent_metrics
    Vue.set(state.metricGroups, index, data)
  },
  UPDATE_METRIC_GROUP_ORDER: (state, data) => {
    let metricGroup = state.metricGroups.find(metricGroup => metricGroup.id === data.metricGroupId)
    const index = metricGroup ? state.metricGroups.indexOf(metricGroup) : null

    if (index === -1 || index === null) {
      return
    }

    metricGroup.order = data.order
    state.metricGroups.splice(index, 1)
    const newIndex = (index + data.step)
    state.metricGroups.splice(newIndex, 0, metricGroup)

    for (let index in state.metricGroups) {
      if (index > newIndex && state.metricGroups[index].order >= data.order) {
        Vue.set(state.metricGroups[index], 'order', (state.metricGroups[index].order + 1))
      }
    }
  },
  ADD_METRIC: (state, data) => {
    const metricGroup = state.metricGroups.find(metricGroup => metricGroup.id === data.metricGroupId)
    const metricGroupIndex = metricGroup ? state.metricGroups.indexOf(metricGroup) : null

    if (metricGroupIndex === -1 || metricGroupIndex === null) {
      return
    }

    let index = 0
    if (typeof state.metricGroups[metricGroupIndex].agent_metrics === 'undefined') {
      state.metricGroups[metricGroupIndex].agent_metrics = []
    }

    if (state.metricGroups[metricGroupIndex].agent_metrics.constructor.name === 'Array') {
      index = state.metricGroups[metricGroupIndex].agent_metrics.length
    }

    if (state.metricGroups[metricGroupIndex].agent_metrics.constructor.name === 'Object') {
      index = Object.keys(state.metricGroups[metricGroupIndex].agent_metrics).length
    }

    Vue.set(state.metricGroups[metricGroupIndex].agent_metrics, index, data.data)
  },
  UPDATE_METRIC: (state, data) => {
    const metricGroup = state.metricGroups.find(metricGroup => metricGroup.id === data.agent_metric_group_id)
    const metricGroupIndex = metricGroup ? state.metricGroups.indexOf(metricGroup) : null

    if (metricGroupIndex === -1 || metricGroupIndex === null) {
      return
    }

    const metric = state.metricGroups[metricGroupIndex].agent_metrics.find(metric => metric.id === data.id)
    const metricIndex = metric ? state.metricGroups[metricGroupIndex].agent_metrics.indexOf(metric) : null

    if (metricIndex === -1 || metricIndex === null) {
      return
    }

    Vue.set(state.metricGroups[metricGroupIndex].agent_metrics, metricIndex, data)
  },
  UPDATE_METRIC_ORDER: (state, data) => {
    const metricGroup = state.metricGroups.find(metricGroup => metricGroup.id === data.metricGroupId)
    const metricGroupIndex = metricGroup ? state.metricGroups.indexOf(metricGroup) : null

    if (metricGroupIndex === -1 || metricGroupIndex === null) {
      return
    }

    const metric = state.metricGroups[metricGroupIndex].agent_metrics.find(metric => metric.id === data.metricId)
    const metricIndex = metric ? state.metricGroups[metricGroupIndex].agent_metrics.indexOf(metric) : null

    if (metricIndex === -1 || metricIndex === null) {
      return
    }

    metric.order = data.order
    state.metricGroups[metricGroupIndex].agent_metrics.splice(metricIndex, 1)
    const newIndex = (metricIndex + data.step)
    state.metricGroups[metricGroupIndex].agent_metrics.splice(newIndex, 0, metric)

    for (let index in state.metricGroups[metricGroupIndex].agent_metrics) {
      if (index > newIndex && state.metricGroups[metricGroupIndex].agent_metrics[index].order >= data.order) {
        Vue.set(state.metricGroups[metricGroupIndex].agent_metrics[index], 'order', (state.metricGroups[metricGroupIndex].agent_metrics[index].order + 1))
      }
    }
  },
  REMOVE_METRICS: (state, data) => {
    const metricGroup = state.metricGroups.find(metricGroup => metricGroup.id === data.metricGroupId)
    const metricGroupIndex = metricGroup ? state.metricGroups.indexOf(metricGroup) : null

    if (metricGroupIndex === -1 || metricGroupIndex === null) {
      return
    }

    const metric = state.metricGroups[metricGroupIndex].agent_metrics.find(metric => metric.id === data.id)
    const metricIndex = metric ? state.metricGroups[metricGroupIndex].agent_metrics.indexOf(metric) : null

    if (metricIndex === -1 || metricIndex === null) {
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
