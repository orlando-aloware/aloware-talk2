<template>
  <inbox-nav-toggle :is-open="isOpen" @toggle="toggle"/>
</template>

<script>
import InboxNavToggle from './inbox-nav-toggle.vue'

export default {
  name: 'inbox-nav-toggle-view.vue',
  components: {
    InboxNavToggle
  },
  methods: {
    toggle (isOpen) {
      this.isOpen = isOpen
    }
  },
  data () {
    return {
      isOpen: false
    }
  }
}
</script>
