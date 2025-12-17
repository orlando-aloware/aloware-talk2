import { mapMutations } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  data () {
    return {
      pollingInterval: 7, // in seconds
      usersPollTimeout: null
    }
  },

  methods: {
    ...mapMutations(['UPDATE_USERS_STATUS_BATCH']),

    startUsersPoll () {
      // Start the first poll immediately, subsequent polls will be scheduled after completion
      this.pollUsers()
    },

    scheduleNextPoll () {
      // Schedule the next poll after pollingInterval seconds
      this.usersPollTimeout = setTimeout(() => {
        this.pollUsers()
      }, this.pollingInterval * 1000)
    },

    pollUsers () {
      console.log('Polling agents status...')

      talk2Api.V1.company.getAgentsStatus()
        .then((result) => {
          // batch update all agent statuses at once for better performance
          this.UPDATE_USERS_STATUS_BATCH(result.data)
        })
        .finally(() => {
          // Schedule next poll after request completes (success or failure)
          this.scheduleNextPoll()
        })
    }
  },

  beforeDestroy () {
    clearTimeout(this.usersPollTimeout)
  }
}
