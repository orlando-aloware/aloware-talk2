<template>
    <div class="pt-2 message-composer-text-wrapper"
         :disabled="isDisabled || isTCPAApprovedTextNotAuthorized">
        <div class="file-dropper position-absolute"
             v-cloak
             @paste.prevent="onPaste"
             @drop.prevent="onDrop"
             @dragover.prevent>
        </div>
        <div @dragover.prevent
             @drop.prevent="onDrop"
             @paste="onPaste">
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
                        <img class="img-preview"
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
            <div id="message-sms-input">
              <q-input class="q-input-composer"
                       borderless
                       autogrow
                       ref="smsMessageBody"
                       input-class="q-input-pl-0 q-input-pr-0 pt-0 pb-0"
                       type="textarea"
                       placeholder="Type your message"
                       v-model="messageComposer.sms.body"
                       :disable="isDisabled || isTCPAApprovedTextNotAuthorized"
                       @input="imposeCharactersLimit"
                       @keydown="onKeyDown"
                       @blur="onBlur">
              </q-input>
            </div>

            <block-tooltip v-if="!canTextToNumber"
                           placement="top"
                           triggers="hover"
                           target="message-sms-input"
                           task="text">
            </block-tooltip>
            <q-dialog v-model="urlShortenerDialog"
                      persistent
                      transition-show="scale"
                      transition-hide="scale">
                <q-card flat
                        style="width: 420px; max-width: 90vw;"
                        class="pb-2 px-2">
                    <q-card-section>
                        <div class="text-h6">Long URL detected</div>
                    </q-card-section>

                    <q-card-section class="q-pt-none">
                        Do you want URLs to be shortened to <u>{{ urlShortenerDomain }}</u>?
                    </q-card-section>

                    <q-checkbox v-model="urlShortenerDontAsk"
                                class="pl-1"
                                label="Don't ask me again"/>

                    <q-card-actions class="bg-white text-teal mt-2">
                        <q-btn label="No"
                               v-close-popup
                               @click="closeUrlShortener"/>
                        <q-btn color="blue"
                               class="ml-auto"
                               label="Yes"
                               :loading="generatingShortUrl"
                               @click="generateShortUrl(false)"/>
                    </q-card-actions>
                </q-card>
            </q-dialog>
        </div>
        <div class="d-flex justify-content-between"
             @dragover.prevent>
            <message-composer-options :campaign-id="campaignId"
                                      :max-attachments="maxAttachments"
                                      :is-broadcast="isBroadcast"
                                      @gifSelected="gifSelected"
                                      @attachmentUploaded="attachmentUploaded"
                                      @templateSelected="templateSelected"
                                      @variableSelected="variableSelected"/>
            <block-tooltip v-if="!canTextToNumber"
                           placement="top"
                           triggers="hover"
                           target="message-sms-popover"
                           task="text">
            </block-tooltip>
            <div id="message-sms-popover">
                <q-btn-dropdown split
                                class="message-composer-send-dropdown-button"
                                color="primary"
                                size="sm"
                                padding="0px 12px"
                                :ripple="false"
                                :disable="isSendTextDisabled"
                                :disable-dropdown="isSendTextDisabled"
                                :menu-offset="[0, 6]"
                                v-if="useSendButton"
                                @click="onSend">
                    <template slot="label">
                        <q-spinner-bars v-if="isSending || generatingShortUrl"
                                        class="mr-1"
                                        color="white"/>
                        {{ sendButtonText }}
                    </template>
                    <q-list class="message-composer-send-dropdown-button-list">
                        <q-item clickable
                                v-close-popup
                                @click="showScheduleMessage">
                            <q-item-section>
                                <q-item-label>Schedule Send</q-item-label>
                            </q-item-section>
                        </q-item>
                    </q-list>
                </q-btn-dropdown>
                <q-tooltip anchor="top middle"
                           self="center middle"
                           v-if="isTCPAApprovedTextNotAuthorized">
          <span class="text-black-dk">
            This number cannot be texted based on TCPA enforcement.
          </span>
                </q-tooltip>
            </div>
        </div>
        <scheduled-message></scheduled-message>
        <sms-template-modal></sms-template-modal>
    </div>
</template>

<script>
import axios from 'axios'
import { mapActions, mapGetters, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import ScheduledMessage from 'components/message-composer/scheduled-message'
import SmsTemplateModal from 'components/sms-template-modal'
import ImagePlaceholder from 'components/message-composer/file-placeholders/image-placeholder'
import VideoPlaceholder from 'components/message-composer/file-placeholders/video-placeholder'
import ApplicationPlaceholder from 'components/message-composer/file-placeholders/application-placeholder'
import AudioPlaceholder from 'components/message-composer/file-placeholders/audio-placeholder'
import MessageComposerOptions from 'components/message-composer/message-composer-options'
import BlockTooltip from 'components/kyc/block-tooltip'
import * as CommunicationTypes from 'src/constants/communication-types'
import { kycMixin } from 'src/plugins/mixins'

export default {
  name: 'message-composer-sms',

  mixins: [
    kycMixin
  ],

  components: {
    MessageComposerOptions,
    AudioPlaceholder,
    ApplicationPlaceholder,
    VideoPlaceholder,
    ImagePlaceholder,
    SmsTemplateModal,
    ScheduledMessage,
    BlockTooltip
  },

  props: {
    isDisabled: {
      type: Boolean,
      default: false
    },

    campaignId: {
      required: false
    },

    useSendButton: {
      type: Boolean,
      default: true
    },

    resetOnLoad: {
      type: Boolean,
      default: true
    },

    maxAttachments: {
      type: Number,
      default: null
    },

    maxCharacters: {
      type: Number,
      default: null
    },

    isBroadcast: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    ...mapGetters('contacts', [
      'contact',
      'messageComposer',
      'selectedLine'
    ]),

    ...mapState('contacts', [
      'isShortenedUrlRemembered'
    ]),

    ...mapGetters('auth', ['profile']),

    ...mapState('cache', ['currentCompany']),

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

    isTCPAApprovedTextNotAuthorized () {
      return this.currentCompany.enforce_tcpa && !this.contact.text_authorized
    },

    sendButtonText () {
      switch (true) {
        case this.generatingShortUrl:
          return ' Generating Short URL...'
        case this.isSending:
          return ' Sending Text...'
        default:
          return 'Send Text'
      }
    },

    isSendTextDisabled () {
      return !this.validSms || this.isTCPAApprovedTextNotAuthorized || this.generatingShortUrl || this.isDisabled || !this.canTextToNumber
    },

    canTextToNumber () {
      const phoneNumber = this.messageComposer.sms.phone_number
      return this.enabledToTextNumber(phoneNumber)
    }
  },

  data () {
    return {
      isSending: false,
      filesOnQueue: [],
      fileOnQueueIcon: ['fa', 'fa-times'],
      filesOnQueueToken: [],
      focusInterval: null,
      urlShortenerDialog: false,
      urlShortenerDomain: null,
      urlShortenerDontAsk: false,
      urlShortenerDontAskUntilSend: false,
      generatingShortUrl: false,
      fileTypes: [
        'audio/basic',
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
        'application/vcard'
      ]
    }
  },

  methods: {
    ...mapActions('contacts', [
      'setMessageComposerSmsGif',
      'removeMessageComposerSmsAttachment',
      'setMessageComposerSmsBody',
      'resetMessageComposerSms',
      'appendMessageComposerSmsAttachments',
      'scheduleMessageOpen',
      'setIsShortenedUrlRemembered'
    ]),

    processFilesToQueue (file) {
      if (!file) {
        return
      }

      if (!this.fileTypes.includes(file.type)) {
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
      const files = e.dataTransfer.files
      const index = { i: 0 }
      for (index.i = 0; index.i < files.length; index.i++) {
        this.processFilesToQueue(files[index.i])
      }
    },

    onPaste (e) {
      const index = {
        i: 0,
        item: null,
        file: null,
        found: false
      }

      if (e.clipboardData.items.length) {
        for (index.i = 0; index.i < e.clipboardData.items.length; index.i++) {
          index.item = e.clipboardData.items[index.i]
          index.file = index.item.type && index.item.type.length > 0 ? index.item.getAsFile() : null
          if (index.file) {
            index.found = true
            this.processFilesToQueue(index.file)
          }
        }

        if (index.found) {
          e.preventDefault()
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

    processDetectLongUrl (detected) {
      if (detected &&
                !this.urlShortenerDontAsk && !this.isShortenedUrlRemembered) {
        this.urlShortenerDialog = true
      }

      // generate the shortened URL if "Yes" selection is remembered
      // in the URL shortener prompt ("Don't ask me again" checkbox is active
      // and yes button is clicked) and there's no shortened URL generation
      // that is in-progress.
      if (detected &&
                (this.urlShortenerDontAsk ||
                    this.isShortenedUrlRemembered) &&
                this.profile.url_shortener_enabled &&
                this.currentCompany.url_shortener_enabled &&
                !this.generatingShortUrl) {
        this.generateShortUrl()
      }
    },

    onBlur () {
      if (this.urlShortenerDialog) {
        return
      }

      this.processDetectLongUrl(this.detectLongUrl(this.messageComposer.sms.body))
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

    messageSentFormatMessage () {
      return {
        ...this.formatMessage(),
        attachments: this.messageComposer.sms.attachments
      }
    },

    onSend () {
      const detected = this.detectLongUrl()
      this.processDetectLongUrl(detected)

      if (detected) {
        return
      }

      const message = this.formatMessage()
      this.$emit('message-sent', {
        ...this.messageSentFormatMessage(),
        type: CommunicationTypes.SMS
      })

      this.isSending = true
      return talk2Api.V1.message.send(message)
        .then(response => {
          this.resetMessageComposerSms()
          this.$generalNotification('Message sent.')
        }).catch(error => {
          console.log(error)
          this.$handleErrors(error.response)
        }).finally(() => {
          this.isSending = false
          this.urlShortenerDontAskUntilSend = false
        })
    },

    gifSelected (gif) {
      this.setMessageComposerSmsGif(gif)
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
      this.setMessageComposerSmsBody((this.messageComposer.sms.body ? this.messageComposer.sms.body + ' ' : '') + template.body)
    },

    variableSelected (variable) {
      this.setMessageComposerSmsBody((this.messageComposer.sms.body ? this.messageComposer.sms.body + ' ' : '') + variable)
    },

    attachmentUploaded (files) {
      files.forEach((file) => {
        this.appendMessageComposerSmsAttachments(file)
      })
    },

    showScheduleMessage () {
      this.scheduleMessageOpen(true)
    },

    focusInput () {
      const count = { data: 0 }
      this.focusInterval = setInterval(() => {
        if (typeof this.$refs.smsMessageBody !== 'undefined') {
          this.$refs.smsMessageBody.focus()
          clearInterval(this.focusInterval)
        }
        count.data++
        if (count.data > 180) {
          clearInterval(this.focusInterval)
        }
      }, 250)
    },

    onUpload (file) {
      const formData = new FormData()
      formData.append('file', file)

      const cancelToken = axios.CancelToken
      this.filesOnQueueToken[file.name] = cancelToken.source()

      talk2Api.V1.lines.fileUpload(this.selectedLine.id, formData, { cancelToken: this.filesOnQueueToken[file.name].token }).then(response => {
        this.appendMessageComposerSmsAttachments(response.data.uploaded_file)
        this.filesOnQueue.splice(this.filesOnQueue.findIndex(item => item.name === file.name), 1)
      }).catch(error => {
        if (window.axios.isCancel(error)) {
          console.log('Request canceled', error.message)
        }

        console.log(error)
        const message = this.filesOnQueue.length > 1 ? 'Error while uploading one of the files.' : 'Error while uploading file.'
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

      const byteCharacters = window.atob(b64Data)
      const byteArrays = []
      const offset = { data: null }
      const slice = { data: null }
      const byteNumbers = { data: null }
      const byteArray = { data: null }
      const index = { i: 0 }

      for (offset.data = 0; offset.data < byteCharacters.length; offset.data += sliceSize) {
        slice.data = byteCharacters.slice(offset.data, offset.data + sliceSize)

        byteNumbers.data = new Array(slice.data.length)
        for (index.i = 0; index.i < slice.data.length; index.i++) {
          byteNumbers.data[index.i] = slice.data.charCodeAt(index.i)
        }

        byteArray.data = new Uint8Array(byteNumbers.data)

        byteArrays.push(byteArray.data)
      }

      return new Blob(byteArrays, { type: contentType })
    },

    detectLongUrl () {
      // check only the long URL if:
      // - company is not white label
      // - URL shortener is forced enabled in the company level and user level
      // - dont ask flag is false (used for skipping the URL shortener prompt
      //   to be able to send the message)
      if (!this.urlShortenerDontAskUntilSend &&
                this.currentCompany &&
                !this.currentCompany.is_whitelabel &&
                this.currentCompany.url_shortener_enabled &&
                this.profile.url_shortener_enabled) {
        const text = this.messageComposer.sms.body
        const matches = text ? text.match(/\bhttps?:\/\/\S+/gi) : []
        return matches ? matches.filter((url) => !url.includes(this.urlShortenerDomain)).length > 0 : false
      }
      return false
    },

    closeUrlShortener () {
      this.urlShortenerDontAskUntilSend = true
      if (this.urlShortenerDontAsk &&
                this.profile.url_shortener_enabled) {
        this.disableUrlShortener()
      }
    },

    async generateShortUrl (send = false) {
      this.generatingShortUrl = true

      if (this.urlShortenerDontAsk) {
        this.setIsShortenedUrlRemembered(true)
      }

      talk2Api.V1.urlShortener.generate(this.messageComposer.sms.body)
        .then(({ data }) => {
          this.$generalNotification('Short URLs generated successfully.', 'success')
          this.messageComposer.sms.body = data.text
          this.generatingShortUrl = false
          this.urlShortenerDialog = false
          if (send) {
            this.onSend()
          }
        })
        .catch(e => {
          console.log(e)
          this.$generalNotification('Something went wrong when generating short URL.', 'error')
          this.generatingShortUrl = false
          this.urlShortenerDialog = false
        })
    },

    disableUrlShortener () {
      this.urlShortenerDontAsk = false
      talk2Api.V1.user.update(
        this.profile.id,
        Object.assign(this.profile, { url_shortener_enabled: false })
      )
      this.$generalNotification('URL Shortener disabled. To enable it again visit Settings > Personalization', 'success')
    },

    getDomains () {
      talk2Api.V1.urlShortener.domains()
        .then(({ data }) => {
          this.urlShortenerDomain = data.domains
          if (this.urlShortenerDomain.length > 0) {
            this.urlShortenerDomain = this.urlShortenerDomain[0]
          }
        })
      this.urlShortenerDialog = false
    },

    onInput (input) {
      this.$emit('messageChanged', input)
    },

    async imposeCharactersLimit (value) {
      if (!this.maxCharacters) {
        return
      }

      // Cleanup string from unwanted encoding - quotes
      value = this.$options.filters.cleanStringToUTF8(value.toString())

      // force reinstatement of maxlength (if bypassed)
      if (value && value.length > this.maxCharacters) {
        await this.$nextTick()

        this.messageComposer.sms.body = value.substr(0, this.maxCharacters)
      }
    }
  },

  mounted () {
    this.getDomains()

    if (this.resetOnLoad) {
      this.resetMessageComposerSms()
    }

    if (this.messageComposer.mode === 'sms') {
      this.focusInput()
    }
  },

  watch: {
    'messageComposer.sms.body': function (value) {
      this.$emit('messageChanged', value)
      this.setMessageComposerSmsBody(value)
    }
  },

  beforeDestroy () {
    clearInterval(this.focusInterval)
  }
}
</script>
