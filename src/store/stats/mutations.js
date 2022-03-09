import Vue from 'vue'
import { updateField } from 'vuex-map-fields'
import _ from 'lodash'
import * as StatsDefault from 'src/constants/stats-default'

export default {
  SET_METRIC_GROUPS: (state, data) => {
    if (_.isEmpty(data)) {
      state.metricGroups = []
      return
    }

    const index = { data: null }
    for (index.data in data) {
      if (typeof data[index.data].agent_metrics === 'undefined') {
        continue
      }

      const metricIndex = { data: null }
      for (metricIndex.data in data[index.data].agent_metrics) {
        const metric = state.availableMetrics.find(metric => metric.metric_id === data[index.data].agent_metrics[metricIndex.data].metric_id)

        if (!metric) {
          continue
        }

        data[index.data].agent_metrics[metricIndex.data].category = metric.category
        data[index.data].agent_metrics[metricIndex.data].categoryLabel = metric.categoryLabel

        if (typeof data[index.data].agent_metrics[metricIndex.data].label !== 'undefined') {
          continue
        }

        data[index.data].agent_metrics[metricIndex.data].label = metric.label
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

    const metricIndex = { index: null }
    for (metricIndex.data in data.agent_metrics) {
      const metric = _.get(metricGroup.agent_metrics, metricIndex.data, null)
      const metricInfo = { data: !metric ? state.availableMetrics.find(metricItem => metricItem.name === data.agent_metrics[metricIndex.data].name) : null }

      if (metricInfo.data) {
        data.agent_metrics[metricIndex.data].category = metricInfo.data.category
        data.agent_metrics[metricIndex.data].categoryLabel = metricInfo.data.categoryLabel
        continue
      }

      metricInfo.data = state.availableMetrics.find(metricItem => metricItem.name === data.agent_metrics[metricIndex.data].name)

      if (!metricInfo.data) {
        continue
      }

      const metricKey = { data: null }
      for (metricKey.data in metricInfo.data) {
        const metricPropValue = _.get(data.agent_metrics[metricIndex.data], metricKey.data, null)
        if (!metricPropValue) {
          data.agent_metrics[metricIndex.data][metricKey.data] = metricInfo.data[metricKey.data]
        }
      }
    }

    Vue.set(state.metricGroups, index, data)
  },
  UPDATE_METRIC_GROUP_ORDER: (state, data) => {
    const metricGroup = state.metricGroups.find(metricGroup => metricGroup.id === data.metricGroupId)
    const index = metricGroup ? state.metricGroups.indexOf(metricGroup) : null

    if (index === -1 || index === null) {
      return
    }

    metricGroup.order = data.order
    state.metricGroups.splice(index, 1)
    const newIndex = (index + data.step)
    state.metricGroups.splice(newIndex, 0, metricGroup)

    if (data.step > 0) {
      const item = { index: null }
      for (item.index in state.metricGroups) {
        if (item.index < newIndex) {
          Vue.set(state.metricGroups[item.index], 'order', (state.metricGroups[item.index].order - 1))
        }
      }
    }

    if (data.step < 0) {
      const item = { index: null }
      for (item.index in state.metricGroups) {
        if (item.index > newIndex) {
          Vue.set(state.metricGroups[item.index], 'order', (state.metricGroups[item.index].order + 1))
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

    const index = { data: 0 }
    if (typeof state.metricGroups[metricGroupIndex].agent_metrics === 'undefined') {
      state.metricGroups[metricGroupIndex].agent_metrics = []
    }

    if (state.metricGroups[metricGroupIndex].agent_metrics.constructor.name === 'Array') {
      index.data = state.metricGroups[metricGroupIndex].agent_metrics.length
    }

    if (state.metricGroups[metricGroupIndex].agent_metrics.constructor.name === 'Object') {
      index.data = Object.keys(state.metricGroups[metricGroupIndex].agent_metrics).length
    }

    const metric = state.availableMetrics.find(metric => metric.metric_id === data.data.metric_id)

    if (metric) {
      data.data.category = metric.category
      data.data.categoryLabel = metric.categoryLabel
    }

    Vue.set(state.metricGroups[metricGroupIndex].agent_metrics, index.data, data.data)
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
      const metricsLilst = JSON.parse(JSON.stringify(state.metricGroups[metricGroupIndex].agent_metrics))
        .sort((a, b) => (a.order > b.order) ? 1 : -1)
      Vue.set(state.metricGroups, `${metricGroupIndex}.agent_metrics`, metricsLilst)
    }

    const metric = state.metricGroups[metricGroupIndex].agent_metrics.find(metric => metric.id === data.metricId)
    const metricIndex = metric ? state.metricGroups[metricGroupIndex].agent_metrics.indexOf(metric) : null

    if (metricIndex === -1 || metricIndex === null) {
      return
    }

    const newIndex = { data: state.metricGroups[metricGroupIndex].agent_metrics.find(metric => metric.order === data.order) }
    newIndex.data = newIndex.data ? state.metricGroups[metricGroupIndex].agent_metrics.indexOf(newIndex.data) : 0

    // store the old order of the metric
    const oldMetricOrder = metric.order
    // assign the new order
    metric.order = data.order
    // move the metric to its new index
    state.metricGroups[metricGroupIndex].agent_metrics.splice(metricIndex, 1)
    state.metricGroups[metricGroupIndex].agent_metrics.splice(newIndex.data, 0, metric)

    // if metric was moved more than 1 step up, update the order of the metrics below it
    if (data.step > 1) {
      const index = { data: null }
      for (index.data = (newIndex.data - 1); index.data >= 0; index.data--) {
        data.order -= 1
        Vue.set(state.metricGroups[metricGroupIndex].agent_metrics[index.data], 'order', data.order)
      }
      return
    }
    // if metric was moved more than 1 step down, update the order of the metrics above it
    if (data.step < -1) {
      const index = { data: null }
      for (index.data = (newIndex + 1); index.data < state.metricGroups[metricGroupIndex].agent_metrics.length; index.data++) {
        data.order += 1
        Vue.set(state.metricGroups[metricGroupIndex].agent_metrics[index.data], 'order', data.order)
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

  RESET_VUEX (state, value) {
    if (!_.isArray(value) || _.isEmpty(value)) {
      return
    }
    state.availableMetrics = []
    state.metricGroups = []
    state.metricLoader = false
    state.groupMetricLoader = false

    if (!value.includes('non-cache')) {
      return
    }

    state = Object.assign({}, StatsDefault.DEFAULT_STATE)
  },

  updateField
}
