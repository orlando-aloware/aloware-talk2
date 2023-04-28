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
    CALL
  }),

  created () {
    this.fetchLiveCalls()
    this.fetchParkedCalls()
    this.fetchQueuedCalls()
    this.fetchSummary()
    this.fetchUsers()
  },

  mounted () {
    // user updated event
    this.$VueEvent.listen('user_updated', (user) => {
      this.setUser(user)
    })

    // agent status updated event
    this.$VueEvent.listen('agent_status_updated', (event) => {
      this.setAgentStatus(event)
    })

    const setCall = (communication) => {
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

    // new communication event
    this.$VueEvent.listen('new_communication', setCall)

    // updated communication event
    this.$VueEvent.listen('update_communication', setCall)

    // deleted communication event
    this.$VueEvent.listen('delete_communication', this.deleteCall)
  },

  methods: {
    ...mapActions('wallboard', [
      'fetchLiveCalls',
      'fetchParkedCalls',
      'fetchQueuedCalls',
      'fetchSummary',
      'fetchUsers'
    ]),

    ...mapMutations('wallboard', {
      deleteCall: 'DELETE_CALL',
      setAgentStatus: 'SET_AGENT_STATUS',
      setLiveCall: 'SET_LIVE_CALL',
      setParkedCall: 'SET_PARKED_CALL',
      setQueuedCall: 'SET_QUEUED_CALL',
      setUser: 'SET_USER'
    })
  }
}
</script>
