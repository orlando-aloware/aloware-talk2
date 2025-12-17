<template>
  <div class="users__header">
    <wallboard-agent-name />
    <span class="users__header__status">
      <agent-status-selector class="bottom-border__none highlighted-primary"
                             selectWidth="200"
                             :use-input="false"
                             @select="onStatus"/>
    </span>
    <agents-status-pills :agents="agents" />
  </div>
</template>

<script>
import AgentsStatusPills from 'src/components/agents-status-pills'
import AgentStatusSelector from 'src/components/generic-selectors/agent-status-selector.vue'
import WallboardAgentName from 'src/components/wallboard/wallboard-agent-name.vue'
import { mapGetters, mapMutations } from 'vuex'

export default {
  name: 'wallboard-agents-header',

  components: {
    AgentsStatusPills,
    AgentStatusSelector,
    WallboardAgentName
  },

  computed: {
    ...mapGetters('wallboard', {
      agents: 'getAgents'
    })
  },

  methods: {
    ...mapMutations('wallboard', {
      setFilter: 'SET_FILTER'
    }),

    onStatus (data) {
      this.setFilter({
        filter: 'agentStatus',
        value: data
      })
    }
  }
}
</script>
