import _ from 'lodash'
import { mapActions, mapState } from 'vuex'
import * as AgentStatus from '../../constants/agent-status'

export default {
  data () {
    return {
      loadingAgentStatus: false,
      AgentStatus
    }
  },

  computed: {
    ...mapState(['oldAgentStatus']),
    ...mapState('auth', ['profile', 'authenticated']),

    agentStatus () {
      return _.get(this.profile, 'agent_status', null)
    },

    isBargingOrWhispering () {
      return AgentStatus.AGENT_STATUS_SENTRY === this.agentStatus
    }
  },

  methods: {
    color (agentStatus) {
      switch (agentStatus) {
        case AgentStatus.AGENT_STATUS_OFFLINE:
          return 'blue-grey-6'
        case AgentStatus.AGENT_STATUS_ACCEPTING_CALLS:
          return 'green-6'
        case AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS:
          return 'red-6'
        case AgentStatus.AGENT_STATUS_ON_BREAK:
          return 'orange-6'
        case AgentStatus.AGENT_STATUS_ON_CALL:
          return 'light-blue-6'
        case AgentStatus.AGENT_STATUS_ON_WRAP_UP:
          return 'yellow-6'
        case AgentStatus.AGENT_STATUS_RINGING:
          return 'lime-13'
        case AgentStatus.AGENT_STATUS_AUTO_DIAL:
          return 'white'
        case AgentStatus.AGENT_STATUS_SENTRY:
          return 'dark'
        default:
          return 'grey-6'
      }
    },

    getAgentStatus (getTry = 1) {
      if (!this.authenticated) {
        return
      }

      this.$axios.post('/api/v1/profile/get-agent-status', {
        device_info: null
      }).then(res => {
        this.setAgentStatus(res.data.agent_status)
        console.log('Changed agent status [pull]: ', this.getStatusLabel(res.data.agent_status))
      }).catch((err) => {
        console.log(err)
        getTry++
        // check if we could get agent status after 3 retries
        if (getTry > 3) {
          // error
          this.$Sentry.captureException(err)
        } else {
          this.getAgentStatus(getTry)
        }
      })
    },

    getStatusLabel (agentStatus) {
      switch (agentStatus) {
        case AgentStatus.AGENT_STATUS_OFFLINE:
          return 'Offline'
        case AgentStatus.AGENT_STATUS_ACCEPTING_CALLS:
          return 'Available'
        case AgentStatus.AGENT_STATUS_ON_BREAK:
          return 'On-break'
        case AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS:
        case AgentStatus.AGENT_STATUS_ON_CALL:
        case AgentStatus.AGENT_STATUS_ON_WRAP_UP:
        case AgentStatus.AGENT_STATUS_RINGING:
        case AgentStatus.AGENT_STATUS_AUTO_DIAL:
        case AgentStatus.AGENT_STATUS_SENTRY:
          return 'Busy'
        default:
          return 'Offline'
      }
    },

    verifyOldAgentStatus (agentStatus = 0) {
      console.log('Changed agent status [event]: ', this.getStatusLabel(agentStatus))
      console.log('Old Agent Status: ', this.getStatusLabel(this.oldAgentStatus))

      if (this.oldAgentStatus !== undefined) {
        this.resetAgentStatus()
      }
    },

    resetAgentStatus (forceStatus = false, signature = 'Talk-ResetAgentStatus') {
      let agentStatus = null

      switch (this.oldAgentStatus) {
        case AgentStatus.AGENT_STATUS_OFFLINE:
          agentStatus = AgentStatus.AGENT_STATUS_OFFLINE
          break
        case AgentStatus.AGENT_STATUS_ON_BREAK:
          agentStatus = AgentStatus.AGENT_STATUS_ON_BREAK
          break
        case AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS:
          agentStatus = AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS
          break
        default:
          agentStatus = AgentStatus.AGENT_STATUS_ACCEPTING_CALLS
          break
      }

      console.log('old agent status [reset]: ', this.getStatusLabel(this.oldAgentStatus))
      console.log('current agent status [reset]: ', this.getStatusLabel(this.profile.agent_status))
      console.log('new agent status [reset]: ', this.getStatusLabel(agentStatus))
      // check status
      if (this.profile.agent_status !== agentStatus.data) {
        this.changeAgentStatus(agentStatus, forceStatus, 1, signature)
      }
    },

    changeAgentStatus: _.debounce(function (val, forceStatus = false, changeAgentStatusTry = 1, signature = 'Unknown') {
      if (!this.authenticated) {
        return
      }

      if (val !== undefined && ![AgentStatus.AGENT_STATUS_ON_WRAP_UP, AgentStatus.AGENT_STATUS_ON_CALL, AgentStatus.AGENT_STATUS_RINGING].includes(val)) {
        console.log('Setting old agent status [api]: ', this.getStatusLabel(val))
        this.setOldAgentStatus(val)
      }

      console.log('Changing agent status [api]: ', this.getStatusLabel(val))

      // make sure that the session is valid
      if (this.profile) {
        this.loadingAgentStatus = true
        this.$axios.post('/api/v1/user/' + this.profile.id + '/agent-status', {
          agent_status: val
        }, {
          headers: {
            'Signature': signature
          }
        }).then(({ data }) => {
          this.loadingAgentStatus = false

          if (forceStatus && val !== data.agent_status) {
            console.log(`Requested Agent status value (${this.getStatusLabel(val)}) and API response value (${this.getStatusLabel(data.agent_status)}) is not the same. Retrying request...`)
            this.changeAgentStatus(val, forceStatus, 1, signature)
            return
          }

          this.setAgentStatus(data.agent_status)
          this.$VueEvent.fire('user_updated', data)
          console.log('Changed agent status [api]: ', this.getStatusLabel(data.agent_status))
        }).catch(err => {
          changeAgentStatusTry++
          // error
          console.log('An error occurred while changing agent status [api]', err)
          // check if we have found the communication after 3 retries
          if (changeAgentStatusTry > 3) {
            this.loadingAgentStatus = false
            return
          }

          this.changeAgentStatus(val, forceStatus, changeAgentStatusTry, signature)
        })
      }
    }, 500),

    ...mapActions(['setOldAgentStatus']),
    ...mapActions('auth', ['setAgentStatus', 'setProfile'])
  },

  beforeDestroy () {
    clearInterval(window.agentStatusIntervalId)
  }
}
