<template>
  <b-card class="mt-2 mb-2 border-0 position-relative">
    <h6>About this contact</h6>

    <div :class="`information-container ${autoHeightClass}`">
      <div class="d-block">
        <p class="text-muted custom-input-label mb-2">Owner</p>
        <contact-user-selector v-model="contact.user_id"
                               @updateField="onUpdateOwner" />
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-2">Contact Disposition</p>
        <contact-disposition @updateField="onUpdateOwner" />
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-2">Email</p>
        <contact-input-field v-model="contact.email"
                             placeholder="Enter email here..."
                             @updateField="onUpdateEmail" />
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-2">Company</p>
        <contact-input-field v-model="contact.company_name"
                             placeholder="Enter company here..."
                             @updateField="onUpdateCompany"/>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-2">Website</p>
        <contact-input-field v-model="contact.website"
                             placeholder="Enter website here..."
                             @updateField="onUpdateWebsite"/>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-2">City</p>
        <contact-input-field v-model="contact.cnam_city"
                             placeholder="Enter city here..."
                             @updateField="onUpdateCity"/>
      </div>

      <div class="d-block" v-if="contact.cnam_country && ['US', 'CA'].includes(contact.cnam_country)">
        <p class="text-muted custom-input-label mb-2">State</p>
        <location-state-selector></location-state-selector>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-2">Country</p>
        <location-country-selector></location-country-selector>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-2">Zip Code</p>
        <contact-input-field v-model="contact.cnam_zipcode"
                             placeholder="Enter zip code here..."
                             @updateField="onUpdateZipCode">
        </contact-input-field>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-2">TCPA Approved</p>
        <p>{{ contact.text_authorized | fixBooleanType }}</p>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-2">Created At</p>
        <p>{{ contact.created_at | fixFullDateUTCRelative }}</p>
      </div>

      <div class="d-block">
        <p class="text-muted custom-input-label mb-2">Intake Source</p>
        <p>{{ contact.intake_source | toUpperCase }}</p>
      </div>
    </div>
    <b-button pill
              variant="light"
              size="sm"
              class="contact-information-toggle" @click="onExpanded">
      <i class="material-icons">{{ is_expanded ? 'expand_less' : 'expand_more' }}</i>
    </b-button>
  </b-card>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import talk2Api from '../../../../plugins/api/api'
import ContactUserSelector from 'pages/contacts/_components/contacts-view/contact-user-selector'
import LocationStateSelector from 'pages/contacts/_components/contacts-view/location-state-selector'
import LocationCountrySelector from 'pages/contacts/_components/contacts-view/location-country-selector'
import ContactInputField from 'pages/contacts/_components/contacts-view/contact-input-field'
import ContactDisposition from 'pages/contacts/_components/contacts-view/contact-disposition'

export default {
  name: 'contact-information',
  components: { ContactDisposition, ContactInputField, LocationCountrySelector, LocationStateSelector, ContactUserSelector },
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
    updateContactField (params, callback) {
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
  mounted () {
    this.getAttributes()
  }
}
</script>

<style lang="scss" scoped>
  .information-container{
    font-size: 90%;
    height: 210px;
    overflow: hidden;
    padding: 0 !important;
    margin-bottom: 8px;

    .custom-input-label {
      font-size: 80%;
    }
  }

  .information-container.auto-height {
    height: 100%;
  }

  .contact-information-toggle {
    background: transparent;
    border: 1px solid #dee2e6;
    position: absolute;
    margin: 0;
    left: 50%;
    -ms-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
    padding: 0.10rem 0.35rem;;
  }

  div.label {
    font-size: 1em;
    display: inline-block;
    width: 90px;
    color: #6c757d !important;
    padding-right: 8px;
  }

  div.value {
    font-size: 1em;
    display: inline-block;
    width: 180px;
    color: #6c757d !important;
    padding-right: 8px;
  }

</style>
