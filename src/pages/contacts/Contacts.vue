<template>
  <div class="contacts row mx-0 content-row d-flex overflow-hidden h-100"
       v-if="authenticated">
    <div class="col-2 pt-0 pl-0 pr-0 mb-0 h-100 bordered-right">
      <contacts-sidebar></contacts-sidebar>
    </div>
    <div class="col-10 px-0 mb-0 main">
      <router-view></router-view>
    </div>
    <remove-folder-dialog />
    <column-headers />
    <remove-contact />
    <remove-contact-confirmation />
    <move-dialog />
    <create-list-modal />
    <select-list-modal />
    <remove-list-modal />
    <remove-list-confirmation/>
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
import { mapGetters } from 'vuex'

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
    ...mapGetters('auth', ['authenticated'])
  }
}
</script>
