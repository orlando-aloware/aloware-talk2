<template>
  <div class="contacts mx-0 content-row d-flex overflow-hidden h-100"
       v-if="authenticated">
    <div class="pt-0 pl-0 pr-0 mb-0 h-100 bordered-right contacts-left-sidebar"
         :class="sidebarClass">
      <contacts-sidebar></contacts-sidebar>
    </div>
    <div class="px-0 mb-0 main flex-1"
         :class="mainClass">
      <router-view></router-view>
    </div>
    <remove-folder-dialog v-if="isActive" />
    <column-headers v-if="isActive" />
    <remove-contact v-if="isActive" />
    <remove-contact-confirmation v-if="isActive" />
    <move-dialog v-if="isActive" />
    <create-list-modal v-if="isActive" />
    <select-list-modal v-if="isActive" />
    <remove-list-modal v-if="isActive" />
    <remove-list-confirmation v-if="isActive" />
  </div>
</template>

<script>
import ContactsSidebar from 'components/contacts/contacts-sidebar.vue'
import RemoveListModal from 'components/remove-list.vue'
import RemoveFolderDialog from 'components/remove-folder.vue'
import ColumnHeaders from 'components/column-headers.vue'
import RemoveContact from 'components/remove-contact.vue'
import RemoveContactConfirmation from 'components/remove-contact-confirmation.vue'
import MoveDialog from 'components/move-dialog.vue'
import CreateListModal from 'components/create-list-modal.vue'
import SelectListModal from 'components/select-list-modal'
import RemoveListConfirmation from 'components/remove-list-confirmation'
import { mapActions, mapGetters, mapState } from 'vuex'

export default {
  name: 'Contacts',

  components: {
    RemoveListConfirmation,
    SelectListModal,
    ContactsSidebar,
    RemoveListModal,
    RemoveFolderDialog,
    RemoveContact,
    RemoveContactConfirmation,
    ColumnHeaders,
    MoveDialog,
    CreateListModal
  },

  computed: {
    ...mapGetters('auth', ['authenticated']),
    ...mapState('contacts', ['showContactsListSidebar']),
    ...mapState(['isMobile']),
    mainClass () {
      if (!this.$q.screen.lt.md) {
        return ''
      }
      return !this.showContactsListSidebar ? 'w-100 no-min-max-width' : 'w-0'
    },
    sidebarClass () {
      if (!this.$q.screen.lt.md) {
        return ''
      }
      return !this.showContactsListSidebar ? 'w-0' : 'w-100 no-min-max-width'
    },
    isActive () {
      return this.$route.name === 'Contacts'
    }
  },

  mounted () {
    this.setShowContactsHeader(true)
    if (this.isMobile) {
      this.toggleSidebar()
    }
  },

  methods: {
    ...mapActions('contacts', [
      'setShowContactsListSidebar',
      'setShowContactsHeader',
      'setUnsavedList'
    ]),
    toggleSidebar () {
      this.setShowContactsListSidebar(false)
    }
  },

  watch: {
    $route (to, from) {
      if (to.name.includes('Contacts')) {
        if (from.name !== 'Contacts') {
          this.setUnsavedList(null)
        }
        this.setShowContactsHeader(true)
        this.setShowContactsListSidebar(false)
      }

      if (to.name === 'Contact' && this.$q.screen.lt.md) {
        this.setShowContactsHeader(false)
      }
    }
  }
}
</script>
