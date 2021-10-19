<template>
  <q-card-actions class="px-0 pt-3 pb-0">
    <compact-btn class="bg-white border stats-refresh-btn border-half-rounded d-flex justify-content-center"
                 :disabled="loading"
                 @clicked="refreshMetricGroup">
      <span v-if="!loading">
        Refresh
      </span>
      <q-spinner-bars color="primary"
                      size="28px"
                      v-if="loading"/>
    </compact-btn>
    <q-space />
    <q-btn
      @click="createMetricGroup"
      unelevated
      no-caps dense
      :disabled="disabled"
      class="px-4 border-half-rounded stats-page-btn"
      color="primary">
      <div class="row items-center no-wrap">
        <div class="d-flex justify-content-center align-items-center">
          <plus-icon style="margin-right: 6px;"
                     width="10"
                     height="10"
                     firstD="M5 1V9"
                     secondD="M9 5H1"
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
import CompactBtn from 'components/compact-btn'
import PlusIcon from 'src/components/icons/plus-icon'
import * as DateRanges from 'src/constants/dates'

export default {
  name: 'AddMetricGroup',
  components: { PlusIcon, CompactBtn },
  computed: {
    ...mapState('auth', ['profile']),
    defaultDateRange () {
      return this.DateRanges.DATE_RANGES_DEFAULT_VALUE
    }
  },
  data () {
    return {
      disabled: false,
      loading: false,
      DateRanges
    }
  },
  methods: {
    ...mapActions('stats', ['addMetricGroup', 'setMetricGroups']),
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
    },
    refreshMetricGroup () {
      console.log('test')
      this.loading = true
      this.$axios
        .get(`/api/v2/agents/${this.profile.id}/statistics/metric-groups`, {
          params: {
            include_metrics: true
          }
        })
        .then(response => {
          this.loading = false
          this.setMetricGroups(response.data)
        })
        .catch((err) => {
          console.error(err)
          this.loading = false
          this.$generalNotification('Failed to fetch metric groups.', 'error')
        })
    }
  }
}
</script>
