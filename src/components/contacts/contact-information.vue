<template>
  <b-card class="border-0 position-relative contact-about-wrapper">
    <h4 v-if="hasExpanded">About this contact</h4>

    <div :class="`information-container ${autoHeightClass}`">
      <div class="w-100 mt-2"
           v-if="hasPermissionTo('list user')">
        <p class="text-muted custom-input-label mb-0">Owner</p>
        <user-selector custom-class="inline-select"
                       :disable="!hasPermissionTo('change contact ownership')"
                       :generic-styling="false"
                       :multiple="false"
                       :use-chips="false"
                       :outlined="false"
                       :show-placeholder="false"
                       v-model="contact.user_id"
                       @change="(eventPayload) => onUpdateFields(eventPayload, 'user_id')">
        </user-selector>
      </div>

      <div class="w-100"
           v-if="hasPermissionTo('list disposition status')">
        <p class="text-muted custom-input-label mb-0">Contact Disposition</p>
        <contact-disposition-selector custom-class="inline-select"
                                      :disable="!hasPermissionTo('dispose contact')"
                                      :generic-styling="false"
                                      :multiple="false"
                                      :use-chips="false"
                                      :outlined="false"
                                      :show-placeholder="false"
                                      :emit-value="true"
                                      v-model="contact.disposition_status_id"
                                      @change="(eventPayload) => onUpdateFields(eventPayload, 'disposition_status_id')">
        </contact-disposition-selector>
      </div>

      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">Email</p>
        <contact-input-field :disabled="!hasPermissionTo('update contact')"
                             v-model="contact.email"
                             @updateField="(eventPayload) => onUpdateFields(eventPayload, 'email')">
        </contact-input-field>
      </div>

      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">Address</p>
        <contact-input-field :disabled="!hasPermissionTo('update contact')"
                             v-model="contact.address"
                             @updateField="(eventPayload) => onUpdateFields(eventPayload, 'address')">
        </contact-input-field>
      </div>

      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">Company</p>
        <contact-input-field :disabled="!hasPermissionTo('update contact')"
                             v-model="contact.company_name"
                             @updateField="(eventPayload) => onUpdateFields(eventPayload, 'company_name')">
        </contact-input-field>
      </div>

      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">Website</p>
        <contact-input-field :disabled="!hasPermissionTo('update contact')"
                             v-model="contact.website"
                             @updateField="(eventPayload) => onUpdateFields(eventPayload, 'website')">
        </contact-input-field>
      </div>

      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">City</p>
        <contact-input-field :disabled="!hasPermissionTo('update contact')"
                             v-model="contact.cnam_city"
                             @updateField="(eventPayload) => onUpdateFields(eventPayload, 'cnam_city')">
        </contact-input-field>
      </div>

      <div class="w-100"
           v-if="contact.cnam_country && ['US', 'CA'].includes(contact.cnam_country)">
        <p class="text-muted custom-input-label mb-0">State</p>
        <location-state-selector :contact="contact"
                                 :disabled="!hasPermissionTo('update contact')"
                                 v-model="contact.cnam_state"
                                 @select="(eventPayload) => onUpdateFields(eventPayload, 'cnam_state')">
        </location-state-selector>
      </div>

      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">Country</p>
        <location-country-selector :contact="contact"
                                   :disabled="!hasPermissionTo('update contact')"
                                   v-model="contact.cnam_country"
                                   @select="(eventPayload) => onUpdateFields(eventPayload, 'cnam_country')">
        </location-country-selector>
      </div>

      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">Zip Code</p>
        <contact-input-field :disabled="!hasPermissionTo('update contact')"
                             v-model="contact.cnam_zipcode"
                             @updateField="(eventPayload) => onUpdateFields(eventPayload, 'cnam_zipcode')">
        </contact-input-field>
      </div>

      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">Timezone</p>
        <q-timezone-selector :disabled="!isAdmin"
                             v-model="contact.timezone"
                             @select="(eventPayload) => onUpdateFields(eventPayload, 'timezone')">
        </q-timezone-selector>
      </div>

      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">Date of Birth</p>
        <date-picker-selector wrapperClass="date-of-birth-field"
                              contentClass="inline-input contact-info-editable"
                              popoverClass="contact-info-popover"
                              popoverId="popover-date-picker-sync"
                              :canEdit="hasPermissionTo('update contact')"
                              v-model="contact.date_of_birth"
                              @change="(eventPayload) => onUpdateFields(eventPayload, 'date_of_birth')">
        </date-picker-selector>
      </div>

      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">Lead Source</p>
        <lead-source-selector specificClass="inline-select"
                              useInput
                              clearable
                              borderless
                              :genericStyling="false"
                              :outlined="false"
                              :disabled="!hasPermissionTo('update contact')"
                              v-model="contact.lead_source"
                              @change="(eventPayload) => onUpdateFields(eventPayload, 'lead_source')">
        </lead-source-selector>
      </div>

      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">Initial Line</p>
        <line-selector specificClass="inline-select"
                       :genericMultiselect="false"
                       :genericStyling="false"
                       :useInput="true"
                       :clearable="true"
                       :borderless="true"
                       :outlined="false"
                       v-model="contact.initial_campaign_id"
                       @change="(eventPayload) => onUpdateFields(eventPayload, 'initial_campaign_id')">
        </line-selector>
      </div>

      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">Custom Field 1</p>
        <contact-input-field :disabled="!hasPermissionTo('update contact')"
                             v-model="contact.csf1"
                             @updateField="(eventPayload) => onUpdateFields(eventPayload, 'csf1')">
        </contact-input-field>
      </div>
      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">Custom Field 2</p>
        <contact-input-field :disabled="!hasPermissionTo('update contact')"
                             v-model="contact.csf2"
                             @updateField="(eventPayload) => onUpdateFields(eventPayload, 'csf2')">
        </contact-input-field>
      </div>
      <contact-attributes :contact="contact"
                          v-if="contact.id"/>

      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">TCPA Approved</p>
        <p>{{ contact.text_authorized | fixBooleanType }}</p>
      </div>

      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">Created At</p>
        <p>{{ contact.created_at | fixFullDateUTCRelative }}</p>
      </div>

      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">Time of First Outbound Call</p>
        <p>{{ timeOfFirstOutboundCall }}</p>
      </div>

      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">Time to First Outbound Call</p>
        <p>{{ timeToFirstOutboundCall }}</p>
      </div>

      <div class="w-100">
        <p class="text-muted custom-input-label mb-0">Intake Source</p>
        <p>{{ contact.intake_source | toUpperCase }}</p>
      </div>
    </div>

    <b-button class="contact-information-toggle"
              variant="light"
              size="sm"
              pill
              v-if="hasExpanded"
              @click="onExpanded">
      <i class="material-icons icon">{{ expanded ? 'expand_less' : 'expand_more' }}</i>
    </b-button>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'
import talk2Api from 'src/plugins/api/api'
import LocationStateSelector from 'src/components/contacts/location-state-selector'
import LocationCountrySelector from 'src/components/contacts/location-country-selector'
import ContactInputField from 'src/components/contacts/contact-input-field'
import UserSelector from 'components/generic-selectors/user-selector'
import ContactDispositionSelector from 'components/generic-selectors/contact-disposition-selector'
import QTimezoneSelector from 'components/contacts/q-timezone-selector'
import DatePickerSelector from 'components/generic-selectors/date-picker-selector'
import LineSelector from 'components/generic-selectors/line-selector'
import ContactAttributes from 'components/contacts/contact-attributes/contact-attributes'
import LeadSourceSelector from 'components/generic-selectors/lead-source-selector.vue'

export default {
  name: 'contact-information',

  mixins: [aclMixin],

  props: {
    firstOutboundCall: {},

    hasExpanded: {
      type: Boolean,
      default: true
    }
  },

  components: {
    ContactAttributes,
    DatePickerSelector,
    QTimezoneSelector,
    ContactDispositionSelector,
    UserSelector,
    ContactInputField,
    LocationCountrySelector,
    LocationStateSelector,
    LineSelector,
    LeadSourceSelector
  },

  computed: {
    ...mapGetters('contacts', ['contact', 'contactAttributes']),

    autoHeightClass () {
      return this.expanded ? 'auto-height' : 'overflow-hidden'
    },

    timeOfFirstOutboundCall () {
      if (this.firstOutboundCall) {
        return this.$options.filters.fixFullDateUTCRelative(this.firstOutboundCall.created_at)
      }

      return '--:--'
    },

    timeToFirstOutboundCall () {
      if (this.contact && this.firstOutboundCall) {
        const formatted = this.formatHumanized(window.moment(this.firstOutboundCall.created_at).diff(window.moment(this.contact.created_at)))
        return !formatted ? '--:--' : `After ${formatted}`
      }

      return '--:--'
    },

    expanded () {
      if (this.hasExpanded) {
        return this.isExpanded
      }

      return true
    }
  },

  data () {
    return {
      isExpanded: false,
      attributes: []
    }
  },

  methods: {
    ...mapActions('contacts', ['setContactAttributes', 'setContact', 'updateChangedContactProperties']),

    onExpanded () {
      this.isExpanded = !this.isExpanded
    },

    getAttributes () {
      talk2Api.V1.contact.getAttributes(this.contact.id)
        .then(response => {
          this.setContactAttributes(response.data)
        })
    },

    onUpdateFields (value, prop) {
      this.contact[prop] = value
      this.updateChangedContactProperties({
        name: prop,
        value: value
      })
    },

    /**
     * Formats provided period(moment.diff) into human readable format
     *
     * @param period
     *
     * @return string
     */
    formatHumanized (period) {
      if (period === 0) {
        return '0 second'
      }

      const segments = []
      const duration = window.moment.duration(period)

      // return nothing when the duration is falsy or not correctly parsed (P0D)
      if (duration.toISOString() === 'P0D' || !duration.isValid()) {
        return ''
      }

      // for duration's year value
      if (duration.years() >= 1) {
        segments.push(this.computeAndHumanize(duration, 'years', 'year'))
      }

      // for duration's month value
      if (duration.months() >= 1) {
        segments.push(this.computeAndHumanize(duration, 'months', 'month'))
      }

      // for duration's days value
      if (duration.days() >= 1) {
        segments.push(this.computeAndHumanize(duration, 'days', 'day'))
      }

      // for duration's hours value
      if (duration.hours() >= 1) {
        segments.push(this.computeAndHumanize(duration, 'hours', 'hour'))
      }

      // for duration's minutes value
      if (duration.minutes() >= 1) {
        segments.push(this.computeAndHumanize(duration, 'minutes', 'minute'))
      }

      // for duration's seconds value, this will only pass if segments is empty
      if (duration.seconds() >= 1 && !segments.length) {
        segments.push(this.computeAndHumanize(duration, 'seconds', 'second'))
      }

      // sanity test, if there are items added to the segment
      if (!segments.length) {
        return ''
      }

      // do formatting
      // eslint-disable-next-line no-return-assign
      return segments.reduce((acc, cur, index) => acc += acc ? `${index === segments.length - 1 ? ' and' : ','} ${cur}` : cur, '')
    },

    /**
     * Converts the duration value and humanize result
     *
     * @param duration
     * @param field
     * @param singular
     *
     * @return string
     */
    computeAndHumanize (duration, field, singular) {
      const temp = Math.floor(duration[field]())

      return `${temp} ${temp > 1 ? field : singular}`
    }
  }
}
</script>
