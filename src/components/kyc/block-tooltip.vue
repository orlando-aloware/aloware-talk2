<template>
  <b-popover boundary="window"
             custom-class="btn-primary"
             ref="popover"
             :triggers="triggers"
             :target="target"
             :placement="placement"
             v-if="customMessage">
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
import { mapState } from 'vuex'

export default {
  name: 'block-tooltip',

  mixins: [
    kycMixin
  ],

  components: {

  },

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
    },

    message: {
      required: false,
      type: String,
      default: ''
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

  computed: {
    ...mapState('cache', ['currentCompany']),
    customMessage () {
      const status = this.currentKycStatus
      const action = this.textForTask
      const url = process.env.APP_URL ?? ''
      const companyId = this.currentCompany.id
      const link = url ? `${url}business-information-registration/${companyId}` : '#'
      let message = ''

      switch (status) {
        case KycLogs.KYC_STATUS_NONE:
        case KycLogs.KYC_STATUS_APPROVED_FOR_CALLING_ONLY:
        case KycLogs.KYC_STATUS_APPROVED_FOR_CALLING_AND_MESSAGING:
          message = ''
          break
        case KycLogs.KYC_STATUS_ZERO:
          message = `You need to <a href="${link}"><u class="text-white">submit important info</u></a> about your business to unlock access to ${action}`
          break
        case KycLogs.KYC_STATUS_DEFINITELY_REJECTED:
          message = `You need to <a href="${link}"><u class="text-white">submit again the info</u></a> about your business to ${action}`
          break
        default:
          // For KYC_STATUS_APPROVED_FOR_SELF_CALLING
          message = `Your account has not yet been verified for ${action}. Please contact our support team to remove this restriction.`
          break
      }

      if (this.message) {
        message = this.message
      }

      return message
    },

    textForTask () {
      let text = ''

      switch (this.task) {
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
        case 'broadcasts':
          text = 'broadcasts'
          break
        case 'alohabot':
          text = 'alohabot'
          break
        case 'sequences':
          text = 'sequences'
          break
        case 'ring-group.create':
          text = 'create ring group'
          break
        case 'ring-group.import':
          text = 'import ring group'
          break
        case 'ring-group.operations':
          text = 'ring group operations'
          break
        case 'line.operations':
          text = 'line operations'
          break
        case 'line.create':
          text = 'create line'
          break
        case 'sequence.create':
          text = 'create sequence'
          break
        case 'users.settings':
          text = 'user settings'
          break
        case 'export':
          text = 'export data'
          break
        case 'integrations':
          text = 'integrations'
          break
        case 'integrations.api':
          text = 'integrations API access'
          break
        case 'trial.skip':
          text = 'skip trial and subscribe'
          break
        case 'calendar':
          text = 'calendar'
          break
      }

      return text
    }
  },

  methods: {

  }
}
</script>
