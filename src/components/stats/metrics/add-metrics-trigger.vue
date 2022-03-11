<template>
  <div class="add-metrics p-0 d-inline-block position-relative m-2">
    <div flat
         bordered
         @click="openModal"
         class="metric-box dashed-box h-100 w-100"
         :class="{ 'q-hoverable cursor-pointer': !disabled}">
      <span class="q-focus-helper"></span>
      <div class="h-100 w-100 align-middle position-absolute">
        <div class="h-100 w-100 text-lead text-center text-grey lighten-3">
          <div class="metric-box-desc metric-box-header d-flex flex-column justify-content-center align-items-center h-100">
            <plus-icon color="#62666E"
                       width="19"
                       height="19"
                       firstD="M9.5 2V17"
                       secondD="M17 9.5H2"
                       strokeWidth="2.5"/>
            <span class="add-metrics-wrapper w-100">Add Metric</span>
          </div>
        </div>
      </div>
    </div>
    <AddMetricsModal
      @closed="closeModal"
      @create="createNewMetric"
      title="Add Metric"
      button-label="Add Metric"
      :is-open="modal" />
  </div>
</template>

<script>

import { mapActions, mapState } from 'vuex'
import AddMetricsModal from './form-metrics-modal'
import PlusIcon from 'components/icons/plus-icon'

export default {
  name: 'AddMetrics',
  props: {
    metricGroup: {
      type: Object,
      default: () => {}
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  components: {
    PlusIcon,
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
      this.modal = false
      this.$axios.post(`/api/v2/agents/${this.profile.id}/statistics/metric-groups/${this.groupId}/metrics`, {
        metric_id: data.metricId.replace(`${data.type}_`, ''),
        color: data.color,
        type: data.type
      }).then(res => {
        res.data.label = data.label
        res.data.categoryLabel = data.categoryLabel
        res.data.value = res.data.value ?? 0
        this.addMetric({
          metricGroupId: this.groupId,
          data: res.data
        })
        this.$generalNotification('Metric successfully added.')
        this.$emit('toggle-loader', false)
      }).catch(err => {
        console.log(err)
        this.$generalNotification('Failed to add metric.', 'error')
        this.$emit('toggle-loader', false)
      })
    },
    openModal () {
      if (!this.disabled) {
        this.modal = true
      }
    },
    closeModal () {
      this.modal = false
    }
  }
}
</script>
