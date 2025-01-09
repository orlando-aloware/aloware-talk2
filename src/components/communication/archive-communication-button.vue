<template>
  <span :class="[{ 'opacity-05 cursor-blocked': loading }, {'cursor-pointer': !loading }]"
        data-testid="comm-archive-button"
        v-if="hasPermissionTo('archive communication')"
        @click="dialog">
    <archive-icon height="16"
                  width="16"
                  color="#62666E"/>

    <q-tooltip>
      Archive
    </q-tooltip>
  </span>
</template>

<script>
import ArchiveIcon from 'components/icons/archive-icon.vue'
import { aclMixin } from 'src/plugins/mixins'
import API from 'src/plugins/api/api'

export default {
  name: 'archive-communication-button',

  mixins: [
    aclMixin
  ],

  components: {
    ArchiveIcon
  },

  props: {
    communication: {
      type: Object,
      required: true
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

      this.$bvModal.msgBoxConfirm('Archiving the communication will remove it from all reports and plots. Continue?', {
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
          this.$generalNotification('Communication archived successfully.', 'success')
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
