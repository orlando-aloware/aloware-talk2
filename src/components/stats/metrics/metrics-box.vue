<template>
  <div class="p-0 d-inline-block">
    <MetricLoader v-if="loader" />
    <div
      v-else
      class="box-container w-auto"
      @mouseover="hovered = true"
      @mouseleave="hovered = false"
      transtion-show="fade"
      transtion-hide="fade">
      <b-badge
        v-if="hovered"
        @click="confirmDeletion"
        class="box-container-badge floating-left bg-white"
        pill>
        <q-icon
          name="fa fa-times"
          class="text-grey cursor-pointer"
          style="font-size: 11px;padding:3px;" />
      </b-badge>
      <q-card flat
        class="metric-box text-black m-2 p-1">
        <q-card-actions>
          <div :class="`metric-box-label text-weight-medium text-${color}`">
            {{ metricValue }}
          </div>
          <q-space />
          <div
            @click="openEditModal"
            class="metric-floating-btn cursor-pointer mr-2">
            <PencilIcon
              v-if="hovered"
              color="grey" />
          </div>
        </q-card-actions>
        <q-card-section class="metric-box-desc q-pt-none text-lowercase pt-4">
          {{ metricName }}
        </q-card-section>
      </q-card>
      <ConfirmDialog
        @close="closeModal"
        title="Remove Metric"
        :id="dialogName"
        :is-open="isOpen"
        :hide-header="true"
        :hide-footer="true"
        size="sm">
        <div slot="content">
          <div class="text-center text-h6 pb-4">
            <TrashIcon height="20" width="20" />
            Remove Metric?
          </div>
          <div class="text-center py-3">
            <div class="text-dark">
              <div v-html="`Do you want to remove this metric?`"></div>
            </div>
          </div>
          <div class="row text-center pt-3 pb-0">
            <div class="col-6 p-1">
              <b-button
                variant="dark-grey"
                class="f-btn--cancel"
                size="sm"
                block
                @click="closeModal">
                Cancel
              </b-button>
            </div>
            <div class="col-6 p-1">
              <b-button
                variant="danger"
                size="sm"
                block
                @click="removeSelectedMetric">
                Remove
              </b-button>
            </div>
          </div>
        </div>
      </ConfirmDialog>
      <EditMetricsModal
        @closed="closeModal"
        @update="updateExistingMetric"
        :resources="preformattedMetric"
        :is-open="editModal"
        button-label="Update Metric"
        title="Update Metric" />
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import EditMetricsModal from './form-metrics-modal'
import MetricLoader from '../metrics/metric-loader'
import ConfirmDialog from 'components/confirm-dialog'
import TrashIcon from 'components/icons/trash-icon'
import PencilIcon from 'components/icons/pencil-o-icon'
import * as MetricOptionColors from 'src/constants/metric-option-colors'

export default {
  name: 'MetricsBox',
  props: {
    metric: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    MetricLoader,
    EditMetricsModal,
    ConfirmDialog,
    PencilIcon,
    TrashIcon
  },
  computed: {
    ...mapState('auth', ['profile']),
    dialogName () {
      return `remove-metric-dialog-${this.metric.id}`
    },
    color () {
      let col = this.MetricOptionColors.METRIC_OPTIONS_COLORS.find(c => {
        return c.value === this.metricColor
      })
      if (col) {
        return col.color
      } else {
        return 'black'
      }
    },
    preformattedMetric () {
      return {
        id: this.metric.id,
        name: this.metricName,
        color: this.metricColor,
        reportId: this.metric.reportId,
        value: this.metric.value
      }
    }
  },
  mounted () {
    this.updateLocalResources()
  },
  data () {
    return {
      hovered: false,
      isOpen: false,
      editModal: false,
      metricName: '',
      metricValue: '',
      metricColor: '',
      loader: false,
      MetricOptionColors
    }
  },
  watch: {
    isOpen (val) {
      if (val) {
        this.$bvModal.show(this.dialogName)
      } else {
        this.$bvModal.hide(this.dialogName)
      }
    },
    metric () {
      this.loader = false
      this.updateLocalResources()
    }
  },
  methods: {
    ...mapActions('stats', [
      'deleteMetric',
      'updateMetrics'
    ]),
    async removeSelectedMetric () {
      this.loader = true
      this.$axios.delete(`/api/v2/agents/${this.profile.id}/statistics/metric-groups/${this.metric.agent_metric_group_id}/metrics/${this.metric.id}`)
        .then(res => {
          this.closeModal()
        })
      await this.deleteMetric({
        userId: this.profile.id,
        metricGroupId: this.metric.agent_metric_group_id,
        metricId: this.metric.id
      })
      this.closeModal()
    },
    async updateExistingMetric (data) {
      await this.updateMetrics(data)
      this.metricName = data.label
      this.metricValue = data.value
      this.metricColor = data.color
      this.editModal = false
    },
    confirmDeletion () {
      this.isOpen = true
    },
    closeModal () {
      this.isOpen = false
      this.editModal = false
    },
    openEditModal () {
      this.editModal = true
    },
    updateLocalResources () {
      this.metricName = this.metric.label
      this.metricValue = this.metric.value
      this.metricColor = this.metric.color
    }
  }
}
</script>
