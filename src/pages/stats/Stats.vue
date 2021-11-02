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
import { mapActions, mapState } from 'vuex'

export default {
  name: 'Stats',

  components: {
    StatsAndMetrics,
    AddMetricGroup
  },

  data () {
    return {
      metricGroupId: null,
      loadingMetricGroups: false
    }
  },

  computed: {
    ...mapState('stats', ['metricGroups']),
    ...mapState('auth', ['profile'])
  },

  methods: {
    ...mapActions('stats', ['setMetricGroups']),
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
    },

    getMetricGroups () {
      if (!this.profile) {
        return
      }

      this.loadingMetricGroups = true
      return this.$axios
        .get(`/api/v2/agents/${this.profile.id}/statistics/metric-groups`, {
          params: {
            include_metrics: true
          }
        })
        .then(response => {
          this.loadingMetricGroups = false
          this.setMetricGroups(response.data)
          return Promise.resolve()
        })
        .catch((err) => {
          console.error(err)
          this.loadingMetricGroups = false
          return Promise.reject()
        })
    }
  },

  mounted () {
    if (this.metricGroups && this.metricGroups.length < 1) {
      this.getMetricGroups()
    }
  }
}
</script>
