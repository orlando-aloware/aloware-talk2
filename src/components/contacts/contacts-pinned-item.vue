<template>
  <router-link :to="item.to"
               :key="item.id"
               v-slot="{ href, route, navigate, isActive, isExactActive }">
    <a :href="href"
       :class="[
            isActive && 'router-link-active',
            isExactActive && 'router-link-exact-active'
          ]"
       class="d-flex align-items-center item"
       @click="navigate">
      <div class="px-2 icon d-flex align-items-center">
        <folder-static-icon v-if="item.type === contactListType.STATIC"></folder-static-icon>
        <folder-dynamic-icon v-if="item.type === contactListType.DYNAMIC || !item.type"></folder-dynamic-icon>
      </div>
      <div class="pr-3 flex-grow-1 item-name d-flex align-items-center">{{ item.name }}</div>
      <div class="pr-2 counts d-flex align-items-center">
        <b-badge pill variant="light text-muted">{{ item.count | fixCount }}</b-badge>
      </div>
    </a>
  </router-link>
</template>

<script>
import FolderStaticIcon from 'components/icons/folder-static-icon'
import FolderDynamicIcon from 'components/icons/folder-dynamic-icon'
import { DYNAMIC, STATIC } from 'src/constants/contacts-list-types'

export default {
  name: 'contacts-pinned-item',
  components: {
    FolderDynamicIcon,
    FolderStaticIcon
  },
  data () {
    return {
      loading: false,
      contactListType: {
        STATIC,
        DYNAMIC
      }
    }
  },
  props: {
    item: {
      type: Object
    }
  }
}
</script>

<style lang="scss" scoped>
.item-name {
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
}
</style>
