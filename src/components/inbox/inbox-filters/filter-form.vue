<template>
  <div>
    <b-form class="inbox-channel-filter-form">
      <b-container>
        <h5 class="mb-4 section-header">Quick Access</h5>
        <b-form-row class="mt-2">
          <b-col sm="12" md="6">
            <b-form-group
              label="Lines"
              class="form-label"
            >
              <line-selector :multiple="true"
                             :use-chips="true"
                             :generic-styling="false"
                             :generic-multiselect="false"
                             :highlighted="isChanged('campaigns')"
                             v-model="filter.campaigns"
                             @change="(eventPayload) => onFilterChange(eventPayload, 'campaigns')">
              </line-selector>
            </b-form-group>
          </b-col>
          <b-col v-if="['calls', 'recordings', 'voicemails'].includes($route.params.channel)"
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

        <h5 class="mt-4 section-header">Handling</h5>
        <b-form-row class="mt-2">
          <b-col sm="12"
                 md="6">
            <b-form-group class="form-label"
                          label="Direction">
              <communication-direction-selector v-model="filter.direction"
                                                :highlighted="isChanged('direction')"
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
                                      :highlighted="isChanged('answer_status')"
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
                                  :highlighted="isChanged('min_talk_time')"
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
                                      :highlighted="isChanged('transfer_type')"
                                      @select="(eventPayload) => onFilterChange(eventPayload, 'transfer_type')">
              </transfer-type-selector>
            </b-form-group>
          </b-col>

          <b-col v-if="['calls', 'recordings'].includes($route.params.channel)" sm="12" md="6">
            <b-form-group
              class="form-label"
              label="Callback Status"
            >
              <callback-status-selector v-model="filter.callback_status"
                                        :clearable="true"
                                        :highlighted="isChanged('callback_status')"
                                        @select="(eventPayload) => onFilterChange(eventPayload, 'callback_status')">
              </callback-status-selector>
            </b-form-group>
          </b-col>
        </b-form-row>

        <h5 class="mt-4 section-header">Properties</h5>
        <b-form-row class="mt-2">
          <b-col md="6"
                 sm="12">
            <b-form-group class="form-label"
                          label="Tags">
              <tag-selector :multiple="true"
                            v-model="filter.tags"
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
          <b-col md="3"
                 sm="12">
            <b-form-group>
              <span class="form-label">Show Only First Time Communications</span>
              <div>
                <q-toggle color="green"
                          v-model="filter.first_time_only"
                          :true-value="1"
                          :false-value="0"/>
              </div>
            </b-form-group>
          </b-col>

          <b-col md="3"
                 sm="12">
            <b-form-group>
              <span class="form-label">Show Only Untagged Communications</span>
              <div>
                <q-toggle color="green"
                          v-model="filter.untagged_only"
                          :true-value="1"
                          :false-value="0" />
              </div>
            </b-form-group>
          </b-col>

          <b-col md="3"
                 sm="12">
            <b-form-group>
              <span class="form-label">Exclude Communications Sent From Sequences</span>
              <div>
                <q-toggle color="green"
                          v-model="filter.exclude_automated_communications"
                          :true-value="1"
                          :false-value="0" />
              </div>
            </b-form-group>
          </b-col>

        </b-form-row>

        <h5 class="mt-4 section-header">Attribution</h5>
        <b-form-row class="mt-2">
          <b-col sm="12"
                 md="6">
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
          <b-col v-if="['calls', 'recordings', 'messages'].includes($route.params.channel)"
                 sm="12"
                 md="6">
            <b-form-group class="form-label"
                          label="Users">
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
                  md="6">
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
export default {
  name: 'filter-form',

  components: {
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
    BroadcastSelector
  },

  computed: {
    ...mapState('inbox', ['channelChangedFilterFields'])
  },

  props: {
    filter: {
      type: Object,
      required: true
    }
  },

  methods: {
    ...mapActions('inbox', ['updateChannelChangedFilterFields']),
    onFilterChange (value, prop) {
      this.filter[prop] = value
      this.updateChannelChangedFilterFields({
        name: prop,
        value: value
      })
    },
    isChanged (property) {
      let item = this.channelChangedFilterFields.find(item => item.property === property)

      return !!item
    }
  },
  watch: {
    'filter.first_time_only': function (value) {
      this.updateChannelChangedFilterFields({
        name: 'first_time_only',
        value: value
      })
    },
    'filter.untagged_only': function (value) {
      this.updateChannelChangedFilterFields({
        name: 'untagged_only',
        value: value
      })
    },
    'filter.exclude_automated_communications': function (value) {
      this.updateChannelChangedFilterFields({
        name: 'exclude_automated_communications',
        value: value
      })
    }
  }
}
</script>
