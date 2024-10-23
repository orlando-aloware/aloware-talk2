import { mapMutations } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  data () {
    return {
      pollingInterval: 30 // in seconds
    }
  },

  methods: {
    ...mapMutations(['UPDATE_USER_STATUS']),

    async pollUsers (companyId) {
      console.log('Polling agents status...')
      const result = await talk2Api.V1.company.getAgentsStatus()

      // update agent_status of every user
      for (const user of result.data) {
        this.UPDATE_USER_STATUS(user)

        if (companyId === user.company_id) {
          this.$VueEvent.fire('agent_status_updated', event)
        }
      }
    }
  }
}
