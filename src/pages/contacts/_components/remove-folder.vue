<template>
  <confirm-dialog
    title="Remove Folder"
    :isOpen="isRemoveFolderOpen"
    id="remove-folder-dialog"
    @close="removeFolderClose"
  >
    <div slot="content">
      <div class="text-left">
        <div class="text-dark">
          Are you sure you want to remove
          <span class="font-weight-bold">{{ folderToRemove.name }}</span
          >? Please be reminded that this will also delete its contents such as
          subfolders, lists and contacts.
        </div>
      </div>
    </div>
    <div slot="footer" class="w-100">
      <div class="d-flex w-100">
        <div class="flex-grow-1"></div>
        <button
          class="btn btn-sm btn-outline-dark mr-2"
          @click="removeFolderClose"
        >
          Cancel
        </button>
        <button class="btn btn-sm btn-danger mr-2">Remove</button>
      </div>
    </div>
  </confirm-dialog>
</template>

<script>
import ConfirmDialog from 'src/pages/contacts/_components/confirm-dialog.vue'

import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    ConfirmDialog
  },
  computed: {
    ...mapGetters('contacts', ['isRemoveFolderOpen', 'folderToRemove'])
  },
  watch: {
    isRemoveFolderOpen (isOpen) {
      if (isOpen) {
        this.$bvModal.show('remove-folder-dialog')
      } else {
        this.$bvModal.hide('remove-folder-dialog')
      }
    }
  },
  methods: {
    ...mapActions('contacts', ['removeFolderClose'])
  }
}
</script>
