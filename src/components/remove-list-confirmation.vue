<template>
  <confirm-dialog id="remove-list-confirmation-dialog"
                  :title="title"
                  @close="removeListClose">
    <div slot="content">
      <div class="text-left">
        <div class="text-dark">
          Type the name of the list below to delete
          <input class="form-control form-control-search"
                 type="text"
                 :placeholder="listToRemove.name"
                 v-model="listName"/>
        </div>
      </div>
    </div>
    <div slot="footer"
         class="w-100">
      <div class="d-flex w-100">
        <div class="flex-grow-1"></div>
        <button class="btn btn-sm btn-outline-dark mr-2"
                @click="onCancel">
          Cancel
        </button>
        <button class="btn btn-sm btn-danger mr-2"
                :disabled="(listName !== listToRemove.name) || isBusy"
                @click="onConfirm">
          <q-spinner-bars color="white"
                          v-if="isBusy" />
          Delete
        </button>
      </div>
    </div>
  </confirm-dialog>
</template>

<script>
import ConfirmDialog from 'components/confirm-dialog.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  components: {
    ConfirmDialog
  },

  computed: {
    ...mapGetters('contacts', [
      'selectedList',
      'listToRemove',
      'isRemoveListOpen',
      'folders',
      'pinnedLists',
      'pinned'
    ]),

    ...mapGetters('powerDialer', [
      'activeFilter'
    ]),

    title () {
      return `Delete ${this.listToRemove.name} list?`
    },

    isContactModule () {
      if (this.$route.name === 'Contacts') {
        return true
      }

      return false
    },

    listEndpoint () {
      if (this.isContactModule) {
        return '/api/v2/contacts-list'
      }

      return '/api/v2/power-dialer-lists'
    },

    foldersEndpoint () {
      if (this.isContactModule) {
        return '/api/v2/contact-folders'
      }

      return '/api/v2/power-dialer-folders'
    },

    test () {
      return this.$route
    }
  },

  data () {
    return {
      isBusy: false,
      listName: null
    }
  },

  watch: {
    isRemoveListOpen (isOpen) {
      if (isOpen) {
        this.listName = null
        this.$bvModal.show('remove-list-dialog')

        return
      }

      this.$bvModal.hide('remove-list-dialog')
    }
  },

  methods: {
    ...mapActions('contacts', [
      'removeListClose',
      'foldersLoaded',
      'listPinToggled'
    ]),

    onCancel () {
      this.removeListClose()
      this.$bvModal.hide('remove-list-confirmation-dialog')
    },

    handleDeletion () {
      this.isBusy = true

      return this.$axios
        .delete(`${this.listEndpoint}/${this.listToRemove.id}`)
        .then(() => {
          this.$generalNotification('List has been successfully removed.')
          this.removeListFromFolders(this.listToRemove.id, this.folders)
          this.removeListFromPinned(this.listToRemove.id)
          this.refreshFoldersList()

          // if current route is equals to list page being deleted then redirect to all contacts
          if (this.$route.name === 'Contacts' &&
            this.$route.path === `/contacts/list/${this.listToRemove.id}`) {
            this.$router.push('/contacts/')

            return
          }

          if (this.$route.path === `/power-dialer/list/${this.listToRemove.id}/${this.activeFilter}`) {
            this.$router.push('/power-dialer/in-queue')
          }
        })
        .catch((_err) => {
          this.$generalNotification('Unable to remove contacts please try again.', 'error')
        }).finally(() => {
          this.isBusy = false
          this.removeListClose()
          this.$bvModal.hide('remove-list-confirmation-dialog')
        })
    },

    onConfirm () {
      this.handleDeletion()
    },

    removeListFromFolders (id, haystack) {
      let list = {}

      for (let i = 0; i < haystack.length; i++) {
        list = haystack[i].lists.find(item => item.id === id)

        if (list) {
          haystack[i].lists.splice(haystack[i].lists.indexOf(list), 1)
        } else {
          this.removeListFromFolders(id, haystack[i].child_folders)
          return
        }
      }

      this.foldersLoaded(this.folders)
    },

    removeListFromPinned (id) {
      if (this.pinned.includes(id)) {
        const isPinned = false

        this.listPinToggled({
          id: id,
          isPinned
        })
      }
    },

    refreshFoldersList () {
      this.$axios
        .get(this.foldersEndpoint)
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((err) => {
          console.error(err)
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    }
  }
}
</script>
