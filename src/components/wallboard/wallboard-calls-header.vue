<template>
  <div class="calls__header">
    <wallboard-agent-name />
    <div class="flex-grow-1 text-right">
      <wallboard-calls-columns-dropdown />
    </div>
  </div>
</template>

<script>
import WallboardAgentName from 'src/components/wallboard/wallboard-agent-name.vue'
import WallboardCallsColumnsDropdown from 'src/components/wallboard/wallboard-calls-columns-dropdown.vue'

export default {
  name: 'wallboard-calls-header',

  components: {
    WallboardAgentName,
    WallboardCallsColumnsDropdown
  }
}
</script>
