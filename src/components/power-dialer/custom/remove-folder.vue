<template>
  <ConfirmDialog
    title="Remove Folder"
    :isOpen="isRemoveFolderOpen"
    id="t-remove-folder-dialog"
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
  </ConfirmDialog>
</template>

<script>

import ConfirmDialog from 'components/confirm-dialog.vue'

import { mapActions, mapGetters } from 'vuex'
// import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
// import talk2Api from 'src/plugins/api/api'

export default {
  components: {
    ConfirmDialog
  },
  computed: {
    ...mapGetters('powerDialer', ['isRemoveFolderOpen', 'folderToRemove'])
  },
  watch: {
    isRemoveFolderOpen (isOpen) {
      if (isOpen) {
        this.$bvModal.show('t-remove-folder-dialog')
      } else {
        this.$bvModal.hide('t-remove-folder-dialog')
      }
    }
  },
  data () {
    return {
      isRemoving: false
    }
  },
  methods: {
    ...mapActions('powerDialer', ['removeFolderClose', 'foldersLoaded']),
    onConfirmRemove () {
      if (this.isRemoving) return
      this.isRemoving = true
      this.isRemoving = false
      this.removeFolderClose()
      // return Promise.all([
      //   this.removeFolderRequest(this.folderToRemove.id)
      // ]).finally(() => {
      //   this.reloadFoldersRequest()
      //   this.removeFolderClose()
      //   this.isRemoving = false
      // }).then(() => {
      //   this.$generalNotification('Folder was successfully deleted')
      // })
    },
    removeFolderRequest (id) {
      console.log('Calling API...', id)
      // return talk2Api.V2.contactFolders.delete(id)
      //   .catch((error) => {
      //     const { message, html } = extractErrorMessage(error)
      //     console.log(html)
      //     this.$generalNotification(message, 'error')
      //   })
    },
    reloadFoldersRequest () {
      console.log('Calling API...')
      // return talk2Api.V2.contactFolders.list()
      //   .then((response) => response.data)
      //   .then(this.foldersLoaded)
      //   .catch((_err) => {
      //     this.$generalNotification('Unable to load folders please try again.', 'error')
      //   })
    }
  }
}
</script>
