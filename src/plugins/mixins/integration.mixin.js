import { mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  computed: {

    ...mapState('cache', [
      'currentCompany'
    ]),

    integrationName () {
      switch (true) {
        case this.currentCompany.hubspot_integration_enabled:
          return 'HubSpot'
        case this.currentCompany.zoho_integration_enabled:
          return 'Zoho'
        case this.currentCompany.pipedrive_integration_enabled:
          return 'Pipedrive'
      }

      return null
    },

    integrationsEnabled () {
      let integrations = []

      if (this.currentCompany.hubspot_integration_enabled) {
        integrations.push('HubSpot')
      }

      if (this.currentCompany.zoho_integration_enabled) {
        integrations.push('Zoho')
      }

      if (this.currentCompany.pipedrive_integration_enabled) {
        integrations.push('Pipedrive')
      }

      return integrations
    }
  },

  methods: {
    getIntegrationData (contact, integrationName, dialerMode) {
      return talk2Api.V1.contact.getIntegrationData(contact.id, {
        params: {
          integration_name: integrationName,
          dialer_mode: dialerMode ? 1 : 0,
          force: true
        }
      })
    }
  }
}
