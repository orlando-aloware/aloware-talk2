<template>
  <b-popover :triggers="triggers"
             :target="target"
             :placement="placement"
             boundary="window"
             custom-class="btn-primary"
             ref="popover">
    <template>
      <span class="d-flex align-items-center contact-tags-item text-white">
        <span v-html="customMessage"></span>
      </span>
    </template>
  </b-popover>
</template>

<script>
import { kycMixin } from 'src/plugins/mixins'
import * as KycLogs from '../../constants/kyc-logs'

export default {
  name: 'block-tooltip',

  mixins: [
    kycMixin
  ],

  props: {
    placement: {
      required: true,
      type: String,
      default: 'top'
    },
    triggers: {
      required: true,
      type: String,
      default: 'click'
    },
    target: {
      required: true,
      type: String
    },
    task: {
      required: true,
      type: String
    }
  },

  components: {

  },

  computed: {
    customMessage () {
      const status = this.currentKycStatus
      const action = this.textForTask
      let message = ''

      switch (status) {
        case KycLogs.KYC_STATUS_ZERO:
          message = `You need to <u>submit important info</u> about your business to unlock access to ${action}`
          break
        case KycLogs.KYC_STATUS_DEFINITELY_REJECTED:
          message = `You need to <u>submit again the info</u> about your business to ${action}`
          break
        case KycLogs.KYC_STATUS_APPROVED_FOR_CALLING_AND_MESSAGING:
          message = `The ${action} isn't available on trial. please <u>Contact Us</u> to upgrade today!`
          break
        default:
          // For KYC_STATUS_APPROVED_FOR_SELF_CALLING and KYC_STATUS_APPROVED_FOR_CALLING_ONLY
          message = `Your account is not yet verified to ${action}, you can reach out to our support to remove the restriction`
          break
      }

      return message
    },

    textForTask () {
      let text = ''

      switch (this.$props.task) {
        case 'contacts.create':
          text = 'create contacts'
          break
        case 'contacts.import':
          text = 'import contacts'
          break
        case 'call':
          text = 'call numbers beside yours'
          break
        case 'text':
          text = 'text messages'
          break
        case 'sms.template':
          text = 'create sms templates'
          break
        case 'broadcasts.create':
          text = 'create broadcasts'
          break
      }

      return text
    }
  },
  data () {
    return {
      tab: 'inbox',
      parkedCallQueue: []
    }
  },

  mounted () {

  },

  methods: {

  }
}
</script>
