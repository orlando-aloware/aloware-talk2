<template>
  <confirm-dialog
    title="Remove Contact"
    :isOpen="isRemoveContactOpen"
    id="remove-contact-dialog"
    @close="removeContactClose"
  >
    <div slot="content">
      <div class="text-left">
        <div class="text-dark">
          Are you sure you want to remove
          <span class="font-weight-bold">{{ contactToRemove.name }}</span> from
          this list?
        </div>
      </div>
    </div>
    <div slot="footer" class="w-100">
      <div class="d-flex w-100">
        <div class="flex-grow-1"></div>
        <button
          class="btn btn-sm btn-outline-dark mr-2"
          @click="removeContactClose"
        >
          Cancel
        </button>
        <button class="btn btn-sm btn-danger mr-2" @click="onConfirm">
          Remove
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
    ...mapGetters('contacts', ['isRemoveContactOpen', 'contactToRemove'])
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
    onConfirm () {
      // TODO: refresh list
      return window.axios
        .delete(
          '/api/v1/contact-list/' +
            this.contactToRemove.contactListId +
            '/items/' +
            this.contactToRemove.id
        )
        .then(() => {
          this.$q.notify({
            message: 'Contact was successfully removed',
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
        }).finally(() => this.removeContactClose())
    }
  }
}
</script>
