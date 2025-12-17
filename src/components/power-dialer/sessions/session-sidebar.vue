<template>
  <div class="h-100 border-0 no-border-radius">
    <div class="contact-list-sidebar-wrapper d-flex flex-column h-100">
      <b-button variant="light"
                size="sm"
                class="sidebar-toggle"
                @click="toggleSidebar">
        <i class="material-icons">
          {{ !sessionSidebarExpanded ? 'keyboard_arrow_left' : 'keyboard_arrow_right' }}
        </i>
      </b-button>

      <session-stats class="flex-grow-0" />
      <session-groups class="flex-grow-1 h-100 overflow-hidden" />
    </div>
  </div>
</template>

<script>

import { mapGetters, mapMutations } from 'vuex'
import { mapFields } from 'vuex-map-fields'
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
    ]),
    ...mapFields('powerDialer', [
      'powerDialerTasks',
      'activeTask'
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
