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
          !Are you sure you want to remove
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
import ConfirmDialog from 'components/confirm-dialog.vue'

import { mapActions, mapGetters } from 'vuex'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import talk2Api from 'src/plugins/api/api'

export default {
  props: {
    isContactModuleType: {
      type: Boolean,
      default: true
    }
  },
  components: {
    ConfirmDialog
  },
  computed: {
    ...mapGetters('contacts', [
      'isRemoveFolderOpen',
      'folderToRemove',
      'removedFolder'
    ])
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
    ...mapActions('contacts', [
      'removeFolderClose',
      'removeFolderItem',
      'resetRemovedFolders',
      'foldersLoaded'
    ]),
    onConfirmRemove () {
      if (this.isRemoving) return
      this.isRemoving = true
      return Promise.all([this.removeFolderRequest(this.folderToRemove.id)])
        .then(() => {
          this.removeFolderItem(this.folderToRemove.id)
          this.$generalNotification('Folder was successfully deleted')
        })
        .finally(() => {
          this.reloadFoldersRequest()
          this.removeFolderClose()
          this.isRemoving = false
        })
    },
    removeFolderRequest (id) {
      if (this.isContactModuleType) {
        return talk2Api.V2.contactFolders.delete(id)
          .catch((error) => {
            const { message, html } = extractErrorMessage(error)
            console.log(html)
            this.$generalNotification(message, 'error')
          })
      } else {
        return talk2Api.V2.powerDialerFolders.delete(id)
          .catch((error) => {
            const { message, html } = extractErrorMessage(error)
            console.log(html)
            this.$generalNotification(message, 'error')
          })
      }
    },
    reloadFoldersRequest () {
      if (this.isContactModuleType) {
        return talk2Api.V2.contactFolders.list()
          .then((response) => response.data)
          .then(this.foldersLoaded)
          .catch((_err) => {
            this.$generalNotification('Unable to load folders please try again.', 'error')
          })
      } else {
        return talk2Api.V2.powerDialerFolders.list()
          .then((response) => response.data)
          .then(this.foldersLoaded)
          .catch((_err) => {
            this.$generalNotification('Unable to load folders please try again.', 'error')
          })
      }
    }
  }
}
</script>
