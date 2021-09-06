<template>
  <div
    @mouseover="hovered = true"
    @mouseleave="hovered = false"
    class="pt-4">
    <div class="row no-wrap q-pt-none text-subtitle1 text-bold text-capitalize">
      <div class="cursor-pointer">
        <TitlePopover
          v-model="reportGroupName2"
          :id="reportGroupId"
          @input="updateGroup" />
      </div>
      <q-select
        v-model="timeline"
        @input="changedFilter($event)"
        outlined
        rounded
        dense
        :options="dateRange"
        options-dense
        class="mini-select">
      </q-select>
    </div>
    <div v-if="resources" class="p-0" style="position:relative;">
      <!-- <q-skeleton square /> -->
      <b-badge
        v-if="hovered"
        @click="confirmDeletion"
        class="bg-white p-0 m-0 contact-unread-badge d-flex justify-center floating"
        style="z-index:10; border:1px grey solid;right:-5px;top:-5px;position:absolute;"
        pill>
        <q-icon
          name="fa fa-times"
          class="cursor-pointer text-grey"
          style="font-size: 11px;padding:3px;" />
      </b-badge>
      <div class="mycard no-border bg-white p-2 row">
        <AddMetrics
          :report-group="{ id: reportGroupId, name: reportGroupName }" />
        <MetricsBox
          v-for="(metric, key) in resources.metrics"
          :key="key"
          :metric="metric" />
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
    ConfirmDialog,
    TrashIcon,
    TitlePopover
  },
  computed: {
    reportGroupName () {
      let { name } = this.resources
      if (name) {
        return name
      }
      return 'Untitled'
    },
    reportGroupName2: {
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
      title: 'Untitled'
    }
  },
  watch: {
    isOpen (val) {
      if (val) {
        this.$bvModal.show(this.dialogName)
      } else {
        this.$bvModal.hide(this.dialogName)
      }
    }
  },
  methods: {
    ...mapActions('stats', [
      'updateReportGroup',
      'deleteReportGroup'
    ]),
    confirmDeletion () {
      this.isOpen = true
    },
    closeModal () {
      this.isOpen = false
    },
    async removeSelectedReportGroup () {
      await this.deleteReportGroup(this.reportGroupId)
      this.closeModal()
    },
    async updateGroup (val) {
      this.reportGroupName2 = val
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
    }
  }
}

</script>

<style lang="scss" scoped>

</style>
