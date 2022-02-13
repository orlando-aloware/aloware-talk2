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
      <SessionGroups v-if="activeTask" />
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
  mounted () {
    // this.activeTask = this.powerDialerTasks.in_queue[0]
    // let { powerDialerTasks } = this
    // powerDialerTasks.in_queue.shift()
    // Removing the first element in array
    console.log('Removing the first element in array :>> ', this.powerDialerTasks.in_queue)
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
