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
import { mapActions } from 'vuex'
import { broadcastsMixin } from 'src/plugins/mixins'

export default {
  name: 'BroadcastWarningNote',

  mixins: [
    broadcastsMixin
  ],

  data () {
    return {
      carrierFees: []
    }
  },

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
        let carrierSurchargesMessage = ''

        if (this.campaign) {
          const carrierFee = this.getCarrierFee()
          carrierSurchargesMessage = `Estimated carrier surcharcharges of $${carrierFee} will also apply.`
        }

        return `This calculator is meant to provide the best estimate for the cost of the broadcast. Actual charges from carriers may vary.${carrierSurchargesMessage}`
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

  mounted () {
    if (this.isCalculatorMessage) {
      this.getCarrierFees()
    }
  },

  methods: {
    ...mapActions('broadcast', [
      'fetchCarrierFees'
    ]),

    getCarrierFees () {
      this.fetchCarrierFees().then(res => {
        this.carrierFees = res.data
      }).catch(err => {
        console.log(err)
      })
    },

    getCarrierFee () {
      if (!this.campaign) {
        return 0
      }

      const shortCodeNumbers = this.campaign?.incoming_numbers?.filter(number => number.is_short_code) || 0
      const longCodeNumbers = this.campaign?.incoming_numbers?.filter(number => !number.is_short_code) || 0
      const isLongCode = longCodeNumbers >= shortCodeNumbers

      let prefix = isLongCode ? 'long_code' : 'short_code'
      // tollfree takes precedence at the end
      if (this.hasTollFreePhoneNumber()) {
        prefix = 'toll_free'
      }

      const suffix = this.shouldApplyMmsRate() ? 'mms' : 'sms'

      // matches the constants from CarrierFee.php
      const carrierFeeName = `${prefix}_${suffix}`
      const carrierFeePerSegment = this.carrierFees.find(fee => fee.name === carrierFeeName)?.price ?? 0

      // TODO:: add this.segments
      return (carrierFeePerSegment * 1).toFixed(3)
    }
  }
}
</script>
