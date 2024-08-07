<template>
  <div class="note note--warning"
       v-if="showWarning">
    <p class="note__title"
       v-if="!isCalculatorMessage">
       WARNING
    </p>
    <div>{{ message }}</div>
  </div>
</template>

<script>
import { broadcastsMixin } from 'src/plugins/mixins'

export default {
  name: 'BroadcastWarningNote',

  mixins: [
    broadcastsMixin
  ],

  props: {
    campaign: {
      type: Object,
      required: false
    },

    isCalculatorMessage: {
      type: Boolean,
      required: false
    }
  },

  computed: {
    showWarning () {
      return this.showMessageSentAsMmsWarning ||
        this.showMessageSentFromTollFreeNumberWarning ||
        this.showMessageSentFromTollFreeNumberAsMmsWarning ||
        this.isCalculatorMessage
    },

    message () {
      if (this.isCalculatorMessage) {
        return 'This calculator is meant to provide the best estimate for the cost of the broadcast. Actual charges from carriers may vary.'
      }

      if (this.showMessageSentAsMmsWarning) {
        return 'The selected line is configured to send long messages via MMS, which may lead to higher-than-expected charges for this broadcast.'
      }

      if (this.showMessageSentFromTollFreeNumberWarning) {
        return 'The selected line is configured with a Toll-free Number, which may lead to higher-than-expected charges for this broadcast.'
      }

      if (this.showMessageSentFromTollFreeNumberAsMmsWarning) {
        return 'The selected line is configured with a Toll-free Number and to send long messages via MMS which may lead to higher-than-expected charges for this broadcast.'
      }

      return ''
    }
  }
}
</script>
