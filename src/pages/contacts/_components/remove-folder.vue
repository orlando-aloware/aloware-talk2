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
        <button class="btn btn-sm btn-danger mr-2" @click="onConfirmRemove">
          Remove
        </button>
      </div>
    </div>
  </confirm-dialog>
</template>

<script>
import ConfirmDialog from 'src/pages/contacts/_components/confirm-dialog.vue'

import { mapActions, mapGetters } from 'vuex'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'

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
  data () {
    return {
      isRemoving: false
    }
  },
  methods: {
    ...mapActions('contacts', ['removeFolderClose', 'foldersLoaded']),
    onConfirmRemove () {
      if (this.isRemoving) return
      this.isRemoving = true
      return Promise.all([
        this.removeFolderRequest(this.folderToRemove.id),
        this.reloadFoldersRequest()
      ]).finally(() => {
        this.removeFolderClose()
        this.isRemoving = false
      }).then(() => {
        this.$q.notify({
          message: 'Folder was successfully deleted',
          type: 'positive',
          textColor: 'white'
        })
      })
    },
    removeFolderRequest (id) {
      return window.axios
        .delete('/api/v2/contact-folders/' + id)
        .catch((error) => {
          const { message, html } = extractErrorMessage(error)
          this.$q.notify({
            message,
            type: 'negative',
            textColor: 'white',
            html
          })
        })
    },
    reloadFoldersRequest () {
      return window.axios
        .get('/api/v2/contact-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((_err) => {
          this.$q.notify({
            message: 'Unable to load folders please try again.',
            type: 'negative',
            textColor: 'white',
            actions: [
              {
                icon: 'close'
              }
            ]
          })
        })
    }
  }
}
</script>
