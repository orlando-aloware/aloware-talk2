<template>
  <div class="pt-2 message-composer-text-wrapper">
    <div class="file-dropper position-absolute"
         v-cloak
         @paste.prevent="onPaste"
         @drop.prevent="onDrop"
         @dragover.prevent>
    </div>
    <div @dragover.prevent
         @drop.prevent="onDrop"
         @paste.prevent="onPaste">
      <div class="mb-2 d-inline-flex media-preview-wrapper">
        <div v-for="(file, index) in filesOnQueue"
             :key="index"
             class="media-preview">
          <div v-if="file.type.includes('audio')"
               class="audio-thumbnail-wrapper">
            <audio-placeholder :file="file"
                               @remove="onRemoveFileInQueue">
            </audio-placeholder>
          </div>
          <div v-if="file.type.includes('pdf')"
               class="pdf-thumbnail-wrapper">
              <application-placeholder :file="file"
                                       @remove="onRemoveFileInQueue">
              </application-placeholder>
          </div>
          <div v-if="file.type.includes('video')"
               class="video-thumbnail-wrapper">
            <video-placeholder :file="file"
                               @remove="onRemoveFileInQueue">
            </video-placeholder>
          </div>
          <div v-if="file.type.includes('image')">
            <image-placeholder :file="file"
                               @remove="onRemoveFileInQueue">
            </image-placeholder>
          </div>
        </div>

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
    <div class="d-flex justify-content-between"
         @dragover.prevent>
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
import axios from 'axios'
import { mapActions, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'
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
import ImagePlaceholder from 'components/message-composer/file-placeholders/image-placeholder'
import VideoPlaceholder from 'components/message-composer/file-placeholders/video-placeholder'
import ApplicationPlaceholder from 'components/message-composer/file-placeholders/application-placeholder'
import AudioPlaceholder from 'components/message-composer/file-placeholders/audio-placeholder'

export default {
  name: 'message-composer-sms',

  components: {
    AudioPlaceholder,
    ApplicationPlaceholder,
    VideoPlaceholder,
    ImagePlaceholder,
    SmsTemplateModal,
    ScheduledMessage,
    MessageTemplates,
    Variables,
    Attachments,
    SearchGiphy,
    VariableIcon,
    CalendarTodayIcon,
    AttachmentIcon,
    GifIcon
  },

  computed: {
    ...mapGetters('contacts', ['contact', 'messageComposer', 'selectedLine']),
    validSms: function () {
      return ((this.messageComposer.sms.body && this.messageComposer.sms.body.trim().length > 0) || this.messageComposer.sms.attachments.length > 0 || this.messageComposer.sms.gif_url.length > 0) &&
        this.selectedLine &&
        this.messageComposer.sms.phone_number &&
        this.messageComposer.sms.phone_number.length > 0
    },
    messageBody () {
      return this.messageComposer.sms.body
    },
    messageAttachments () {
      return this.messageComposer.sms.attachments
    },
    messageGifUrl () {
      return this.messageComposer.sms.gif_url
    }
  },

  data () {
    return {
      isSending: false,
      filesOnQueue: [],
      fileOnQueueIcon: ['fa', 'fa-times'],
      filesOnQueueToken: []
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
    processFilesToQueue (file) {
      if (!file) {
        return
      }

      if (!['audio/basic',
        'audio/L24',
        'audio/mp4',
        'audio/mpeg',
        'audio/ogg',
        'audio/vnd.rn-realaudio',
        'audio/vnd.wave',
        'audio/3gpp',
        'audio/3gpp2',
        'audio/ac3',
        'audio/vnd.wave',
        'audio/webm',
        'audio/amr-nb',
        'audio/amr',
        'video/mpeg',
        'video/mp4',
        'video/quicktime',
        'video/webm',
        'video/3gpp',
        'video/3gpp2',
        'video/3gpp-tt',
        'video/H261',
        'video/H263',
        'video/H263-1998',
        'video/H263-2000',
        'video/H264',
        'image/bmp',
        'image/tiff',
        'image/jpeg',
        'image/jpg',
        'image/gif',
        'image/png',
        'text/vcard',
        'text/x-vcard',
        'text/csv',
        'text/rtf',
        'text/richtext',
        'text/calendar',
        'text/directory',
        'application/pdf',
        'application/vcard'].includes(file.type)) {
        this.$generalNotification('Unsupported file type detected.', 'error')
        return
      }

      // Images should not exceed 5MB
      if (['image/jpeg', 'image/png', 'image/tiff', 'image/jpg', 'image/gif'].includes(file.type) && (file.size / (1024 * 1024) > 5)) {
        this.$generalNotification('Exceed max file size of 5MB for images detected.', 'error')
        return
      }

      // Other file types should not exceed 600KB
      if (!['image/jpeg', 'image/png', 'image/tiff', 'image/jpg', 'image/gif'].includes(file.type) && (file.size / (1024 * 1024) > 0.6)) {
        this.$generalNotification('Exceed max file size of 600KB for other file types detected.', 'error')
        return
      }

      this.filesOnQueue.push(file)
      this.onUpload(file)
    },
    onDrop (e) {
      let files = e.dataTransfer.files
      for (let i = 0; i < files.length; i++) {
        this.processFilesToQueue(files[i])
      }
    },
    onPaste (e) {
      for (let i = 0; i < e.clipboardData.items.length; i++) {
        let item = e.clipboardData.items[i]
        if (item.type && item.type.length > 0) {
          this.processFilesToQueue(item.getAsFile())
        }
      }
    },
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
          this.$generalNotification('Text has been sent.')
        }).catch(error => {
          console.log(error)
          this.$generalNotification('Error while sending text.', 'error')
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
    },
    onUpload (file) {
      let formData = new FormData(), _this = this
      formData.append('file', file)

      const cancelToken = axios.CancelToken
      this.filesOnQueueToken[file.name] = cancelToken.source()

      talk2Api.V1.lines.fileUpload(this.selectedLine.id, formData, { cancelToken: this.filesOnQueueToken[file.name].token }).then(response => {
        _this.appendMessageComposerSmsAttachments(response.data.uploaded_file)
        _this.filesOnQueue.splice(_this.filesOnQueue.findIndex(item => item.name === file.name), 1)
      }).catch(error => {
        console.log(error)
        let message = _this.filesOnQueue.length > 1 ? 'Error while uploading one of the files.' : 'Error while uploading file.'
        this.$generalNotification(message, 'error')
        this.filesOnQueue.splice(this.filesOnQueue.findIndex(item => item.name === file.name), 1)
      })
    },
    onRemoveFileInQueue (file) {
      this.filesOnQueue.splice(this.filesOnQueue.findIndex(item => item.name === file.name), 1)
      this.filesOnQueueToken[file.name].cancel()
    },
    base64ToBlob (b64Data, contentType, sliceSize) {
      contentType = contentType || ''
      sliceSize = sliceSize || 512

      let byteCharacters = window.atob(b64Data)
      let byteArrays = []

      for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        let slice = byteCharacters.slice(offset, offset + sliceSize)

        let byteNumbers = new Array(slice.length)
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i)
        }

        let byteArray = new Uint8Array(byteNumbers)

        byteArrays.push(byteArray)
      }

      return new Blob(byteArrays, { type: contentType })
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
