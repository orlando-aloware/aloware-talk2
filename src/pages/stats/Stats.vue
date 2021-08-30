<template>
  <q-scroll-area style="height: 100vh; max-width: 100wh;">
    <div class="p-3">
      <MetricsGroup
        v-for="n in 7"
        :key="n"
        :section-title="`Metrics Group ${Math.ceil(Math.random()*99)}`" />
    </div>
    <div class="h-100 pt-6"></div>
  </q-scroll-area>
</template>

<script>

import MetricsGroup from 'components/stats/stats-metrics-group'

export default {
  name: 'Stats',
  components: {
    MetricsGroup
  }
}
</script>
