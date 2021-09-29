<template>
  <div class="h-100 border-0 no-border-radius">
    <div class="contact-list-sidebar-wrapper d-block">
    <b-button
        variant="light"
        size="sm"
        class="sidebar-toggle"
        @click="() => ( alert(1) )">
        <i class="material-icons">{{ isExpanded ? 'keyboard_arrow_left' : 'keyboard_arrow_right' }}</i>
      </b-button>
    <SessionStats />
    <SessionGroups />
    </div>
  </div>
</template>

<script>

import SessionStats from './session-stats'
import SessionGroups from './session-groups'
export default {
  name: 'SessionSidebar',
  components: {
    SessionStats,
    SessionGroups
  },
  data () {
    return {
      isExpanded: true
    }
  }
}
</script>
