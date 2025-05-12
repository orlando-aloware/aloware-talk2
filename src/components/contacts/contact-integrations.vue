<template>
  <b-card class="integrations-card border-0" data-testid="contact-integrations-card">
    <h4 class="mb-2"
        data-testid="contact-integrations-title"
        v-if="!no_title">
      Integrations
    </h4>
    <p v-if="isIntegrationsDisabled"
       data-testid="contact-integrations-disabled-text"
       class="status-notice fs-12 text-muted mb-0">
      Enable your favorite CRM integration to see more details directly from the CRM.
    </p>
    <integration-hubspot
        v-if="isHubspotEnabled"
        data-testid="contact-integrations-hubspot"
        :contact="contact"
        :team-inbox-id="teamInboxId"
        :is-read-only="isReadOnly"
    />

    <integration-pipedrive
        v-if="isPipedriveEnabled"
        data-testid="contact-integrations-pipedrive"
        :contact="contact"
        :team-inbox-id="teamInboxId"
        :is-read-only="isReadOnly"
    />

    <integration-gohighlevel
        v-if="isGHLEnabled"
        data-testid="contact-integrations-gohighlevel"
        :contact="contact"
        :team-inbox-id="teamInboxId"
        :is-read-only="isReadOnly"
    />

    <integration-salesforce
        v-if="isSalesforceEnabled"
        data-testid="contact-integrations-salesforce"
        :contact="contact"
        :team-inbox-id="teamInboxId"
        :is-read-only="isReadOnly"
    />

    <integration-guesty
      v-if='isGuestyEnabled'
      data-testid='contact-integrations-guesty'
      :contact='contact'
      :team-inbox-id="teamInboxId"
      :is-read-only="isReadOnly"
    />

    <integration-zoho
      v-if='isZohoEnabled'
      data-testid='contact-integrations-zoho'
      :contact='contact'
      :team-inbox-id="teamInboxId"
      :is-read-only="isReadOnly"
    />

    <contact-crm-links
      data-testid="contact-integrations-crm-links"
      :contact="contact"
    />
  </b-card>
</template>

<script>
import { mapState } from 'vuex'
import IntegrationHubspot from 'src/components/integrations/integration-hubspot'
import IntegrationPipedrive from 'src/components/integrations/integration-pipedrive'
import ContactCrmLinks from 'components/contacts/contact-crm-links'
import IntegrationGohighlevel from 'components/integrations/integration-gohighlevel.vue'
import IntegrationSalesforce from 'components/integrations/integration-salesforce.vue'
import IntegrationGuesty from 'components/integrations/integration-guesty.vue'
import IntegrationZoho from 'components/integrations/integration-zoho.vue'
import { teamInboxPropsMixin } from 'src/plugins/mixins'

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
    },

    isReadOnly: {
      type: Boolean,
      required: false,
      default: false
    }
  },

  components: {
    IntegrationZoho,
    IntegrationGuesty,
    IntegrationGohighlevel,
    ContactCrmLinks,
    IntegrationHubspot,
    IntegrationPipedrive,
    IntegrationSalesforce
  },

  mixins: [teamInboxPropsMixin],

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
        !this.currentCompany.guesty_integration_enabled &&
        !this.currentCompany.gohighlevel_integration_enabled &&
        !this.currentCompany.salesforce_integration_enabled
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

    isGuestyEnabled () {
      return !!(this.currentCompany &&
        this.currentCompany.guesty_integration_enabled)
    },

    isSalesforceEnabled () {
      return this.currentCompany && this.currentCompany.salesforce_integration_enabled
    }
  }
}
</script>
