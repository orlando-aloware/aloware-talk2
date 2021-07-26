<template>
  <div class="message-composer-email">
    <div class="pt-2 form-input-container">
      <form>
        <q-input placeholder="Subject"
                 input-class="q-input-pl-0 q-input-pr-0"
                 bottom-slots
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
                 @input="updateMessage"
        />
      </form>
    </div>
    <div class="d-flex justify-content-between">
      <div class="message-options">
        <b-link href="#" id="smsTemplate">
          <calendar-today-icon></calendar-today-icon>
        </b-link>
        <b-link href="#" id="smsVariables">
          <variable-icon></variable-icon>
        </b-link>
      </div>
      <div>
        <b-button-group>
          <b-button variant="primary"
                    class="fs-13 pl-3 pr-3"
                    size="sm"
                    :disabled="isSending || !validEmail"
                    @click="onSend">
            <q-spinner-bars v-if="isSending" color="white" />
            {{ isSending ? 'Sending Email...' : 'Send Email' }}
          </b-button>
        </b-button-group>
      </div>
    </div>
    <b-popover ref="popover"
               id="email-variables-popover"
               placement="topright"
               target="smsVariables"
               triggers="click blur"
               @show="onPopoverShown">
      <variables @variableSelected="variableSelected" always-open></variables>
    </b-popover>

    <b-popover ref="popover"
               id="email-templates-popover"
               placement="topright"
               target="smsTemplate"
               triggers="click blur"
               @show="onPopoverShown">
      <message-templates @templateSelected="templateSelected"></message-templates>
    </b-popover>
  </div>
</template>

<script>
import CalendarTodayIcon from 'components/icons/calendar-today-icon'
import VariableIcon from 'components/icons/variable-icon'
import Variables from 'components/message-composer/options/variables'
import { mapActions, mapGetters } from 'vuex'
import MessageTemplates from 'components/message-composer/options/message-templates'
import talk2Api from 'src/plugins/api/api'
export default {
  name: 'message-composer-email',
  components: { MessageTemplates, Variables, VariableIcon, CalendarTodayIcon },
  computed: {
    ...mapGetters('contacts', ['contact', 'messageComposer', 'selectedLine']),
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
        from_name: this.contact.name,
        message: this.messageComposer.email.body,
        subject: this.messageComposer.email.subject
      }
    },
    onSend () {
      this.isSending = true
      talk2Api.V1.contact.sendEmail(this.contact.id, this.formatMessage()).then(response => {
        this.resetMessageComposerEmail()
        this.$q.notify({
          message: 'Email has been sent.',
          type: 'positive',
          textColor: 'white',
          position: 'bottom-right'
        })
      }).catch(error => {
        console.log(error)
        this.$q.notify({
          message: 'Error while sending email.',
          type: 'negative',
          textColor: 'white',
          position: 'bottom-right'
        })
      }).finally(() => {
        this.isSending = false
      })
    },
    templateSelected (template) {
      this.setMessageComposerEmailBody((this.messageComposer.email.body ?? '') + ' ' + template.body)
      this.closeTemplatesPopover()
    },
    closeTemplatesPopover () {
      this.$root.$emit('bv::hide::popover', 'email-templates-popover')
      this.$refs.emailMessageBody.focus()
    },
    variableSelected (variable) {
      this.setMessageComposerEmailBody((this.messageComposer.email.body ?? '') + ' ' + variable)
      this.closeVariablesPopover()
    },
    closeVariablesPopover () {
      this.$root.$emit('bv::hide::popover', 'email-variables-popover')
      this.$refs.emailMessageBody.focus()
    },
    onPopoverShown () {
      this.$root.$emit('bv::hide::popover')
    }
  }
}
</script>
