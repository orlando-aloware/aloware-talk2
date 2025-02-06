<template>
  <confirm-dialog :title="`Convert list to ${listShowInPublicFolder ? 'private' : 'public'}`"
                  :is-open="value"
                  id="convert-list-to-public-dialog"
                  @close="onCancel">
    <div slot="content">
      <div class="text-left">
        <div class="text-dark">
          Are you sure you want to convert the list <strong>{{ listName }}</strong> to {{ listShowInPublicFolder ? 'private' : 'public' }}?
        </div>
      </div>
    </div>

    <div slot="footer"
         class="w-100">
      <div class="d-flex w-100">
        <div class="flex-grow-1"/>

        <button class="btn btn-sm btn-outline-dark mr-2"
                @click="onCancel">
          Cancel
        </button>

        <button class="btn btn-sm btn-primary mr-2"
                @click="onConvertToPublic">
          Yes
        </button>
      </div>
    </div>
  </confirm-dialog>
</template>

<script>
import ConfirmDialog from 'components/confirm-dialog.vue'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import API from 'src/plugins/api/api'

export default {
  components: {
    ConfirmDialog
  },

  props: {
    value: {
      type: Boolean,
      default: false
    },

    listId: {
      type: Number,
      required: true
    },

    listName: {
      type: String,
      required: true
    },

    listShowInPublicFolder: {
      type: Boolean,
      required: false,
      default: false
    },

    fromAdminList: {
      type: Boolean,
      default: false
    }
  },

  methods: {
    onCancel () {
      this.$emit('closed')
    },

    onConvertToPublic () {
      const params = {
        show_in_public_folder: !this.listShowInPublicFolder,
        ...(this.fromAdminList ? { from_admin_list: true } : {})
      }

      API.V2.contactList.update(this.listId, params)
        .then((response) => {
          this.$generalNotification(`Contact list has been successfully converted to ${this.listShowInPublicFolder ? 'private' : 'public'}`)
          this.$emit('converted')
        })
        .catch((error) => {
          const { message } = extractErrorMessage(error)
          this.$generalNotification(message, 'error')
        })
    }
  }
}
</script>
