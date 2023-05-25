<template>
  <div class="wallboard"
       v-if="authenticated">
    <wallboard-sidebar/>
    <wallboard-header/>
    <router-view></router-view>
  </div>
</template>

<script>
import WallboardHeader from 'src/components/wallboard/wallboard-header.vue'
import WallboardSidebar from 'src/components/wallboard/wallboard-sidebar.vue'
import { CALL } from 'src/constants/communication-types'
import { aclMixin } from 'src/plugins/mixins'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'

export default {
  name: 'Wallboard',

  mixins: [
    aclMixin
  ],

  components: {
    WallboardHeader,
    WallboardSidebar
  },

  computed: {
    ...mapGetters('auth', [
      'authenticated',
      'profile'
    ]),

    ...mapState('cache', [
      'currentCompany'
    ])
  },

  data: () => ({
    listeners: {
      agentUpdated: null,
      agentStatusUpdated: null,
      callUpdated: null
    },
    CALL
  }),

  created () {
    this.fetchAgents()
    this.fetchLiveCalls()
    this.fetchParkedCalls()
    this.fetchQueuedCalls()
    this.fetchSummary()
  },

  mounted () {
    this.listeners.agentUpdated = (agent) => {
      this.setAgent(agent)
    }

    this.listeners.agentStatusUpdated = (event) => {
      this.setAgentStatus(event)
    }

    this.listeners.callUpdated = (communication) => {
      if (![CALL].includes(communication.type)) {
        return
      }

      // disable live dashboard for reporters
      if (this.hasReporterAccess) {
        return
      }

      // make each call disposition handle the same event
      this.setLiveCall(communication)
      this.setParkedCall(communication)
      this.setQueuedCall(communication)
    }

    // agent updated event
    this.$VueEvent.listen('user_updated', this.listeners.agentUpdated)

    // agent status updated event
    this.$VueEvent.listen('agent_status_updated', this.listeners.agentStatusUpdated)

    // new communication event
    this.$VueEvent.listen('new_communication', this.listeners.callUpdated)

    // updated communication event
    this.$VueEvent.listen('update_communication', this.listeners.callUpdated)

    // deleted communication event
    this.$VueEvent.listen('delete_communication', this.deleteCall)
  },

  methods: {
    ...mapActions('wallboard', [
      'fetchAgents',
      'fetchLiveCalls',
      'fetchParkedCalls',
      'fetchQueuedCalls',
      'fetchSummary'
    ]),

    ...mapMutations('wallboard', {
      deleteCall: 'DELETE_CALL',
      setAgent: 'SET_AGENT',
      setAgentStatus: 'SET_AGENT_STATUS',
      setLiveCall: 'SET_LIVE_CALL',
      setParkedCall: 'SET_PARKED_CALL',
      setQueuedCall: 'SET_QUEUED_CALL'
    })
  },

  beforeDestroy () {
    this.$VueEvent.stop('user_updated', this.listeners.agentUpdated)
    this.$VueEvent.stop('agent_status_updated', this.listeners.agentStatusUpdated)
    this.$VueEvent.stop('new_communication', this.listeners.callUpdated)
    this.$VueEvent.stop('update_communication', this.listeners.callUpdated)
    this.$VueEvent.stop('delete_communication', this.deleteCall)
  }
}
</script>
