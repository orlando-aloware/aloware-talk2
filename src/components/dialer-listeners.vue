<template>
  <div />
</template>

<script>
import { broadcastMixin } from 'src/boot/mixins'

export default {
  name: 'DialerListeners',

  mixins: [
    broadcastMixin
  ],

  data () {
    return {
      listeners: {}
    }
  },

  created () {
    this.broadcastInit()
  },

  mounted () {
    this.listeners.userLoggedIn = (event) => this.handleUserLogin(event)
    this.listeners.agentStatusUpdated = (event) => this.handleAgentStatusUpdate(event)

    this.startMainEvents()
  },

  beforeDestroy () {
    this.stopMainEvents()
  },

  methods: {
    startMainEvents () {
      this.$VueEvent.listen('userLoggedIn', this.listeners.userLoggedIn)
      this.$VueEvent.listen('agent_status_updated', this.listeners.agentStatusUpdated)
    },

    stopMainEvents () {
      this.$VueEvent.stop('userLoggedIn', this.listeners.userLoggedIn)
      this.$VueEvent.stop('agent_status_updated', this.listeners.agentStatusUpdated)
    },

    handleUserLogin (event) {
      this.$emit('user-logged-in', event)
    },

    handleAgentStatusUpdate (event) {
      this.$emit('agent-status-updated', event)
    }
  }
}
</script>
