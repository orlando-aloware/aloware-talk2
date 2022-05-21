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
    }
  },

  created () {
    this.$VueEvent.listen('user_updated', (user) => {
      // if (this.profile && user.id === this.profile.id && this.profile.agent_status !== user.agent_status) {
      if (this.profile && user.id === this.profile.id) {
        console.log('user_updated', user)
        // this.setAgentStatus(user.agent_status)
        this.setProfile(user)
        console.log('Changed agent status [event]: ', user.agent_status)
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
        this.setAgentStatus(res.data.agent_status)
        console.log('Changed agent status [pull]: ', res.data.agent_status)
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
      const agentStatus = { data: null }
      switch (this.oldAgentStatus) {
        case AgentStatus.AGENT_STATUS_OFFLINE:
          agentStatus.data = AgentStatus.AGENT_STATUS_OFFLINE
          break
        case AgentStatus.AGENT_STATUS_ON_BREAK:
          agentStatus.data = AgentStatus.AGENT_STATUS_ON_BREAK
          break
        case AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS:
          agentStatus.data = AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS
          break
        default:
          agentStatus.data = AgentStatus.AGENT_STATUS_ACCEPTING_CALLS
          break
      }
      console.log('old agent status [reset]: ', this.oldAgentStatus)
      console.log('current agent status [reset]: ', this.profile.agent_status)
      console.log('new agent status [reset]: ', agentStatus.data)
      // check status
      if (this.profile.agent_status !== agentStatus.data) {
        this.changeAgentStatus(agentStatus.data)
      }
    },

    changeAgentStatus: _.debounce(function (val, changeAgentStatusTry = 1) {
      if (!this.authenticated) {
        return
      }
      if (val !== undefined && ![AgentStatus.AGENT_STATUS_ON_WRAP_UP, AgentStatus.AGENT_STATUS_ON_CALL, AgentStatus.AGENT_STATUS_RINGING].includes(val)) {
        console.log('Setting old agent status [api]: ', val)
        this.setOldAgentStatus(val)
      }
      console.log('Changing agent status [api]: ', val)

      // make sure that the session is valid
      if (this.profile) {
        this.loadingAgentStatus = true
        this.$axios.post('/api/v1/user/' + this.profile.id + '/agent-status', {
          agent_status: val
        }).then(res => {
          this.loadingAgentStatus = false
          this.setAgentStatus(res.data.agent_status)
          this.$VueEvent.fire('user_updated', res.data)
          console.log('Changed agent status [api]: ', res.data.agent_status)
          if (this.agentStatus !== AgentStatus.AGENT_STATUS_ON_WRAP_UP) {
            this.$VueEvent.fire('endWrapUp')
          }
        }).catch(err => {
          changeAgentStatusTry++
          // error
          console.log('An error occurred while changing agent status [api]', err)
          // check if we have found the communication after 3 retries
          if (changeAgentStatusTry > 3) {
            this.loadingAgentStatus = false
          } else {
            this.changeAgentStatus(val, changeAgentStatusTry)
          }
        })
      }
    }, 500),

    ...mapActions(['setOldAgentStatus']),
    ...mapActions('auth', ['setAgentStatus', 'setProfile'])
  },

  watch: {
    agentStatus (toVal, fromVal) {
      if (fromVal === AgentStatus.AGENT_STATUS_ON_WRAP_UP) {
        this.$VueEvent.fire('endWrapUp')
      }
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('change_agent_status')
    clearInterval(window.agentStatusIntervalId)
  }
}
