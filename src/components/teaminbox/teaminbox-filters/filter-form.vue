<template>
  <div data-testid="teaminbox-filter-form-wrapper">
    <b-form class="inbox-channel-filter-form" data-testid="teaminbox-filter-form">
      <b-container>
        <div>
          <h5 class="section-header">Quick Access</h5>
          <b-form-row class="mt-2 quick-access" data-testid="teaminbox-filter-form-quick-access-form-row">
            <b-col sm="12" md="6">
              <b-form-group class="form-label mb-3" data-testid="teaminbox-filter-form-quick-access-form-group">
                <template v-slot:label>
                  <span>{{ dateRangeLabel }}</span>
                  <span class="pl-1">
                    <information-circle-icon color="#2F80ED"/>
                    <q-tooltip anchor="top middle"
                               self="center middle"
                               data-testid="teaminbox-filter-form-tooltip">
                      <span class="text-13">Filter contacts based on last engagement date (last time agent or contact sent an SMS or called)</span>
                    </q-tooltip>
                  </span>
                </template>

                <date-range-picker ref="picker"
                                   :class="[dateHasChanges ? 'daterange-picker-highlighted' : '']"
                                   :opens="opens"
                                   :ranges="ranges"
                                   :always-show-calendars="true"
                                   :auto-apply="true"
                                   data-testid="teaminbox-filter-form-date-range-picker"
                                   @toggle="pickerToggle"
                                   @finish-selection="onFinishSelection"
                                   v-model="dateRange">
                  <template v-slot:input="picker" style="min-width: 350px;">
                    {{ getDateRangeInputLabel(picker) }}
                  </template>
                </date-range-picker>
              </b-form-group>
            </b-col>
            <b-col sm="12" md="6">
              <b-form-group label="Lines"
                            class="form-label mb-0">
                <line-selector :force-remove-missing-values="true"
                               :multiple="true"
                               :use-chips="true"
                               :generic-styling="false"
                               :generic-multiselect="false"
                               :highlighted="isChanged('campaigns')"
                               :disable="isLineSelectorDisabled"
                               :pre-selected-team-inbox-line-id="activeInboxId"
                               v-model="filter.campaigns"
                               data-testid="teaminbox-filter-form-line-selector"
                               @change="eventPayload => onFilterChange(eventPayload, 'campaigns')">
                </line-selector>
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>

        <div>
          <h5 class="mt-2 section-header">Status and Contact</h5>
          <b-form-row class="mt-2" data-testid="teaminbox-filter-form-contact-form-row">
            <b-col sm="6">
              <b-form-group class="form-group form-label mb-3">
                Unread Communications Only
                <div>
                  <b-form-checkbox class="cursor-pointer switch-success"
                                   size="lg"
                                   switch
                                   :value="true"
                                   :unchecked-value="false"
                                   :class="[isChanged('unread_only') ? 'checkbox-highlighted' : '']"
                                   data-testid="teaminbox-filter-form-unread-only-checkbox"
                                   v-model="filter.unread_only"
                                   @change="eventPayload => onFilterChange(eventPayload, 'unread_only')">
                  </b-form-checkbox>
                </div>
              </b-form-group>
            </b-col>
            <b-col sm="6" md="6">
              <b-form-group class="form-group form-label mb-3">
                My Contacts Only
                <div>
                  <b-form-checkbox class="cursor-pointer switch-success"
                                   size="lg"
                                   switch
                                   :value="true"
                                   :unchecked-value="false"
                                   :class="[isChanged('my_contact') ? 'checkbox-highlighted' : '']"
                                   data-testid="teaminbox-filter-form-my-contacts-checkbox"
                                   v-model="filter.my_contact"
                                   @change="eventPayload => onFilterChange(eventPayload, 'my_contact')">
                  </b-form-checkbox>
                </div>
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>

        <div>
          <h5 class="mt-2 section-header">Handling</h5>
          <b-form-row class="mt-2" data-testid="teaminbox-filter-form-handling-form-row">
            <b-col sm="12" md="6">
              <b-form-group label="Channels" class="form-label mb-0">
                <channel-selector :highlighted="isChanged('channels')"
                                  data-testid="teaminbox-filter-form-channel-selector"
                                  v-model="filter.channels"
                                  @input="eventPayload => onFilterChange(eventPayload, 'channel')">
                </channel-selector>
              </b-form-group>
            </b-col>

            <b-col sm="12" md="6" v-if="isContactStatusControlEnabled">
              <b-form-group label="Task Status" class="form-label mb-0">
                <q-select
                  ref="taskStatusSelect"
                  class="q-basic-selector"
                  option-value="value"
                  option-label="label"
                  emit-value
                  map-options
                  dense
                  outlined
                  color="primary"
                  multiple
                  use-chips
                  use-input
                  placeholder="Select Task Status"
                  data-testid="teaminbox-filter-form-task-status-selector"
                  :options="fTaskStatusOptions"
                  v-model="filter.task_status"
                  @input="eventPayload => onFilterChange(eventPayload, 'task_status')"
                  @filter="filterTaskStatusFn"
                >
                <template v-slot:selected-item="scope">
                  <q-chip
                    dense
                    :tabindex="scope.tabindex"
                    color="white"
                    class="tag-selected-chip"
                    text-color="secondary"
                    data-testid="teaminbox-filter-form-task-status-chip"
                  >
                    <i class="fa fa-circle position-absolute"
                      :style="`color: ${scope.opt.color}; font-size: 50%; left: 4px; top: 40%; margin-right: 10px;`" />
                    <span class="ml-3 mr-3 pr-1 pl-1">{{ scope.opt.label }}</span>
                    <div role="button"
                        class="custom__remove d-flex align-items-center position-absolute r-0"
                        @click="scope.removeAtIndex(scope.index)">
                      <remove-tag-icon class="ml-1 remove-tag-icon"
                                      data-testid="teaminbox-filter-form-task-status-remove-tag-icon" />
                    </div>
                  </q-chip>
                </template>
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="no-results text-grey">
                      No results
                    </q-item-section>
                  </q-item>
                </template>
                </q-select>
              </b-form-group>
            </b-col>

          </b-form-row>
          <b-form-row class="mt-2">
            <b-col sm="6">
              <b-form-group class="form-label" label="Direction">
                <direction-selector :highlighted="isChanged('directions')"
                                   data-testid="teaminbox-filter-form-comm-direction-selector"
                                   v-model="filter.directions"
                                   @input="eventPayload => onFilterChange(eventPayload, 'directions')">
                </direction-selector>
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>
      </b-container>
    </b-form>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import DateRangePicker from 'vue2-daterange-picker'
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css'
import LineSelector from 'components/generic-selectors/line-selector'
import DirectionSelector from './direction-selector'
import ChannelSelector from './channel-selector'
import InformationCircleIcon from 'components/icons/information-circle-icon'
import RemoveTagIcon from 'components/icons/contact-activity/remove-tag-icon'
import moment from 'moment-timezone'

export default {
  name: 'teaminbox-filter-form',

  components: {
    DateRangePicker,
    LineSelector,
    DirectionSelector,
    ChannelSelector,
    InformationCircleIcon,
    RemoveTagIcon
  },

  mixins: [
  ],

  props: {
    filter: {
      type: Object,
      required: true
    },
    defaultFilter: {
      type: Object,
      required: true
    },
    reset: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapState('auth', ['profile']),
    ...mapGetters('TeamInbox', ['activeInboxCampaignIds']),
    ...mapGetters('cache', ['isContactStatusControlEnabled']),
    ...mapState(['campaigns', 'currentTimezone']),
    ...mapState('TeamInbox', ['activeInboxId']),

    dateRangeLabel () {
      return 'Last Engagement Date'
    },

    isLineSelectorDisabled () {
      return false
    },

    /**
     * Returns the active campaigns for the current team inbox
     */
    activeCampaigns () {
      return this.campaigns.filter(campaign => this.activeInboxCampaignIds?.includes(campaign.id) || campaign.ivr_id)
    },

    dateHasChanges () {
      return this.filter.from_date !== this.defaultFilter.from_date ||
        this.filter.to_date !== this.defaultFilter.to_date
    }
  },

  data () {
    return {
      dateRange: {
        startDate: null,
        endDate: null
      },
      opens: 'right',
      ranges: {},
      rangePicker: null,
      fTaskStatusOptions: [],
      taskStatusOptions: [
        { label: 'Open', value: 'open' },
        { label: 'Pending', value: 'pending' },
        { label: 'Closed', value: 'closed' }
      ]
    }
  },

  methods: {
    onFilterChange (value, field) {
      this.$emit('filterChange', { value, field })
    },

    onFinishSelection () {
      this.onDateChange('custom')
    },

    onDateChange (date_range = this.filter.date_range) {
      this.onFilterChange({
        date_range,
        from_date: this.dateRange.startDate,
        to_date: this.dateRange.endDate
      }, 'dateRange')
    },

    pickerToggle (isOpen) {
      if (isOpen) {
        this.$nextTick(() => {
          const pickerElement = this.$refs.picker.$el
          const listItems = pickerElement.querySelectorAll('li')

          listItems.forEach(li => {
            li.addEventListener('click', () => {
              this.onDateChange(li.getAttribute('data-range-key'))
            })

            li.classList.remove('active')

            if (li.getAttribute('data-range-key') === this.filter.date_range) {
              li.classList.add('active')
            }
          })
        })
      }
    },

    getDateRangeInputLabel () {
      if (this.dateRange.startDate && this.dateRange.endDate) {
        return `${moment(this.dateRange.startDate).format('MM/DD/YYYY')} - ${moment(this.dateRange.endDate).format('MM/DD/YYYY')}`
      }

      if (this.reset) {
        return `${moment(this.ranges['Last 30 Days'][0]).format('MM/DD/YYYY')} - ${moment(this.ranges['Last 30 Days'][1]).format('MM/DD/YYYY')}`
      }

      return 'All Time'
    },

    isChanged (field) {
      return JSON.stringify(this.filter[field]) !== JSON.stringify(this.defaultFilter[field])
    },

    parseDatePicker (date) {
      if (!date) {
        return null
      }
      return moment(date)._d
    },

    initializeDateRanges () {
      const timezone = this.currentTimezone
      const DATE_FORMAT = 'MM/DD/YYYY HH:mm:ss'

      this.ranges = {
        'Today': [this.parseDatePicker(moment().tz(timezone).startOf('day').format(DATE_FORMAT)), this.parseDatePicker(moment().tz(timezone).endOf('day').format(DATE_FORMAT))],
        'Yesterday': [this.parseDatePicker(moment().tz(timezone).subtract(1, 'days').startOf('day').format(DATE_FORMAT)), this.parseDatePicker(moment().tz(timezone).subtract(1, 'days').endOf('day').format(DATE_FORMAT))],
        'Last 7 Days': [this.parseDatePicker(moment().tz(timezone).subtract(7, 'days').startOf('day').format(DATE_FORMAT)), this.parseDatePicker(moment().tz(timezone).endOf('day').format(DATE_FORMAT))],
        'Last 30 Days': [this.parseDatePicker(moment().tz(timezone).subtract(30, 'days').startOf('day').format(DATE_FORMAT)), this.parseDatePicker(moment().tz(timezone).endOf('day').format(DATE_FORMAT))],
        'This Month So Far': [this.parseDatePicker(moment().tz(timezone).startOf('month').format(DATE_FORMAT)), this.parseDatePicker(moment().tz(timezone).endOf('day').format(DATE_FORMAT))],
        'Last Month': [this.parseDatePicker(moment().tz(timezone).subtract(1, 'months').startOf('month').format(DATE_FORMAT)), this.parseDatePicker(moment().tz(timezone).subtract(1, 'months').endOf('month').format(DATE_FORMAT))],
        'All Time': [null, null]
      }
    },
    showTaskStatusPlaceholder () {
      const input = this.$refs.taskStatusSelect?.$el?.querySelector('.q-basic-selector .q-field__input')
      if (!input) {
        return
      }

      if (!this.filter.task_status?.length) {
        input.placeholder = 'Select Task Status'
        input.style.display = 'block'
        return
      }

      input.placeholder = ''
    },

    filterTaskStatusFn (val, update) {
      if (val === '') {
        update(() => {
          this.fTaskStatusOptions = this.taskStatusOptions
        })
        return
      }

      update(() => {
        this.fTaskStatusOptions = this.taskStatusOptions.filter(option => option.label.toLowerCase().includes(val.toLowerCase()))
      })
    }
  },

  filters: {
    date (date) {
      return moment(date).format('MM/DD/YYYY')
    }
  },

  created () {
    this.initializeDateRanges()

    this.$watch(
      () => [this.filter.from_date, this.filter.to_date],
      (value) => {
        this.dateRange.startDate = value[0]
        this.dateRange.endDate = value[1]
      }
    )
  },

  mounted () {
    this.dateRange.startDate = this.filter.from_date
    this.dateRange.endDate = this.filter.to_date

    this.rangePicker = this.$refs.picker
    this.fTaskStatusOptions = [ ...this.taskStatusOptions ]
    this.showTaskStatusPlaceholder()
  },

  watch: {
    dateRange: {
      deep: true,
      handler () {
        let startDate = moment(this.dateRange.startDate)
        let endDate = moment(this.dateRange.endDate)

        if (startDate.isValid() && endDate.isValid() && startDate.format('HH:mm:ss') === endDate.format('HH:mm:ss')) {
          startDate.set({ hour: 0, minute: 0, second: 0 })
          endDate.set({ hour: 23, minute: 59, second: 59 })
          this.dateRange.startDate = startDate.format('YYYY-MM-DD HH:mm:ss')
          this.dateRange.endDate = endDate.format('YYYY-MM-DD HH:mm:ss')
        }

        const fromDate = this.dateRange.startDate ? startDate.format('YYYY-MM-DD HH:mm:ss') : null
        const toDate = this.dateRange.endDate ? endDate.format('YYYY-MM-DD HH:mm:ss') : null

        // Only update if values actually changed to avoid infinite loops
        if (this.filter.from_date !== fromDate || this.filter.to_date !== toDate) {
          this.filter.from_date = fromDate
          this.filter.to_date = toDate

          // Emit the change to notify parent component
          this.onFilterChange({
            date_range: this.filter.date_range,
            from_date: fromDate,
            to_date: toDate
          }, 'dateRange')
        }
      }
    },

    reset (newVal) {
      if (newVal) {
        this.dateRange.startDate = this.ranges['Last 30 Days'][0]
        this.dateRange.endDate = this.ranges['Last 30 Days'][1]
        this.filter.from_date = this.dateRange.startDate
        this.filter.to_date = this.dateRange.endDate
        this.getDateRangeInputLabel()
      }
    },
    'filter.task_status' () {
      this.showTaskStatusPlaceholder()
    }
  }
}
</script>

<style lang="scss">
.teaminbox-filter-form .quick-access .vue-daterange-picker .reportrange-text {
  height: 40px;
  display: flex;
  align-items: center;
}
.daterange-picker-highlighted .reportrange-text {
  border: 2px solid #256eff !important;
}
.checkbox-highlighted {
  .custom-control-input:checked ~ .custom-control-label::before {
    border-color: #256eff !important;
    background-color: #256eff !important;
  }
  .custom-control-label::before {
    border-color: #256eff !important;
  }
}
</style>
