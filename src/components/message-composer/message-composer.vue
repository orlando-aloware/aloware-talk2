<template>
  <div class="composer-container">
    <div class="composer-wrapper"
         :class="[messageComposer.mode === 'note' ? 'bg-blue-70' : '']">
      <div class="tab-links d-inline-flex">
        <b-link href="#"
                :disabled="isSmsDisabled"
                :class="{ active : messageComposer.mode === 'sms' }"
                @click="setMode('sms')">Text
          <q-tooltip v-if="isSmsDisabled"
                     anchor="top middle"
                     self="center middle">
            SMS/MMS feature is disabled.
          </q-tooltip>
        </b-link>
        <b-link href="#"
                v-if="currentCompany && currentCompany.reseller_id !== 357"
                :disabled="disableFax || isPhoneNumberInvalid"
                :class="{ active : messageComposer.mode === 'fax' }"
                @click="setMode('fax')">Fax
          <q-tooltip v-if="disableFax"
                     anchor="top middle"
                     self="center middle">
            Selected line is not capable of sending faxes.
          </q-tooltip>
        </b-link>
        <b-link href="#"
                v-if="currentCompany && currentCompany.reseller_id !== 357"
                :disabled="!contact.email"
                :class="{ active : messageComposer.mode === 'email' }"
                @click="setMode('email')">Email
          <q-tooltip v-if="!contact.email"
                     anchor="top middle"
                     self="center middle">
            This contact doesn't have any valid email address.
          </q-tooltip>
        </b-link>
        <b-link href="#"
                :class="{ active : messageComposer.mode === 'note' }"
                @click="setMode('note')">Note
        </b-link>
      </div>
      <div>
        <message-composer-sms :is-disabled="isSmsDisabled"
                              :campaignId="campaignId"
                              :disabled-message="disabledComplianceMessage"
                              v-if="messageComposer.mode === 'sms'"
                              @message-sent="onMessageSent"/>

        <message-composer-fax v-if="messageComposer.mode === 'fax'"
                              @message-sent="onMessageSent"/>

        <message-composer-email :campaignId="campaignId"
                                v-if="messageComposer.mode === 'email' && contact.email"
                                @message-sent="onMessageSent"/>

        <message-composer-note v-if="messageComposer.mode === 'note'"
                               @message-sent="onMessageSent"/>
      </div>
    </div>
    <div class="composer-footer d-flex justify-content-between pt-1">
      <div class="phone-lines-left d-inline-flex">
        <span class="pr-2 pt-1">To:</span>
        <contact-phone-number-selector v-if="contact"
                                       @setSelectedPhone="setSelectedPhone">
        </contact-phone-number-selector>
      </div>

      <div class="phone-lines-right">
        <div class="float-right d-inline-flex">
          <span class="pr-2 pt-1">From:</span>
          <line-selector :campaignId="campaignId"
                         check-blocked-messaging
                         @change="onLineChange">
          </line-selector>
        </div>
      </div>
    </div>
    <div v-if="isMessagingBlocked(selectedLine, true)" class="composer-footer">
      <div class="compliance-badge mb-2">
        {{ selectedLine.blocked_messaging_information['reason'] }}
      </div>
    </div>
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
  selectorMixin
} from 'src/plugins/mixins'
import ContactPhoneNumberSelector from 'components/message-composer/contact-phone-number-selector'
import LineSelector from 'components/message-composer/line-selector'
import talk2Api from 'src/plugins/api/api'
import MessageComposerFax from 'components/message-composer/message-composer-fax'
import MessageComposerEmail from 'components/message-composer/message-composer-email'
import MessageComposerNote from 'components/message-composer/message-composer-note'
import * as CommunicationDirection from 'src/constants/communication-direction'
import * as Roles from 'src/constants/roles'

export default {
  name: 'message-composer',

  mixins: [
    contactMixin,
    contactV2AttributesMixin,
    aclMixin,
    visibilityMixin,
    selectorMixin
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
    MessageComposerSms
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
