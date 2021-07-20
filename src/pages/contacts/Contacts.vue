<template>
  <div class="row mx-0 overflow-auto content-row pl-lg-5 ml-lg-2 q-px-xs-md">
    <div class="col-lg-2 px-0 pl-lg-2 pr-lg-3 mb-3">
      <contacts-sidebar></contacts-sidebar>
    </div>
    <div class="col-lg-10 px-0 pr-lg-3 mb-3 main">
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
  }
}
</script>

<style lang="scss">
  .content-row {
    height: auto !important;
  }
</style>
