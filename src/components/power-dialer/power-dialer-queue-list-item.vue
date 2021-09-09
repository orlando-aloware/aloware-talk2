<template>
  <router-link
    :to="item.to"
    :key="item.id"
    v-slot="{ href, route, navaigate, isActive, isExactActive }">
    <a
      href="/"
      :class="[
        isActive && 'router-link-active',
        isExactActive && 'router-link-exact-active'
      ]"
      class="d-flex align-items-center item"
      @click="{}">
      <div class="px-2 icon">
        <FolderStaticIcon />
        <FolderDynamicIcon />
      </div>
      <div class="pr-3 flex-grow-1 item-name">{{ item.name }}</div>
      <div class="pr-2">
        <b-badge pill variant="light text-muted">{{ item.count }}</b-badge>
      </div>
    </a>
  </router-link>
</template>

<script>

import FolderStaticIcon from 'components/icons/folder-static-icon'
import FolderDynamicIcon from 'components/icons/folder-dynamic-icon'

export default {
  name: 'PowerDialerQueueListItem',
  props: {
    item: {
      type: Object
    }
  },
  components: {
    FolderStaticIcon,
    FolderDynamicIcon
  }
}
</script>
