<template>
  <div>
    <b-form class="inbox-channel-filter-form">
      <b-container>
        <div v-if="$route.name === 'Inbox' || !['mentions'].includes($route.params.channel)">
          <h5 class="section-header">Quick Access</h5>
          <b-form-row class="mt-2">
            <b-col sm="12" md="6">
              <b-form-group
                :label="dateRangeLabel"
                class="form-label"
              >
                <div class="last-engagement-tooltip-wrapper" v-if="['Inbox Channel Task Status', 'Inbox'].includes($route.name)">
                  <information-circle-icon color="#2F80ED">
                  </information-circle-icon>
                  <q-tooltip  anchor="top middle"
                              self="center middle">
                    Filter contacts based on last engagement date (last time agent or contact sent an SMS or called)
                  </q-tooltip>
                </div>

                <date-range-picker
                  v-model="date_range"
                  ref="picker"
                  :class="[dateHasChanges ? 'daterange-picker-highlighted' : '']"
                  :opens="opens"
                  :ranges="ranges"
                  :always-show-calendars="false"
                  :auto-apply="true"
                >
                  <template v-slot:input="picker" style="min-width: 350px;">
                    {{ getDateRangeInputLabel(picker) }}
                  </template>
                </date-range-picker>
              </b-form-group>
            </b-col>
            <b-col sm="12" md="6">
              <b-form-group label="My Contacts"
                            class="form-label">
                <b-form-checkbox
                  class="mt-1"
                  switch
                  v-model="filter.my_contact"
                  :value="true"
                  :unchecked-value="false"
                  @change="(eventPayload) => onFilterChange(eventPayload, 'my_contact')"
                >
                </b-form-checkbox>
              </b-form-group>
            </b-col>
          </b-form-row>
          <b-form-row class="mt-2">
            <b-col sm="12" md="6">
              <b-form-group
                label="Lines"
                class="form-label"
              >
                <line-selector v-model="filter.campaigns"
                               :multiple="true"
                               :use-chips="true"
                               :generic-styling="false"
                               :generic-multiselect="false"
                               :highlighted="isChanged('campaigns')"
                               @change="(eventPayload) => onFilterChange(eventPayload, 'campaigns')">
                </line-selector>
              </b-form-group>
            </b-col>
            <b-col v-if="$route.name === 'Inbox' || ['inbox', 'calls', 'recordings', 'voicemails'].includes($route.params.channel)"
                   sm="12"
                   md="6">
              <b-form-group
                class="form-label"
                label="Ring Groups"
              >
                <ring-group-selector v-model="filter.ring_groups"
                                     :multiple="true"
                                     :highlighted="isChanged('ring_groups')"
                                     :generic-multiselect="false"
                                     @change="(eventPayload) => onFilterChange(eventPayload, 'ring_groups')">
                </ring-group-selector>
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>

        <div v-if="$route.params.channel && !['mentions', 'inbox'].includes($route.params.channel)">
          <h5 class="mt-4 section-header">Handling</h5>
          <b-form-row class="mt-2">
            <b-col sm="12"
                   md="6">
              <b-form-group class="form-label"
                            label="Direction">
                <communication-direction-selector v-model="filter.direction"
                                                  custom-class="bottom-border__none highlighted-primary padding-left__none q-select-auto-width"
                                                  :highlighted="isChanged('direction')"
                                                  :use-input="false"
                                                  @select="(eventPayload) => onFilterChange(eventPayload, 'direction')">
                </communication-direction-selector>
              </b-form-group>
            </b-col>
            <b-col v-if="['calls', 'messages'].includes($route.params.channel)"
                   sm="12"
                   md="6">
              <b-form-group class="form-label"
                            label="Answer Status">
                <answer-status-selector v-model="filter.answer_status"
                                        custom-class="bottom-border__none highlighted-primary padding-left__none q-select-auto-width"
                                        :highlighted="isChanged('answer_status')"
                                        :use-input="false"
                                        @select="(eventPayload) => onFilterChange(eventPayload, 'answer_status')">
                </answer-status-selector>
              </b-form-group>
            </b-col>
            <b-col v-if="['calls', 'recordings'].includes($route.params.channel)"
                   sm="12"
                   md="6">
              <b-form-group class="form-label"
                            label="Talk Time">
                <talk-time-selector v-model="filter.min_talk_time"
                                    custom-class="bottom-border__none highlighted-primary padding-left__none q-select-auto-width"
                                    :highlighted="isChanged('min_talk_time')"
                                    :use-input="false"
                                    @select="(eventPayload) => onFilterChange(eventPayload, 'min_talk_time')">
                </talk-time-selector>
              </b-form-group>
            </b-col>
            <b-col v-if="['calls', 'recordings'].includes($route.params.channel)"
                   sm="12"
                   md="6">
              <b-form-group class="form-label"
                            label="Transfer Type">
                <transfer-type-selector v-model="filter.transfer_type"
                                        custom-class="bottom-border__none highlighted-primary padding-left__none q-select-auto-width"
                                        :highlighted="isChanged('transfer_type')"
                                        :use-input="false"
                                        @select="(eventPayload) => onFilterChange(eventPayload, 'transfer_type')">
                </transfer-type-selector>
              </b-form-group>
            </b-col>
            <b-col v-if="['calls', 'recordings'].includes($route.params.channel)"
                   sm="12"
                   md="6">
              <b-form-group
                class="form-label"
                label="Callback Status"
              >
                <callback-status-selector v-model="filter.callback_status"
                                          custom-class="bottom-border__none highlighted-primary padding-left__none q-select-auto-width"
                                          :clearable="true"
                                          :highlighted="isChanged('callback_status')"
                                          :use-input="false"
                                          @select="(eventPayload) => onFilterChange(eventPayload, 'callback_status')">
                </callback-status-selector>
              </b-form-group>
            </b-col>
          </b-form-row>
        </div>

        <div v-if="$route.params.channel && !['mentions', 'inbox'].includes($route.params.channel)">
          <h5 class="mt-4 section-header">Properties</h5>
          <b-form-row class="mt-2">
            <b-col md="6"
                   sm="12">
              <b-form-group class="form-label"
                            label="Tags">
                <tag-selector ref="tagSelector"
                              v-model="filter.tags"
                              :multiple="true"
                              :highlighted="isChanged('tags')"
                              @change="(eventPayload) => onFilterChange(eventPayload, 'tags')">
                </tag-selector>
              </b-form-group>
            </b-col>
            <b-col v-if="['calls', 'recordings'].includes($route.params.channel)"
                   md="6"
                   sm="12">
              <b-form-group class="form-label"
                            label="Call Disposition">
                <call-disposition-selector v-model="filter.call_dispositions"
                                           :multiple="true"
                                           :highlighted="isChanged('call_dispositions')"
                                           @change="(eventPayload) => onFilterChange(eventPayload, 'call_dispositions')">
                </call-disposition-selector>
              </b-form-group>
            </b-col>
          </b-form-row>
          <b-form-row>
            <b-col md="6"
                   sm="12">
              <b-form-group>
                <span class="form-label">Show Only First Time Communications</span>
                <div>
                  <b-form-checkbox switch
                                   class="cursor-pointer switch-success"
                                   size="lg"
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
                  <b-form-checkbox switch
                                   class="switch-success"
                                   size="lg"
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
                  <b-form-checkbox switch
                                   class="switch-success"
                                   size="lg"
                                   :value="1"
                                   :unchecked-value="0"
                                   v-model="filter.exclude_automated_communications">
                  </b-form-checkbox>
                </div>
              </b-form-group>
            </b-col>

          </b-form-row>
        </div>

        <div>
          <h5 class="mt-4 section-header">Attribution</h5>
          <b-form-row class="mt-2">
            <b-col sm="12"
                   md="6"
                   v-if="!['mentions', 'inbox'].includes($route.params.channel) && $route.name !== 'Inbox'">
              <b-form-group class="form-label"
                            label="Phone Numbers">
                <incoming-number-selector v-model="filter.incoming_numbers"
                                          :multiple="true"
                                          :use-chips="true"
                                          :highlighted="isChanged('incoming_numbers')"
                                          @change="(eventPayload) => onFilterChange(eventPayload, 'incoming_numbers')">
                </incoming-number-selector>
              </b-form-group>
            </b-col>
            <b-col v-if="['calls', 'recordings', 'messages', 'mentions'].includes($route.params.channel)"
                   sm="12"
                   md="6">
              <b-form-group class="form-label"
                            label="Communication Owners">
                <div class="comm-owner-filter-tooltip-wrapper">
                  <information-circle-icon color="#2F80ED">
                  </information-circle-icon>
                  <q-tooltip  anchor="top middle"
                              self="center middle">
                    <p class="font-weight-bold">Who is the communication owner?</p>
                    <p class="font-weight-bold mb-0">For outbound communication:</p>
                    <p class="mb-0">Calls, SMS, fax & emails:</p>
                    <p><ul><li>The agent that sent the communication</li></ul></p>

                    <p class="font-weight-bold mb-0">For inbound communication:</p>
                    <p class="mb-0">Calls:</p>
                    <p><ul><li>The agent that answered the call</li></ul></p>

                    <p class="mb-0">SMS, fax & email:</p>
                    <p><ul><li>The most recently assigned contact owner owns all of these inbound communications</li></ul></p>
                  </q-tooltip>
                </div>
                <user-selector v-model="filter.users"
                               :generic-styling="false"
                               :multiple="true"
                               :use-chips="true"
                               :highlighted="isChanged('users')"
                               @change="(eventPayload) => onFilterChange(eventPayload, 'users')">
                </user-selector>
              </b-form-group>
            </b-col>
            <b-col  sm="12"
                    md="6"
                    v-if="!['mentions', 'inbox'].includes($route.params.channel) && $route.name !== 'Inbox'">
              <b-form-group class="form-label"
                            label="Sequences">
                <sequence-selector v-model="filter.workflows"
                                   :multiple="true"
                                   :generic-styling="false"
                                   :use-chips="true"
                                   :highlighted="isChanged('workflows')"
                                   @change="(eventPayload) => onFilterChange(eventPayload, 'workflows')">
                </sequence-selector>
              </b-form-group>
            </b-col>
            <b-col v-if="!['voicemails'].includes($route.params.channel)"
                   sm="12"
                   md="6">
              <b-form-group class="form-label"
                            label="Contact Owner">
                <user-selector v-model="filter.owner_id"
                               :generic-styling="false"
                               :multiple="true"
                               :use-chips="true"
                               :highlighted="isChanged('owner_id')"
                               :clearable="false"
                               :disable="disableContactOwner"
                               custom-placeholder="Contact owner"
                               @change="(eventPayload) => onFilterChange(eventPayload, 'owner_id')">
                </user-selector>
              </b-form-group>
            </b-col>
            <b-col v-if="['messages'].includes($route.params.channel)"
                   sm="12"
                   md="6">
              <b-form-group class="form-label"
                            label="Broadcasts">
                <broadcast-selector v-model="filter.broadcasts"
                                    :multiple="true"
                                    :generic-styling="false"
                                    :use-chips="true"
                                    :highlighted="isChanged('broadcasts')"
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
import { mapActions, mapState } from 'vuex'

import DateRangePicker from 'vue2-daterange-picker'
import 'vue2-daterange-picker/dist/vue2-daterange-picker.css'
import InformationCircleIcon from 'components/icons/information-circle-icon'

export default {
  name: 'filter-form',

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
    DateRangePicker
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
    ...mapState('inbox', ['channelChangedFilterFields']),
    ...mapState('auth', ['profile']),
    dateRangeLabel () {
      return ['Inbox Channel Task Status', 'Inbox'].includes(this.$route.name) ? 'Last Engagement Date' : 'Time'
    },
    dateHasChanges () {
      return this.filter.from_date !== this.defaultFilterModel.filter.from_date || this.filter.to_date !== this.defaultFilterModel.filter.to_date
    }
  },

  data () {
    return {
      startDate: new Date(),
      endDate: new Date(),
      disableContactOwner: false,
      date_range: {
        startDate: null, // window.moment('2015-01-01')._d,
        endDate: null // window.moment()._d
      },
      opens: 'right',
      ranges: {
        'All Time': [null, null]
      }
    }
  },

  filters: {
    date (date) {
      return window.moment(date).format('MM/DD/YYYY')
    }
  },

  methods: {
    ...mapActions('inbox', ['updateChannelChangedFilterFields']),
    onFilterChange (value, prop) {
      this.filter[prop] = value
    },
    isChanged (property) {
      return JSON.stringify(this.filter[property]) !== JSON.stringify(this.defaultFilterModel.filter[property])
    },
    getDateRangeInputLabel (data) {
      if (data.startDate && data.endDate) {
        return this.$options.filters.date(data.startDate) + ' - ' + this.$options.filters.date(data.endDate)
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
        this.date_range.startDate = value[0]
        this.date_range.endDate = value[1]
      })
  },

  watch: {
    date_range: {
      deep: true,
      handler () {
        this.filter.from_date = this.date_range.startDate ? window.moment(this.date_range.startDate).format('YYYY-MM-DD') : null
        this.filter.to_date = this.date_range.endDate ? window.moment(this.date_range.endDate).format('YYYY-MM-DD') : null
      }
    },

    'filter.my_contact': {
      deep: true,
      handler (value) {
        if (value) {
          this.filter.owner_id = []
        }

        this.disableContactOwner = value
      }
    }
  }
}
</script>
