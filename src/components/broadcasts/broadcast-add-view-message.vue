<template>
  <div class="broadcast-add broadcast-add__message">
    <b-form-radio-group stacked
                        value-field="id"
                        text-field="label"
                        :options="types"
                        v-model="type"/>
    <!-- sms -->
    <div class="broadcast-add__message__sms"
         v-if="type === 'sms'">
      <div class="broadcast-add__message__sms__composer-header">
        Limit: {{ smartEncodedMessageLength }} / {{ maxSmsBodyLength }}
      </div>

      <div class="broadcast-add__message__sms__composer-body">
        <message-composer-sms :max-attachments="1"
                              :max-characters="maxSmsBodyWithOptoutLength"
                              :reset-on-load="false"
                              :use-send-button="false"
                              :is-broadcast="true"
                              @messageChanged="messageLength"/>
      </div>

      <div class="broadcast-add__message__sms__composer-footer">
        <div class="d-flex items-center"
             style="z-index: 10">
          <information-circle-icon class="cursor-pointer"/>
          <q-tooltip>
            This is the text message you want to send to the selected group of contacts.<br>
            If the user has no contact name or 'Aloware Contact' as the name, then the variable will be blank.
          </q-tooltip>
        </div>
        <div class="d-flex items-center">
          <q-checkbox class="pr-4"
                      label="Add opt-out phrase for this message"
                      size="xs"
                      v-model="isOptoutActiveComputed"/>
          <span class="mr-4">
            Message parts: {{ messagePartCount }} / {{ baseLine }}
          </span>
          <span>
            Message(s): {{ messageCount }}
          </span>

        </div>
      </div>

      <div class="broadcast-add__message__sms__label-preview">
        Preview
      </div>

      <div :class="['broadcast-add__message__sms__preview', { 'broadcast-add__message__sms__preview--empty': smsBodyLength === 0 }]">
        <message-composer-sms-preview />
      </div>
    </div>

    <!-- voicemail -->
    <div class="broadcast-add__message__rmv"
         v-if="type === 'rvm'">
      <div class="broadcast-add__message__rmv__file-upload"
           v-if="!rvm">
        <audio-recorder class="flex-grow-1"
                        :upload-url="vmDropUploadUrl"
                        @recordedAudioUploaded="applyVMDropAudioFile">
        </audio-recorder>

        <b-card class="flex-grow-1"
                title="Upload an audio file">
          <file-uploader accepted-file-types=".mp3, .wav"
                         :upload-url="vmDropUploadUrl"
                         @fileUploaded="vmFileUploaded">
            <template slot="description">
              <div class="text-center mt-2 notice">
                <p class="mb-0">Supports MP3/WAV only.</p>
                <p class="mb-0">Max. files size for images is 8MB</p>
              </div>
            </template>
          </file-uploader>
        </b-card>
      </div>

      <div class="broadcast-add__message__rmv__file-preview"
           v-else>
        <waveform unique-id="broadcast-rvm-preview"
                  :remote-url="rvmUrl" />
        <span class="broadcast-add__message__rmv__file-preview__remove-icon"
              @click="onRemoveRVM">
          <close-icon icon-color="#fff"
                      height="20"
                      width="20"/>
          <q-tooltip>
            Remove RVM
          </q-tooltip>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import AudioRecorder from 'components/audio-recorder'
import CloseIcon from 'src/components/icons/close-icon.vue'
import FileUploader from 'components/file-uploader'
import InformationCircleIcon from 'components/icons/information-circle-icon.vue'
import MessageComposerSms from 'src/components/message-composer/message-composer-sms.vue'
import MessageComposerSmsPreview from 'src/components/message-composer/message-composer-sms-preview.vue'
import Waveform from 'src/components/waveform.vue'
import { mapActions, mapGetters, mapState } from 'vuex'
import { aclMixin, smsMixin } from 'src/plugins/mixins'

export default {
  name: 'broadcast-add-view-message',

  mixins: [
    aclMixin,
    smsMixin
  ],

  components: {
    AudioRecorder,
    CloseIcon,
    FileUploader,
    InformationCircleIcon,
    MessageComposerSms,
    MessageComposerSmsPreview,
    Waveform
  },

  props: {
    contactsLength: {
      type: Number,
      default: 0
    },

    rvm: {
      type: Object,
      default: null
    }
  },

  data: () => ({
    type: 'sms',
    maxSmsBodyLength: 1600
  }),

  computed: {
    ...mapState([
      'campaigns'
    ]),

    ...mapState('auth', [
      'profile'
    ]),

    ...mapGetters('contacts', [
      'messageComposer',
      'isOptoutActive',
      'optoutText',
      'messageBodyWithOptout'
    ]),

    isOptoutActiveComputed: {
      get () {
        return this.isOptoutActive
      },

      set (value) {
        return this.setIsOptoutActive(value)
      }
    },

    maxSmsBodyWithOptoutLength () {
      return this.isOptoutActive ? 1600 - this.optoutTextLength : 1600
    },

    isValid () {
      switch (this.type) {
        case 'sms':
          return this.messageComposer.sms.body && this.messageComposer.sms.body.trim().length > 0
        case 'rvm':
          return !!this.rvm?.file_name
        default:
          return false
      }
    },

    types () {
      return [
        {
          id: 'sms',
          label: 'SMS',
          enabled: this.hasPermissionTo('create broadcast message')
        },
        {
          id: 'rvm',
          label: 'Ringless Voicemail',
          enabled: this.hasPermissionTo('create broadcast rvm')
        }
      ].filter(type => type.enabled)
    },

    optoutTextLength () {
      return this.isOptoutActive ? this.optoutText.length : 0
    },

    smsBodyLength () {
      return this.smartEncodedMessageLength
    },

    hasMoreThanAscii () {
      if (this.smsBodyLength > 0) {
        return this.hasUnicode
      }

      return false
    },

    baseLine () {
      return this.segmentMaxChars
    },

    messagePartCount () {
      if (this.smsBodyLength > 0) {
        const count = this.smartEncodedMessageLength % this.segmentUsedChars
        return (count === 0 ? this.segmentMaxChars : count) || this.smartEncodedMessageLength
      }

      return 0
    },

    messageCount () {
      // Return the number of segments
      return this.segments
    },

    useMmsRate () {
      return this.messageComposer.sms.attachments.length > 0 || this.messageComposer.sms.gif_url.length > 0
    },

    price () {
      // get the rate based on the type
      const rate = this.type === 'rvm'
        ? this.profile.rate.rvm
        : this.useMmsRate ? this.profile.rate.local_mms : this.profile.rate.local_sms

      // get the messages count based on the type
      const messages = this.type === 'sms'
        ? this.messageCount
        : this.rvm ? 1 : 0

      return this.contactsLength * messages * rate
    },

    vmDropUploadUrl () {
      return `${window.axios.defaults.baseURL}/api/v1/broadcasts/upload/rvm`
    },

    rvmUrl () {
      return `${window.axios.defaults.baseURL}/static/uploaded_file/${this.rvm?.file_name}`
    }
  },

  created () {
    const campaign = this.profile.campaign_id
      ? this.campaigns.find(camp => camp.id === this.profile.campaign_id)
      : this.campaigns[0]

    this.setSelectedLine(campaign)

    // type setup
    this.type = this.rvm ? 'rvm' : 'sms'
    this.setIsOptoutActive(true)
  },

  methods: {
    ...mapActions('contacts', [
      'setMessageComposerSmsBody',
      'setSelectedLine',
      'setIsOptoutActive'
    ]),

    applyVMDropAudioFile (data) {
      this.$emit('rvm-updated', data)
    },

    vmFileUploaded (file) {
      this.$emit('rvm-updated', file)
    },

    onRemoveRVM () {
      this.$emit('rvm-updated', null)
    }
  },

  watch: {
    isValid: {
      immediate: true,
      handler (state) {
        this.$emit('input', state)
      }
    },

    isOptoutActive: {
      immediate: true,
      handler () {
        const newBody = this.messageComposer.sms.body.substring(0, this.maxSmsBodyWithOptoutLength)
        this.setMessageComposerSmsBody(newBody)
        this.messageLength(newBody)
        this.getMessageInfo(newBody)
      }
    },

    type (type) {
      // clean content of non-selected types
      switch (type) {
        case 'sms':
          this.$emit('rvm-updated', null)
          break
        case 'rvm':
          this.setMessageComposerSmsBody('')
          break
      }

      this.$emit('type-updated', type)
    },

    price: {
      immediate: true,
      handler (price) {
        this.$emit('price-updated', price)
      }
    }
  }
}
</script>
