<template>
  <button :class="['btn', 'btn-sm', customClass]"
          :disabled="loading"
          v-if="show"
          @click="dialog(communication)">
    <i class="material-icons">
      power_settings_new
    </i>
    <q-tooltip>
      Terminate
    </q-tooltip>
  </button>
</template>

<script>
import API from 'src/plugins/api/api'
import { aclMixin } from 'src/plugins/mixins'
import { DISPOSITION_STATUS_INPROGRESS_NEW } from 'src/constants/communication-disposition-status'

export default {
  name: 'terminate-communication-button',

  mixins: [
    aclMixin
  ],

  props: {
    communication: {
      type: Object,
      required: true
    },

    customClass: {
      required: false,
      default: null
    }
  },

  computed: {
    show () {
      return this.hasRole('Company Admin') && this.communication.disposition_status2 === DISPOSITION_STATUS_INPROGRESS_NEW
    }
  },

  data: () => ({
    loading: false,
    DISPOSITION_STATUS_INPROGRESS_NEW
  }),

  methods: {
    dialog () {
      this.$bvModal.msgBoxConfirm('Terminating communication will forcefully dispose it. Continue?', {
        buttonSize: 'sm',
        okTitle: 'Yes',
        cancelTitle: 'Cancel',
        centered: true
      }).then(confirm => {
        if (confirm) {
          this.terminate()
        }
      })
    },

    terminate () {
      this.loading = true

      API.V1.communication.forceTerminate(this.communication.id)
        .then(() => {
          this.$generalNotification('Communication terminated successfully.', 'success')
          this.loading = false
        })
        .catch(err => {
          this.loading = false
          this.$handleErrors(err.response)
        })
    }
  }
}
</script>
