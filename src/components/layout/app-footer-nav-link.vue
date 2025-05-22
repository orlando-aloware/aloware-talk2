<template>
  <q-route-tab
    v-show="accessibleByUser"
    :active="isActive"
    :content-class="`tab-icons xs-text ${isActive ? 'tab-active' : 'text-grey'}`"
    :name="title"
    :ripple="false"
    :to="to"
    active-class="tab-active"
    no-caps
  >
    <span class="tab-icon">
      <slot :active="isActive" name="icon"></slot>
    </span>
    {{ title }}
  </q-route-tab>
</template>
<script>

import { allowedRoutes } from 'src/router/composables/useRolesSystem'

export default {
  name: 'app-footer-nav-link',
  props: {
    title: { required: true, type: String },
    to: { required: true, type: [Object, String] }
  },
  computed: {
    isActive () {
      if (this.to instanceof Object) {
        if (!this.$route.name) return false

        return this.$route.name.startsWith(this.to.name)
      } else {
        return this.$route.path.startsWith(this.to)
      }
    },

    matchedRoutes () {
      return this.$router.resolve(this.to).resolved.matched
    },
    userSpecificRoutes () {
      return this.$store.state.auth.is_focused_power_dialer ? allowedRoutes.focusedPowerDialer : allowedRoutes.default
    },
    accessibleByUser () {
      return this.matchedRoutes.some(
        route => this.userSpecificRoutes.includes(route.name)
      )
    }
  }
}
</script>
