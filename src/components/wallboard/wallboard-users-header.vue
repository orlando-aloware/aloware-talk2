<template>
  <div class="users__header">
    <search placeholder="Search Agent"
            @search="onSearch"/>
    <span class="users__header__status">
    <agent-status-selector class="bottom-border__none highlighted-primary"
                           :use-input="false"
                           selectWidth="200"
                           @select="onStatus"/>
    </span>
  </div>
</template>

<script>
import Search from 'src/components/search.vue'
import AgentStatusSelector from '../generic-selectors/agent-status-selector.vue'

export default {
  name: 'wallboard-users-header',

  components: {
    AgentStatusSelector,
    Search
  },

  methods: {
    onSearch (data) {
      this.$emit('agent', data)
    },

    onStatus (data) {
      this.$emit('status', data)
    }
  }
}
</script>
