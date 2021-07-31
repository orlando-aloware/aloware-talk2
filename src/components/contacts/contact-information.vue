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
        <contact-disposition @updateField="onUpdateOwner"
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
                                 :country="contact.cnam_state"
                                 :disabled="!hasPermissionTo('update contact')"
                                 @select="onUpdateState"></location-state-selector>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-0">Country</p>
        <location-country-selector v-model="contact.cnam_country"
                                   :country="contact.cnam_country"
                                   :disabled="!hasPermissionTo('update contact')"
                                   @select="onUpdateCountry"></location-country-selector>
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
    ...mapActions('contacts', ['setContactAttributes', 'setContact']),

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
      this.updateContactField({ user_id: params.val }, params.callback)
    },

    onUpdateZipCode (params) {
      this.updateContactField({ cnam_zipcode: params.val }, params.callback)
    },

    onUpdateEmail (params) {
      this.updateContactField({ email: params.val }, params.callback)
    },

    onUpdateWebsite (params) {
      this.updateContactField({ website: params.val }, params.callback)
    },

    onUpdateCompany (params) {
      this.updateContactField({ company_name: params.val }, params.callback)
    },

    onUpdateCity (params) {
      this.updateContactField({ cnam_city: params.val }, params.callback)
    },

    onUpdateCountry (params) {
      this.updateContactField({ cnam_country: params.value }, params.callback)
    },

    onUpdateState (params) {
      this.updateContactField({ cnam_state: params.value }, params.callback)
    },

    updateContactField (params, callback) {
      if (!this.contact || !this.contact.id) {
        return false
      }

      return talk2Api.V1.contact.update(this.contact.id, params).then(response => {
        this.setContact(response.data)
      }).catch((err) => {
        // TODO enable this when all mixins has been ported
        // this.$root.handleErrors(err.response)
        console.log(err)
        this.$q.notify({
          message: 'Error while saving data...',
          type: 'negative',
          textColor: 'white',
          actions: [
            {
              icon: 'close'
            }
          ]
        })
      }).finally(() => {
        if (typeof callback === 'function') {
          callback()
        }
      })
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
