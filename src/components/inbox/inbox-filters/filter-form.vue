<template>
  <div data-testid="filter-form-wrapper">
    <b-form class="inbox-channel-filter-form" data-testid="filter-form-quick-access-form">
      <b-container>
        <div v-if="$route.name === 'Inbox' || !isMentionsChannel || isFilterDialogForView">
          <h5 class="section-header">Quick Access</h5>
          <b-form-row class="mt-2 quick-access" data-testid="filter-form-quick-access-form-row">
            <b-col sm="12"
                   md="6">
              <b-form-group class="form-label" data-testid="filter-form-quick-access-form-group">
                <template v-slot:label>
                  <span>{{ dateRangeLabel }}</span>
                  <span class="pl-1"
                        v-if="isInboxOrAllComms || isFilterDialogForView">
                    <information-circle-icon color="#2F80ED"/>
                    <q-tooltip anchor="top middle"
                               self="center middle"
                               data-testid="filter-form-form-tooltip">
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
                                   data-testid="filter-form-date-range-picker"
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
                               data-testid="filter-form-line-selector"
                               @change="eventPayload => onFilterChange(eventPayload, 'campaigns')">
                </line-selector>
              </b-form-group>
            </b-col>
          </b-form-row>
          <b-form-row class="mt-2" data-testid="filter-form-quick-access-form-row">
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
                                     data-testid="filter-form-ring-group-selector"
                                     @change="eventPayload => onFilterChange(eventPayload, 'ring_groups')">
                </ring-group-selector>
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>

        <div v-if="!isMentionsOrInboxChannel && !isFilterDialogForView">
          <h5 class="mt-4 section-header">Handling</h5>
          <b-form-row class="mt-2" data-testid="filter-form-handling-form-row">
            <b-col sm="12"
                   md="6">
              <b-form-group class="form-label"
                            label="Direction">
                <communication-direction-selector custom-class="bottom-border__none highlighted-primary padding-left__none q-select-auto-width"
                                                  :highlighted="isChanged('direction')"
                                                  :use-input="false"
                                                  v-model="filter.direction"
                                                  data-testid="filter-form-comm-direction-selector"
                                                  @select="eventPayload => onFilterChange(eventPayload, 'direction')">
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
                                        data-testid="filter-form-answer-status-selector"
                                        @select="eventPayload => onFilterChange(eventPayload, 'answer_status')">
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
                                    data-testid="filter-form-talk-time-selector"
                                    @select="eventPayload => onFilterChange(eventPayload, 'min_talk_time')">
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
                                        data-testid="filter-form-transfer-type-selector"
                                        @select="eventPayload => onFilterChange(eventPayload, 'transfer_type')">
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
                                          data-testid="filter-form-callback-status-selector"
                                          @select="eventPayload => onFilterChange(eventPayload, 'callback_status')">
                </callback-status-selector>
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>

        <div v-if="!isMentionsChannel || isFilterDialogForView">
          <h5 class="mt-4 section-header">Properties</h5>
          <b-form-row class="mt-2" data-testid="filter-form-properties-form-row">
            <b-col md="6"
                   sm="12">
              <b-form-group class="form-label"
                            :label="tagsFilterLabel">
                <entity-tags ref="tagSelector"
                             data-testid="communication-tags-multi-select"
                             entity="contact"
                             entity-type="contacts"
                             placeholder="Type to search tags"
                             :category="tagsFilterCategory"
                             :is-filter="true"
                             :dense="true"
                             :filter-values="filter.tags"
                             :filter-values-objects="selectedTags"
                             @filter="onFilterTagsChange"/>
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
                                           @change="eventPayload => onFilterChange(eventPayload, 'call_dispositions')">
                </call-disposition-selector>
              </b-form-group>
            </b-col>
          </b-form-row>
          <b-form-row v-if="!isInboxOrInboxViews" data-testid="filter-form-properties-form-row">
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
                <span class="form-label">Show Only Unread Communications</span>
                <div>
                  <b-form-checkbox class="cursor-pointer switch-success"
                                   size="lg"
                                   switch
                                   :value="1"
                                   :unchecked-value="0"
                                   v-model="filter.unread_only">
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
                                         @select="eventPayload => onFilterChange(eventPayload, 'creator_type')">
                  </creator-type-selector>
                </div>
              </b-form-group>
            </b-col>

          </b-form-row>
          <b-form-row v-if="isInboxOrInboxViews" data-testid="filter-form-properties-form-row">
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
                                   data-testid="filter-form-properties-form-checkbox"
                                   v-model="filter.has_unread">
                  </b-form-checkbox>
                </div>
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>

        <div v-if="isInboxOrInboxViews">
          <h5 class="mt-4 section-header">Has Communicated Within</h5>
          <b-form-row class="mt-2" data-testid="filter-form-has-communicated-within-form-row">
            <b-col sm="12"
                     md="6">
              <b-form-group class="form-label">
                <template v-slot:label>
                  <span>Last Engagement Date Period</span>
                  <span class="pl-1">
                    <information-circle-icon color="#2F80ED"/>
                    <q-tooltip anchor="top middle"
                               self="center middle"
                               data-testid="filter-form-has-communicated-within-form-tooltip">
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
                          data-testid="filter-form-has-communicated-within-form-select"
                          v-model="filter.dynamic_engagement_date_range" />
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>

        <div>
          <h5 class="mt-4 section-header">Attribution</h5>
          <b-form-row class="mt-2" data-testid="filter-form-attributions-form-row">
            <b-col sm="12"
                   md="6"
                   v-if="!isMentionsOrInboxChannel">
              <b-form-group class="form-label"
                            label="Line Phone Numbers">
                <incoming-number-selector :multiple="true"
                                          :use-chips="true"
                                          :highlighted="isChanged('incoming_numbers')"
                                          v-model="filter.incoming_numbers"
                                          data-testid="filter-form-incoming-number-selector"
                                          @change="eventPayload => onFilterChange(eventPayload, 'incoming_numbers')">
                </incoming-number-selector>
              </b-form-group>
            </b-col>
            <b-col sm="12"
                   md="6"
                   v-if="isInboxOrAllCallsChannel || isMessagesOnlyChannel">
              <b-form-group class="form-label">
                <template v-slot:label>
                  <span data-testid="filter-form-communication-owners-row">Communication Owners</span>
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
                               data-testid="filter-form-user-selector"
                               v-model="filter.users"
                               @change="eventPayload => onFilterChange(eventPayload, 'users')">
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
                                   @change="eventPayload => onFilterChange(eventPayload, 'workflows')">
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
                               data-testid="filter-form-user-selector"
                               @change="eventPayload => onFilterChange(eventPayload, 'contact_owner')">
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
                                    data-testid="filter-form-broadcast-selector"
                                    @change="eventPayload => onFilterChange(eventPayload, 'broadcasts')">
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
import UserSelector from 'components/generic-selectors/user-selector'
import IncomingNumberSelector from 'components/generic-selectors/incoming-number-selector'
import SequenceSelector from 'components/generic-selectors/sequence-selector'
import CallbackStatusSelector from 'components/generic-selectors/callback-status-selector'
import BroadcastSelector from 'components/generic-selectors/broadcast-selector'
import CreatorTypeSelector from 'components/generic-selectors/creator-type-selector.vue'
import { mapState, mapActions } from 'vuex'
import DateRangePicker from 'vue2-daterange-picker'
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css'
import InformationCircleIcon from 'components/icons/information-circle-icon'
import { TAG_CATEGORIES as TagCategories } from 'src/constants/tag-categories'
import { inboxRoutesMixin } from 'src/plugins/mixins'
import EntityTags from 'components/generic-selectors/entity-tags'
import moment from 'moment'

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
    CallbackStatusSelector,
    BroadcastSelector,
    DateRangePicker,
    CreatorTypeSelector,
    EntityTags
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
    ...mapState(['tags']),

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

    ...mapState(['currentTimezone']),

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
        startDate: null,
        endDate: null
      },
      opens: 'right',
      ranges: {
        'Today': [this.parseDatePicker(moment().tz(this.currentTimezone).startOf('day').format('MM/DD/YYYY HH:mm:ss')), this.parseDatePicker(moment().tz(this.currentTimezone).endOf('day').format('MM/DD/YYYY HH:mm:ss'))],
        'Yesterday': [this.parseDatePicker(moment().tz(this.currentTimezone).subtract(1, 'days').startOf('day').format('MM/DD/YYYY HH:mm:ss')), this.parseDatePicker(moment().tz(this.currentTimezone).subtract(1, 'days').endOf('day').format('MM/DD/YYYY HH:mm:ss'))],
        'Last 7 Days': [this.parseDatePicker(moment().tz(this.currentTimezone).subtract(7, 'days').startOf('day').format('MM/DD/YYYY HH:mm:ss')), this.parseDatePicker(moment().tz(this.currentTimezone).endOf('day').format('MM/DD/YYYY HH:mm:ss'))],
        'Last 30 Days': [this.parseDatePicker(moment().tz(this.currentTimezone).subtract(30, 'days').startOf('day').format('MM/DD/YYYY HH:mm:ss')), this.parseDatePicker(moment().tz(this.currentTimezone).endOf('day').format('MM/DD/YYYY HH:mm:ss'))],
        'This Month So Far': [this.parseDatePicker(moment().tz(this.currentTimezone).startOf('month').format('MM/DD/YYYY HH:mm:ss')), this.parseDatePicker(moment().tz(this.currentTimezone).endOf('day').format('MM/DD/YYYY HH:mm:ss'))],
        'Last Month': [this.parseDatePicker(moment().tz(this.currentTimezone).subtract(1, 'months').startOf('month').format('MM/DD/YYYY HH:mm:ss')), this.parseDatePicker(moment().tz('Australia/Brisbane').subtract(1, 'months').endOf('month').format('MM/DD/YYYY HH:mm:ss'))],
        'All Time': [null, null]
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
        }
      ],
      selectedTags: []
    }
  },

  filters: {
    date (date) {
      return moment(date).format('MM/DD/YYYY')
    }
  },

  methods: {
    ...mapActions(['setTags']),

    onFilterChange (value, prop) {
      this.filter[prop] = value
    },

    onFilterTagsChange (tagsIds, tagsObjects) {
      this.filter.tags = tagsIds
      this.setTags(tagsObjects)
    },

    isChanged (property) {
      return JSON.stringify(this.filter[property]) !== JSON.stringify(this.defaultFilterModel.filter[property])
    },

    getDateRangeInputLabel () {
      if (this.dateRange.startDate && this.dateRange.endDate) {
        return `${this.$options.filters.date(this.dateRange.startDate)} - ${this.$options.filters.date(this.dateRange.endDate)}`
      }

      return 'All Time'
    },

    getTagsObjectsByIds (tagsIds = []) {
      return tagsIds?.map((tagId) => this.tags?.find((tag) => tag.id === tagId))
    },

    onPreliminarChange (tags) {
      this.setTags(tags)
    },

    parseDatePicker (date) {
      if (!date) {
        return null
      }
      return moment(date)._d
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
    this.selectedTags = this.getTagsObjectsByIds(this.filter?.tags)

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
          ? moment(this.dateRange.startDate).format('YYYY-MM-DD HH:mm:ss')
          : null
        this.filter.to_date = this.dateRange.endDate
          ? moment(this.dateRange.endDate).format('YYYY-MM-DD HH:mm:ss')
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

    'filter.tags': {
      deep: true,
      handler (value) {
        this.selectedTags = this.getTagsObjectsByIds(value)
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
