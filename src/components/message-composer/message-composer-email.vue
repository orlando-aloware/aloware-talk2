<template>
  <div class="message-composer-email" data-testid="message-composer-email-wrapper">
    <div class="pt-2 form-input-container">
      <form data-testid="email-form">
        <q-input placeholder="Subject"
                 input-class="q-input-pl-0 q-input-pr-0"
                 bottom-slots
                 data-testid="email-subject-input"
                 v-model="messageComposer.email.subject" >
        </q-input>

        <q-input borderless
                 autogrow
                 ref="emailMessageBody"
                 class="q-input-composer"
                 input-class="q-input-pl-0 q-input-pr-0 pt-0 pb-0"
                 type="textarea"
                 placeholder="Type your message"
                 v-model="messageComposer.email.body"
                 data-testid="email-message-body-input"
                 @input="updateMessage"
        />
      </form>
    </div>
    <div class="d-flex justify-content-between">
      <message-composer-options :campaign-id="campaignId"
                                data-testid="email-message-composer-options"
                                @templateSelected="templateSelected"
                                @variableSelected="variableSelected"/>
      <div>
        <q-btn color="primary"
               class="message-composer-send-button"
               :disable="isSending || !validEmail"
               data-testid="email-send-button"
               @click="onSend">
          <template slot="default">
            <q-spinner-bars v-if="isSending"
                            data-testid="email-sending-spinner"
                            color="white" class="mr-1">
            </q-spinner-bars>
            {{ isSending ? ' Sending Email...' : 'Send Email' }}
          </template>
        </q-btn>
      </div>
    </div>
    <sms-template-modal data-testid="email-sms-template-modal"></sms-template-modal>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import SmsTemplateModal from 'components/sms-template-modal'
import MessageComposerOptions from 'components/message-composer/message-composer-options'
import * as CommunicationTypes from 'src/constants/communication-types'

export default {
  name: 'message-composer-email',

  props: {
    campaignId: {
      required: false
    }
  },

  components: { MessageComposerOptions, SmsTemplateModal },

  computed: {
    ...mapGetters('contacts', ['contact', 'messageComposer', 'selectedLine']),

    ...mapState('auth', ['profile']),

    validEmail () {
      return (this.messageComposer.email.body && this.messageComposer.email.body.trim().length > 0) && (this.messageComposer.email.subject && this.messageComposer.email.subject.trim().length > 0)
    },

    isSubjectValid () {
      return this.messageComposer.email.subject.length > 2
    }
  },

  data () {
    return {
      isSending: false,
      message: ''
    }
  },

  methods: {
    ...mapActions('contacts', ['setMessageComposerEmailBody', 'resetMessageComposerEmail']),

    updateMessage (value) {
      this.setMessageComposerEmailBody(value)
    },

    formatMessage () {
      return {
        campaign_id: this.selectedLine.id,
        from_name: this.profile.name,
        message: this.messageComposer.email.body,
        subject: this.messageComposer.email.subject
      }
    },

    onSend () {
      this.isSending = true

      const message = this.formatMessage()
      this.$emit('message-sent', {
        ...message,
        type: CommunicationTypes.EMAIL
      })

      talk2Api.V1.contact.sendEmail(this.contact.id, message).then(response => {
        this.resetMessageComposerEmail()
        this.$generalNotification('Email has been sent.')
      }).catch(error => {
        console.log(error)
        this.$handleErrors(error.response)
      }).finally(() => {
        this.isSending = false
      })
    },

    templateSelected (template) {
      this.setMessageComposerEmailBody((this.messageComposer.email.body ?? '') + ' ' + template.body)
    },

    variableSelected (variable) {
      this.setMessageComposerEmailBody((this.messageComposer.email.body ?? '') + ' ' + variable)
      this.focusEmailBody()
    },

    focusEmailBody () {
      this.$refs.emailMessageBody.focus()
    }
  },

  mounted () {
    if (this.messageComposer.mode === 'email') {
      this.focusEmailBody()
    }
  }
}
</script>
