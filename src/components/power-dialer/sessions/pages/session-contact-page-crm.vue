<template>
  <div class="row full-height">
    <div class="col-12 p-0">
      <div v-if="!isReferrizer"
           class="hubspot-iframe-container">
        <iframe class="hubspot-crm-iframe"
                :src="hubspotLink"
                frameborder="0"
                id="hubspot-crm"
                v-if="hubspotLink">
        </iframe>
      </div>

      <div v-if="isReferrizer"
           class="referrizer-iframe-container">
        <iframe class="referrizer-crm-iframe"
                :src="referrizerLink"
                :key="contact.id"
                frameborder="0"
                id="referrizer-crm"
                v-if="referrizerLink">
        </iframe>
      </div>
    </div>
  </div>
</template>

<script>

import { mapGetters, mapState } from 'vuex'
import { hubspotIntegrationMixin } from 'src/plugins/mixins'

export default {
  name: 'SessionContactPageCrm',

  mixins: [
    hubspotIntegrationMixin
  ],

  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapState('contacts', ['contact']),

    hubspotLink () {
      return this.getHubspotContactLink(this.contact)
    },

    referrizerLink () {
      if (!this.isReferrizer) {
        return null
      }

      const agentName = this.profile.name
      const leadNumber = this.contact.phone_number
      const firstName = this.contact.first_name
      const address = this.contact.address
      const companyName = this.contact.company_name
      const city = this.contact.cnam_city
      const state = this.contact.cnam_state
      const zipcode = this.contact.cnam_zipcode
      const email = this.contact.email
      const website = this.contact.website
      const customUrl = this.currentCompany?.crm_view_custom_url

      return `${customUrl}&utm_source=Aloware&utm_medium=${agentName}&feneroleadid=${leadNumber}&fenerousername=${agentName}&phone=${leadNumber}&firstname=${firstName}&address1=${address}&title=${companyName}&city=${city}&state=${state}&zip=${zipcode}&email=${email}&website=${website}`
    },

    isReferrizer () {
      // return this.profile.company.id === 2140
      return true
    },

    test () {
      const iframe = document.getElementById('hubspot-crm')
      return iframe.contentWindow
    }
  }
}
</script>
