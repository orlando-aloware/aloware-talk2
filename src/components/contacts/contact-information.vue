<template>
  <b-card class="border-0 position-relative contact-about-wrapper">
    <h4>About this contact</h4>

    <div :class="`information-container ${autoHeightClass}`">
      <div class="d-block mt-2"
           v-if="hasPermissionTo('list user')">
        <p class="text-muted custom-input-label mb-0">Owner</p>
        <contact-user-selector v-model="contact.user_id"
                               @updateField="onUpdateOwner"
                               :disabled="!hasPermissionTo('change contact ownership')">
        </contact-user-selector>
      </div>

      <div class="d-block"
           v-if="hasPermissionTo('list disposition status')">
        <p class="text-muted custom-input-label mb-0">Contact Disposition</p>
        <contact-disposition @select="onUpdateDisposition"
                             :disabled="!hasPermissionTo('dispose contact')">
        </contact-disposition>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Email</p>
        <contact-input-field v-model="contact.email"
                             :disabled="!hasPermissionTo('update contact')"
                             @updateField="onUpdateEmail">
        </contact-input-field>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Company</p>
        <contact-input-field v-model="contact.company_name"
                             :disabled="!hasPermissionTo('update contact')"
                             @updateField="onUpdateCompany">
        </contact-input-field>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Website</p>
        <contact-input-field v-model="contact.website"
                             :disabled="!hasPermissionTo('update contact')"
                             @updateField="onUpdateWebsite">
        </contact-input-field>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">City</p>
        <contact-input-field v-model="contact.cnam_city"
                             :disabled="!hasPermissionTo('update contact')"
                             @updateField="onUpdateCity">
        </contact-input-field>
      </div>

      <div class="d-block" v-if="contact.cnam_country && ['US', 'CA'].includes(contact.cnam_country)">
        <p class="text-muted custom-input-label mb-0">State</p>
        <location-state-selector v-model="contact.cnam_state"
                                 :contact="contact"
                                 :disabled="!hasPermissionTo('update contact')"
                                 @select="onUpdateState">
        </location-state-selector>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Country</p>
        <location-country-selector v-model="contact.cnam_country"
                                   :contact="contact"
                                   :disabled="!hasPermissionTo('update contact')"
                                   @select="onUpdateCountry">
        </location-country-selector>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Zip Code</p>
        <contact-input-field v-model="contact.cnam_zipcode"
                             :disabled="!hasPermissionTo('update contact')"
                             @updateField="onUpdateZipCode">
        </contact-input-field>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">TCPA Approved</p>
        <p>{{ contact.text_authorized | fixBooleanType }}</p>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Created At</p>
        <p>{{ contact.created_at | fixFullDateUTCRelative }}</p>
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
        <p>{{ contact.intake_source | toUpperCase }}</p>
      </div>
    </div>
    <b-button pill
              variant="light"
              size="sm"
              class="contact-information-toggle"
              @click="onExpanded">
      <i class="material-icons">{{ is_expanded ? 'expand_less' : 'expand_more' }}</i>
    </b-button>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'
import talk2Api from 'src/plugins/api/api'
import ContactUserSelector from 'src/components/contacts/contact-user-selector'
import LocationStateSelector from 'src/components/contacts/location-state-selector'
import LocationCountrySelector from 'src/components/contacts/location-country-selector'
import ContactInputField from 'src/components/contacts/contact-input-field'
import ContactDisposition from 'src/components/contacts/contact-disposition'

export default {
  name: 'contact-information',

  mixins: [aclMixin],

  props: {
    firstOutboundCall: {}
  },

  components: {
    ContactDisposition,
    ContactInputField,
    LocationCountrySelector,
    LocationStateSelector,
    ContactUserSelector
  },

  computed: {
    ...mapGetters('contacts', ['contact', 'contactAttributes']),

    autoHeightClass () {
      return this.is_expanded ? 'auto-height' : ''
    },

    timeOfFirstOutboundCall () {
      if (this.firstOutboundCall) {
        return this.$options.filters.fixFullDateUTCRelative(this.firstOutboundCall.created_at)
      }

      return '--:--'
    },

    timeToFirstOutboundCall () {
      if (this.contact && this.firstOutboundCall) {
        let contactCreated = window.moment(this.contact.created_at)
        let callCreated = window.moment(this.firstOutboundCall.created_at)

        let formatted = this.formatHumanized(callCreated.diff(contactCreated))

        return !formatted ? '--:--' : `After ${formatted}`
      }

      return '--:--'
    }
  },

  data () {
    return {
      is_expanded: false,
      attributes: []
    }
  },

  mounted () {
    if (this.contact && this.contact.id) {
      this.getAttributes()
    }
  },

  methods: {
    ...mapActions('contacts', ['setContactAttributes', 'setContact', 'updateChangedContactProperties']),

    onExpanded () {
      this.is_expanded = !this.is_expanded
    },

    getAttributes () {
      talk2Api.V1.contact.getAttributes(this.contact.id)
        .then(response => {
          this.setContactAttributes(response.data)
        })
    },

    onUpdateOwner (params) {
      this.updateChangedContactProperties({
        name: 'user_id',
        value: params.val
      })
    },
    onUpdateDisposition (dispositionStatusId) {
      this.updateChangedContactProperties({
        name: 'disposition_status_id',
        value: dispositionStatusId
      })
    },

    onUpdateZipCode (params) {
      this.updateChangedContactProperties({
        name: 'cnam_zipcode',
        value: params.val
      })
    },

    onUpdateEmail (params) {
      this.updateChangedContactProperties({
        name: 'email',
        value: params.val
      })
    },

    onUpdateWebsite (params) {
      this.updateChangedContactProperties({
        name: 'website',
        value: params.val
      })
    },

    onUpdateCompany (params) {
      this.updateChangedContactProperties({
        name: 'company_name',
        value: params.val
      })
    },

    onUpdateCity (params) {
      this.updateChangedContactProperties({
        name: 'cnam_city',
        value: params.val
      })
    },

    onUpdateCountry (params) {
      this.updateChangedContactProperties({
        name: 'cnam_country',
        value: params.val
      })
    },

    onUpdateState (params) {
      this.updateChangedContactProperties({
        name: 'cnam_state',
        value: params.val
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
  },

  watch: {
    'contact.id': function () {
      if (this.contact && this.contact.id) {
        this.getAttributes()
      }
    }
  }
}
</script>
