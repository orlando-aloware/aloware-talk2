<template>
  <q-scroll-area
    class="pb-4 bg-grey-40"
    style="height: 100vh; max-width: 100wh;">
    <div class="px-4 py-0">
      <AddMetricGroup @focusToNewMetricGroup="focusToNewMetricGroup"/>
    </div>
    <div class="px-4 pt-0 pb-5">
      <StatsAndMetrics :editGroupId="metricGroupId"
                       @updated="updated"/>
    </div>
  </q-scroll-area>
</template>

<script>

import StatsAndMetrics from 'components/stats/stats-and-metrics'
import AddMetricGroup from 'components/stats/metric-group/add-metric-group'
import { mapState } from 'vuex'

export default {
  name: 'Stats',
  components: {
    StatsAndMetrics,
    AddMetricGroup
  },
  data () {
    return {
      metricGroupId: null
    }
  },
  computed: {
    ...mapState('stats', ['metricGroups'])
  },
  methods: {
    focusToNewMetricGroup (metricGroupId) {
      let clearFocusInterval = setInterval(() => {
        const metricGroup = this.metricGroups.find(metricGroup => metricGroup.id === metricGroupId)
        if (metricGroup) {
          // test this
          this.metricGroupId = metricGroup.id
          clearInterval(clearFocusInterval)
        }
      }, 100)
    },
    updated () {
      this.metricGroupId = null
    }
  }
}
</script>
