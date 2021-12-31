import Vue from 'vue'
import { updateField } from 'vuex-map-fields'
import _ from 'lodash'

export default {
  SET_METRIC_GROUPS: (state, data) => {
    if (_.isEmpty(data)) {
      state.metricGroups = []
      return
    }

    for (let index in data) {
      if (typeof data[index].agent_metrics === 'undefined') {
        continue
      }

      for (let metricIndex in data[index].agent_metrics) {
        const metric = state.availableMetrics.find(metric => metric.metric_id === data[index].agent_metrics[metricIndex].metric_id)

        if (!metric) {
          continue
        }

        data[index].agent_metrics[metricIndex].category = metric.category
        data[index].agent_metrics[metricIndex].categoryLabel = metric.categoryLabel

        if (typeof data[index].agent_metrics[metricIndex].label !== 'undefined') {
          continue
        }

        data[index].agent_metrics[metricIndex].label = metric.label
      }
    }

    state.metricGroups = data
  },
  SET_METRIC_GROUP_METRICS: (state, data) => {
    const metricGroup = state.metricGroups.find(metricGroup => metricGroup.id === data.metricGroupId)
    const index = metricGroup ? state.metricGroups.indexOf(metricGroup) : null

    if (index === -1 || index === null) {
      return
    }

    Vue.set(state.metricGroups[index], 'agent_metrics', data.data)
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

    if (index === -1 || index === null || typeof data.agent_metrics === 'undefined') {
      return
    }

    for (let metricIndex in data.agent_metrics) {
      let metric = _.get(metricGroup.agent_metrics, metricIndex, null)
      let metricInfo = !metric ? state.availableMetrics.find(metricItem => metricItem.name === data.agent_metrics[metricIndex].name) : null

      if (metricInfo) {
        data.agent_metrics[metricIndex].category = metricInfo.category
        data.agent_metrics[metricIndex].categoryLabel = metricInfo.categoryLabel
        continue
      }

      metricInfo = state.availableMetrics.find(metricItem => metricItem.name === data.agent_metrics[metricIndex].name)

      if (!metricInfo) {
        continue
      }

      for (let metricKey in metricInfo) {
        let metricPropValue = _.get(data.agent_metrics[metricIndex], metricKey, null)
        if (!metricPropValue) {
          data.agent_metrics[metricIndex][metricKey] = metricInfo[metricKey]
        }
      }
    }

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

    if (data.step > 0) {
      for (let index in state.metricGroups) {
        if (index < newIndex) {
          Vue.set(state.metricGroups[index], 'order', (state.metricGroups[index].order - 1))
        }
      }
    }

    if (data.step < 0) {
      for (let index in state.metricGroups) {
        if (index > newIndex) {
          Vue.set(state.metricGroups[index], 'order', (state.metricGroups[index].order + 1))
        }
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

    const metric = state.availableMetrics.find(metric => metric.metric_id === data.data.metric_id)

    if (metric) {
      data.data.category = metric.category
      data.data.categoryLabel = metric.categoryLabel
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

    if (state.metricGroups[metricGroupIndex].agent_metrics.length) {
      // arrange the metrics by order
      let metricsLilst = JSON.parse(JSON.stringify(state.metricGroups[metricGroupIndex].agent_metrics))
      metricsLilst.sort((a, b) => (a.order > b.order) ? 1 : -1)
      Vue.set(state.metricGroups, `${metricGroupIndex}.agent_metrics`, metricsLilst)
    }

    const metric = state.metricGroups[metricGroupIndex].agent_metrics.find(metric => metric.id === data.metricId)
    const metricIndex = metric ? state.metricGroups[metricGroupIndex].agent_metrics.indexOf(metric) : null

    if (metricIndex === -1 || metricIndex === null) {
      return
    }

    let newIndex = state.metricGroups[metricGroupIndex].agent_metrics.find(metric => metric.order === data.order)
    newIndex = newIndex ? state.metricGroups[metricGroupIndex].agent_metrics.indexOf(newIndex) : 0

    // store the old order of the metric
    const oldMetricOrder = metric.order
    // assign the new order
    metric.order = data.order
    // move the metric to its new index
    state.metricGroups[metricGroupIndex].agent_metrics.splice(metricIndex, 1)
    state.metricGroups[metricGroupIndex].agent_metrics.splice(newIndex, 0, metric)

    // if metric was moved more than 1 step up, update the order of the metrics below it
    if (data.step > 1) {
      for (let index = (newIndex - 1); index >= 0; index--) {
        data.order -= 1
        Vue.set(state.metricGroups[metricGroupIndex].agent_metrics[index], 'order', data.order)
      }
      return
    }
    // if metric was moved more than 1 step down, update the order of the metrics above it
    if (data.step < -1) {
      for (let index = (newIndex + 1); index < state.metricGroups[metricGroupIndex].agent_metrics.length; index++) {
        data.order += 1
        Vue.set(state.metricGroups[metricGroupIndex].agent_metrics[index], 'order', data.order)
      }
      return
    }
    // moved only 1 step up or down
    Vue.set(state.metricGroups[metricGroupIndex].agent_metrics[(newIndex - data.step)], 'order', oldMetricOrder)
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
  TOGGLE_GROUP_METRIC_LOADER: (state, value) => {
    state.groupMetricLoader = value
  },
  SET_AVAILABLE_METRICS: (state, data) => {
    state.availableMetrics = data
  },
  updateField,
  RESET_STAT_VUEX: (state) => {
    state.availableMetrics = []
    state.metricGroups = []
    state.metricLoader = false
    state.groupMetricLoader = false
  }
}
