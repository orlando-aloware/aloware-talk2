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
       @click="toggleSidebar($event, route)">
      <div class="icon d-flex align-items-center">
        <folder-static-icon v-if="item.type === ContactListTypes.STATIC"></folder-static-icon>
        <folder-dynamic-icon v-if="item.type === ContactListTypes.DYNAMIC || !item.type"></folder-dynamic-icon>
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
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'contacts-shared-item',
  components: {
    FolderDynamicIcon,
    FolderStaticIcon
  },
  data () {
    return {
      loading: false,
      ContactListTypes
    }
  },
  props: {
    item: {
      type: Object
    }
  },
  computed: {
    ...mapState('contacts', ['unsavedList'])
  },
  methods: {
    ...mapActions('contacts', ['setShowContactsListSidebar', 'setUnsavedList']),
    toggleSidebar (event, route) {
      event.preventDefault()
      if (this.unsavedList) {
        this.$bvModal.msgBoxConfirm('You have an unsaved contact list. This action may caused unsaved contact list data loss. Do you wish to continue?', {
          buttonSize: 'sm',
          okTitle: 'Yes',
          cancelTitle: 'No',
          centered: true
        }).then(confirm => {
          if (confirm) {
            this.handleToggleSidebar(route)
          }
        })
      } else {
        this.handleToggleSidebar(route)
      }
    },

    handleToggleSidebar (route) {
      this.setUnsavedList(null)
      this.setShowContactsListSidebar(false)
      this.$router.push({
        path: route.path
      })
    }
  }
}
</script>
