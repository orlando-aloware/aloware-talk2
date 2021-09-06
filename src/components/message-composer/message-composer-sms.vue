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
        <b-link href="#">
          <q-menu content-class="mx-height-500"
                  ref="giphyMenu"
                  :offset="[0,5]" >
            <div class="row no-wrap q-pa-md">
              <search-giphy @selected="setMessageGif"></search-giphy>
            </div>
          </q-menu>

          <gif-icon></gif-icon>
        </b-link>

        <b-link href="#">
          <q-menu ref="attachmentMenu"
                  :offset="[0,5]">
            <div class="row no-wrap q-pa-md">
              <attachments @attachmentUploaded="onAttachmentUploaded"></attachments>
            </div>
          </q-menu>
          <attachment-icon></attachment-icon>
        </b-link>
        <b-link href="#">
          <q-menu content-class="mx-height-300"
                  ref="templatesMenu"
                  :offset="[0,5]">
            <div class="row no-wrap q-pa-md">
              <message-templates @templateSelected="templateSelected"></message-templates>
            </div>
          </q-menu>
          <calendar-today-icon></calendar-today-icon>
        </b-link>
        <b-link href="#">
          <q-menu content-class="mx-height-300"
                  ref="variablesMenu"
                  :offset="[0,5]">
            <div class="row no-wrap q-pa-md">
              <variables @variableSelected="variableSelected" always-open></variables>
            </div>
          </q-menu>
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
        attachments: this.messageComposer.sms.attachments.map(attachment => attachment.uuid),
        gif: this.messageComposer.sms.gif_url
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
    setMessageGif (gif) {
      this.setMessageComposerSmsGif(gif)
      this.$refs.giphyMenu.hide()
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
      this.$refs.templatesMenu.hide()
    },
    variableSelected (variable) {
      this.setMessageComposerSmsBody((this.messageComposer.sms.body ?? '') + ' ' + variable)
      this.$refs.variablesMenu.hide()
    },
    onAttachmentUploaded (files) {
      let _this = this
      files.forEach(function (file) {
        _this.appendMessageComposerSmsAttachments(file)
      })

      this.$refs.attachmentMenu.hide()
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
