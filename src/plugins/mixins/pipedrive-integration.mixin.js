import { mapState } from 'vuex'

export default {
  data () {
    return {
      integrationName: 'pipedrive'
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany'])
  },

  methods: {
    pipedriveContactLink (contact) {
      if (this.currentCompany &&
          this.currentCompany.pipedrive_integration_enabled &&
          contact &&
          contact.integration_data &&
          contact.integration_data.contact_details &&
          contact.integration_data.contact_details.id &&
          this.currentCompany.pipedrive_company_domain) {
        return `https://${this.currentCompany.pipedrive_company_domain}.pipedrive.com/person/${contact.integration_data.contact_details.id}`
      }

      return false
    }
  }
}
