<template>
  <div class="note note--warning"
       v-if="showWarning">
    <p class="note__title">WARNING</p>
    <div>{{ message }}</div>
  </div>
</template>

<script>
export default {
  name: 'WarningNote',

  props: {
    campaign: {
      type: Object,
      required: false
    },

    useMmsRate: {
      type: Boolean,
      required: false
    }
  },

  computed: {
    hasTollFreePhoneNumber () {
      return this.campaign?.has_tollfree_pn
    },

    showMessageSentAsMmsWarning () {
      return this.useMmsRate && !this.hasTollFreePhoneNumber
    },

    showMessageSentFromTollFreeNumberWarning () {
      return !this.useMmsRate && this.hasTollFreePhoneNumber
    },

    showMessageSentFromTollFreeNumberAsMmsWarning () {
      return this.useMmsRate && this.hasTollFreePhoneNumber
    },

    showWarning () {
      return this.showMessageSentAsMmsWarning || this.showMessageSentFromTollFreeNumberWarning || this.showMessageSentFromTollFreeNumberAsMmsWarning
    },

    message () {
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
