<template>
  <div class="add-metrics p-0 d-inline-block position-relative m-2">
    <q-card flat bordered
      @click="openModal"
      class="metric-box dashed-box full-height q-hoverable cursor-pointer">
      <span class="q-focus-helper"></span>
      <q-card-section class="full-height align-middle">
        <div class="row items-center justify-center full-height text-lead text-center text-grey lighten-3 align-middle">
          <div class="metric-box-desc metric-box-header pb-1">
            <span class="text-h4 text-weight-light">+</span>
            <br />
            Add Metrics
          </div>
        </div>
      </q-card-section>
    </q-card>
    <AddMetricsModal
      @closed="closeModal"
      @create="createNewMetric"
      title="Add Metric"
      button-label="Create Metric"
      :is-open="modal" />
  </div>
</template>

<script>

import { mapActions, mapState } from 'vuex'
import AddMetricsModal from './form-metrics-modal'

export default {
  name: 'AddMetrics',
  props: {
    metricGroup: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    AddMetricsModal
  },
  computed: {
    ...mapState('auth', ['profile']),
    groupId () {
      return this.metricGroup.id
    }
  },
  data () {
    return {
      modal: false
    }
  },
  methods: {
    ...mapActions('stats', ['addMetric']),
    createNewMetric (data) {
      this.$emit('toggle-loader', true)
      this.$axios.post(`/api/v2/agents/${this.profile.id}/statistics/metric-groups/${this.groupId}/metrics`, {
        metric_id: data.metricId,
        color: data.color,
        type: data.type
      }).then(res => {
        res.data.label = data.label
        res.data.value = 0
        this.addMetric({
          metricGroupId: this.groupId,
          data: res.data
        })
        this.$generalNotification('Metric successfully added.')
        this.$emit('toggle-loader', false)
        this.modal = false
      }).catch(err => {
        console.log(err)
        this.$generalNotification('Failed to add metric.', 'error')
        this.$emit('toggle-loader', false)
        this.modal = false
      })
    },
    openModal () {
      this.modal = true
    },
    closeModal () {
      this.modal = false
    }
  }
}
</script>
