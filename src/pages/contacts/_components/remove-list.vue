<template>
  <confirm-dialog
    title="Remove List"
    :isOpen="isRemoveListOpen"
    id="remove-list-dialog"
    @close="removeListClose"
  >
    <div slot="content">
      <div class="text-left">
        <div class="text-dark">
          Are you sure you want to remove
          <span class="font-weight-bold">{{ listToRemove.name }}</span
          >? Please be reminded that this will also delete all its contacts.
        </div>
      </div>
    </div>
    <div slot="footer" class="w-100">
      <div class="d-flex w-100">
        <div class="flex-grow-1"></div>
        <button
          class="btn btn-sm btn-outline-dark mr-2"
          @click="removeListClose"
        >
          Cancel
        </button>
        <button class="btn btn-sm btn-danger mr-2" @click="onRemoveList">
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
    ...mapGetters('contacts', ['isRemoveListOpen', 'listToRemove'])
  },
  watch: {
    isRemoveListOpen (isOpen) {
      if (isOpen) {
        this.$bvModal.show('remove-list-dialog')
      } else {
        this.$bvModal.hide('remove-list-dialog')
      }
    }
  },
  methods: {
    ...mapActions('contacts', ['removeListClose', 'foldersLoaded']),
    onRemoveList () {
      return window.axios
        .delete('/api/v1/contacts-list/' + this.listToRemove.id)
        .then(() => {
          this.reloadFolders()
        })
        .catch((_err) => {
          this.$q.notify({
            message: 'Unable to remove list.',
            type: 'negative',
            textColor: 'white',
            actions: [
              {
                icon: 'close'
              }
            ]
          })
        })
        .finally(() => this.removeListClose())
    },
    reloadFolders () {
      return window.axios
        .get('/api/v1/contact-folders')
        .then((response) => response.data)
        .then((response) => {
          this.foldersLoaded(response)
          if (String(this.$route.params.id) === String(this.listToRemove.id)) {
            this.$router.history.replace('/contacts')
          }
        })
        .catch((_err) => {
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
