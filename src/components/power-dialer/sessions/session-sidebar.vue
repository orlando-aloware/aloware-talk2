<template>
  <div class="h-100 border-0 no-border-radius">
    <div class="contact-list-sidebar-wrapper d-block">
      <b-button
        variant="light"
        size="sm"
        class="sidebar-toggle"
        :style="`${sessionSidebarExpanded ? 'right:-25px !important' : ''}`"
        @click="toggleSidebar">
        <i class="material-icons">{{ !sessionSidebarExpanded ? 'keyboard_arrow_left' : 'keyboard_arrow_right' }}</i>
      </b-button>
      <SessionStats />
      <SessionGroups />
    </div>
  </div>
</template>

<script>

import { mapGetters, mapMutations } from 'vuex'
import SessionStats from './session-stats'
import SessionGroups from './session-groups'

export default {
  name: 'SessionSidebar',
  components: {
    SessionStats,
    SessionGroups
  },
  computed: {
    ...mapGetters('powerDialer', [
      'sessionSidebarExpanded'
    ])
  },
  data () {
    return {
      isExpanded: true
    }
  },
  methods: {
    ...mapMutations('powerDialer', [
      'TOGGLE_SESSION_SIDEBAR'
    ]),
    toggleSidebar () {
      this.isExpanded = !this.isExpanded
      this.TOGGLE_SESSION_SIDEBAR()
    }
  }
}
</script>
