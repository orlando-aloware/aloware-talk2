<template>
  <div class="pt-0 pb-4">
    <div class="row no-wrap report-group-header q-pt-none text-subtitle1 text-bold text-capitalize">
      <div class="cursor-pointer">
        <TitlePopover
          v-model="metricGroupName"
          :id="metricGroupId"
          @input="updateGroup" />
      </div>
      <q-select
        class="mini-select"
        outlined
        rounded
        map-options
        emit-value
        option-value="id"
        option-label="label"
        :options="dateRange"
        :dense="dense"
        :options-dense="denseOpts"
        v-model="timeline"
        @input="changedFilter($event)">
      </q-select>
    </div>
    <div
      v-if="resources"
      @mouseover="hovered = true"
      @mouseleave="hovered = false"
      class="metric-group p-0"
      style="position:relative;">
      <!-- <q-skeleton square /> -->
      <b-badge
        v-if="hovered"
        @click="confirmDeletion"
        class="bg-white p-0 m-0"
        style="z-index:10; border:1px grey solid;right:-5px;top:-5px;position:absolute;"
        pill>
        <q-icon
          name="fa fa-times"
          class="cursor-pointer text-grey"
          style="font-size: 11px;padding:3px;" />
      </b-badge>
      <div class="no-border bg-white p-2 pr-5 rowd d-flex">
        <AddMetrics
          :metric-group="{ id: metricGroupId, name: metricGroupName }"
          @toggle-loader="toggleLoad" />
        <template v-if="resources.agent_metrics">
          <Draggable
            class="list-group w-100"
            :options="{handle:'.movable'}"
            v-model="resources.agent_metrics"
            v-bind="dragOptions"
            @change="updateSortedMetric"
            tag="ul">
            <transition-group :key="key"
                              type="transition"
                              name="flip-list">
              <MetricsBox
                v-for="metric in resources.agent_metrics"
                :key="metric.id"
                :metric="metric" />
            </transition-group>
          </Draggable>
        </template>
        <MetricLoader v-if="loader" />
        <div v-if="hovered" class="metric-group-drawer">
          <div class="drawer-icon movable">
            <i class="fa fa-bars mr-2 text-muted"></i>
          </div>
        </div>
      </div>
    </div>
    <ConfirmDialog
      @close="closeModal"
      title="Delete Metric Group"
      :id="dialogName"
      :is-open="isOpen"
      :hide-header="true"
      :hide-footer="true"
      size="sm">
      <div slot="content">
        <div class="text-center text-h6 pb-4">
          <TrashIcon
            height="20"
            width="20" />
          Remove Metric Group?
        </div>
        <div class="text-center py-3">
          <div class="text-dark">
          <div v-html="`Do you want to remove this Metric Group: <strong>${resources.name}</strong>?`"></div>
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
              @click="removeSelectedMetricGroup">
              Remove
            </b-button>
          </div>
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>
import Draggable from 'vuedraggable'
import { mapActions, mapState } from 'vuex'
import AddMetrics from '../metrics/add-metrics-trigger'
import MetricsBox from '../metrics/metrics-box'
import MetricLoader from '../metrics/metric-loader'
import ConfirmDialog from 'components/confirm-dialog'
import TrashIcon from 'components/icons/trash-icon'
import TitlePopover from 'components/popover/text-popover'
import * as DateRanges from 'src/constants/dates'

export default {
  name: 'MetricGroup',
  props: {
    resources: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    AddMetrics,
    Draggable,
    MetricsBox,
    MetricLoader,
    ConfirmDialog,
    TrashIcon,
    TitlePopover
  },
  computed: {
    ...mapState('auth', ['profile']),
    metricGroupName: {
      get () {
        let { name } = this.resources
        if (this.title === 'Untitled') {
          if (name) {
            return name
          }
        }
        return this.title
      },
      set (val) {
        this.title = val
      }
    },
    metricGroupId () {
      return this.resources.id
    },
    dateRange () {
      return this.DateRanges.DATE_RANGES
    },
    dialogName () {
      return `remove-group-dialog-${this.resources.id}`
    }
  },
  mounted () {
    this.timeline = this.resources.date_range_type || 1
  },
  data () {
    return {
      timeline: '',
      hovered: false,
      isOpen: false,
      title: 'Untitled',
      dense: true,
      denseOpts: true,
      loader: false,
      dragOptions: {
        animation: 200,
        group: 'description',
        disabled: false,
        ghostClass: 'ghost'
      },
      DateRanges
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
    resources () {
      this.timeline = this.resources.date_range_type
    }
  },
  methods: {
    ...mapActions('stats', [
      'updateMetricGroup',
      'deleteMetricGroup'
    ]),
    async removeSelectedMetricGroup () {
      this.$axios.delete(`/api/v2/agents/${this.profile.id}/statistics/metric-groups/${this.metricGroupId}`)
        .then(res => {
          this.deleteMetricGroup(res.data.id)
          this.$generalNotification('Metric group successfully removed.')
          this.closeModal()
        }).catch(err => {
          console.log(err)
          this.$generalNotification('Failed to remove metric group.')
          this.closeModal()
        })
    },
    updateGroup (val) {
      this.metricGroupName = val
      this.$axios.patch(`/api/v2/agents/${this.profile.id}/statistics/metric-groups/${this.resources.id}`, {
        name: val,
        date_range_type: this.resources.date_range_type
      }).then(res => {
        this.updateMetricGroup(res.data)
        this.$generalNotification('Metric group updated successfully.')
      }).catch(err => {
        console.log(err)
        this.$generalNotification('Failed to updated metric group.', 'error')
      })
    },
    async changedFilter (val) {
      this.$axios.patch(`/api/v2/agents/${this.profile.id}/statistics/metric-groups/${this.resources.id}`, {
        name: this.title,
        date_range_type: val
      }).then(res => {
        this.updateMetricGroup(res.data)
        this.$generalNotification('Metric group updated successfully.')
      }).catch(err => {
        console.log(err)
        this.$generalNotification('Failed to updated metric group.', 'error')
      })
    },
    confirmDeletion () {
      this.isOpen = true
    },
    closeModal () {
      this.isOpen = false
    },
    toggleLoad (val) {
      this.loader = val
    },
    async updateSortedMetric (val) {
      let { newIndex, oldIndex, element } = val.moved
      let step = null
      let direction = oldIndex > newIndex ? 'up' : 'down'
      let id = element.id

      if (oldIndex > newIndex) {
        step = oldIndex - newIndex
      } else {
        step = newIndex - oldIndex
      }

      await this.updateMetric({
        id: id,
        direction: direction,
        step: step
      })
    }
  }
}

</script>
