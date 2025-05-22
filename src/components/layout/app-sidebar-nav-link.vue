<template>
  <q-btn
    v-show="accessibleByUser"
    :data-testid="computedTestId"
    :icon="computedIcon"
    :padding="isActive ? 'none' : '10px 21px'"
    :ripple="false"
    :to="to"
    align="left"
    class="nav-icons w-100"
    flat
    @click="e => $emit('click', e)"
  >
    <q-tooltip
      v-if="!isSidebarExpanded"
      :offset="[-5, 0]"
      anchor="center right"
      self="center left"
    >
      <span class="font-weight-bold text-sm">{{ title }}</span>
    </q-tooltip>

    <span
      v-if="isSidebarExpanded"
      :class="{'text-menu-purple': !isActive, 'text-white': isActive}"
      class="text-size-lg font-weight-bold text-regular ml-2"
    >
      {{ title }}
    </span>

    <slot name="icon" />
  </q-btn>
</template>
<script>
import { allowedRoutes } from 'src/router/composables/useRolesSystem'

export default {
  name: 'app-sidebar-nav-link',
  props: {
    to: { required: true, type: [Object, String] },
    icon: { required: true, type: String },
    isSidebarExpanded: { required: true, type: Boolean },
    title: { required: true, type: String }
  },
  computed: {
    isActive () {
      if (this.to instanceof Object) {
        if (!this.$route.name) return false

        return this.$route.name.startsWith(this.to.name)
      } else {
        return this.$route.path.startsWith(`/${this.to}`)
      }
    },
    computedIcon () {
      return `img:app-icons/menu/${this.icon}_${this.isActive ? 'active' : 'gray'}.svg`
    },
    computedTestId () {
      return `${this.title.toLowerCase()}${this.isActive ? '-no' : ''}-active-sidebar-btn`
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
