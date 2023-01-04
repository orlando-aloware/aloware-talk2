import { mapState } from 'vuex'
import { isEmpty } from 'lodash'
import talk2Api from 'src/plugins/api/api'

export default {
  data () {
    return {}
  },

  computed: {
    ...mapState('cache', ['currentCompany'])
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
    },

    getContactId (contact) {
      if (contact.integration_data && contact.integration_data.vid) {
        return contact.integration_data.vid
      }

      if (contact.integration_data && contact.integration_data.hubspot && contact.integration_data.hubspot.contact_id) {
        return contact.integration_data.hubspot.contact_id
      }

      return null
    }
  }
}
