import { mapState } from 'vuex'
// import { isEmpty } from 'lodash'
// import talk2Api from 'src/plugins/api/api'

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
          this.currentCompany.zoho_organization_id) {
        return `https://crm.zoho.com/crm/org${this.currentCompany.zoho_organization_id}/tab/Contacts/${contact.integration_data.zoho.contact_id}`
      }

      return false
    }
  }
}
