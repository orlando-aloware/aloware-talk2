<template>
  <div class="row summary-info-labels d-flex px-0">
    <template v-for="(info, key) in filteredMetrics">
      <div
        v-if="defaultMetrics"
        :key="`metric-default-${key}`"
        class="summary-info-labels__div d-flex pl-0 pr-4 pt-1">
        {{ metricName(info) }}
        <strong class="pl-2">
          {{ `${info.completed_contacts_count}(${info.percentage}%)` }}
        </strong>
      </div>
      <div
        v-else
        :key="`metric-blocked-${key}`"
        class="col col-4 p-0 px-1 pb-3">
        <q-card-section
          class="p-0">
          <div class="t-value text-subtitle1 text-weight-medium d-flex">
            <span v-if="info.type === 0">
              {{ `${info.completed_contacts_count}` }}
            </span>
            <span v-else>
              {{ `${info.completed_contacts_count}` }}
            </span>
            <div
              v-if="info.type === 0"
              class="text-caption pt-1 pl-1 text-grey">
              {{ info.name === 'Duration' ? `` : `/${info.percentage}` }}
            </div>
            <div
              v-else
              class="text-caption pt-1 pl-1 text-grey">
              {{ `(${info.percentage}%)` }}
            </div>
          </div>
          <div class="t-label text-caption text-grey-90">
            {{ info.type === 0 ? info.name : metricName(info) }}
          </div>
        </q-card-section>
      </div>
    </template>
  </div>
</template>

<script>

import { mapFields } from 'vuex-map-fields'
import { mapState, mapActions } from 'vuex'
import { isEmpty } from 'lodash'

const METRIC = {
  contact_disposition: 1,
  call_disposition: 2
}
const metric = {
  plain: 0,
  block: 1
}

export default {
  name: 'SummaryInfoLabels',
  props: {
    metricType: {
      type: [String, Number],
      default: metric.plain
    },
    prefetchedItems: {
      type: Array,
      default: () => []
    }
  },
  async mounted () {
    let metrics = await this.getSessionMetricsOptions()
    let collection = []

    metrics.forEach(m => {
      collection.push({
        label: m.label,
        disable: true,
        value: null
      })
      collection = collection.concat(...m.options)
    })
    this.metrics = collection
  },
  computed: {
    ...mapFields('powerDialer', [
      'metrics'
    ]),
    ...mapState('powerDialer', [
      'activeMetrics'
    ]),
    defaultMetrics () {
      return this.metricType === metric.plain
    },
    filteredMetrics () {
      if (isEmpty(this.activeMetrics)) {
        return this.prefetchedItems
      }
      return this.prefetchedItems.concat(this.activeMetrics)
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'getSessionMetricsOptions'
    ]),
    metricName (metricObj) {
      let metric = this.metrics.find((m) => {
        let id = m.value?.split('_&_')[1].toString()
        let key = m.value?.split('_&_')[0].toString()
        switch (metricObj?.type) {
          case METRIC.contact_disposition:
            if (m.value && key === 'contact_disposition' && id === metricObj.metric_id.toString()) {
              return m
            }
            break
          case METRIC.call_disposition:
            if (m.value && key === 'call_disposition' && id === metricObj.metric_id.toString()) {
              return m
            }
            break
          default:
            return m
        }
      })
      return metric?.label
    }
  },
  data () {
    return {}
  }
}
</script>
