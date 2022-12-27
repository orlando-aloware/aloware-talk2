import { mapState } from 'vuex'

export default {
  data () {
    return {
      integrationName: 'guesty'
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany'])
  },

  methods: {
    guestyContactLink (contact) {
      if (this.currentCompany &&
          this.currentCompany.guesty_integration_enabled &&
          contact &&
          contact.integration_data &&
          contact.integration_data.guesty &&
          contact.integration_data.guesty.conversation_id) {
        return `https://app.guesty.com/inbox-v2/${contact.integration_data.guesty.conversation_id}/reservation`
      }

      return false
    }
  }
}
