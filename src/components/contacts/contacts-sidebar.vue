<template>
  <card class="h-100 border-0 no-border-radius contacts-sidebar-card">
    <contacts-pinned></contacts-pinned>
  </card>
</template>

<script>
import Card from 'components/card.vue'
import ContactsPinned from './contacts-pinned.vue'
export default {
  components: {
    Card,
    ContactsPinned
  },
  data () {
    return {
      expanded: true,
      toggleFolders: true
    }
  },
  watch: {
    '$route': {
      handler (routeObj) {
        this.toggleFolders = routeObj.name === 'Contacts'
      },
      deep: true
    }
  }
}
</script>
