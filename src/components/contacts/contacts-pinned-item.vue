<template>
  <router-link :to="item.to"
               :key="item.id"
               v-if="item.name"
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
      <div class="counts d-flex align-items-center">
        <b-badge pill variant="light text-muted">{{ listCount | fixCount }}</b-badge>
      </div>
    </a>
  </router-link>
</template>

<script>
import FolderStaticIcon from 'components/icons/folder-static-icon'
import FolderDynamicIcon from 'components/icons/folder-dynamic-icon'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { mapActions, mapGetters, mapState } from 'vuex'
import { isNaN } from 'lodash'

export default {
  name: 'contacts-pinned-item',
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
    ...mapState('contacts', [
      'unsavedList'
    ]),
    ...mapGetters('contacts', [
      'selectedList'
    ]),
    listCount () {
      let listCount = 0

      if (this.id === this.item.id) {
        listCount = this.item.count !== this.selectedList.contactCount ? this.selectedList.contactCount : this.item.count
      } else {
        listCount = this.item.count
      }

      return !isNaN(listCount) ? listCount : 0
    },
    id () {
      if (['Contacts List', 'Public Contacts List', 'Default Contacts List'].includes(this.$route.meta.page)) {
        return this.$route.params.id
      } else if (['power-dialer', 'power-dialer-queue-filter'].includes(this.$route.meta.id)) {
        return this.$route.params.id
      } else if (['power-dialer-session', 'power-dialer-list', 'power-dialer-list-filter'].includes(this.$route.meta.id)) {
        return this.$route.params.id
      }

      if (this.$route.name !== 'Contacts' && this.$route.name !== 'Power Dialer') {
        return null
      }

      return 'all'
    }
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
