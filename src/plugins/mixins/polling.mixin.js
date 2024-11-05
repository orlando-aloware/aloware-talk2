import { mapMutations } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  data () {
    return {
      pollingInterval: 5, // in seconds
      usersPollInterval: null
    }
  },

  methods: {
    ...mapMutations(['UPDATE_USER_STATUS']),

    addUsersPoll () {
      // runs after 'polling_interval' seconds the app is initiated, every 'polling_interval' seconds
      this.usersPollInterval = setInterval(() => {
        this.pollUsers()
      }, this.pollingInterval * 1000)
    },

    pollUsers () {
      console.log('Polling agents status...')

      talk2Api.V1.company.getAgentsStatus().then((result) => {
        // update agent_status of every user

        for (const user of result.data) {
          this.UPDATE_USER_STATUS(user)

          if (this.profile.company_id === user.company_id) {
            this.$VueEvent.fire('agent_status_updated', user)
          }
        }
      })
    }
  },

  beforeDestroy () {
    clearInterval(this.usersPollInterval)
  }
}
