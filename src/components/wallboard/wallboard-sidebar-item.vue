<template>
  <router-link :class="['wallboard__sidebar__item', { 'wallboard__sidebar__item--active': active }]"
               :to="{ path: route }">
    <span class="wallboard__sidebar__item__icon">
      <component :is="icon"/>
    </span>
    <span class="wallboard__sidebar__item__name">{{ name }}</span>
    <span class="wallboard__sidebar__item__action">
      <slot name="action"
            v-if="!loading"/>
      <q-spinner-tail size="12px"
                      color="blue"
                      v-else/>
    </span>
  </router-link>
</template>

<script>
import WallboardAgentsIcon from 'src/components/icons/wallboard/agents-icon.vue'
import WallboardOverviewIcon from 'src/components/icons/wallboard/overview-icon.vue'
import WallboardLiveCallIcon from 'src/components/icons/wallboard/live-call-icon.vue'
import WallboardParkedCallIcon from 'src/components/icons/wallboard/parked-call-icon.vue'
import WallboardQueuedCallIcon from 'src/components/icons/wallboard/queued-call-icon.vue'

export default {
  name: 'wallboard-sidebar-item',

  components: {
    WallboardAgentsIcon,
    WallboardOverviewIcon,
    WallboardLiveCallIcon,
    WallboardParkedCallIcon,
    WallboardQueuedCallIcon
  },

  props: {
    name: {
      type: String,
      required: true
    },

    icon: {
      type: String,
      required: true
    },

    route: {
      type: String,
      required: true
    },

    loading: {
      type: Boolean,
      required: false,
      default: false
    },

    active: {
      type: Boolean,
      default: false
    }
  }
}
</script>
