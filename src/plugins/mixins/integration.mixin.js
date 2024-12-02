import { mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'

const integrations = [
  {
    name: 'Pipedrive',
    value: 'pipedrive_integration_enabled'
  },
  {
    name: 'HighLevel',
    value: 'gohighlevel_integration_enabled'
  },
  {
    name: 'HubSpot',
    value: 'hubspot_integration_enabled'
  },
  {
    name: 'HelpScout',
    value: 'helpscout_integration_enabled'
  },
  {
    name: 'Zoho',
    value: 'zoho_integration_enabled'
  },
  {
    name: 'Guesty',
    value: 'guesty_integration_enabled'
  },
  {
    name: 'Salesforce',
    value: 'salesforce_integration_enabled'
  }
]

export default {
  computed: {

    ...mapState('cache', [
      'currentCompany'
    ]),

    integrationNameHumanReadable () {
      switch (true) {
        case this.currentCompany.hubspot_integration_enabled:
          return 'HubSpot'
        case this.currentCompany.zoho_integration_enabled:
          return 'Zoho'
        case this.currentCompany.pipedrive_integration_enabled:
          return 'Pipedrive'
        // case this.currentCompany.salesforce_integration_enabled:
        //   return 'Salesforce'
        // case this.currentCompany.gohighlevel_integration_enabled:
        //   return 'HighLevel'
        // case this.currentCompany.guesty_integration_enabled:
        //   return 'Guesty'
      }

      return null
    },

    integrationsEnabled () {
      return integrations
        .filter(integration => this.currentCompany?.[integration.value])
        .map(integration => integration.name)
    },

    hasCompanyIntegrationsEnabled () {
      return integrations.some(integration => this.currentCompany?.[integration.value])
    }
  },

  methods: {
    getIntegrationData (contact, integrationName, dialerMode) {
      return talk2Api.V1.contact.getIntegrationData(contact.id, {
        params: {
          integration_name: integrationName,
          dialer_mode: dialerMode ? 1 : 0,
          force: true,
          with_duplicates: true
        }
      })
    }
  }
}
