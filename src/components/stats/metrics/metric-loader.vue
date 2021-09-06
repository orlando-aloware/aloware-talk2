<template>
  <div class="q-gutter-md p-2">
    <q-card flat
      class="metric-box text-black p-3">
      <div>
        <q-skeleton height="40px" class="bg-lightgrey mt-2" />
        <!-- <q-skeleton class="bg-indigo" /> -->
      </div>
      <div>
        <q-skeleton height="20px" class="bg-lightgrey mt-4 mb-0 " />
        <!-- <q-skeleton class="bg-indigo" /> -->
      </div>
    </q-card>
  </div>
</template>

<script>

import { mapState } from 'vuex'

export default {
  name: 'MetricLoader',
  computed: {
    ...mapState('stats', [
      'metric_loader'
    ])
  }
}
</script>
