<template>
  <router-link
    :to="item.to"
    :key="item.id"
    v-slot="{ href, route, navigate, isActive, isExactActive }"
  >
    <a
      :href="href"
      @click="navigate"
      class="d-flex align-items-center item"
      :class="[
            isActive && 'router-link-active',
            isExactActive && 'router-link-exact-active'
          ]"
    >
      <div class="px-2 icon">
        <folder-static-icon
          v-if="item.type === contactListType.STATIC"
        ></folder-static-icon>
        <folder-dynamic-icon
          v-if="item.type === contactListType.DYNAMIC || !item.type"
        ></folder-dynamic-icon>
      </div>
      <div class="pr-3 flex-grow-1">{{ item.name }}</div>
      <div class="pr-2">
        <b-badge pill variant="light text-muted">{{
            item.count | fixCount
          }}</b-badge>
      </div>
    </a>
  </router-link>
</template>

<script>
import FolderStaticIcon from 'components/icons/folder-static-icon'
import FolderDynamicIcon from 'components/icons/folder-dynamic-icon'
import {
  STATIC,
  DYNAMIC
} from 'src/constants/contacts-list-types'

export default {
  name: 'contacts-pinned-item',
  components: { FolderDynamicIcon, FolderStaticIcon },
  data () {
    return {
      loading: false,
      contactListType: { STATIC, DYNAMIC }
    }
  },
  props: {
    item: {
      type: Object
    }
  }
}
</script>

<style scoped>

</style>
