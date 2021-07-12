<template>
  <div class="composer-container">
    <div class="composer-wrapper p-2">
      <div class="composer-links d-flex justify-content-between">
        <b-link href="#" :class="{ active : messageComposer.mode === 'sms' }" v-on:click="setMode('sms')">Text</b-link>
        <b-link href="#" :class="{ active : messageComposer.mode === 'fax' }" v-on:click="setMode('fax')">Fax</b-link>
        <b-link href="#" :class="{ active : messageComposer.mode === 'email' }" v-on:click="setMode('email')">Email</b-link>
        <b-link href="#" :class="{ active : messageComposer.mode === 'note' }" v-on:click="setMode('note')">Note</b-link>
      </div>
      <div>
        <message-composer-sms v-if="messageComposer.mode === 'sms'" />
        <message-composer-fax v-if="messageComposer.mode === 'fax'" />
        <message-composer-email v-if="messageComposer.mode === 'email'" />
        <message-composer-note v-if="messageComposer.mode === 'note'" />
      </div>
    </div>
    <div class="composer-variables d-flex justify-content-between pt-1">
      <div class="w-40 d-inline-flex">
        <span class="pr-2 pt-1">To:</span>
        <phone-number-selector @setSelectedPhone="setSelectedPhone"></phone-number-selector>
      </div>

      <div class="w-35 d-inline-flex">
        <span class="pr-2 pt-1">From:</span>
       <line-selector></line-selector>
      </div>
    </div>
  </div>
</template>

<script>
import MessageComposerSms from 'pages/contacts/_components/message-composer/message-composer-sms'
import { mapActions, mapGetters } from 'vuex'
import contactMixin from 'src/plugins/mixins/contact.mixin'
import PhoneNumberSelector from 'pages/contacts/_components/message-composer/phone-number-selector'
import LineSelector from 'pages/contacts/_components/message-composer/line-selector'
import talk2Api from 'src/plugins/api/api'
import MessageComposerFax from 'pages/contacts/_components/message-composer/message-composer-fax'
import MessageComposerEmail from 'pages/contacts/_components/message-composer/message-composer-email'
import MessageComposerNote from 'pages/contacts/_components/message-composer/message-composer-note'

export default {
  name: 'message-composer',
  mixins: [contactMixin],
  components: { MessageComposerNote, MessageComposerEmail, MessageComposerFax, LineSelector, PhoneNumberSelector, MessageComposerSms },
  computed: {
    ...mapGetters('contacts', ['contact', 'selectedLine', 'messageComposer'])
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
      return talk2Api.V1.sms_template.get()
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

<style lang="scss" scoped>
  @import 'src/css/variables.scss';
  .composer-container {
    padding: 10px;
    background: $white;

    .composer-wrapper {
      position: relative;
      border: 1px solid $grey-70;
      border-radius: 8px;

      .composer-links {
        color: $blue;
        font-weight: 600;
        font-size: 13px;
        width: 20%;

        a {
          text-decoration: none;
        }

        a:hover {
          border-bottom: 2px solid $blue;
          color: $blue;
        }

        a.active {
          border-bottom: 2px solid $blue;
        }
      }
    }

    .composer-variables {
      font-size: 13px;
      height: 26px;
    }

    .w-30 {
      width: 30%;
    }
    .w-35 {
      width: 35%;
    }
    .w-40 {
      width: 40%;
    }

  }
</style>
