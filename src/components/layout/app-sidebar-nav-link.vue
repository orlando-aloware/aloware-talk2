<template>
  <div v-if="accessibleByUser" style="display: contents">
    <q-btn
      v-show="isActive"
      :class="className"
      :data-testid="`${title.toLowerCase()}-active-sidebar-btn`"
      :icon="'img:app-icons/menu/' + icon + '_active.svg'"
      :ripple="false"
      :to="to"
      align="left"
      class="nav-icons w-100"
      flat
      padding="none"
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
        class="text-size-lg font-weight-bold text-regular text-white ml-2"
      >
        {{ title }}
    </span>

      <slot name="icon" />
    </q-btn>

    <q-btn
      v-show="!isActive"
      :class="className"
      :data-testid="`${title.toLowerCase()}-no-active-sidebar-btn`"
      :icon="'img:app-icons/menu/' + icon + '_gray.svg'"
      :padding="padding"
      :ripple="false"
      :to="to"
      align="left"
      class="nav-icons w-100"
      flat
      @click="e => $emit('click', e)"
    >
      <slot name="badge" v-if="!isSidebarExpanded" />
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
        class="text-size-lg font-weight-bold text-regular text-menu-purple ml-2"
      >
        {{ title }}
        <slot name="badge-expanded" />
    </span>

      <slot name="icon" />
    </q-btn>
  </div>
</template>
<script>
import { allowedRoutes } from 'src/router/composables/useRolesSystem'

export default {
  // We double-render button with v-show just to load the icon, since q-btn loads icon too slow and sidebar "blinks"
  name: 'app-sidebar-nav-link',
  props: {
    to: { required: true, type: [Object, String] },
    icon: { required: true, type: String },
    isSidebarExpanded: { required: true, type: Boolean },
    title: { required: true, type: String },
    isActive: { required: true, type: Boolean },
    padding: { type: String, default: '10px 21px' },
    className: { type: Object }
  },
  computed: {
    computedTestId () {
      return `${this.title.toLowerCase()}-no-active-sidebar-btn`
    },

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
