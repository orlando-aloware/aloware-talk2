<template>
  <div class="pt-2 message-composer-text-wrapper">
    <div>
      <div v-if="messageComposer.sms.gif_url || messageComposer.sms.attachments.length > 0"
           class="mb-2 d-inline-flex media-preview-wrapper">
        <div v-if="messageComposer.sms.gif_url"
             class="media-preview">
          <img class="img-preview"
               :src="messageComposer.sms.gif_url"/>
          <b-button size="sm"
                    class="btn-remove-attachments"
                    @click="removeMessageGif"
                    pill>
            <i class="fa fa-times"></i>
          </b-button>
        </div>

        <div v-for="attachment of messageComposer.sms.attachments"
             :key="attachment.id"
             class="media-preview">
          <div v-if="attachment.mimetype.includes('audio')"
               class="audio-thumbnail-wrapper">
            <div class="text-center media-icon-wrapper mt-2">
              <i class="fa fa-microphone media-icon"></i>
            </div>
            <p class="ellipsis mt-1 text-center">{{ attachment.original_file }}</p>
            <b-button size="sm"
                      class="btn-remove-attachments"
                      @click="removeAttachment(attachment)"
                      pill>
              <i class="fa fa-times"></i>
            </b-button>
          </div>
          <div v-if="attachment.mimetype.includes('pdf')"
               class="pdf-thumbnail-wrapper">
            <div class="text-center media-icon-wrapper mt-2">
              <i class="far fa-file-pdf media-icon"></i>
            </div>
            <p class="ellipsis mt-1 text-center">{{ attachment.original_file }}</p>
            <b-button size="sm"
                      class="btn-remove-attachments"
                      @click="removeAttachment(attachment)"
                      pill>
              <i class="fa fa-times"></i>
            </b-button>
          </div>
          <div v-if="attachment.mimetype.includes('video')"
               class="video-thumbnail-wrapper">
            <b-embed type="video"
                     aspect="1by1">
              <source :src="getPreviewLink(attachment.uuid)"
                      :type="attachment.mimetype">
            </b-embed>
            <b-button size="sm"
                      variant="light"
                      class="btn-play"
                      pill>
              <i class="fa fa-play"></i>
            </b-button>
            <b-button size="sm"
                      class="btn-remove-attachments"
                      @click="removeAttachment(attachment)"
                      pill>
              <i class="fa fa-times"></i>
            </b-button>
          </div>
          <div v-if="attachment.mimetype.includes('image')">
            <img  class="img-preview"
                  :src="getPreviewLink(attachment.uuid)"/>
            <b-button size="sm"
                      class="btn-remove-attachments"
                      @click="removeAttachment(attachment)"
                      pill>
              <i class="fa fa-times"></i>
            </b-button>
          </div>
        </div>

      </div>
      <q-input ref="smsMessageBody"
               class="q-input-composer"
               input-class="q-input-pl-0 q-input-pr-0 pt-0 pb-0"
               type="textarea"
               placeholder="Type your message"
               v-model="messageComposer.sms.body"
               borderless
               autogrow
               @keydown="onKeyDown">
      </q-input>
    </div>
    <div class="d-flex justify-content-between">
      <div class="message-options">
        <b-link href="#" id="smsGif">
          <gif-icon></gif-icon>
        </b-link>
        <b-link href="#" id="smsAttachments">
          <attachment-icon></attachment-icon>
        </b-link>
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
                    :disabled="!validSms"
                    @click="onSend">
            <q-spinner-bars v-if="isSending" color="white" />
            {{ isSending ? 'Sending Text...' : 'Send Text' }}
          </b-button>
          <b-dropdown class="message-composer-dropdown"
                      variant="primary"
                      size="sm"
                      :disabled="!validSms"
                      right>
            <b-dropdown-item :disabled="!validSms"
                             @click="showScheduleMessage">
              Schedule Send
            </b-dropdown-item>
          </b-dropdown>
        </b-button-group>
      </div>
    </div>
    <b-popover ref="popover"
               custom-class="mx-w-100"
               id="attachment-popover"
               placement="topright"
               target="smsAttachments"
               triggers="click"
               @show="onPopoverShown">
      <attachments @attachmentUploaded="onAttachmentUploaded"></attachments>
    </b-popover>
    <b-popover ref="popover"
               custom-class="mx-w-100"
               id="gif-popover"
               placement="topright"
               target="smsGif"
               triggers="click blur"
               @show="onPopoverShown">
      <search-giphy @selected="setMessageGif"></search-giphy>
    </b-popover>
    <b-popover ref="popover"
               id="sms-variables-popover"
               placement="topright"
               target="smsVariables"
               triggers="click blur"
               @show="onPopoverShown">
        <variables @variableSelected="variableSelected" always-open></variables>
    </b-popover>

    <b-popover ref="popover"
               id="sms-templates-popover"
               placement="topright"
               target="smsTemplate"
               triggers="click blur"
               @show="onPopoverShown">
      <message-templates @templateSelected="templateSelected"></message-templates>
    </b-popover>

    <scheduled-message></scheduled-message>
    <sms-template-modal></sms-template-modal>
  </div>
</template>

<script>
import GifIcon from 'components/icons/gif-icon'
import AttachmentIcon from 'components/icons/attachment-icon'
import CalendarTodayIcon from 'components/icons/calendar-today-icon'
import VariableIcon from 'components/icons/variable-icon'
import SearchGiphy from 'components/message-composer/options/search-giphy'
import Attachments from 'components/message-composer/options/attachments'
import Variables from 'components/message-composer/options/variables'
import ScheduledMessage from 'components/message-composer/scheduled-message'
import SmsTemplateModal from 'components/sms-template-modal'
import MessageTemplates from 'components/message-composer/options/message-templates'
import { mapActions, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'message-composer-sms',
  components: { SmsTemplateModal, ScheduledMessage, MessageTemplates, Variables, Attachments, SearchGiphy, VariableIcon, CalendarTodayIcon, AttachmentIcon, GifIcon },
  computed: {
    ...mapGetters('contacts', ['contact', 'messageComposer', 'selectedLine']),
    validSms: function () {
      return ((this.messageComposer.sms.body && this.messageComposer.sms.body.trim().length > 0) || this.messageComposer.sms.attachments.length > 0 || this.messageComposer.sms.gif_url.length > 0) &&
        this.selectedLine &&
        this.messageComposer.sms.phone_number &&
        this.messageComposer.sms.phone_number.length > 0
    }
  },
  data () {
    return {
      isSending: false
    }
  },
  methods: {
    ...mapActions('contacts', [
      'setMessageComposerSmsGif',
      'removeMessageComposerSmsAttachment',
      'setMessageComposerSmsBody',
      'resetMessageComposerSms',
      'appendMessageComposerSmsAttachments',
      'scheduleMessageOpen'
    ]),
    onKeyDown (evt) {
      if (evt.keyCode === 13 && !evt.shiftKey) {
        if (this.validSms) {
          this.onSend()
        }
        evt.preventDefault()
      }
    },
    formatMessage () {
      return {
        body: this.messageComposer.sms.body,
        contact_id: this.contact.id,
        campaign_id: this.selectedLine.id,
        phone_number: this.messageComposer.sms.phone_number,
        attachments: this.messageComposer.sms.attachments.map(attachment => attachment.uuid)
      }
    },
    onSend () {
      this.isSending = true
      return talk2Api.V1.message.send(this.formatMessage())
        .then(response => {
          this.resetMessageComposerSms()
          this.$q.notify({
            message: 'Text has been sent.',
            type: 'positive',
            textColor: 'white',
            position: 'bottom-right'
          })
        }).catch(error => {
          console.log(error)
          this.$q.notify({
            message: 'Error while sending text.',
            type: 'negative',
            textColor: 'white',
            position: 'bottom-right'
          })
        }).finally(() => {
          this.isSending = false
        })
    },
    closeVariablesPopover () {
      this.$root.$emit('bv::hide::popover', 'sms-variables-popover')
      this.focusInput()
    },
    closeTemplatesPopover () {
      this.$root.$emit('bv::hide::popover', 'sms-templates-popover')
      this.focusInput()
    },
    setMessageGif (gif) {
      this.setMessageComposerSmsGif(gif)
      this.$root.$emit('bv::hide::popover', 'gif-popover')
    },
    removeMessageGif () {
      this.setMessageComposerSmsGif('')
    },
    removeAttachment (attachment) {
      this.removeMessageComposerSmsAttachment(attachment)
    },
    getPreviewLink (uuid) {
      return process.env.API_URL + '/static/uploaded_file/' + uuid
    },
    templateSelected (template) {
      this.setMessageComposerSmsBody((this.messageComposer.sms.body ?? '') + ' ' + template.body)
      this.closeTemplatesPopover()
    },
    variableSelected (variable) {
      this.setMessageComposerSmsBody((this.messageComposer.sms.body ?? '') + ' ' + variable)
      this.closeVariablesPopover()
    },
    onAttachmentUploaded (files) {
      let _this = this
      files.forEach(function (file) {
        _this.appendMessageComposerSmsAttachments(file)
      })
    },
    onPopoverShown () {
      this.$root.$emit('bv::hide::popover')
    },
    showScheduleMessage () {
      this.scheduleMessageOpen(true)
    },
    focusInput () {
      let _this = this
      setTimeout(function () {
        _this.$refs.smsMessageBody.focus()
      }, 100)
    }
  },
  mounted () {
    this.resetMessageComposerSms()
    if (this.messageComposer.mode === 'sms') {
      this.focusInput()
    }
  },
  watch: {
    'messageComposer.sms.body': function (value) {
      this.setMessageComposerSmsBody(value)
    }
  }
}
</script>
