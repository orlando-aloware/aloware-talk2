<template>
  <card class="h-100 border-0 no-border-radius contacts-sidebar-card">
    <contacts-pinned></contacts-pinned>
  </card>
</template>

<script>
import Card from 'components/card.vue'
import ContactsPinned from './contacts-pinned.vue'
import { mapState } from 'vuex'
import { aclMixin, userMixin } from 'src/plugins/mixins'

export default {
  mixins: [
    userMixin,
    aclMixin
  ],
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
  computed: {
    ...mapState('cache', ['currentCompany'])
  },
  watch: {
    '$route': {
      handler (routeObj) {
        this.toggleFolders = routeObj.name === 'Contacts'
      },
      deep: true
    }
  },
  mounted () {
    if (!this.hasPermissionTo('access contacts')) this.$router.replace({ path: '/' })
  }
}
</script>
