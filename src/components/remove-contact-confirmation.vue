<template>
  <confirm-dialog
    id="remove-contact-confirmation-dialog"
    :title="title"
    @close="removeContactClose"
    @hide="onHide"
    @shown="onShown"
  >
    <div slot="content">
      <div class="text-left">
        <div class="text-dark">
          Type the number of contacts below to delete
          <input type="text"
                 class="form-control form-control-search"
                 ref="contactsToDeleteInput"
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
                :disabled="(contactsToDelete !== contactToDeleteCount.toString()) || isBusy"
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
import _ from 'lodash'
import ConfirmDialog from 'components/confirm-dialog.vue'
import { mapActions, mapGetters } from 'vuex'
import * as ContactsListRemoveFromTypes from 'src/constants/contacts-list-remove-from-types'
import { DEFAULT_LIST_ITEMS } from 'src/constants/power-dialer/default-list-items'

export default {
  components: {
    ConfirmDialog
  },
  computed: {
    ...mapGetters('contacts', [
      'contactToRemove',
      'selectedContacts',
      'removeContactActionType',
      'selectedList',
      'isBulkDelete',
      'listItems'
    ]),
    title () {
      return `Delete ${this.contactToDeleteCount} contact` + ((this.contactToDeleteCount > 1) ? `s` : ``) + `?`
    },
    contactToDeleteCount () {
      if (this.contactToRemove) {
        return 1
      }

      if (this.selectedContacts[this.listId]) {
        return this.selectedContacts[this.listId]?.length
      }

      return 0
    },
    isContactsRoute () {
      return this.$route.meta.title === 'Contacts'
    },
    endpointForList () {
      if (this.isContactsRoute) {
        return 'contact-list-item'
      }
      return 'power-dialer-list-items'
    },
    defaultListItems () {
      return DEFAULT_LIST_ITEMS
    },
    listId () {
      return this.selectedList.name === 'My Queue' ? 'my-queue' : this.selectedList.id
    },
    currentList () {
      return this.listItems[this.selectedList.id]
    }
  },
  data () {
    return {
      isBusy: false,
      contactsToDelete: null,
      ContactsListRemoveFromTypes
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
    ...mapActions('contacts', [
      'removeContactClose',
      'setShouldUpdateSelectedListContactCount',
      'contactsLoaded'
    ]),
    onCancel () {
      this.removeContactClose()
      this.$bvModal.hide('remove-contact-confirmation-dialog')
    },
    onHide () {
      this.contactsToDelete = null
    },
    onShown () {
      this.$refs.contactsToDeleteInput.focus()
    },
    handleSingleDeletion () {
      const url = { data: null }
      switch (this.removeContactActionType) {
        case ContactsListRemoveFromTypes.REMOVE_FROM_LIST_ONLY:
          url.data = `/api/v2/${this.endpointForList}/` +
            this.selectedList.id +
            '/items/' +
            this.contactToRemove.id
          break
        case ContactsListRemoveFromTypes.REMOVE_FROM_CONTACTS:
          const contactId = _.get(this.contactToRemove, 'id', null)

          if (!contactId || contactId === 'undefined') {
            console.log('Failed to remove contact: Missing contact id!')
            return
          }

          url.data = `/api/v2/contacts/${contactId}`
          break
      }

      this.isBusy = true
      return this.$axios
        .delete(
          url.data
        )
        .then(() => {
          this.$VueEvent.fire('fetchContacts', { clear: true })
          this.$VueEvent.fire('shouldUpdateListCount')
          this.$generalNotification('Contact was successfully removed.')
        })
        .catch((_err) => {
          this.$generalNotification('Unable to remove contact please try again.', 'error')
        }).finally(() => {
          this.isBusy = false
          this.contactsToDelete = null
          this.$bvModal.hide('remove-contact-confirmation-dialog')
          this.contactsLoaded({
            id: this.selectedList.id || 'all',
            append: false,
            ...this.currentList
          })
        })
    },
    handleBulkDeletion () {
      const url = { data: null }
      switch (this.removeContactActionType) {
        case ContactsListRemoveFromTypes.REMOVE_FROM_LIST_ONLY:
          url.data = `/api/v2/${this.endpointForList}/bulk/${this.selectedList.id}`
          break
        case ContactsListRemoveFromTypes.REMOVE_FROM_CONTACTS:
          url.data = `/api/v2/contacts/bulk-delete`
          break
      }
      this.isBusy = true
      const ids = this.selectedContacts[this.listId].map(contact => this.isContactsRoute ? contact.id : contact.contact_list_item_id)
      const params = this.isContactsRoute ? { contacts: ids } : { contact_list_items: ids }
      return this.$axios
        .delete(url.data, { params: params })
        .then(() => {
          this.$emit('contactsRemoved', this.selectedList)
          this.$generalNotification('Contacts were successfully removed.')
        })
        .catch((_err) => {
          this.$generalNotification('Unable to remove contacts please try again.', 'error')
        }).finally(() => {
          this.contactsToDelete = null
          this.isBusy = false
          this.removeContactClose()
          this.$bvModal.hide('remove-contact-confirmation-dialog')
        })
    },
    onConfirm () {
      if (this.contactToRemove && !this.isBulkDelete) {
        this.handleSingleDeletion()
      }

      if (Object.keys(this.selectedContacts).length !== 0 && this.selectedContacts[this.selectedList.id].constructor !== Object && this.isBulkDelete) {
        this.handleBulkDeletion()
      }
    }
  }
}
</script>
