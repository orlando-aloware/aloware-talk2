<template>
  <div class="pt-0 pb-4">
    <div class="row no-wrap report-group-header q-pt-none text-subtitle1 text-bold text-capitalize">
      <div class="cursor-pointer">
        <TitlePopover
          v-model="reportGroupName"
          :id="reportGroupId"
          @input="updateGroup" />
      </div>
      <q-select
        v-model="timeline"
        @input="changedFilter($event)"
        outlined
        rounded
        :options="dateRange"
        :dense="dense"
        :options-dense="denseOpts"
        class="mini-select">
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
      <div class="no-border bg-white p-2 pr-5 row">
        <AddMetrics
          :report-group="{ id: reportGroupId, name: reportGroupName }"
          @toggle-loader="toggleLoad" />
        <MetricsBox
          v-for="(metric, key) in resources.metrics"
          :key="key"
          :metric="metric" />
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
      title="Delete Report Group"
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
          Remove Report Group?
        </div>
        <div class="text-center py-3">
          <div class="text-dark">
          <div v-html="`Do you want to remove this Report Group: <strong>${resources.name}</strong>?`"></div>
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
              @click="removeSelectedReportGroup">
              Remove
            </b-button>
          </div>
        </div>
      </div>
    </ConfirmDialog>
  </div>
</template>

<script>

import { mapActions } from 'vuex'
import AddMetrics from '../metrics/add-metrics-trigger'
import MetricsBox from '../metrics/metrics-box'
import MetricLoader from '../metrics/metric-loader'
import ConfirmDialog from 'components/confirm-dialog'
import TrashIcon from 'components/icons/trash-icon'
import TitlePopover from 'components/popover/text-popover'
import {
  DATE_RANGES
} from 'src/constants/dates'

const dateRanges = { DATE_RANGES }

export default {
  name: 'ReportGroup',
  props: {
    resources: {
      type: Object,
      default: () => {}
    }
  },
  components: {
    AddMetrics,
    MetricsBox,
    MetricLoader,
    ConfirmDialog,
    TrashIcon,
    TitlePopover
  },
  computed: {
    reportGroupName: {
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
    reportGroupId () {
      return this.resources.id
    },
    dateRange () {
      if (dateRanges) {
        return dateRanges.DATE_RANGES
      }
      return []
    },
    dialogName () {
      return `remove-group-dialog-${this.resources.id}`
    }
  },
  mounted () {
    this.timeline = this.resources.timeline || 'Today'
  },
  data () {
    return {
      timeline: '',
      hovered: false,
      isOpen: false,
      title: 'Untitled',
      dense: true,
      denseOpts: true,
      loader: false
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
      this.timeline = this.resources.timeline
    }
  },
  methods: {
    ...mapActions('stats', [
      'updateReportGroup',
      'deleteReportGroup'
    ]),
    async removeSelectedReportGroup () {
      await this.deleteReportGroup(this.reportGroupId)
      this.closeModal()
    },
    async updateGroup (val) {
      this.reportGroupName = val
      await this.updateReportGroup({
        id: this.resources.id,
        name: this.title,
        timeline: this.timeline
      })
    },
    async changedFilter (val) {
      await this.updateReportGroup({
        id: this.resources.id,
        name: this.title,
        timeline: val
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
    }
  }
}

</script>
