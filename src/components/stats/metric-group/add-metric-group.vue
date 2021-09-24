<template>
  <q-card-actions class="px-0 pt-3 pb-0">
    <q-space />
    <q-btn
      @click="createMetricGroup"
      unelevated
      no-caps dense
      :disabled="disabled"
      class="px-4 py-1"
      color="primary">
      <div class="row items-center no-wrap">
        <div class="text-center">
          + Add Metric Group
        </div>
      </div>
    </q-btn>
  </q-card-actions>
</template>

<script>

import { mapState, mapActions } from 'vuex'

import * as DateRanges from 'src/constants/dates'

export default {
  name: 'AddMetricGroup',
  components: {},
  computed: {
    ...mapState('auth', ['profile']),
    defaultDateRange () {
      return this.DateRanges.DATE_RANGES_DEFAULT_VALUE
    }
  },
  data () {
    return {
      disabled: false,
      DateRanges
    }
  },
  methods: {
    ...mapActions('stats', ['addMetricGroup']),
    createMetricGroup () {
      this.disabled = true
      const data = {
        name: 'Untitled',
        date_range_type: this.defaultDateRange
      }
      this.$axios.post(`api/v2/agents/${this.profile.id}/statistics/metric-groups`, data)
        .then(res => {
          this.addMetricGroup(res.data)
          this.$generalNotification('Metric group successfully created.')
          this.disabled = false
        }).catch(err => {
          console.log(err)
          this.$generalNotification('Failed to create a metric group.', 'error')
        })
    }
  }
}
</script>
