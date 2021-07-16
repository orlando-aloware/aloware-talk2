<template>
  <b-card class="mt-2 mb-2 border-0">
    <h6 class="mb-2">Integrations</h6>
    <p v-if="!isHubspotEnabled"
       class="status-notice text-muted mb-0">
      Enable your favorite CRM integration and push contacts from the
      integration settings page to see links to your CRM contacts.
    </p>
    <integration-hubspot v-if="isHubspotEnabled"></integration-hubspot>
  </b-card>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import IntegrationHubspot from 'src/components/integrations/integration-hubspot'

export default {
  name: 'contact-integrations',
  components: { IntegrationHubspot },
  computed: {
    ...mapGetters('contacts', ['contact']),
    ...mapState(['currentCompany']),
    isHubspotEnabled () {
      return this.currentCompany && this.currentCompany.hubspot_integration_enabled
    }
  }
}
</script>

<style lang="scss" scoped>
  .status-notice {
    font-size: 12px;
  }
</style>
