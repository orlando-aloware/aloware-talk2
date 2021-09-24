<template>
  <q-scroll-area
    class="pb-4"
    style="height: 100vh; max-width: 100wh;">
    <div class="px-4 py-0">
      <AddMetricGroup />
    </div>
    <div class="px-4 pt-0 pb-5">
      <StatsAndMetrics />
    </div>
  </q-scroll-area>
</template>

<script>

import StatsAndMetrics from 'components/stats/stats-and-metrics'
import AddMetricGroup from 'components/stats/metric-group/add-metric-group'

export default {
  name: 'Stats',
  components: {
    StatsAndMetrics,
    AddMetricGroup
  }
}
</script>
