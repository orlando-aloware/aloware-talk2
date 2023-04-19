<template>
  <div class="users__header">
    <wallboard-agent-name />
    <span class="users__header__status">
      <agent-status-selector class="bottom-border__none highlighted-primary"
                             :use-input="false"
                             selectWidth="200"
                             @select="onStatus"/>
    </span>
  </div>
</template>

<script>
import WallboardAgentName from 'src/components/wallboard/wallboard-agent-name.vue'
import AgentStatusSelector from '../generic-selectors/agent-status-selector.vue'
import { mapMutations } from 'vuex'

export default {
  name: 'wallboard-users-header',

  components: {
    AgentStatusSelector,
    WallboardAgentName
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
