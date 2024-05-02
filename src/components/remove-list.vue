<template>
  <confirm-dialog title="Remove List"
                  :isOpen="isRemoveListOpen"
                  id="remove-list-dialog"
                  @close="confirmClose">
    <div slot="content">
      <div class="text-left">
        <div class="text-dark">
          Are you sure you want to {{ clearable ? 'clear' : 'remove' }}
          <span class="font-weight-bold">{{ listName }}</span>?
        </div>
      </div>
    </div>

    <div slot="footer"
         class="w-100">
      <div class="d-flex w-100"
           v-if="clearable">
        <div class="flex-grow-1"/>

        <button class="btn btn-sm btn-danger mr-2"
                @click="onClearList">
          Clear List
        </button>
      </div>

      <div class="d-flex w-100"
           v-else>
        <div class="flex-grow-1"/>

        <button class="btn btn-sm btn-outline-dark mr-2"
                @click="onCancel">
          Cancel
        </button>

        <button class="btn btn-sm btn-danger mr-2"
                @click="onRemoveListOnly">
          Delete List
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
      'isRemoveListOpen',
      'listToRemove'
    ]),

    isContactsRoute () {
      if (this.$route.meta.title === 'Contacts') {
        return true
      }
      return false
    },

    listPath () {
      if (this.isContactsRoute) {
        return '/api/v2/contacts-list/'
      }
      return '/api/v2/power-dialer-lists/'
    },

    clearable () {
      return this.listToRemove.clear === true
    },

    listName () {
      return this.listToRemove.name || 'My Queue'
    }
  },

  data () {
    return {
      flagged: false
    }
  },

  watch: {
    isRemoveListOpen (isOpen) {
      if (isOpen) {
        this.flagged = false
        this.$bvModal.show('remove-list-dialog')
      } else {
        this.$bvModal.hide('remove-list-dialog')
      }
    }
  },

  methods: {
    ...mapActions('contacts', [
      'removeListClose',
      'removeListOpen',
      'foldersLoaded'
    ]),

    confirmClose () {
      if (!this.flagged) {
        this.removeListClose()
      }
    },

    onRemoveList () {
      return this.$axios
        .delete(`${this.listPath}${this.listToRemove.id}`)
        .then(() => {
          this.reloadFolders()
        })
        .catch((_err) => {
          this.$generalNotification('Unable to remove list.', 'error')
        })
        .finally(() => {
          this.removeListClose()
        })
    },

    reloadFolders (endpoint = '/api/v2/contact-folders') {
      return this.$axios
        .get(endpoint)
        .then((response) => response.data)
        .then((response) => {
          this.foldersLoaded(response)
          if (String(this.$route.params.id) === String(this.listToRemove.id)) {
            this.$router.history.replace('/contacts/')
          }
        })
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    },

    onClearList () {
      return this.$axios
        .post(`/api/v2/power-dialer-list-items/clear-tasks/${this.listToRemove.id}`)
        .then((response) => response.data)
        .then((response) => {
          this.$generalNotification(`${this.listToRemove.name} list items has been cleared!`, 'success')
        })
        .catch(() => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
        .finally(() => {
          this.reloadFolders('/api/v2/power-dialer-folders')
          this.removeListClose()
          this.$emit('on-clear-list')
        })
    },

    onRemoveListOnly () {
      this.showConfirmDialog()
    },

    showConfirmDialog () {
      this.flagged = true
      this.$bvModal.show('remove-list-confirmation-dialog')
      this.$bvModal.hide('remove-list-dialog')
    },

    onCancel () {
      this.$bvModal.hide('remove-list-dialog')
    }
  }
}
</script>
