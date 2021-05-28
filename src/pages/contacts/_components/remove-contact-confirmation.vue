<template>
  <confirm-dialog
    id="remove-contact-confirmation-dialog"
    :title="title"
    @close="removeContactClose"
  >
    <div slot="content">
      <div class="text-left">
        <div class="text-dark">
          Type the number of contacts below to delete
          <input type="text"
                 class="form-control form-control-search"
                 :placeholder="contactToDeleteCount"
                 v-model="contactsToDelete"/>
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
                :disabled="contactsToDelete != contactToDeleteCount"
                @click="onConfirm">
          Delete
        </button>
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
    ...mapGetters('contacts', ['contactToRemove', 'selectedContacts', 'removeContactActionType', 'selectedList']),
    title () {
      return `Delete ${this.contactToDeleteCount} contact` + ((this.contactToDeleteCount > 1) ? `s` : ``) + `?`
    },
    contactToDeleteCount () {
      if (this.contactToRemove) {
        return 1
      }

      if (this.selectedContacts[this.selectedList.id]) {
        return this.selectedContacts[this.selectedList.id].length
      }

      return 0
    }
  },
  data () {
    return {
      contactsToDelete: null
    }
  },
  watch: {
    isRemoveContactOpen (isOpen) {
      if (isOpen) {
        this.$bvModal.show('remove-contact-dialog')
      } else {
        this.$bvModal.hide('remove-contact-dialog')
      }
    }
  },
  methods: {
    ...mapActions('contacts', ['removeContactClose']),
    onCancel () {
      this.removeContactClose()
      this.$bvModal.hide('remove-contact-confirmation-dialog')
    },
    handleSingleDeletion () {
      let url = null
      switch (this.removeContactActionType) {
        case 'remove_from_list':
          url = '/api/v1/contact-list-item/' +
            this.selectedList.id +
            '/items/' +
            this.contactToRemove.id
          break
        case 'remove_from_contacts':
          url = `/api/v1/contact/${this.contactToRemove.id}`
          break
      }
      return window.axios
        .delete(
          url
        )
        .then(() => {
          this.$q.notify({
            message: 'Contact was successfully removed.',
            type: 'positive',
            textColor: 'white'
          })
        })
        .catch((_err) => {
          this.$q.notify({
            message: 'Unable to remove contact please try again.',
            type: 'negative',
            textColor: 'white'
          })
        }).finally(() => this.$bvModal.hide('remove-contact-confirmation-dialog'))
    },
    handleBulkDeletion () {
      let url = null
      switch (this.removeContactActionType) {
        case 'remove_from_list':
          url = `/api/v1/contact-list-item/bulk/${this.selectedList.id}`
          break
        case 'remove_from_contacts':
          url = `/api/v1/contact/bulk`
          break
      }
      return window.axios
        .delete(url, { params: { contacts: this.selectedContacts[this.selectedList.id] } })
        .then(() => {
          this.$q.notify({
            message: 'Contacts was successfully removed.',
            type: 'positive',
            textColor: 'white'
          })
        })
        .catch((_err) => {
          this.$q.notify({
            message: 'Unable to remove contacts please try again.',
            type: 'negative',
            textColor: 'white'
          })
        }).finally(() => {
          this.removeContactClose()
          this.$bvModal.hide('remove-contact-confirmation-dialog')
        })
    },
    onConfirm () {
      if (this.contactToRemove) {
        this.handleSingleDeletion()
      }

      if (Object.keys(this.selectedContacts).length !== 0 && this.selectedContacts[this.selectedList.id].constructor !== Object) {
        this.handleBulkDeletion()
      }
    }
  }
}
</script>
