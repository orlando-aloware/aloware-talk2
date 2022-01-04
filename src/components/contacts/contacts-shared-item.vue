<template>
  <router-link :to="{ path: '/contacts/list/' + item.id, query : { type: 'public' }, meta : { type: 'public' }}"
               :key="item.id"
               v-slot="{ href, route, navigate, isActive, isExactActive }">
    <a :href="href"
       :class="[
            isActive && 'router-link-active',
            isExactActive && 'router-link-exact-active'
          ]"
       class="d-flex align-items-center item"
       @click="toggleSidebar(navigate, $event)">
      <div class="icon d-flex align-items-center">
        <folder-static-icon v-if="item.type === contactListType.STATIC"></folder-static-icon>
        <folder-dynamic-icon v-if="item.type === contactListType.DYNAMIC || !item.type"></folder-dynamic-icon>
      </div>
      <div class="pr-3 flex-grow-1 item-name d-flex align-items-center">
        <span>{{ item.name }}</span>
      </div>
    </a>
  </router-link>
</template>

<script>
import FolderStaticIcon from 'components/icons/folder-static-icon'
import FolderDynamicIcon from 'components/icons/folder-dynamic-icon'
import { DYNAMIC, STATIC } from 'src/constants/contacts-list-types'
import { mapActions } from 'vuex'

export default {
  name: 'contacts-shared-item',
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
  },
  methods: {
    ...mapActions('contacts', ['setShowContactsListSidebar']),
    toggleSidebar (callback, event) {
      callback(event)
      this.setShowContactsListSidebar(false)
    }
  }
}
</script>
