<template>
  <confirm-dialog :title="title"
                  :isOpen="isRemoveContactOpen"
                  id="remove-contact-dialog"
                  @close="onClose">
    <div slot="content">
      <div class="text-left">
        <div class="text-dark">
         <div v-html="message"/>
        </div>
      </div>
    </div>
    <div slot="footer"
         class="w-100">
      <div class="d-flex w-100"
           v-if="isContactModuleType">
        <div class="flex-grow-1"/>
        <button class="btn btn-sm btn-outline-success mr-2"
                v-if="selectedList.type === ContactListTypes.STATIC"
                @click="onRemoveFromList">
          Remove From List Only
        </button>
        <button class="btn btn-sm btn-danger mr-2"
                @click="onRemoveFromContacts">
          Remove Contact{{ hasMultipleSelection ? 's' : '' }}
        </button>
      </div>
      <div class="d-flex w-100"
           v-else>
        <div class="flex-grow-1"/>
        <button class="btn btn-sm btn-danger mr-2"
                @click="onRemoveFromPdList">
          {{ hasMultipleSelection ? 'Remove Contacts from List' : 'Remove Contact from List' }}
        </button>
      </div>
    </div>
  </confirm-dialog>
</template>

<script>
import ConfirmDialog from 'components/confirm-dialog.vue'
import { mapActions, mapGetters } from 'vuex'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import * as ContactListRemoveFromTypes from 'src/constants/contacts-list-remove-from-types'

export default {
  props: {
    isContactModuleType: {
      type: Boolean,
      default: true
    },
    selectedCount: {
      type: Number,
      default: 0
    }
  },

  components: {
    ConfirmDialog
  },

  computed: {
    ...mapGetters('contacts', [
      'isRemoveContactOpen',
      'contactToRemove',
      'selectedContacts',
      'selectedList'
    ]),

    title () {
      if (this.contactToRemove) {
        return 'Remove ' + (this.contactToRemove.name ? this.contactToRemove.name : 'No Name') + '?'
      }

      if (this.selectedContacts[this.selectedList.id]) {
        return `Remove ${this.$options.filters.numFormat(this.selectedCount)} contact${this.hasMultipleSelection ? 's' : ''}?`
      }

      return ''
    },

    message () {
      if (this.contactToRemove) {
        return 'Are you sure you want to remove ' + (this.contactToRemove.name ? this.contactToRemove.name : 'No Name') + '?'
      }

      if (this.selectedContacts[this.selectedList.id]) {
        return `Are you sure you want to remove <span>${this.$options.filters.numFormat(this.selectedCount)}</span> contact${this.hasMultipleSelection ? 's' : ''}?`
      }

      return ''
    },

    listId () {
      return this.selectedList.name === 'My Queue' ? 'my-queue' : this.selectedList.id
    },

    hasMultipleSelection () {
      return this.selectedCount
    }
  },

  data () {
    return {
      ContactListTypes,
      flag: false
    }
  },

  watch: {
    isRemoveContactOpen (isOpen) {
      if (isOpen) {
        this.$bvModal.show('remove-contact-dialog')
        this.flag = false
      } else {
        this.$bvModal.hide('remove-contact-dialog')
      }
    }
  },

  methods: {
    ...mapActions('contacts', [
      'removeContactClose',
      'setContactRemoveActionType'
    ]),

    onRemoveFromList () {
      this.flag = true
      this.setContactRemoveActionType(ContactListRemoveFromTypes.REMOVE_FROM_LIST_ONLY)
      this.$bvModal.show('remove-contact-confirmation-dialog')
      this.$bvModal.hide('remove-contact-dialog')
    },

    onRemoveFromPdList () {
      this.flag = true
      this.setContactRemoveActionType(ContactListRemoveFromTypes.REMOVE_FROM_LIST_ONLY)
      this.$bvModal.hide('remove-contact-dialog')
      this.$emit('on-remove')
    },

    onRemoveFromContacts () {
      this.flag = true
      this.setContactRemoveActionType(ContactListRemoveFromTypes.REMOVE_FROM_CONTACTS)
      this.$bvModal.show('remove-contact-confirmation-dialog')
      this.$bvModal.hide('remove-contact-dialog')
    },

    onClose () {
      if (!this.flag) {
        this.removeContactClose()
      }
    }
  }
}
</script>
