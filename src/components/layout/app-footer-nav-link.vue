<template>
  <q-route-tab
    v-if="accessibleByUser"
    :active="isActive"
    :content-class="`tab-icons xs-text ${isActive ? 'tab-active' : 'text-grey'}`"
    :name="title"
    :ripple="false"
    :to="to.path || to"
    active-class="tab-active"
    exact
    no-caps
  >
    <span class="tab-icon">
      <slot :active="isActive" name="icon" />
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
    to: { required: true, type: [Object, String] },
    isActive: { required: true, type: Boolean }
  },
  computed: {
    matchedRoutes () {
      return this.$router.resolve(this.to).resolved.matched
    },
    userSpecificRoutes () {
      return this.$store.state.auth.is_focused_power_dialer ? allowedRoutes.talkLite : allowedRoutes.default
    },
    accessibleByUser () {
      return this.matchedRoutes.some(
        route => this.userSpecificRoutes.includes(route.name)
      )
    }
  }
}
</script>
