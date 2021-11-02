<template>
  <b-card class="border-0 position-relative contact-about-wrapper">
    <h4 v-if="isContactType">About this contact</h4>

    <div :class="`information-container ${autoHeightClass}`">
      <div class="d-block mt-2"
           v-if="hasPermissionTo('list user')">
        <p class="text-muted custom-input-label mb-0">Owner</p>
        <user-selector v-model="resources.user_id"
                       :disable="!hasPermissionTo('change contact ownership')"
                       :generic-styling="false"
                       :multiple="false"
                       :use-chips="false"
                       :outlined="false"
                       :show-placeholder="false"
                       custom-class="inline-select"
                       @change="(eventPayload) => onUpdateFields(eventPayload, 'user_id')">
        </user-selector>
      </div>

      <div class="d-block"
           v-if="hasPermissionTo('list disposition status')">
        <p class="text-muted custom-input-label mb-0">Contact Disposition</p>
        <contact-disposition-selector :disable="!hasPermissionTo('dispose contact')"
                                      :generic-styling="false"
                                      :multiple="false"
                                      :use-chips="false"
                                      :outlined="false"
                                      :show-placeholder="false"
                                      custom-class="inline-select"
                                      v-model="resources.disposition_status_id"
                                      @change="(eventPayload) => onUpdateFields(eventPayload, 'disposition_status_id')">
        </contact-disposition-selector>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Email</p>
        <contact-input-field v-model="resources.email"
                             :disabled="!hasPermissionTo('update contact')"
                             @updateField="(eventPayload) => onUpdateFields(eventPayload, 'email')">
        </contact-input-field>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Company</p>
        <contact-input-field v-model="resources.company_name"
                             :disabled="!hasPermissionTo('update contact')"
                             @updateField="(eventPayload) => onUpdateFields(eventPayload, 'company_name')">
        </contact-input-field>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Website</p>
        <contact-input-field v-model="resources.website"
                             :disabled="!hasPermissionTo('update contact')"
                             @updateField="(eventPayload) => onUpdateFields(eventPayload, 'website')">
        </contact-input-field>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">City</p>
        <contact-input-field v-model="resources.cnam_city"
                             :disabled="!hasPermissionTo('update contact')"
                             @updateField="(eventPayload) => onUpdateFields(eventPayload, 'cnam_city')">
        </contact-input-field>
      </div>

      <div class="d-block" v-if="resources.cnam_country && ['US', 'CA'].includes(resources.cnam_country)">
        <p class="text-muted custom-input-label mb-0">State</p>
        <location-state-selector v-model="resources.cnam_state"
                                 :contact="contact"
                                 :disabled="!hasPermissionTo('update contact')"
                                 @select="(eventPayload) => onUpdateFields(eventPayload, 'cnam_state')">
        </location-state-selector>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Country</p>
        <location-country-selector v-model="resources.cnam_country"
                                   :contact="contact"
                                   :disabled="!hasPermissionTo('update contact')"
                                   @select="(eventPayload) => onUpdateFields(eventPayload, 'cnam_country')">
        </location-country-selector>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Zip Code</p>
        <contact-input-field v-model="resources.cnam_zipcode"
                             :disabled="!hasPermissionTo('update contact')"
                             @updateField="(eventPayload) => onUpdateFields(eventPayload, 'cnam_zipcode')">
        </contact-input-field>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">TCPA Approved</p>
        <p>{{ resources.text_authorized | fixBooleanType }}</p>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Created At</p>
        <p>{{ resources.created_at | fixFullDateUTCRelative }}</p>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Time of First Outbound Call</p>
        <p>{{ timeOfFirstOutboundCall }}</p>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Time to First Outbound Call</p>
        <p>{{ timeToFirstOutboundCall }}</p>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Intake Source</p>
        <p>{{ resources.intake_source | toUpperCase }}</p>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Custom Field 1</p>
        <contact-input-field v-model="resources.csf1"
                             :disabled="!hasPermissionTo('update contact')"
                             @updateField="(eventPayload) => onUpdateFields(eventPayload, 'csf1')">
        </contact-input-field>
      </div>
      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Custom Field 2</p>
        <contact-input-field v-model="resources.csf2"
                             :disabled="!hasPermissionTo('update contact')"
                             @updateField="(eventPayload) => onUpdateFields(eventPayload, 'csf2')">
        </contact-input-field>
      </div>
    </div>
    <b-button pill
              variant="light"
              size="sm"
              class="contact-information-toggle"
              v-if="isContactType"
              @click="onExpanded">
      <i class="material-icons">{{ isExpanded ? 'expand_less' : 'expand_more' }}</i>
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

export default {
  name: 'contact-information',

  mixins: [aclMixin],

  props: {
    firstOutboundCall: {},
    isContactType: {
      type: Boolean,
      default: true
    }
  },

  components: {
    ContactDispositionSelector,
    UserSelector,
    ContactInputField,
    LocationCountrySelector,
    LocationStateSelector
  },

  computed: {
    ...mapGetters('contacts', {
      contact: 'contact',
      contactAttributes: 'contactAttributes'
    }),
    ...mapGetters('powerDialer', {
      pdContact: 'contact',
      pdContactAttributes: 'contactAttributes'
    }),

    resources () {
      if (this.isContactType) {
        return this.contact
      } else {
        return this.pdContact
      }
    },

    autoHeightClass () {
      return this.isExpanded ? 'auto-height' : ''
    },

    timeOfFirstOutboundCall () {
      if (this.firstOutboundCall) {
        return this.$options.filters.fixFullDateUTCRelative(this.firstOutboundCall.created_at)
      }

      return '--:--'
    },

    timeToFirstOutboundCall () {
      if (this.contact && this.firstOutboundCall) {
        let contactCreated = window.moment(this.resources.created_at)
        let callCreated = window.moment(this.firstOutboundCall.created_at)

        let formatted = this.formatHumanized(callCreated.diff(contactCreated))

        return !formatted ? '--:--' : `After ${formatted}`
      }

      return '--:--'
    },
    isExpanded () {
      if (this.isContactType) {
        return this.is_expanded
      } else {
        return true
      }
    }
  },

  data () {
    return {
      is_expanded: false,
      attributes: []
    }
  },

  methods: {
    ...mapActions('contacts', ['setContactAttributes', 'setContact', 'updateChangedContactProperties']),

    onExpanded () {
      this.is_expanded = !this.is_expanded
    },

    getAttributes () {
      talk2Api.V1.resources.getAttributes(this.resources.id)
        .then(response => {
          this.setContactAttributes(response.data)
        })
    },

    onUpdateFields (value, prop) {
      if (this.isContactType) {
        this.contact[prop] = value
      } else {
        this.pdContact[prop] = value
      }

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

      let segments = []
      const duration = window.moment.duration(period)

      // return nothing when the duration is falsy or not correctly parsed (P0D)
      if (duration.toISOString() === 'P0D' || !duration.isValid()) return ''

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
