import { mapState } from 'vuex'
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
    }
  }
}
