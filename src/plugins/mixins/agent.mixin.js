import _ from 'lodash'
import { mapActions, mapState } from 'vuex'
import * as AgentStatus from '../../constants/agent-status'

export default {
  data () {
    return {
      agentStatus: this.profile?.agent_status,
      loadingAgentStatus: false,
      AgentStatus
    }
  },

  computed: {
    ...mapState(['oldAgentStatus']),
    ...mapState('auth', ['profile', 'authenticated'])
  },

  created () {
    this.$VueEvent.listen('user_updated', (user) => {
      if (this.profile && user.id === this.profile.id && this.profile.agent_status !== user.agent_status) {
        this.profile.agent_status = user.agent_status
        this.agentStatus = user.agent_status
        console.log('Changed agent status: ' + user.agent_status)
      }
    })

    this.$VueEvent.listen('change_agent_status', (agentStatus) => {
      this.changeAgentStatus(agentStatus)
    })

    if (!window.agentStatusIntervalId) {
      window.agentStatusIntervalId = setInterval(() => {
        // this is a recursive agent status check with 3 retries
        this.getAgentStatus()
      }, 60 * 1000)
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
        this.profile.agent_status = res.data.agent_status
        this.agentStatus = res.data.agent_status
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

    resetAgentStatus () {
      let agentStatus
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
      console.log('old agent status: ' + this.oldAgentStatus)
      console.log('current agent status: ' + this.agentStatus)
      console.log('new agent status: ' + agentStatus)
      // check status
      if (this.agentStatus !== agentStatus) {
        this.changeAgentStatus(agentStatus)
      }
    },

    changeAgentStatus: _.debounce(function (val, changeAgentStatusTry = 1) {
      if (!this.authenticated) {
        return
      }
      if (val !== undefined && ![AgentStatus.AGENT_STATUS_ON_WRAP_UP, AgentStatus.AGENT_STATUS_ON_CALL, AgentStatus.AGENT_STATUS_RINGING].includes(val)) {
        console.log('Setting old agent status: ' + val)
        this.setOldAgentStatus(val)
      }
      console.log('Changing agent status: ' + val)

      // make sure that the session is valid
      if (this.profile) {
        this.loadingAgentStatus = true
        this.$axios.post('/api/v1/user/' + this.profile.id + '/agent-status', {
          agent_status: val
        }).then(res => {
          this.loadingAgentStatus = false
          this.profile.agent_status = res.data.agent_status
          this.agentStatus = res.data.agent_status
          console.log('Changed agent status: ' + res.data.agent_status)
          this.$VueEvent.fire('user_updated', res.data)
          if (this.agentStatus !== AgentStatus.AGENT_STATUS_ON_WRAP_UP) {
            this.$VueEvent.fire('endWrapUp')
          }
        }).catch(err => {
          changeAgentStatusTry++
          // error
          console.log('An error occurred while changing agent status', err)
          // check if we have found the communication after 3 retries
          if (changeAgentStatusTry > 3) {
            this.loadingAgentStatus = false
          } else {
            this.changeAgentStatus(val, changeAgentStatusTry)
          }
        })
      }
    }, 500),

    ...mapActions(['setOldAgentStatus'])
  },

  beforeDestroy () {
    this.$VueEvent.stop('change_agent_status')
  }
}
