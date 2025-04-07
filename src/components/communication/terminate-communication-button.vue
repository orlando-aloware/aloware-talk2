<template>
  <span data-testid="comm-terminate-comm-button"
        :class="classes"
        :disabled="loading"
        :id="`action-terminate-${_uid}`"
        v-if="show"
        @click="dialog">
    <power-icon :height="iconHeight"
                :width="iconWidth"/>
    <span v-if="showButtonText" class="ml-1">Terminate</span>
    <b-tooltip data-testid="comm-terminate-comm-button-tooltip"
               custom-class="talk-table__tooltip"
               :target="`action-terminate-${_uid}`"
               v-else>
      Terminate
    </b-tooltip>
  </span>
</template>

<script>
import API from 'src/plugins/api/api'
import PowerIcon from 'src/components/icons/power-icon.vue'
import { aclMixin } from 'src/plugins/mixins'
import { DISPOSITION_STATUS_INPROGRESS_NEW } from 'src/constants/communication-disposition-status'
import { isLiveCall, isParkedCall } from 'src/plugins/helpers/functions'
import * as CommunicationTypes from 'src/constants/communication-types'

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
    },

    iconHeight: {
      type: [Number, String],
      default: 22
    },

    iconWidth: {
      type: [Number, String],
      default: 22
    },

    showButtonText: {
      type: Boolean,
      default: false
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
      return this.hasRole('Company Admin') &&
        this.communication.type === CommunicationTypes.CALL &&
        this.communication.disposition_status2 === DISPOSITION_STATUS_INPROGRESS_NEW
    },

    isLiveOrParkedCall () {
      return isLiveCall(this.communication) || isParkedCall(this.communication)
    }
  },

  data: () => ({
    loading: false,
    DISPOSITION_STATUS_INPROGRESS_NEW,
    CommunicationTypes
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
          this.$emit('terminated', this.communication.id)
        })
        .catch(err => {
          this.loading = false
          this.$handleErrors(err.response)
        })
    }
  }
}
</script>
