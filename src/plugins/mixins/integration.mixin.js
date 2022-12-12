import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('cache', [
      'currentCompany'
    ]),
    integrationName () {
      switch (true) {
        case this.currentCompany.hubspot_integration_enabled:
          return 'hubspot'
        case this.currentCompany.zoho_integration_enabled:
          return 'zoho'
        case this.currentCompany.pipedrive_integration_enabled:
          return 'pipedrive'
      }

      return null
    }
  }
}
