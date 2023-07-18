<template>
  <div class="h-100 w-100 position-relative">
    <b-overlay class="h-100 w-100 position-absolute"
               rounded="sm"
               :show="metricLoader">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="40px" />
      </template>
    </b-overlay>
    <q-scroll-area class="pb-4 bg-grey-40 stats-container h-100 overflow-hidden-y"
                   v-if="!metricLoader">
      <div class="px-4 py-0 stats-header">
        <AddMetricGroup @focusToNewMetricGroup="focusToNewMetricGroup"/>
      </div>
      <div class="stats-metrics-container px-4 pt-0 pb-5">
        <StatsAndMetrics :editGroupId="metricGroupId"
                         @updated="updated"/>
      </div>
    </q-scroll-area>
  </div>
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
      loadingMetricGroups: false,
      clearFocusInterval: null
    }
  },

  computed: {
    ...mapState('stats', ['metricGroups', 'metricLoader']),
    ...mapState('auth', ['profile'])
  },

  methods: {
    ...mapActions('stats', ['setMetricGroups']),

    focusToNewMetricGroup (metricGroupId) {
      const counter = { data: 0 }
      const metricGroup = { data: null }

      this.clearFocusInterval = setInterval(() => {
        metricGroup.data = this.metricGroups.find(metricGroup => metricGroup.id === metricGroupId)

        if (metricGroup.data) {
          // test this
          this.metricGroupId = metricGroup.data.id
          clearInterval(this.clearFocusInterval)
        }

        counter.data++

        if (counter.data > 60000) {
          clearInterval(this.clearFocusInterval)
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
          this.$handleErrors(err.response)

          return Promise.reject()
        })
    }
  },

  beforeDestroy () {
    clearInterval(this.clearFocusInterval)
  }
}
</script>
