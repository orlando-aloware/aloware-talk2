<template>
  <confirm-dialog :id="dialogId"
                  title='Remove Contact From List Confirmation'
                  :is-busy="isBusy"
                  @hide="onHide"
                  @shown="onShown">
    <div slot="content">
      <div class="text-left">
        <div class="text-dark">
          {{`Are you sure you want to remove ${this.contact.name} from "${list.name}" list?`}}
        </div>
      </div>
    </div>
    <div slot="footer"
         class="w-100">
      <div class="d-flex w-100">
        <div class="flex-grow-1" />
        <button class="btn btn-sm btn-outline-dark mr-2"
                :disabled="isBusy"
                @click="onCancel">
          Cancel
        </button>
        <button class="btn btn-sm btn-danger mr-2"
                :disabled="isBusy"
                @click="onConfirm">
          <b-spinner variant="warning"
                     type="grow"
                     label="Spinning"
                     small
                     v-if="isBusy">
          </b-spinner>
          Remove
        </button>
      </div>
    </div>
  </confirm-dialog>
</template>

<script>
import ConfirmDialog from 'components/confirm-dialog.vue'
import { STATIC } from 'src/constants/contacts-list-types'

export default {
  inject: [
    'selectedContacts'
  ],

  components: {
    ConfirmDialog
  },

  props: {
    dialogId: {
      type: String
    },
    contact: {
      type: Object
    },
    list: {
      type: Object
    }
  },

  data () {
    return {
      isBusy: false,
      contactsToDelete: null,
      STATIC
    }
  },

  methods: {
    onCancel () {
      this.$bvModal.hide(this.dialogId)
    },

    onHide () {
      this.$bvModal.hide(this.dialogId)
    },

    onShown () {
      this.busy = false
      this.$refs.confirmationInput.focus()
    },

    handleDeletion () {
      this.isBusy = true
      this.$emit('deleting')
      return this.$axios.delete(`/api/v2/contact-list-item/` + this.list.id + '/items/' + this.contact.id, {
        data: {}
      })
        .then(() => {
          this.$generalNotification('The Contact was  removed from list successfully.')
          this.$emit('deleted')
        })
        .catch((_err) => {
          console.error(_err)
          this.$generalNotification('Unable to remove contact from list. Please try again.', 'error')
        }).finally(() => {
          this.isBusy = false
          this.$emit('finally')
        })
    },

    async onConfirm () {
      this.handleDeletion()
    }
  }
}
</script>
