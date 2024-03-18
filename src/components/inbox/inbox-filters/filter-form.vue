<template>
  <div>
    <b-form class="inbox-channel-filter-form">
      <b-container>
        <div v-if="$route.name === 'Inbox' || !isMentionsChannel || isFilterDialogForView">
          <h5 class="section-header">Quick Access</h5>
          <b-form-row class="mt-2 quick-access">
            <b-col sm="12"
                   md="6">
              <b-form-group class="form-label">
                <template v-slot:label>
                  <span>{{ dateRangeLabel }}</span>
                  <span class="pl-1"
                        v-if="isInboxOrAllComms || isFilterDialogForView">
                    <information-circle-icon color="#2F80ED"/>
                    <q-tooltip anchor="top middle"
                               self="center middle">
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
                                   v-model="dateRange">
                  <template v-slot:input="picker" style="min-width: 350px;">
                    {{ getDateRangeInputLabel(picker) }}
                  </template>
                </date-range-picker>
              </b-form-group>
            </b-col>
            <b-col sm="12"
                   md="6">
              <b-form-group label="Lines"
                            class="form-label">
                <line-selector :force-remove-missing-values="true"
                               :multiple="true"
                               :use-chips="true"
                               :generic-styling="false"
                               :generic-multiselect="false"
                               :highlighted="isChanged('campaigns')"
                               :disable="isLineSelectorDisabled"
                               v-model="filter.campaigns"
                               @change="(eventPayload) => onFilterChange(eventPayload, 'campaigns')">
                </line-selector>
              </b-form-group>
            </b-col>
          </b-form-row>
          <b-form-row class="mt-2">
            <b-col sm="12"
                   md="6"
                   v-if="isInboxOrAllCallsChannel">
              <b-form-group class="form-label"
                            label="Ring Groups">
                <ring-group-selector :force-remove-missing-values="true"
                                     :multiple="true"
                                     :highlighted="isChanged('ring_groups')"
                                     :generic-multiselect="false"
                                     v-model="filter.ring_groups"
                                     @change="(eventPayload) => onFilterChange(eventPayload, 'ring_groups')">
                </ring-group-selector>
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>

        <div v-if="!isMentionsOrInboxChannel && !isFilterDialogForView">
          <h5 class="mt-4 section-header">Handling</h5>
          <b-form-row class="mt-2">
            <b-col sm="12"
                   md="6">
              <b-form-group class="form-label"
                            label="Direction">
                <communication-direction-selector custom-class="bottom-border__none highlighted-primary padding-left__none q-select-auto-width"
                                                  :highlighted="isChanged('direction')"
                                                  :use-input="false"
                                                  v-model="filter.direction"
                                                  @select="(eventPayload) => onFilterChange(eventPayload, 'direction')">
                </communication-direction-selector>
              </b-form-group>
            </b-col>
            <b-col sm="12"
                   md="6"
                   v-if="isCallsOnlyChannel">
              <b-form-group class="form-label"
                            label="Answer Status">
                <answer-status-selector custom-class="bottom-border__none highlighted-primary padding-left__none q-select-auto-width"
                                        :highlighted="isChanged('answer_status')"
                                        :use-input="false"
                                        v-model="filter.answer_status"
                                        @select="(eventPayload) => onFilterChange(eventPayload, 'answer_status')">
                </answer-status-selector>
              </b-form-group>
            </b-col>
            <b-col sm="12"
                   md="6"
                   v-if="isCallsAndRecordingsChannel">
              <b-form-group class="form-label"
                            label="Talk Time">
                <talk-time-selector custom-class="bottom-border__none highlighted-primary padding-left__none q-select-auto-width"
                                    :highlighted="isChanged('min_talk_time')"
                                    :use-input="false"
                                    v-model="filter.min_talk_time"
                                    @select="(eventPayload) => onFilterChange(eventPayload, 'min_talk_time')">
                </talk-time-selector>
              </b-form-group>
            </b-col>
            <b-col sm="12"
                   md="6"
                   v-if="isCallsAndRecordingsChannel">
              <b-form-group class="form-label"
                            label="Transfer Type">
                <transfer-type-selector custom-class="bottom-border__none highlighted-primary padding-left__none q-select-auto-width"
                                        :highlighted="isChanged('transfer_type')"
                                        :use-input="false"
                                        v-model="filter.transfer_type"
                                        @select="(eventPayload) => onFilterChange(eventPayload, 'transfer_type')">
                </transfer-type-selector>
              </b-form-group>
            </b-col>
            <b-col sm="12"
                   md="6"
                   v-if="isCallsAndRecordingsChannel">
              <b-form-group class="form-label"
                            label="Callback Status">
                <callback-status-selector custom-class="bottom-border__none highlighted-primary padding-left__none q-select-auto-width"
                                          :clearable="true"
                                          :highlighted="isChanged('callback_status')"
                                          :use-input="false"
                                          v-model="filter.callback_status"
                                          @select="(eventPayload) => onFilterChange(eventPayload, 'callback_status')">
                </callback-status-selector>
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>

        <div v-if="!isMentionsChannel || isFilterDialogForView">
          <h5 class="mt-4 section-header">Properties</h5>
          <b-form-row class="mt-2">
            <b-col md="6"
                   sm="12">
              <b-form-group class="form-label"
                            :label="tagsFilterLabel">
                <tag-selector ref="tagSelector"
                              :multiple="true"
                              :highlighted="isChanged('tags')"
                              :category="tagsFilterCategory"
                              v-model="filter.tags"
                              @change="(eventPayload) => onFilterChange(eventPayload, 'tags')">
                </tag-selector>
              </b-form-group>
            </b-col>
            <b-col md="6"
                   sm="12"
                   v-if="!isInboxOrInboxViews && isCallsAndRecordingsChannel">
              <b-form-group class="form-label"
                            label="Call Disposition">
                <call-disposition-selector :multiple="true"
                                           :highlighted="isChanged('call_dispositions')"
                                           v-model="filter.call_dispositions"
                                           @change="(eventPayload) => onFilterChange(eventPayload, 'call_dispositions')">
                </call-disposition-selector>
              </b-form-group>
            </b-col>
          </b-form-row>
          <b-form-row v-if="!isInboxOrInboxViews">
            <b-col md="6"
                   sm="12">
              <b-form-group>
                <span class="form-label">Show Only First Time Communications</span>
                <div>
                  <b-form-checkbox class="cursor-pointer switch-success"
                                   size="lg"
                                   switch
                                   :value="1"
                                   :unchecked-value="0"
                                   v-model="filter.first_time_only">
                  </b-form-checkbox>
                </div>
              </b-form-group>
            </b-col>

            <b-col md="6"
                   sm="12">
              <b-form-group>
                <span class="form-label">Show Only Untagged Communications</span>
                <div>
                  <b-form-checkbox class="switch-success"
                                   size="lg"
                                   switch
                                   :value="1"
                                   :unchecked-value="0"
                                   v-model="filter.untagged_only">
                  </b-form-checkbox>
                </div>
              </b-form-group>
            </b-col>

            <b-col md="6"
                   sm="12">
              <b-form-group>
                <span class="form-label">Exclude Communications Sent From Sequences</span>
                <div>
                  <b-form-checkbox class="switch-success"
                                   size="lg"
                                   switch
                                   :value="1"
                                   :unchecked-value="0"
                                   v-model="filter.exclude_automated_communications">
                  </b-form-checkbox>
                </div>
              </b-form-group>
            </b-col>

            <b-col md="6"
                   sm="12">
              <b-form-group>
                <span class="form-label">Creator Type</span>
                <div>
                  <creator-type-selector custom-class="bottom-border__none highlighted-primary padding-left__none q-select-auto-width"
                                         :highlighted="isChanged('creator_type')"
                                         :use-input="false"
                                         v-model="filter.creator_type"
                                         @select="(eventPayload) => onFilterChange(eventPayload, 'creator_type')">
                  </creator-type-selector>
                </div>
              </b-form-group>
            </b-col>

          </b-form-row>
          <b-form-row v-if="isInboxOrInboxViews">
            <b-col md="6"
                   sm="12">
              <b-form-group>
                <span class="form-label">Show contacts with unread communications only</span>
                <div>
                  <b-form-checkbox class="switch-success"
                                   size="lg"
                                   switch
                                   :value="1"
                                   :unchecked-value="0"
                                   v-model="filter.has_unread">
                  </b-form-checkbox>
                </div>
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>

        <div v-if="isInboxOrInboxViews">
          <h5 class="mt-4 section-header">Has Communicated Within</h5>
          <b-form-row class="mt-2">
            <b-col sm="12"
                     md="6">
              <b-form-group class="form-label">
                <template v-slot:label>
                  <span>Last Engagement Date Period</span>
                  <span class="pl-1">
                    <information-circle-icon color="#2F80ED"/>
                    <q-tooltip anchor="top middle"
                               self="center middle">
                      <span class="text-13">Filter based on the last communication date; always  dynamic based on the selected relative period</span>
                    </q-tooltip>
                  </span>
                </template>
                <q-select class="q-user-selector q-basic-selector"
                          options-selected-class="text-primary"
                          color="primary"
                          option-value="id"
                          option-label="name"
                          map-options
                          use-input
                          emit-value
                          dense
                          outlined
                          :options="relativeRanges"
                          v-model="filter.dynamic_engagement_date_range" />
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>

        <div>
          <h5 class="mt-4 section-header">Attribution</h5>
          <b-form-row class="mt-2">
            <b-col sm="12"
                   md="6"
                   v-if="!isMentionsOrInboxChannel">
              <b-form-group class="form-label"
                            label="Line Phone Numbers">
                <incoming-number-selector :multiple="true"
                                          :use-chips="true"
                                          :highlighted="isChanged('incoming_numbers')"
                                          v-model="filter.incoming_numbers"
                                          @change="(eventPayload) => onFilterChange(eventPayload, 'incoming_numbers')">
                </incoming-number-selector>
              </b-form-group>
            </b-col>
            <b-col sm="12"
                   md="6"
                   v-if="isInboxOrAllCallsChannel || isMessagesOnlyChannel">
              <b-form-group class="form-label">
                <template v-slot:label>
                  <span>Communication Owners</span>
                  <span class="pl-1">
                    <information-circle-icon color="#2F80ED"/>
                    <q-tooltip anchor="top middle"
                               self="center middle">
                      <div class="text-13">
                        <p class="font-weight-bold">Who is the communication owner?</p>
                        <p class="font-weight-bold mb-0">For outbound communication:</p>
                        <p class="mb-0">Calls, SMS, fax & emails:</p>
                        <p><ul><li>The agent that sent the communication</li></ul></p>

                        <p class="font-weight-bold mb-0">For inbound communication:</p>
                        <p class="mb-0">Calls:</p>
                        <p><ul><li>The agent that answered the call</li></ul></p>

                        <p class="mb-0">SMS, fax & email:</p>
                        <p><ul><li>The most recently assigned contact owner owns all of these inbound communications</li></ul></p>
                      </div>
                    </q-tooltip>
                  </span>
                </template>
                <user-selector custom-placeholder="Select Communication Owners"
                               :force-remove-missing-values="true"
                               :generic-styling="false"
                               :multiple="true"
                               :use-chips="true"
                               :highlighted="isChanged('users')"
                               v-model="filter.users"
                               @change="(eventPayload) => onFilterChange(eventPayload, 'users')">
                </user-selector>
              </b-form-group>
            </b-col>
            <b-col sm="12"
                   md="6"
                   v-if="!isMentionsOrInboxChannel">
              <b-form-group class="form-label"
                            label="Sequences">
                <sequence-selector :force-remove-missing-values="true"
                                   :multiple="true"
                                   :generic-styling="false"
                                   :use-chips="true"
                                   :highlighted="isChanged('workflows')"
                                   v-model="filter.workflows"
                                   @change="(eventPayload) => onFilterChange(eventPayload, 'workflows')">
                </sequence-selector>
              </b-form-group>
            </b-col>
            <b-col sm="12"
                   md="6"
                   v-if="!isMentionsChannel || isFilterDialogForView">
              <b-form-group class="form-label"
                            label="Contact Owners">
                <user-selector custom-placeholder="Select Contact Owners"
                               :force-remove-missing-values="true"
                               :generic-styling="false"
                               :multiple="true"
                               :use-chips="true"
                               :highlighted="isChanged('contact_owner')"
                               :clearable="false"
                               :disable="disableContactOwner"
                               v-model="filter.contact_owner"
                               @change="(eventPayload) => onFilterChange(eventPayload, 'contact_owner')">
                </user-selector>
              </b-form-group>
            </b-col>
            <b-col sm="12"
                   md="6"
                   v-if="isMessagesOnlyChannel && !isFilterDialogForView">
              <b-form-group class="form-label"
                            label="Broadcasts">
                <broadcast-selector :multiple="true"
                                    :generic-styling="false"
                                    :use-chips="true"
                                    :highlighted="isChanged('broadcasts')"
                                    v-model="filter.broadcasts"
                                    @change="(eventPayload) => onFilterChange(eventPayload, 'broadcasts')">
                </broadcast-selector>
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>
      </b-container>
    </b-form>
  </div>
</template>

<script>
import LineSelector from 'components/generic-selectors/line-selector'
import RingGroupSelector from 'components/generic-selectors/ring-group-selector'
import TransferTypeSelector from 'components/generic-selectors/transfer-type-selector'
import TalkTimeSelector from 'components/generic-selectors/talk-time-selector'
import AnswerStatusSelector from 'components/generic-selectors/answer-status-selector'
import CommunicationDirectionSelector from 'components/generic-selectors/communication-direction-selector'
import CallDispositionSelector from 'components/generic-selectors/call-disposition-selector'
import TagSelector from 'components/generic-selectors/tag-selector'
import UserSelector from 'components/generic-selectors/user-selector'
import IncomingNumberSelector from 'components/generic-selectors/incoming-number-selector'
import SequenceSelector from 'components/generic-selectors/sequence-selector'
import CallbackStatusSelector from 'components/generic-selectors/callback-status-selector'
import BroadcastSelector from 'components/generic-selectors/broadcast-selector'
import CreatorTypeSelector from 'components/generic-selectors/creator-type-selector.vue'
import { mapState } from 'vuex'
import DateRangePicker from 'vue2-daterange-picker'
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css'
import InformationCircleIcon from 'components/icons/information-circle-icon'
import { TAG_CATEGORIES as TagCategories } from 'src/constants/tag-categories'
import { inboxRoutesMixin } from 'src/plugins/mixins'

export default {
  name: 'filter-form',

  mixins: [
    inboxRoutesMixin
  ],

  components: {
    InformationCircleIcon,
    SequenceSelector,
    IncomingNumberSelector,
    UserSelector,
    CommunicationDirectionSelector,
    AnswerStatusSelector,
    TalkTimeSelector,
    TransferTypeSelector,
    LineSelector,
    RingGroupSelector,
    CallDispositionSelector,
    TagSelector,
    CallbackStatusSelector,
    BroadcastSelector,
    DateRangePicker,
    CreatorTypeSelector
  },

  props: {
    filter: {
      type: Object,
      required: true
    },

    defaultFilterModel: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapState('inbox', [
      'channelChangedFilterFields',
      'isFilterDialogShown',
      'isFilterModelFormShown',
      'isFilterDialogForView',
      'inboxShowMyContacts'
    ]),

    ...mapState('auth', [
      'profile'
    ]),

    isInboxOrAllComms () {
      return this.inboxTaskRoutes.includes(this.$route.name) ||
        ['all-communications'].includes(this.$route.params.channel)
    },

    dateRangeLabel () {
      return this.isInboxOrAllComms || this.isFilterDialogForView ? 'Last Engagement Date' : 'Time'
    },

    dateHasChanges () {
      return this.filter.from_date !== this.defaultFilterModel.filter.from_date ||
        this.filter.to_date !== this.defaultFilterModel.filter.to_date
    },

    isRangeSelectionOpen () {
      if (!this.rangePicker) {
        return false
      }

      return this.rangePicker.$data.showCustomRangeCalendars
    },

    isMentionsChannel () {
      return this.$route.params.channel === 'mentions'
    },

    isInbox () {
      return this.$route.name === 'Inbox' || this.$route.params.channel === 'inbox'
    },

    isMentionsOrInboxChannel () {
      const nonCommunicationChannels = ['mentions', 'inbox', 'view']

      return this.isInboxOrInboxViews ||
        nonCommunicationChannels.includes(this.$route.params.channel)
    },

    isInboxOrAllCallsChannel () {
      const nonSmsChannels = ['inbox', 'calls', 'recordings', 'voicemails', 'all-communications', 'view', 'my-personal-line']

      return this.isInboxOrInboxViews ||
        nonSmsChannels.includes(this.$route.params.channel)
    },

    isCallsOnlyChannel () {
      const callsChannels = ['calls', 'all-communications', 'my-personal-line']

      return callsChannels.includes(this.$route.params.channel)
    },

    isCallsAndRecordingsChannel () {
      const allCallsChannels = ['calls', 'recordings', 'all-communications', 'my-personal-line']

      return allCallsChannels.includes(this.$route.params.channel)
    },

    isMessagesOnlyChannel () {
      const smsChannels = ['messages', 'all-communications', 'my-personal-line']

      return smsChannels.includes(this.$route.params.channel)
    },

    tagsFilterLabel () {
      return this.isInbox ? 'Contact Tags' : 'Tags'
    },

    tagsFilterCategory () {
      return this.isInboxOrInboxViews ? TagCategories.CAT_CONTACTS : TagCategories.CAT_COMMUNICATIONS
    },

    isInboxOrInboxViews () {
      return ['Inbox', 'Inbox View', 'Inbox View Contact Task'].includes(this.$route.name) || ['inbox', 'view'].includes(this.$route.params.channel) || this.isFilterDialogForView
    },

    isLineSelectorDisabled () {
      return this.$route.params.channel === 'my-personal-line'
    }
  },

  data () {
    return {
      disableContactOwner: false,
      dateRange: {
        startDate: null, // window.moment('2015-01-01')._d,
        endDate: null // window.moment()._d
      },
      opens: 'right',
      ranges: {
        'All Time': [null, null],
        'Today': [window.moment()._d, window.moment()._d],
        'Yesterday': [window.moment().subtract(1, 'day')._d, window.moment().subtract(1, 'day')._d],
        'This Week': [window.moment().startOf('week')._d, window.moment().endOf('week')._d],
        'This Month': [window.moment().startOf('month')._d, window.moment().endOf('month')._d],
        'Last 7 Days': [window.moment().subtract(7, 'day')._d, window.moment()._d],
        'Last 30 Days': [window.moment().subtract(30, 'day')._d, window.moment().subtract(1, 'day')._d],
        'Last 3 Months': [window.moment().subtract(3, 'month')._d, window.moment()._d],
        'Custom Range': [window.moment().subtract(1, 'day')._d, window.moment()._d]
      },
      rangePicker: null,
      TagCategories,
      relativeRanges: [
        {
          id: 0,
          name: 'All Time'
        },
        {
          id: 1,
          name: 'Today'
        },
        {
          id: 2,
          name: 'Yesterday'
        },
        {
          id: 3,
          name: 'This Week'
        },
        {
          id: 4,
          name: 'Last Week'
        },
        {
          id: 5,
          name: 'Last 7 Days'
        },
        {
          id: 6,
          name: 'This Month'
        },
        {
          id: 7,
          name: 'Last Month'
        },
        {
          id: 8,
          name: 'Last 30 Days'
        },
        {
          id: 9,
          name: 'Recent (Last 30 Days + Today)'
        }
      ]
    }
  },

  filters: {
    date (date) {
      return window.moment(date).format('MM/DD/YYYY')
    }
  },

  methods: {
    onFilterChange (value, prop) {
      this.filter[prop] = value
    },

    isChanged (property) {
      return JSON.stringify(this.filter[property]) !== JSON.stringify(this.defaultFilterModel.filter[property])
    },

    getDateRangeInputLabel () {
      if (this.dateRange.startDate && this.dateRange.endDate) {
        return `${this.$options.filters.date(this.dateRange.startDate)} - ${this.$options.filters.date(this.dateRange.endDate)}`
      }

      return 'All Time'
    }
  },

  created () {
    this.$watch(

      // Evaluate the value including the two properties

      () => [this.filter.from_date, this.filter.to_date],

      // The type of value or oldValue is the array returned above

      (value, oldValue) => {
        this.dateRange.startDate = value[0]
        this.dateRange.endDate = value[1]
      })
  },

  mounted () {
    this.dateRange.startDate = this.filter.from_date
    this.dateRange.endDate = this.filter.to_date
    this.rangePicker = this.$refs.picker

    setTimeout(() => {
      if (this.inboxShowMyContacts) {
        this.filter.my_contact = 1
      }
    }, 500)
  },

  watch: {
    dateRange: {
      deep: true,
      handler () {
        this.filter.from_date = this.dateRange.startDate
          ? window.moment(this.dateRange.startDate).format('YYYY-MM-DD')
          : null
        this.filter.to_date = this.dateRange.endDate
          ? window.moment(this.dateRange.endDate).format('YYYY-MM-DD')
          : null
      }
    },

    'filter.my_contact': {
      deep: true,
      handler (value) {
        if (value) {
          this.filter.contact_owner = []
        }
      }
    },

    'filter.contact_owner': {
      deep: true,
      handler (value) {
        if (value && value.length) {
          this.filter.my_contact = 0
        }
      }
    },

    isRangeSelectionOpen: function (value) {
      if (value) {
        this.dateRange.startDate = window.moment().subtract(1, 'day').format('YYYY-MM-DD')
        this.dateRange.endDate = window.moment().format('YYYY-MM-DD')
      }
    },

    'rangePicker.$data.open': function (value) {
      if (value && this.dateRange.startDate && this.dateRange.endDate) {
        this.rangePicker.$data.start = window.moment(this.dateRange.startDate)._d
        this.rangePicker.$data.end = window.moment(this.dateRange.endDate)._d
      }
    }
  }
}
</script>
