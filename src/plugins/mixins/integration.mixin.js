import { mapState } from 'vuex'

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
    }
  }
}
