import { mapMutations } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  data () {
    return {
      pollingInterval: 15 // in seconds
    }
  },

  methods: {
    ...mapMutations(['UPDATE_USER_STATUS']),

    pollUsers (companyId) {
      console.log('Polling agents status...')

      talk2Api.V1.company.getAgentsStatus().then((result) => {
        // update agent_status of every user

        for (const user of result.data) {
          this.UPDATE_USER_STATUS(user)

          if (companyId === user.company_id) {
            this.$VueEvent.fire('agent_status_updated', user)
          }
        }
      })
    }
  }
}
