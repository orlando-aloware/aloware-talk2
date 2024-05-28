<template>
  <span :class="classes"
        :disabled="loading"
        data-testid="comm-terminate-comm-button"
        v-if="show"
        @click="dialog">
    <power-icon height="22"
                width="22"/>
    <q-tooltip data-testid="comm-terminate-comm-button-tooltip">
      Terminate
    </q-tooltip>
  </span>
</template>

<script>
import API from 'src/plugins/api/api'
import PowerIcon from 'src/components/icons/power-icon.vue'
import { aclMixin } from 'src/plugins/mixins'
import { DISPOSITION_STATUS_INPROGRESS_NEW } from 'src/constants/communication-disposition-status'
import { isLiveCall, isParkedCall } from 'src/plugins/helpers/functions'

export default {
  name: 'terminate-communication-button',

  mixins: [
    aclMixin
  ],

  components: {
    PowerIcon
  },

  props: {
    communication: {
      type: Object,
      required: true
    }
  },

  computed: {
    classes () {
      return [
        'cursor-pointer',
        { 'opacity-05 cursor-blocked': this.loading }
      ]
    },

    show () {
      // live and parked calls must be DISPOSITION_STATUS_INPROGRESS_NEW
      if (this.isLiveOrParkedCall) {
        return this.hasRole('Company Admin') && this.communication.disposition_status2 === DISPOSITION_STATUS_INPROGRESS_NEW
      }

      return this.hasRole('Company Admin')
    },

    isLiveOrParkedCall () {
      return isLiveCall(this.communication) || isParkedCall(this.communication)
    }
  },

  data: () => ({
    loading: false,
    DISPOSITION_STATUS_INPROGRESS_NEW
  }),

  methods: {
    dialog () {
      if (this.loading) {
        return
      }

      const message = this.isLiveOrParkedCall
        ? 'Terminating communication will forcefully dispose it'
        : 'Terminating will end this call and assign it a Failed call disposition'

      this.$bvModal.msgBoxConfirm(`${message}. Continue?`, {
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

      const action = this.isLiveOrParkedCall
        ? API.V1.communication.forceTerminate(this.communication.id)
        : API.V1.communication.forceDequeue(this.communication.id)

      action
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
