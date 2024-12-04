<template>
  <confirm-dialog id="remove-contact-confirmation-dialog"
                  :title="confirmationInputString + ' Contact Confirmation'"
                  :is-busy="isBusy"
                  @close="onClose"
                  @hide="onHide"
                  @shown="onShown">
    <div slot="content">
      <div class="text-left"
           v-html="message"/>
      <div class="text-left">
        <div class="text-dark py-2" v-if="isDeleteContactConfirmation">
          Type "{{ confirmationInputString }}" here to confirm.
          <input ref="contactsToDeleteInput"
                 class="form-control form-control-search my-2"
                 type="text"
                 :placeholder="confirmationInputString"
                 v-model="typedConfirmationInputString" />
        </div>
      </div>
    </div>
    <div slot="footer"
         class="w-100">
      <div class="d-flex w-100">
        <div class="flex-grow-1"/>
        <button class="btn btn-sm btn-outline-dark mr-2"
                :disabled="isBusy"
                @click="onCancel">
          Cancel
        </button>
        <button class="btn btn-sm btn-danger mr-2"
                :disabled="disablesConfirmButton"
                @click="onConfirm">
          <b-spinner variant="warning"
                     type="grow"
                     label="Spinning"
                     small
                     v-if="isBusy">
          </b-spinner>
          {{ confirmationInputString  }}
        </button>
      </div>
    </div>
  </confirm-dialog>
</template>

<script>
import { chunk, get, isEmpty } from 'lodash'
import ConfirmDialog from 'components/confirm-dialog.vue'
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import * as ContactsListRemoveFromTypes from 'src/constants/contacts-list-remove-from-types'
import { DEFAULT_LIST_ITEMS } from 'src/constants/power-dialer/default-list-items'
import { STATIC } from 'src/constants/contacts-list-types'

export default {
  inject: [
    'selectedContacts'
  ],

  components: {
    ConfirmDialog
  },

  props: {
    selectedCount: {
      type: Number,
      default: 0
    }
  },

  computed: {
    ...mapGetters('contacts', [
      'contactToRemove',
      'removeContactActionType',
      'selectedList',
      'isBulkDelete',
      'listItems',
      'isAllContactsSelected'
    ]),

    ...mapState('contacts', [
      'currentListFilters'
    ]),

    ...mapState([
      'isDatatableSelectedAll'
    ]),

    ...mapState('cache', ['currentCompany']),

    message () {
      const formattedContactToDeleteCount = this.$options.filters.numFormat(this.contactToDeleteCount)
      const formattedContactWord = ` contact` + ((this.contactToDeleteCount > 1) ? `s` : ``)
      let message = null
      switch (this.removeContactActionType) {
        case ContactsListRemoveFromTypes.REMOVE_FROM_LIST_ONLY:
          message = `remove ${formattedContactToDeleteCount}` + formattedContactWord + ` from the list?`
          break
        case ContactsListRemoveFromTypes.REMOVE_FROM_CONTACTS:
          message = `delete ${formattedContactToDeleteCount}` + formattedContactWord + `?`
      }
      return 'Are you sure you want to ' + message
    },

    disablesConfirmButton () {
      if (this.isBusy) {
        return true
      }

      if (this.isDeleteContactConfirmation &&
        this.confirmationInputString !== this.typedConfirmationInputString) {
        return true
      }
      return false
    },

    isRemoveFromContactListOnlyConfirmation () {
      return this.removeContactActionType === ContactsListRemoveFromTypes.REMOVE_FROM_LIST_ONLY
    },
    isDeleteContactConfirmation () {
      return this.removeContactActionType === ContactsListRemoveFromTypes.REMOVE_FROM_CONTACTS
    },

    confirmationInputString () {
      return this.isRemoveFromContactListOnlyConfirmation ? 'Remove' : 'Delete'
    },

    contactToDeleteCount () {
      if (this.contactToRemove) {
        return 1
      }

      if (this.selectedContacts[this.listId]) {
        let list = this.selectedContacts[this.listId]
        return list.length
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
      // refactor to handle this by the `id` instead of the `name`, as the `name` is not unique.
      // Some list could have "My Queue" as name and it would generate errors
      if (this.isPowerDialer && this.selectedList.id === this.myQueue.id) {
        return 'my-queue'
      }

      return this.selectedList.id
    },

    currentList () {
      return this.listItems[this.selectedList.id]
    }
  },

  data () {
    return {
      isBusy: false,
      contactsToDelete: null,
      ContactsListRemoveFromTypes,
      typedConfirmationInputString: '',
      STATIC
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

    ...mapMutations(['FORCE_CONTACTS_POLL']),

    onCancel () {
      this.typedConfirmationInputString = ''
      this.removeContactClose()
      this.$bvModal.hide('remove-contact-confirmation-dialog')
    },

    onHide () {
      this.typedConfirmationInputString = ''
      this.contactsToDelete = null
    },

    onShown () {
      if (this.isDeleteContactConfirmation) {
        this.$refs.contactsToDeleteInput.focus()
      }
    },

    onClose () {
      this.typedConfirmationInputString = ''
      this.removeContactClose()
    },

    handleSingleDeletion () {
      let url = null
      let payload = {}

      switch (this.removeContactActionType) {
        case ContactsListRemoveFromTypes.REMOVE_FROM_LIST_ONLY:
          url = `/api/v2/${this.endpointForList}/` +
            this.selectedList.id +
            '/items/' +
            this.contactToRemove.id
          break
        case ContactsListRemoveFromTypes.REMOVE_FROM_CONTACTS:
          const contactId = get(this.contactToRemove, 'id', null)

          if (!contactId || contactId === 'undefined') {
            console.log('Failed to remove contact: Missing contact id!')
            return
          }

          if (this.selectedList.type === STATIC) {
            payload.contact_list_id = this.selectedList.id
          }

          url = `/api/v2/contacts/${contactId}`
          break
      }

      this.isBusy = true

      return this.$axios.delete(url, {
        data: payload
      })
        .then(() => {
          // force a contacts poll to be executed once
          this.FORCE_CONTACTS_POLL(true)

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
      let url = null
      let params = {}

      switch (this.removeContactActionType) {
        case ContactsListRemoveFromTypes.REMOVE_FROM_LIST_ONLY:
          url = `/api/v2/${this.endpointForList}/bulk/${this.selectedList.id}`
          break
        case ContactsListRemoveFromTypes.REMOVE_FROM_CONTACTS:
          url = `/api/v2/contacts/bulk-delete`

          if (this.selectedList.type === STATIC) {
            params.list_id = this.selectedList.id
          }

          break
      }

      this.isBusy = true
      // exclude contacts with integrations and get the contact ids
      let ids = this.selectedContacts[this.listId].reduce((acc, contact) => {
        acc.push(this.isContactsRoute ? contact.id : contact.contact_list_item_id)
        return acc
      }, [])

      ids = chunk(ids, 50)

      if (this.isDatatableSelectedAll) {
        params.selected_all = true
      }

      if (!isEmpty(this.currentListFilters)) {
        const allFilters = this.$jsonClone(this.currentListFilters)

        Object.keys(allFilters).forEach(index => {
          // include all other filters
          if (!this.$isNumeric(index)) {
            params[index] = allFilters[index]
            delete allFilters[index]
          }
        })

        if (!isEmpty(allFilters)) {
          // include the filter groups
          params.filter_groups = allFilters
        }
      }

      const isChunked = !params?.selected_all && ids.length > 0
      this.processRequest(url, params, isChunked, ids)
    },

    processRequest (url, params, isChunked = false, chunkedContactIds = []) {
      if (chunkedContactIds.length > 0 && this.isContactsRoute) {
        params.contacts = chunkedContactIds[0]
      } else if (chunkedContactIds.length) {
        params.contact_list_items = chunkedContactIds[0]
      }

      this.$axios
        .delete(url, { data: params })
        .then(res => {
          if (isChunked) {
            // remove the used set of contact ids
            chunkedContactIds.splice(0, 1)
            const hasMoreChunks = chunkedContactIds.length > 1

            // process the next set of contact ids
            if (chunkedContactIds.length > 0) {
              this.processRequest(url, params, hasMoreChunks, chunkedContactIds)

              return
            } else {
              isChunked = false
            }
          }

          // force a contacts poll to be executed once
          this.FORCE_CONTACTS_POLL(true)

          this.$generalNotification('Contacts are being removed from the list. This may take a few moments to update. Please refresh your page to confirm the changes.')
        })
        .catch((_err) => {
          if (!isChunked) {
            this.$generalNotification('Unable to remove contacts please try again.', 'error')
          }
        }).finally(() => {
          if (!isChunked) {
            this.contactsToDelete = null
            this.isBusy = false
            this.removeContactClose()
            this.$bvModal.hide('remove-contact-confirmation-dialog')
          }
        })
    },

    onConfirm () {
      if (this.contactToRemove && !this.isBulkDelete) {
        this.handleSingleDeletion()
      }

      if (Object.keys(this.selectedContacts).length !== 0 && this.selectedContacts[this.selectedList.id].constructor !== Object && this.isBulkDelete) {
        this.handleBulkDeletion()
      }
    },

    integrationsCount () {
      if (!this.contactToRemove && this.selectedContacts[this.listId]) {
        // disable integrations count if multi entity is not activated
        if (!this.currentCompany.activate_multi_entity) {
          return 0
        }
        return this.selectedContacts[this.listId].filter(contact => contact.has_integration).length
      }

      return 0
    }
  }
}
</script>
