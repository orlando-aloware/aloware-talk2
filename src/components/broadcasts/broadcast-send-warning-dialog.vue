<template>
  <confirm-dialog id="send-warning-dialog"
                  :is-open="isOpen"
                  @close="onCloseDialog">
    <template #content>
      <p>
        {{ message }}
      </p>
    </template>

    <template #footer>
      <div>
        <button class="btn btn-sm btn-light mr-2"
                @click="onCloseDialog">
          Cancel
        </button>

        <button class="btn btn-sm btn-primary"
                @click="onSubmitClicked">
          {{ buttonSubmitText }}
        </button>
      </div>
    </template>
  </confirm-dialog>
</template>

<script>
import { broadcastsMixin } from 'src/plugins/mixins'
import ConfirmDialog from 'components/confirm-dialog.vue'

export default {
  name: 'BroadcastSendWarningDialog',

  components: {
    ConfirmDialog
  },

  mixins: [
    broadcastsMixin
  ],

  props: {
    isOpen: {
      type: Boolean,
      default: false
    },

    campaign: {
      type: Object,
      required: false
    }
  },

  computed: {
    buttonSubmitText () {
      return 'Yes'
    },

    message () {
      if (this.showMessageSentAsMmsWarning) {
        return 'The selected line is configured to send long messages via MMS, which may lead to higher-than-expected charges for this broadcast. Would you like to proceed?'
      }

      if (this.showMessageSentFromTollFreeNumberWarning) {
        return 'The selected line is configured with a Toll-free Number, which may lead to higher-than-expected charges for this broadcast. Would you like to proceed?'
      }

      if (this.showMessageSentFromTollFreeNumberAsMmsWarning) {
        return 'The selected line is configured with a Toll-free Number and to send long messages via MMS which may lead to higher-than-expected charges for this broadcast. Would you like to proceed?'
      }

      return ''
    }
  },

  methods: {
    onCloseDialog () {
      this.$emit('close')
    },

    onSubmitClicked () {
      this.$emit('submit')
    }
  }
}
</script>
