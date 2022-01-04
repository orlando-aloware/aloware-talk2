<template>
  <q-card-actions class="px-0 pt-3 pb-2 pb-0">
    <q-space />
    <q-btn
      @click="createMetricGroup"
      unelevated
      no-caps dense
      :disabled="disabled"
      class="px-4 border-half-rounded stats-page-btn"
      color="primary">
      <div class="row items-center no-wrap">
        <div class="d-flex justify-content-center align-items-center text-size-lg-2">
          <plus-icon style="margin-right: 6px;"
                     width="14"
                     height="14"
                     firstD="M7 1V13"
                     secondD="M13 7H1"
                     strokeWidth="1.5"
                     color="#FFFFFF"/>
          Add Metric Group
        </div>
      </div>
    </q-btn>
  </q-card-actions>
</template>

<script>

import { mapState, mapActions } from 'vuex'
import PlusIcon from 'src/components/icons/plus-icon'
import * as DateRanges from 'src/constants/dates'

export default {
  name: 'AddMetricGroup',
  components: { PlusIcon },
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
          this.$emit('focusToNewMetricGroup', res.data.id)
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
