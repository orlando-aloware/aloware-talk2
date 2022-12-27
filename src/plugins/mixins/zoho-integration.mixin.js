import { mapState } from 'vuex'

export default {
  data () {
    return {
      integrationName: 'zoho'
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany'])
  },

  methods: {
    zohoContactLink (contact) {
      if (this.currentCompany &&
          this.currentCompany.zoho_integration_enabled &&
          contact &&
          contact.integration_data &&
          contact.integration_data.zoho &&
          contact.integration_data.zoho.contact_id &&
          contact.integration_data.zoho.org_id) {
        return `https://crm.zoho.com/crm/org${contact.integration_data.zoho.org_id}/tab/Contacts/${contact.integration_data.zoho.contact_id}`
      }

      return false
    }
  }
}
