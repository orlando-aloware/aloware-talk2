<template>
  <div class="composer-container">
    <div id="composer-wrapper"
         class="composer-wrapper"
         :class="[messageComposer.mode === 'note' ? 'bg-blue-70' : '']">
      <div class="tab-links d-inline-flex">
        <b-link href="#"
                :disabled="isSmsDisabled"
                :class="{ active : messageComposer.mode === 'sms' }"
                data-testid="text-tab-link"
                @click="setMode('sms')">Text
          <q-tooltip v-if="isSmsDisabled"
                     anchor="top middle"
                     data-testid="sms-feature-disable-tooltip"
                     self="center middle">
            SMS/MMS feature is disabled.
          </q-tooltip>
        </b-link>
        <b-link href="#"
                v-if="currentCompany && currentCompany.reseller_id !== 357"
                :disabled="disableFax || isPhoneNumberInvalid"
                :class="{ active : messageComposer.mode === 'fax' }"
                data-testid="fax-tab-link"
                @click="setMode('fax')">Fax
          <q-tooltip v-if="disableFax"
                     anchor="top middle"
                     data-testid="line-not-capable-tooltip"
                     self="center middle">
            Selected line is not capable of sending faxes.
          </q-tooltip>
        </b-link>
        <b-link href="#"
                v-if="currentCompany && currentCompany.reseller_id !== 357"
                :disabled="!contact.email"
                :class="{ active : messageComposer.mode === 'email' }"
                data-testid="email-tab-link"
                @click="setMode('email')">Email
          <q-tooltip v-if="!contact.email"
                     anchor="top middle"
                     data-testid="invalid-email-address-tooltip"
                     self="center middle">
            This contact doesn't have any valid email address.
          </q-tooltip>
        </b-link>
        <b-link href="#"
                :class="{ active : messageComposer.mode === 'note' }"
                data-testid="note-tab-link"
                @click="setMode('note')">Note
        </b-link>
      </div>
      <div>
        <message-composer-sms :is-disabled="isSmsDisabled"
                              :campaignId="campaignId"
                              :disabled-message="disabledComplianceMessage"
                              data-testid="message-composer-sms"
                              @message-sent="onMessageSent"
                              v-if="messageComposer.mode === 'sms'"/>

        <message-composer-fax @message-sent="onMessageSent"
                              data-testid="message-composer-fax"
                              v-if="messageComposer.mode === 'fax'"/>

        <message-composer-email :campaignId="campaignId"
                                data-testid="message-composer-email"
                                @message-sent="onMessageSent"
                                v-if="messageComposer.mode === 'email' && contact.email"/>

        <message-composer-note @message-sent="onMessageSent"
                              data-testid="message-composer-note"
                               v-if="messageComposer.mode === 'note'"/>
      </div>
    </div>
    <div class="composer-footer d-flex justify-content-between pt-1">
      <div class="phone-lines-left d-inline-flex">
        <span class="pr-2 pt-1">To:</span>
        <contact-phone-number-selector v-if="contact"
                                       data-testid="message-composer-contact-phone-number-selector"
                                       @setSelectedPhone="setSelectedPhone">
        </contact-phone-number-selector>
      </div>

      <div class="phone-lines-right">
        <div class="float-right d-inline-flex">
          <span class="pr-2 pt-1">From:</span>
          <line-selector :campaignId="campaignId"
                         check-blocked-messaging
                         data-testid="message-composer-line-selector"
                         @change="onLineChange">
          </line-selector>
        </div>
      </div>
    </div>
    <div v-if="shouldShowComplianceMessage" class="composer-footer">
      <div class="compliance-badge mb-2">
        {{ disabledComplianceMessage }}
      </div>
    </div>
    <block-tooltip placement="top"
                   triggers="hover"
                   target="composer-wrapper"
                   task="text"
                   :message="disabledComplianceMessage"
                   data-testid="message-composer-block-tooltip"
                   v-if="!canTextToNumber">
    </block-tooltip>
  </div>
</template>

<script>
import MessageComposerSms from 'components/message-composer/message-composer-sms'
import { mapActions, mapGetters, mapState } from 'vuex'
import {
  contactMixin,
  contactV2AttributesMixin,
  aclMixin,
  visibilityMixin,
  selectorMixin,
  kycMixin
} from 'src/plugins/mixins'
import ContactPhoneNumberSelector from 'components/message-composer/contact-phone-number-selector'
import LineSelector from 'components/message-composer/line-selector'
import talk2Api from 'src/plugins/api/api'
import MessageComposerFax from 'components/message-composer/message-composer-fax'
import MessageComposerEmail from 'components/message-composer/message-composer-email'
import MessageComposerNote from 'components/message-composer/message-composer-note'
import BlockTooltip from 'components/kyc/block-tooltip'
import * as CommunicationDirection from 'src/constants/communication-direction'
import * as Roles from 'src/constants/roles'

export default {
  name: 'message-composer',

  mixins: [
    contactMixin,
    contactV2AttributesMixin,
    aclMixin,
    visibilityMixin,
    selectorMixin,
    kycMixin
  ],

  props: {
    campaignId: {
      required: false
    }
  },

  components: {
    MessageComposerNote,
    MessageComposerEmail,
    MessageComposerFax,
    LineSelector,
    ContactPhoneNumberSelector,
    MessageComposerSms,
    BlockTooltip
  },

  computed: {
    ...mapGetters('contacts', ['contact', 'selectedLine', 'messageComposer']),

    ...mapState(['templates']),

    ...mapState('cache', ['currentCompany']),

    ...mapState('auth', ['profile']),

    disableFax () {
      return this.selectedLine ? !this.selectedLine.is_fax : true
    },

    isSmsDisabled () {
      return !this.currentCompany.sms_enabled || this.hasRole(Roles.COMPANY_REPORTER_ACCESS) || this.isMessagingBlocked(this.selectedLine, true)
    },

    isPhoneNumberInvalid () {
      if (this.selectContact && this.selectContact.phone_numbers && this.selectContact.phone_numbers.length) {
        const number = this.selectContact.phone_numbers.find(num => num.phone_number === this.selectContact.phone_number)

        return !number || number.is_invalid || number.is_wrong_number
      }

      return false
    },

    disabledComplianceMessage () {
      return this.isMessagingBlocked(this.selectedLine, true) ? this.selectedLine?.blocked_messaging_information?.['reason'] : ''
    },

    shouldShowComplianceMessage () {
      return !this.isTrialKYC && this.isMessagingBlocked(this.selectedLine, true) && this.selectedLine && this.selectedLine.blocked_messaging_information && this.selectedLine.blocked_messaging_information['reason']
    },

    canTextToNumber () {
      const phoneNumber = this.messageComposer.sms.phone_number
      return this.enabledToTextNumber(phoneNumber) && !this.disabledComplianceMessage
    }
  },

  methods: {
    ...mapActions(
      'contacts', [
        'setMessageComposerSmsPhoneNumber',
        'setMessageComposerAttachments',
        'setMessageComposerMode',
        'setSelectedLine',
        'setIsOptoutActive'
      ]
    ),

    ...mapActions(['setTemplates']),

    setMode (mode) {
      this.setMessageComposerMode(mode)
    },

    setSelectedPhone (phone) {
      if (!phone) {
        return
      }

      this.setMessageComposerSmsPhoneNumber(phone.phone_number)
    },

    getSmsTemplates () {
      return talk2Api.V1.smsTemplate.get()
        .then(response => {
          this.setTemplates(response.data)
        })
    },

    onLineChange (line) {
      this.setSelectedLine(line)
    },

    onMessageSent (message) {
      const sendingMessage = {
        ...message,
        direction: CommunicationDirection.OUTBOUND,
        user_id: this.profile.id,
        workflow_id: null,
        lead_number: this.contact.phone_number,
        created_at: window.moment()
      }
      this.$emit('message-sent', sendingMessage)
    }
  },

  mounted () {
    if (this.isSmsDisabled) {
      this.setMode('email')
    } else {
      this.setMode('sms')
    }

    this.setMessageComposerSmsPhoneNumber(this.contact.phone_number)
    if (!this.templates || this.templates.length < 1) {
      this.getSmsTemplates()
    }

    this.setIsOptoutActive(false)
  },

  watch: {
    'contact': function () {
      this.setMessageComposerSmsPhoneNumber(this.contact.phone_number)
    }
  }
}
</script>
