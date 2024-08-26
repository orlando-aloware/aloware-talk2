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
  name: 'broadcast-send-warning-dialog',

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
      const baseMessage = this.generateWarningMessage()
      return baseMessage ? `${baseMessage} Would you like to proceed?` : ''
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
