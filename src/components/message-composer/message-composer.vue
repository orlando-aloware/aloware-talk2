<template>
  <div class="composer-container">
    <div class="composer-wrapper p-2">
      <div class="tab-links d-inline-flex">
        <b-link href="#"
                :class="{ active : messageComposer.mode === 'sms' }"
                @click="setMode('sms')">Text
        </b-link>
        <b-link href="#"
                v-if="currentCompany && currentCompany.reseller_id != 357"
                :class="{ active : messageComposer.mode === 'fax' }"
                @click="setMode('fax')">Fax
        </b-link>
        <b-link href="#"
                :disabled="!contact.email"
                :class="{ active : messageComposer.mode === 'email' }"
                @click="setMode('email')">Email
        </b-link>
        <b-link href="#"
                :class="{ active : messageComposer.mode === 'note' }"
                @click="setMode('note')">Note
        </b-link>
      </div>
      <div>
        <message-composer-sms v-if="messageComposer.mode === 'sms'" />
        <message-composer-fax v-if="messageComposer.mode === 'fax'" />
        <message-composer-email v-if="messageComposer.mode === 'email' && contact.email" />
        <message-composer-note v-if="messageComposer.mode === 'note'" />
      </div>
    </div>
    <div class="composer-footer d-flex justify-content-between pt-1">
      <div class="w-40 d-inline-flex">
        <span class="pr-2 pt-1">To:</span>
        <phone-number-selector @setSelectedPhone="setSelectedPhone"></phone-number-selector>
      </div>

      <div class="w-35">
        <div class="float-right d-inline-flex">
          <span class="pr-2 pt-1">From:</span>
          <line-selector></line-selector>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MessageComposerSms from 'components/message-composer/message-composer-sms'
import { mapActions, mapGetters, mapState } from 'vuex'
import contactMixin from 'src/plugins/mixins/contact.mixin'
import PhoneNumberSelector from 'components/message-composer/phone-number-selector'
import LineSelector from 'components/message-composer/line-selector'
import talk2Api from 'src/plugins/api/api'
import MessageComposerFax from 'components/message-composer/message-composer-fax'
import MessageComposerEmail from 'components/message-composer/message-composer-email'
import MessageComposerNote from 'components/message-composer/message-composer-note'

export default {
  name: 'message-composer',
  mixins: [contactMixin],
  components: { MessageComposerNote, MessageComposerEmail, MessageComposerFax, LineSelector, PhoneNumberSelector, MessageComposerSms },
  computed: {
    ...mapGetters('contacts', ['contact', 'selectedLine', 'messageComposer']),
    ...mapState(['currentCompany'])
  },
  methods: {
    ...mapActions(
      'contacts', ['setMessageComposerSmsPhoneNumber', 'setMessageComposerAttachments', 'setMessageComposerMode']
    ),
    setMode (mode) {
      this.setMessageComposerMode(mode)
    },
    ...mapActions(['setSmsTemplates']),
    setSelectedPhone (phoneNumber) {
      this.setMessageComposerSmsPhoneNumber(phoneNumber)
    },

    getSmsTemplates () {
      return talk2Api.V1.smsTemplate.get()
        .then(response => {
          this.setSmsTemplates(response.data)
        })
    }
  },
  mounted () {
    this.setMessageComposerSmsPhoneNumber(this.contact.phone_number)
    this.getSmsTemplates()
  },
  watch: {
    'contact': function () {
      this.setMessageComposerSmsPhoneNumber(this.contact.phone_number)
    }
  }
}
</script>
