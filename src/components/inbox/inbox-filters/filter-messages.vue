<template>
  <div>
    <b-form>
      <b-container>
        <h5>Quick Access</h5>
        <b-form-row class="mt-2">
          <b-col sm="12" md="6">
            <b-form-group
              id="input-group-1"
              label="Lines"
              label-for="input-1"
            >
              <line-selector :multiple="true"
                             :use-chips="true"
                             :generic-styling="false"
                             v-model="filter.campaigns"
                             @change="(eventPayload) => onFilterChange(eventPayload, 'campaigns')">
              </line-selector>
            </b-form-group>
          </b-col>
        </b-form-row>

        <h5>Handling</h5>
        <b-form-row class="mt-2">
          <b-col sm="12" md="6">
            <b-form-group label="Direction">
              <communication-direction-selector v-model="filter.direction"
                                                @select="(eventPayload) => onFilterChange(eventPayload, 'direction')">
              </communication-direction-selector>
            </b-form-group>
          </b-col>
          <b-col sm="12" md="6">
            <b-form-group
              id="input-group-1"
              label="Answer Status"
              label-for="input-1"
            >
              <answer-status-selector v-model="filter.answer_status"
                                      @select="(eventPayload) => onFilterChange(eventPayload, 'answer_status')">
              </answer-status-selector>
            </b-form-group>
          </b-col>
          <b-col v-if="['calls', 'recordings', 'messages'].includes($route.params.channel)" sm="12" md="6">
            <b-form-group
              id="input-group-1"
              label="Callback Status"
              label-for="input-1"
            >
              <callback-status-selector v-model="filter.callback_status"
                                        :clearable="true"
                                        @select="(eventPayload) => onFilterChange(eventPayload, 'callback_status')">
              </callback-status-selector>
            </b-form-group>
          </b-col>
        </b-form-row>

        <h5>Properties</h5>
        <b-form-row class="mt-2">
          <b-col md="6" sm="12">
            <b-form-group
              id="input-group-1"
              label="Tags"
              label-for="input-1"
            >
              <tag-selector :multiple="true"
                            v-model="filter.tags"
                            @change="(eventPayload) => onFilterChange(eventPayload, 'tags')">
              </tag-selector>
            </b-form-group>
          </b-col>
        </b-form-row>
        <b-form-row>
          <b-col md="3" sm="12">
            <b-form-group>
              Show Only First Time Communications
              <div>
                <q-toggle color="green"
                          v-model="filter.first_time_only"
                          :true-value="1"
                          :false-value="0" />
              </div>
            </b-form-group>
          </b-col>

          <b-col md="3" sm="12">
            <b-form-group>
              Show Only Untagged Communications
              <div>
                <q-toggle color="green"
                          v-model="filter.untagged_only"
                          :true-value="1"
                          :false-value="0" />
              </div>
            </b-form-group>
          </b-col>

          <b-col md="3" sm="12">
            <b-form-group>
              Exclude Communications Sent From Sequences
              <div>
                <q-toggle color="green"
                          v-model="filter.exclude_automated_communications"
                          :true-value="1"
                          :false-value="0" />
              </div>
            </b-form-group>
          </b-col>

        </b-form-row>

        <h5>Attribution</h5>
        <b-form-row class="mt-2">
          <b-col sm="12" md="6">
            <b-form-group
              id="input-group-1"
              label="Phone Numbers"
              label-for="input-1"
            >
              <phone-number-selector :multiple="true"
                                     :use-chips="true"
                                     @change="(eventPayload) => onFilterChange(eventPayload, 'incoming_numbers')">
              </phone-number-selector>
            </b-form-group>
          </b-col>
          <b-col sm="12" md="6">
            <b-form-group
              id="input-group-1"
              label="Users"
              label-for="input-1"
            >
              <user-selector :generic-styling="false"
                             :multiple="true"
                             :use-chips="true">
              </user-selector>
            </b-form-group>
          </b-col>
          <b-col sm="12" md="6">
            <b-form-group
              id="input-group-1"
              label="Sequences"
              label-for="input-1"
            >
              <sequence-selector :multiple="true"
                                 :generic-styling="false"
                                 :use-chips="true"
                                 @change="(eventPayload) => onFilterChange(eventPayload, 'workflows')"></sequence-selector>
            </b-form-group>
          </b-col>
          <b-col sm="12" md="6">
            <b-form-group
              id="input-group-1"
              label="Broadcasts"
              label-for="input-1"
            >
              <broadcast-selector  :multiple="true"
                                 :generic-styling="false"
                                 :use-chips="true"
                                 @change="(eventPayload) => onFilterChange(eventPayload, 'broadcasts')"></broadcast-selector>
            </b-form-group>
          </b-col>
        </b-form-row>
      </b-container>
    </b-form>
  </div>
</template>

<script>
import LineSelector from 'components/generic-selectors/line-selector'
import AnswerStatusSelector from 'components/generic-selectors/answer-status-selector'
import CommunicationDirectionSelector from 'components/generic-selectors/communication-direction-selector'
import TagSelector from 'components/generic-selectors/tag-selector'
import UserSelector from 'components/generic-selectors/user-selector'
import PhoneNumberSelector from 'components/generic-selectors/phone-number-selector'
import SequenceSelector from 'components/generic-selectors/sequence-selector'
import CallbackStatusSelector from 'components/generic-selectors/callback-status-selector'
import BroadcastSelector from 'components/generic-selectors/broadcast-selector'
export default {
  name: 'filter-calls',

  components: {
    BroadcastSelector,
    SequenceSelector,
    PhoneNumberSelector,
    UserSelector,
    CommunicationDirectionSelector,
    AnswerStatusSelector,

    LineSelector,
    TagSelector,
    CallbackStatusSelector
  },

  props: {
    filter: {
      type: Object,
      required: true
    }
  },

  data () {
    return {

    }
  },

  methods: {
    onFilterChange (value, prop) {
      this.filter[prop] = value
    }
  }
}
</script>
