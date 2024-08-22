<template>
  <div class="broadcast-warning-note broadcast-warning-note--warning"
       v-if="showWarning">
    <p class="broadcast-warning-note__title"
       v-if="!isCalculatorMessage">
       WARNING
    </p>
    <div>{{ message }}</div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import { broadcastsMixin } from 'src/plugins/mixins'

export default {
  name: 'broadcast-warning-note',

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
    ...mapGetters('carrierFee', {
      carrierFees: 'getCarrierFees'
    }),

    ...mapGetters('contacts', [
      'messageComposer'
    ]),

    ...mapState('broadcast', [
      'contactsLength'
    ]),

    showWarning () {
      return this.showMessageSentAsMmsWarning ||
        this.showMessageSentFromTollFreeNumberWarning ||
        this.showMessageSentFromTollFreeNumberAsMmsWarning ||
        this.isCalculatorMessage
    },

    message () {
      if (this.isCalculatorMessage) {
        let carrierSurchargesMessage = ''

        if (this.campaign && this.contactsLength) {
          const carrierFee = this.getCarrierFee()
          carrierSurchargesMessage = ` Estimated carrier surcharges of $${carrierFee} will also apply.`
        }

        return `This calculator is meant to provide the best estimate for the cost of the broadcast. Actual charges from carriers may vary.${carrierSurchargesMessage}`
      }

      if (this.showMessageSentAsMmsDueToAssets) {
        return 'The message will be sent via MMS because it has an attachment or GIF attached to it, which may lead to higher-than-expected charges for this broadcast.'
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
  },

  methods: {
    getCarrierFee () {
      const shortCodeNumbers = this.campaign?.incoming_numbers?.filter(number => number.is_short_code) || 0
      const longCodeNumbers = this.campaign?.incoming_numbers?.filter(number => !number.is_short_code) || 0
      const isLongCode = longCodeNumbers >= shortCodeNumbers

      let prefix = isLongCode ? 'long_code' : 'short_code'
      // tollfree takes precedence at the end
      if (this.hasTollFreePhoneNumber) {
        prefix = 'toll_free'
      }

      const suffix = this.shouldApplyMmsRate ? 'mms' : 'sms'

      // matches the constants from CarrierFee.php
      const carrierFeeName = `${prefix}_${suffix}`
      const carrierFeePerSegment = this.carrierFees?.find(fee => fee.name === carrierFeeName)?.price ?? 0

      return (carrierFeePerSegment * this.contactsLength * this.messageCount()).toFixed(2)
    }
  },

  watch: {
    'messageComposer.sms.body': {
      immediate: true,
      handler (value) {
        this.messageLength(value)
      }
    }
  }
}
</script>
