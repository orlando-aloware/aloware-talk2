<template>
  <router-link
    :to="'/power-dialer'"
    :key="item.id"
    v-if="item.name"
    v-slot="{ href, route, navigate, isActive, isExactActive }">
    <a
      :href="href"
      :class="[isActive && 'router-link-active', isExactActive && 'router-link-exact-active']"
      class="d-flex align-items-center item"
      @click="navigate">
      <div class="pr-3 flex-grow-1 item-name d-flex align-items-center">
        <ListIcon />
        <span class="pl-2">{{ item.name }}</span>
      </div>
      <div class="counts d-flex align-items-center">
        <div class="icon d-flex align-items-center">
          <AddUserIcon class="cursor-pointer" />
        </div>
        <b-badge class="t-badge t-badge__warning ml-2 text-white p-1">
          {{ item.count | fixCount }}
        </b-badge>
      </div>
    </a>
  </router-link>
</template>

<script>

import ListIcon from 'components/icons/list-icon'
import AddUserIcon from 'components/icons/add-user-icon'

export default {
  name: 'PowerDialerQueueListItem',
  props: {
    item: {
      type: Object
    }
  },
  components: {
    ListIcon,
    AddUserIcon
  }
}
</script>
