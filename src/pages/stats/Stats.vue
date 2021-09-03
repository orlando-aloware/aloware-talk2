<template>
  <q-scroll-area
    class="pb-4"
    style="height: 100vh; max-width: 100wh;">
    <div class="px-3 py-0">
      <StatsAndMetrics
        v-for="(rg, key) in reportGroup"
        :key="key"
        :resources="rg" />
    </div>
    <div class="px-3 py-0">
      <AddReportGroup />
    </div>
  </q-scroll-area>
</template>

<script>

import { mapActions, mapGetters } from 'vuex'
import StatsAndMetrics from 'components/stats/stats-and-metrics'
import AddReportGroup from 'components/stats/report-group/add-report-group'

export default {
  name: 'Stats',
  components: {
    StatsAndMetrics,
    AddReportGroup
  },
  computed: {
    ...mapGetters('stats', [
      'reportGroup'
    ])
  },
  mounted () {
    this.getReportGroups()
  },
  data () {
    return {
      report_group: []
    }
  },
  methods: {
    ...mapActions('stats', [
      'getReportGroups'
    ])
  }
}
</script>
