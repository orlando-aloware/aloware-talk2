<template>
  <div>
    <b-form class="inbox-channel-filter-form">
      <b-container>
        <div v-if="$route.name === 'Inbox' || !['mentions'].includes($route.params.channel)">
          <h5 class="section-header">Quick Access</h5>
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
                                   :value="true"
                                   :unchecked-value="false"
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
                                   :value="true"
                                   :unchecked-value="false"
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
                                   :value="true"
                                   :unchecked-value="false"
                                   v-model="filter.exclude_automated_communications">
                  </b-form-checkbox>
                </div>
              </b-form-group>
            </b-col>

          </b-form-row>
        </div>

        <div v-if="$route.params.channel && !['inbox'].includes($route.params.channel)">
          <h5 class="mt-4 section-header">Attribution</h5>
          <b-form-row class="mt-2">
            <b-col sm="12"
                   md="6"
                   v-if="!['mentions', 'inbox'].includes($route.params.channel)">
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
                    md="6"
                    v-if="!['mentions'].includes($route.params.channel)">
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
    },
    defaultFilterModel: {
      type: Object,
      required: true
    }
  },

  methods: {
    ...mapActions('inbox', ['updateChannelChangedFilterFields']),
    onFilterChange (value, prop) {
      this.filter[prop] = value
    },
    isChanged (property) {
      return JSON.stringify(this.filter[property]) !== JSON.stringify(this.defaultFilterModel.filter[property])
    }
  }
}
</script>
