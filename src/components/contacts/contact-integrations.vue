<template>
  <b-card class="integrations-card border-0">
    <h4 class="mb-2"
        v-if="!no_title">
      Integrations
    </h4>
    <p v-if="isIntegrationsDisabled"
       class="status-notice fs-12 text-muted mb-0">
      Enable your favorite CRM integration to see more details directly from the CRM.
    </p>
    <integration-hubspot v-if="isHubspotEnabled"
                         :contact="contact"/>

    <integration-pipedrive v-if="isPipedriveEnabled"
                         :contact="contact"/>

    <integration-gohighlevel v-if="isGHLEnabled"
                           :contact="contact"/>

    <contact-crm-links :contact="contact"/>
  </b-card>
</template>

<script>
import { mapState } from 'vuex'
import IntegrationHubspot from 'src/components/integrations/integration-hubspot'
import IntegrationPipedrive from 'src/components/integrations/integration-pipedrive'
import ContactCrmLinks from 'components/contacts/contact-crm-links'
import IntegrationGohighlevel from 'components/integrations/integration-gohighlevel.vue'

export default {
  name: 'contact-integrations',

  props: {
    contact: {
      type: Object,
      required: true
    },

    no_title: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  components: { IntegrationGohighlevel, ContactCrmLinks, IntegrationHubspot, IntegrationPipedrive },

  computed: {
    ...mapState('cache', ['currentCompany']),

    isIntegrationsDisabled () {
      if (!this.currentCompany) {
        return true
      }

      if (this.currentCompany.id === 460) {
        return false
      }

      return !this.currentCompany.pipedrive_integration_enabled &&
        !this.currentCompany.hubspot_integration_enabled &&
        !this.currentCompany.stripe_integration_enabled &&
        !this.currentCompany.zoho_integration_enabled &&
        !this.currentCompany.helpscout_integration_enabled &&
        !this.currentCompany.guesty_integration_enabled &&
        !this.currentCompany.gohighlevel_integration_enabled
    },

    isHubspotEnabled () {
      return this.currentCompany && this.currentCompany.hubspot_integration_enabled
    },

    isPipedriveEnabled () {
      return !!(this.currentCompany &&
        this.currentCompany.pipedrive_integration_enabled)
    },

    isGHLEnabled () {
      return this.currentCompany && this.currentCompany.gohighlevel_integration_enabled
    },

    isZohoEnabled () {
      return !!(this.currentCompany &&
        this.currentCompany.zoho_integration_enabled)
    },

    isHelpScoutEnabled () {
      return !!(this.currentCompany &&
        this.currentCompany.helpscout_integration_enabled)
    },

    isGuestyEnabled () {
      return !!(this.currentCompany &&
        this.currentCompany.guesty_integration_enabled)
    }
  }
}
</script>
