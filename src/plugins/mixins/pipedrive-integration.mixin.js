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
      return contact?.integration_data?.pipedrive?.link
    }
  }
}
