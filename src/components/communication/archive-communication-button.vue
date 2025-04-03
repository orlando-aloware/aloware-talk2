<template>
  <span :class="[{ 'opacity-05 cursor-blocked': loading }, {'cursor-pointer': !loading }]"
        data-testid="comm-archive-button"
        :id="`action-delete-${_uid}`"
        @click="dialog">
    <trash-icon height="16"
                width="16"
                color="#62666E"/>
    <span v-if="showButtonText" class="ml-1">Delete</span>
    <b-tooltip custom-class="talk-table__tooltip"
               :target="`action-delete-${_uid}`"
               v-else>
      Delete
    </b-tooltip>
  </span>
</template>

<script>
import TrashIcon from 'components/icons/trash-icon.vue'
import { aclMixin } from 'src/plugins/mixins'
import API from 'src/plugins/api/api'

export default {
  name: 'archive-communication-button',

  mixins: [
    aclMixin
  ],

  components: {
    TrashIcon
  },

  props: {
    communication: {
      type: Object,
      required: true
    },

    showButtonText: {
      type: Boolean,
      default: false
    }
  },

  data: () => ({
    loading: false
  }),

  methods: {
    dialog () {
      if (this.loading) {
        return
      }

      this.$bvModal.msgBoxConfirm('Deleting this communication will remove it from all reports and graphs. Do you want to proceed?', {
        buttonSize: 'sm',
        okTitle: 'Yes',
        cancelTitle: 'Cancel',
        centered: true
      }).then(confirm => {
        if (confirm) {
          this.archive()
        }
      })
    },

    archive () {
      this.loading = true

      API.V1.communication.delete(this.communication.id)
        .then(() => {
          this.$generalNotification('Communication deleted successfully.', 'success')
          this.loading = false
          this.$emit('archived', this.communication.id)
        })
        .catch(err => {
          this.loading = false
          this.$handleErrors(err.response)
        })
    }
  }
}
</script>
