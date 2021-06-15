<template>
  <confirm-dialog
    id="remove-list-confirmation-dialog"
    :title="title"
    @close="removeListClose"
  >
    <div slot="content">
      <div class="text-left">
        <div class="text-dark">
          Type the name of the list below to delete
          <input type="text"
                 class="form-control form-control-search"
                 :placeholder="listToRemove.name"
                 v-model="listName"/>
        </div>
      </div>
    </div>
    <div slot="footer" class="w-100">
      <div class="d-flex w-100">
        <div class="flex-grow-1"></div>
        <button
          class="btn btn-sm btn-outline-dark mr-2"
          @click="onCancel"
        >
          Cancel
        </button>
        <button class="btn btn-sm btn-danger mr-2"
                :disabled="(listName !== listToRemove.name) || isBusy"
                @click="onConfirm">
          <b-spinner variant="warning"
                     type="grow"
                     label="Spinning"
                     small
                     v-if="isBusy">
          </b-spinner>
          Delete
        </button>
      </div>
    </div>
  </confirm-dialog>
</template>

<script>
import ConfirmDialog from 'src/pages/contacts/_components/confirm-dialog.vue'
import { mapActions, mapGetters } from 'vuex'
import { LIST_ONLY, LIST_AND_CONTACT } from 'src/constants/remove-list-action-types'

export default {
  components: {
    ConfirmDialog
  },
  computed: {
    ...mapGetters('contacts', ['removeListActionType', 'selectedList', 'listToRemove', 'isRemoveListOpen', 'folders', 'pinnedLists', 'pinned']),
    title () {
      return `Delete ${this.listToRemove.name} ?`
    }
  },
  data () {
    return {
      isBusy: false,
      listName: null,
      ActionTypes: { LIST_ONLY, LIST_AND_CONTACT }
    }
  },
  watch: {
    isRemoveListOpen (isOpen) {
      if (isOpen) {
        this.listName = null
        this.$bvModal.show('remove-list-dialog')
      } else {
        this.$bvModal.hide('remove-list-dialog')
      }
    }
  },
  methods: {
    ...mapActions('contacts', ['removeListClose', 'foldersLoaded', 'listPinToggled']),
    onCancel () {
      this.removeListClose()
      this.$bvModal.hide('remove-list-confirmation-dialog')
    },
    handleDeletion (params) {
      this.isBusy = true
      return window.axios
        .delete(`/api/v2/contacts-list/${this.listToRemove.id}`, { params })
        .then(() => {
          this.$q.notify({
            message: 'Contact list was successfully removed.',
            type: 'positive',
            textColor: 'white'
          })
          this.removeListFromFolders(this.listToRemove.id, this.folders)
          this.removeListFromPinned(this.listToRemove.id)
          // if current route is equals to list page being deleted then redirect to all contacts
          if (this.$router.history.current.path === `/contacts/list/${this.listToRemove.id}`) {
            this.$router.push('/contacts')
          }
        })
        .catch((_err) => {
          this.$q.notify({
            message: 'Unable to remove contacts please try again.',
            type: 'negative',
            textColor: 'white'
          })
        }).finally(() => {
          this.isBusy = false
          this.removeListClose()
          this.$bvModal.hide('remove-list-confirmation-dialog')
        })
    },
    onConfirm () {
      this.handleDeletion({ deletion_type: this.removeListActionType })
    },
    removeListFromFolders (id, haystack) {
      for (let i = 0; i < haystack.length; i++) {
        let list = haystack[i].lists.find(list => list.id === id)

        if (list) {
          haystack[i].lists.splice(haystack[i].lists.indexOf(list), 1)
        } else {
          this.removeListFromFolders(id, haystack[i].child_folders)
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
      window.axios
        .get('/api/v2/contact-folders')
        .then((response) => response.data)
        .then(this.foldersLoaded)
        .catch((err) => {
          console.error(err)
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
