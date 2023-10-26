<template>
  <b-popover :triggers="triggers"
             :target="target"
             :placement="placement"
             boundary="window"
             custom-class="btn-primary"
             ref="popover">
    <template>
      <span class="d-flex align-items-center contact-tags-item text-white">
        <span>
          {{ customText }}
        </span>
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
    customText () {
      const status = this.currentKycStatus
      let base = ''
      if (status === KycLogs.STATUS_KYC_0) {
        base = 'You need to submit important info about your business to unlock access to ' + this.textForTask
      }
      if (status === KycLogs.STATUS_REJECTED_FRAUD) {
        base = 'You need to submit again the info about your business to ' + this.textForTask
      }
      if (status === KycLogs.STATUS_VERIFIED_RESTRICTED) {
        base = 'Your account is not yet verified to ' + this.textForTask
        base += ', you can reach out to our support to remove the restriction'
      }
      return base
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

  },

  watch: {

  }
}
</script>
