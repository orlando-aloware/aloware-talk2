<template>
  <div>
    <b-form>
      <b-container>
        <h5>Quick Access</h5>
        <b-form-row class="mt-2">
          <b-col>
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
          <b-col>
            <b-form-group
              id="input-group-1"
              label="Ring Groups"
              label-for="input-1"
            >
              <ring-group-selector :multiple="true" @change="(eventPayload) => onFilterChange(eventPayload, 'ring_groups')">
              </ring-group-selector>
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
              label="Sequences"
              label-for="input-1"
            >
              <sequence-selector :multiple="true"
                                 :generic-styling="false"
                                 :use-chips="true"
                                 @change="(eventPayload) => onFilterChange(eventPayload, 'workflows')"></sequence-selector>
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
import CommunicationDirectionSelector from 'components/generic-selectors/communication-direction-selector'
import TagSelector from 'components/generic-selectors/tag-selector'
import PhoneNumberSelector from 'components/generic-selectors/phone-number-selector'
import SequenceSelector from 'components/generic-selectors/sequence-selector'
export default {
  name: 'filter-calls',

  components: {
    SequenceSelector,
    PhoneNumberSelector,
    CommunicationDirectionSelector,
    LineSelector,
    RingGroupSelector,
    TagSelector
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
