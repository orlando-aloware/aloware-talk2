<template>
  <div>
    <div class="pt-3 pb-4 form-input-container">

      <form>
        <q-input placeholder="Subject"
                 input-class="q-input-pl-0 q-input-pr-0"
                 bottom-slots
                 v-model="message_composer.email.subject" >
        </q-input>

        <q-input borderless
                 ref="emailMessageBody"
                 class="q-input-composer"
                 input-class="q-input-pl-0 q-input-pr-0 pt-0"
                 type="textarea"
                 placeholder="Type your message"
                 v-model="message_composer.email.body"
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
                    size="sm"
                    :disabled="!validEmail"
                    v-on:click="onSend">
            <q-spinner-bars v-if="is_sending" color="white" />
            {{ is_sending ? 'Sending...' : 'Send Email' }}
          </b-button>
        </b-button-group>
      </div>
    </div>
    <b-popover ref="popover"
               id="email-variables-popover"
               placement="topright"
               target="smsVariables"
               triggers="click"
               @show="onPopoverShown">
      <variables @variableSelected="variableSelected"></variables>
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
import Variables from 'pages/contacts/_components/message-composer/options/variables'
import { mapActions, mapGetters } from 'vuex'
import MessageTemplates from 'pages/contacts/_components/message-composer/options/message-templates'
import talk2Api from 'src/plugins/api/api'
export default {
  name: 'message-composer-email',
  components: { MessageTemplates, Variables, VariableIcon, CalendarTodayIcon },
  computed: {
    ...mapGetters('contacts', ['contact', 'message_composer', 'selected_line']),
    validEmail () {
      return (this.message_composer.email.body && this.message_composer.email.body.length > 0) && (this.message_composer.email.subject && this.message_composer.email.subject.length > 0)
    },
    isSubjectValid () {
      return this.message_composer.email.subject.length > 2
    }
  },
  data () {
    return {
      is_sending: false,
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
        campaign_id: this.selected_line.id,
        from_name: this.contact.name,
        message: this.message_composer.email.body,
        subject: this.message_composer.email.subject
      }
    },
    onSend () {
      talk2Api.V1.contact.sendEmail(this.contact.id, this.formatMessage()).then(response => {
        this.resetMessageComposerEmail()
      })
    },
    templateSelected (template) {
      this.setMessageComposerEmailBody((this.message_composer.email.body ?? '') + ' ' + template.body)
      this.closeTemplatesPopover()
    },
    closeTemplatesPopover () {
      this.$root.$emit('bv::hide::popover', 'email-templates-popover')
      this.$refs.emailMessageBody.focus()
    },
    variableSelected (variable) {
      this.setMessageComposerEmailBody((this.message_composer.email.body ?? '') + ' ' + variable)
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

<style lang="scss" scoped>
  .b-textarea, .b-textarea:focus {
    border: none !important;
    box-shadow:none !important;
    padding: 0 !important;
    overflow: hidden;
  }

  .message-options {
    padding-top: 6px;
  }
  .message-options a:focus,
  .message-options a:focus-visible {
    outline: none !important;
    outline-offset: 0;
  }

  .message-options a:not(:first-child){
    margin-left: 10px;
  }
  .popover {
    max-width: 100%;
  }

  .email-subject-input {
    padding: 0 !important;
  }

</style>
