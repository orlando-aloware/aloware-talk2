<template>
  <div class="pt-0 pb-4">
    <div class="row no-wrap report-group-header q-pt-none text-subtitle1 text-bold text-capitalize">
      <div class="cursor-pointer">
        <TitlePopover
          :id="metricGroupId"
          :editMetricGroupId="editMetricGroupId"
          v-model="metricGroupName"
          @input="updateGroup"
          @close="editClosed"/>
      </div>
      <q-select class="mini-select"
                outlined
                rounded
                map-options
                emit-value
                option-value="id"
                option-label="label"
                bg-color="white"
                :options="dateRange"
                :dense="dense"
                :options-dense="denseOpts"
                :disabled="updateLoading || metricsList.length === 0"
                :readonly="updateLoading || metricsList.length === 0"
                v-if="!show_custom_date_range"
                v-model="timeline"
                @input="changedFilter($event)">
      </q-select>
      <div class="custom-date-time-picker" v-if="show_custom_date_range">
        <vue-ctk-date-time-picker id="start-date-time-picker"
                                  formatted="lll"
                                  label="Start date and Time"
                                  :noButtonNow="true"
                                  :no-header="true"
                                  v-model="customStartDate"
                                  @is-hidden="enableCustomEndDate"/>
        <vue-ctk-date-time-picker id="end-date-time-picker"
                                  formatted="lll"
                                  label="End date and Time"
                                  :noButtonNow="true"
                                  :minDate="customStartDate"
                                  :no-header="true"
                                  :disabled="isEndDateTimePickerDisabled"
                                  v-model="customEndDate"
                                  @is-hidden="enableButtonPicker" />
        <div class="btn-custom-date">
          <b-button class="text-sm btn-apply"
                    variant="primary"
                    :disabled="isApplyButtonPickerDisabled"
                    @click="applyCustomDateFilter">
            Apply
          </b-button>
          <b-button variant="dark-grey"
                    class="f-btn--cancel btn-cancel"
                    size="sm"
                    @click="cancelCustomDateFilter">
            Cancel
          </b-button>
        </div>
      </div>
    </div>
    <div
      v-if="resources"
      @mouseover="hovered = true"
      @mouseleave="hovered = false"
      class="metric-group p-0">
      <!-- <q-skeleton square /> -->
      <b-badge
        v-if="hovered"
        @click="confirmDeletion"
        class="bg-white p-0 m-0 group-delete"
        pill>
        <q-icon
          name="fa fa-times"
          class="cursor-pointer text-grey"/>
      </b-badge>
      <div class="no-border bg-white p-2 rowd d-flex group-wrapper">
        <template>
          <Draggable
            class="list-group"
            :options="{handle: '.movable'}"
            v-model="metricsList"
            v-bind="dragOptions"
            @change="updateSortedMetric"
            :move="checkMove"
            tag="ul">
            <transition-group type="transition"
                              class="d-flex flex-wrap"
                              name="flip-list">
              <template v-if="metricsList">
                <template v-for="(metric, index) in metricsList">
                  <MetricsBox
                    class="metric-box-item movable"
                    :ref="`metric-box-${index}`"
                    :key="metric.id"
                    :metric="metric"
                    v-if="metric.label"
                    @remove="onLoaderToggled"/>
                </template>
                <MetricLoader :key="`metric-loader-` + metricGroupId"
                              v-if="loader" />
              </template>
              <AddMetrics
                ref="addMetric"
                draggable="false"
                :key="`add-metrics-` + metricGroupId"
                :metric-group="{ id: metricGroupId, name: metricGroupName }"
                :disabled="updateLoading"
                @toggle-loader="toggleLoad"/>
            </transition-group>
          </Draggable>
        </template>
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
import _ from 'lodash'
import Draggable from 'vuedraggable'
import { mapActions, mapState } from 'vuex'
import AddMetrics from '../metrics/add-metrics-trigger'
import MetricsBox from '../metrics/metrics-box'
import MetricLoader from '../metrics/metric-loader'
import ConfirmDialog from 'components/confirm-dialog'
import TrashIcon from 'components/icons/trash-icon'
import TitlePopover from 'components/popover/text-popover'
import * as DateRanges from 'src/constants/dates'
import moment from 'moment'
import VueCtkDateTimePicker from 'vue-ctk-date-time-picker'
import 'vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css'

export default {
  name: 'MetricGroup',
  props: {
    resources: {
      type: Object,
      default: () => {}
    },
    editMetricGroupId: {
      default: null,
      required: false
    }
  },
  components: {
    AddMetrics,
    Draggable,
    MetricsBox,
    MetricLoader,
    ConfirmDialog,
    TrashIcon,
    TitlePopover,
    VueCtkDateTimePicker
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
      metricsList: [],
      loaderToggled: false,
      updateLoading: false,
      DateRanges,
      show_custom_date_range: false,
      customStartDate: '',
      customEndDate: '',
      isEndDateTimePickerDisabled: true,
      isApplyButtonPickerDisabled: true,
      customRange: {}
    }
  },
  computed: {
    ...mapState('auth', ['profile']),
    metricGroupName: {
      get () {
        const { name } = this.resources

        if (name) {
          return name
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
    },
    arrangedMetricList () {
      const agentMetrics = _.get(this.resources, 'agent_metrics', [])
      if (!_.isEmpty(agentMetrics)) {
        return JSON.parse(JSON.stringify(agentMetrics))
          .sort((a, b) => (a.order > b.order) ? 1 : -1)
      }
      return agentMetrics
    }
  },
  mounted () {
    this.timeline = this.resources.date_range_type || 1
    this.metricsList = this.arrangedMetricList ? JSON.parse(JSON.stringify(this.arrangedMetricList)) : []
    this.customRange = this.DateRanges.DATE_RANGES.find(range => {
      if (range.label === 'Custom') {
        return range
      }
    })

    if (this.timeline === this.customRange.id) {
      this.show_custom_date_range = true
    }
  },
  methods: {
    ...mapActions('stats', [
      'updateMetricGroup',
      'updateMetricOrder',
      'deleteMetricGroup'
    ]),
    async removeSelectedMetricGroup () {
      this.$axios.delete(`/api/v2/agents/${this.profile.id}/statistics/metric-groups/${this.metricGroupId}`)
        .then(res => {
          this.closeModal()
          setTimeout(() => {
            this.deleteMetricGroup(this.metricGroupId)
          }, 500)
          this.$generalNotification('Metric group successfully removed.')
        }).catch(err => {
          console.log(err)
          this.$generalNotification('Failed to remove metric group.')
          this.closeModal()
        })
    },
    updateGroup: _.debounce(function (val) {
      this.metricGroupName = val
      this.$axios.patch(`/api/v2/agents/${this.profile.id}/statistics/metric-groups/${this.resources.id}`, {
        name: val,
        date_range_type: this.resources.date_range_type
      }).then(res => {
        this.updateMetricGroup(res.data)
        this.$emit('updated')
        this.$generalNotification('Metric group updated successfully.')
      }).catch(err => {
        console.log(err)
        this.$generalNotification('Failed to updated metric group.', 'error')
      })
    }, 200),
    toggleLoader (value) {
      this.updateLoading = value
      const index = { data: null }
      for (index.data in this.metricsList) {
        if (!_.isEmpty(this.$refs[`metric-box-${index.data}`])) {
          this.$refs[`metric-box-${index.data}`][0].toggleLoader(value)
        }
      }
    },
    async changedFilter (val) {
      if (this.customRange.id === val) {
        this.show_custom_date_range = true
        return
      }

      this.getMetricGroupsStatistics(val)
    },
    getMetricGroupsStatistics (val, start_date = null, end_date = null) {
      this.toggleLoader(true)
      this.$axios.patch(`/api/v2/agents/${this.profile.id}/statistics/metric-groups/${this.resources.id}`, {
        name: this.metricGroupName,
        date_range_type: val,
        custom_start_date: start_date,
        custom_end_date: end_date
      }).then(res => {
        this.toggleLoader(false)
        this.updateMetricGroup(res.data)
        this.$generalNotification('Metric group updated successfully.')
      }).catch(err => {
        console.log(err)
        this.toggleLoader(false)
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
      if (!this.loader && this.metricsList.length !== this.arrangedMetricList.length) {
        this.metricsList = JSON.parse(JSON.stringify(this.arrangedMetricList))
      }
    },
    async updateSortedMetric (val) {
      if (typeof val.moved === 'undefined') {
        return
      }

      const { newIndex, oldIndex, element } = val.moved
      const metric = this.arrangedMetricList.find(metric => metric.id === element.id)

      if (!metric) {
        return
      }

      const previousMetrics = JSON.parse(JSON.stringify(this.arrangedMetricList))

      const order = this.arrangedMetricList[newIndex].order
      const step = newIndex - oldIndex

      await this.updateMetricOrder({
        metricGroupId: this.metricGroupId,
        metricId: element.id,
        order: order,
        step: step
      })

      this.toggleLoader(true)

      await this.$axios.patch(`api/v2/agents/${this.profile.id}/statistics/metric-groups/${this.metricGroupId}/metrics/${element.id}/order`, {
        order: order
      }).then(res => {
        this.$generalNotification('Metric successfully updated.')
        this.toggleLoader(false)
      }).catch(err => {
        this.setMetricGroupMetrics({
          metricGroupId: this.metricGroupId,
          data: previousMetrics
        })
        this.toggleLoader(false)
        console.log(err)
        this.$generalNotification('Failed to update metric.', 'error')
      })
    },
    editClosed () {
      this.$emit('updated')
    },
    checkMove (event) {
      const element = _.get(this.$refs.addMetric, '$el', null)
      return event.from === event.to && event.related !== element
    },
    onLoaderToggled (toggle) {
      this.loaderToggled = toggle
    },
    cancelCustomDateFilter () {
      this.show_custom_date_range = false
      this.isEndDateTimePickerDisabled = true
      this.isApplyButtonPickerDisabled = true
      this.customStartDate = ''
      this.customEndDate = ''

      this.timeline = 1

      if (this.resources.date_range_type && this.resources.date_range_type !== this.customRange.id) {
        this.timeline = this.resources.date_range_type
        return
      }

      this.getMetricGroupsStatistics(this.timeline)
    },
    applyCustomDateFilter () {
      const startDate = moment(this.customStartDate, 'YYYY-MM-DD hh:mm a').format('YYYY-MM-DD HH:mm:ss')
      const endDate = moment(this.customEndDate, 'YYYY-MM-DD hh:mm a').format('YYYY-MM-DD HH:mm:ss')

      this.getMetricGroupsStatistics(this.customRange.id, startDate, endDate)
    },
    enableCustomEndDate (date) {
      if (this.customStartDate) {
        this.isEndDateTimePickerDisabled = false
      }
    },
    enableButtonPicker () {
      if (this.customEndDate) {
        this.isApplyButtonPickerDisabled = false
      }
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
    },
    arrangedMetricList () {
      const list1 = JSON.stringify(this.metricsList)
      const list2 = JSON.stringify(this.arrangedMetricList)
      if (list1 !== list2 && !_.isEmpty(list2)) {
        this.metricsList = JSON.parse(list2)
      }
    }
  }
}

</script>
