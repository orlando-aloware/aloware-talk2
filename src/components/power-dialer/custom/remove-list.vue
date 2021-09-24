<template>
  <confirm-dialog
    title="Remove List"
    :isOpen="isRemoveListOpen"
    id="t-remove-list-dialog"
    @close="removeListClose"
  >
    <div slot="content">
      <div class="text-left">
        <div class="text-dark">
          Are you sure you want to remove
          <span class="font-weight-bold">{{ listToRemove.name }}</span>?
        </div>
      </div>
    </div>
    <div slot="footer" class="w-100">
      <div class="d-flex w-100">
        <div class="flex-grow-1"></div>
        <button
          class="btn btn-sm btn-outline-dark mr-2"
          @click="onRemoveListOnly"
        >
          Delete List, But Save Contacts
        </button>
        <button class="btn btn-sm btn-danger mr-2" @click="onRemoveListAndContact">
          Delete List and Contacts
        </button>
      </div>
    </div>
  </confirm-dialog>
</template>

<script>
import ConfirmDialog from 'components/confirm-dialog.vue'

import { mapActions, mapGetters } from 'vuex'
import { LIST_ONLY, LIST_AND_CONTACT } from 'src/constants/remove-list-action-types'

export default {
  components: {
    ConfirmDialog
  },
  computed: {
    ...mapGetters('powerDialer', ['isRemoveListOpen', 'listToRemove'])
  },
  data () {
    return {
      ActionTypes: { LIST_ONLY, LIST_AND_CONTACT }
    }
  },
  watch: {
    isRemoveListOpen (isOpen) {
      if (isOpen) {
        this.$bvModal.show('t-remove-list-dialog')
      } else {
        this.$bvModal.hide('t-remove-list-dialog')
      }
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'removeListClose',
      'removeListOpen',
      'foldersLoaded',
      'setRemoveListActionType'
    ]),
    onRemoveList () {
      return this.$axios
        .delete('/api/v2/power-dialer-list/' + this.listToRemove.id)
        .then(() => {
          this.reloadFolders()
        })
        .catch((_err) => {
          this.$generalNotification('Unable to remove list.', 'error')
        })
        .finally(() => this.removeListClose())
    },
    reloadFolders () {
      return this.$axios
        .get('/api/v2/power-dialer-folders')
        .then((response) => response.data)
        .then((response) => {
          this.foldersLoaded(response)
          if (String(this.$route.params.id) === String(this.listToRemove.id)) {
            this.$router.history.replace('/power-dialer/')
          }
        })
        .catch((_err) => {
          this.$generalNotification('Unable to load folders please try again.', 'error')
        })
    },
    onRemoveListOnly () {
      this.showConfirmDialog(this.ActionTypes.LIST_ONLY)
    },
    onRemoveListAndContact () {
      this.showConfirmDialog(this.ActionTypes.LIST_AND_CONTACT)
    },
    showConfirmDialog (actionType) {
      this.setRemoveListActionType(actionType)
      // this.$bvModal.show('t-remove-list-confirmation-dialog')
      // this.$bvModal.hide('t-remove-list-dialog')
    }
  }
}
</script>
