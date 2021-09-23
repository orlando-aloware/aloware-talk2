<template>
  <div class="h-100 border-0 no-border-radius">
    <SessionStats />
    <SessionGroups />
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
  }
}
</script>
