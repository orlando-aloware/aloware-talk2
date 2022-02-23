<template>
  <div class="summary-info-labels d-flex px-0">
    <div
      v-for="(info, key) in activeMetrics"
      :key="key"
      class="summary-info-labels__div d-flex pl-0 pr-4 pt-1">
      {{ metricName(info) }}
      <strong class="pl-2">
        {{ `${info.completed_contacts_count}(${info.percentage}%)` }}
      </strong>
    </div>
  </div>
</template>

<script>

import { mapState } from 'vuex'

const METRIC = {
  contact_disposition: 1,
  call_disposition: 2
}
export default {
  name: 'SummaryInfoLabels',
  computed: {
    ...mapState('powerDialer', [
      'activeMetrics',
      'metrics'
    ])
  },
  methods: {
    metricName (metricObj) {
      let metric = this.metrics.find((m) => {
        let id = m.value?.split('_&_')[1].toString()
        let key = m.value?.split('_&_')[0].toString()
        switch (metricObj.type) {
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
            break
        }
      })
      return metric.label
    }
  },
  data () {
    return {
      infos: [
        {
          label: 'Tried',
          value: '52'
        },
        {
          label: 'Total',
          value: '124'
        },
        {
          label: 'Connected',
          value: '3 (9%)'
        },
        {
          label: 'Closed',
          value: '1 (4%)'
        }
      ]
    }
  }
}
</script>
