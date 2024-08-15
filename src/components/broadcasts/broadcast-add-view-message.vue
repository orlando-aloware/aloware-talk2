<template>
  <div class="broadcast-add broadcast-add__message">
    <div class="broadcast-add__schedule__row"
         v-if="propCampaign">
      <div class="broadcast-add__schedule__row__label">
        From
        <span>
          <information-circle-icon class="cursor-pointer"/>
          <q-tooltip>
            The line you want to send the bulck messages campaign from.
          </q-tooltip>
        </span>
      </div>
      <div class="broadcast-add__schedule__row__fields">
        <contact-line-selector :value="propCampaign?.id"
                               @select="onCampaignSelected"/>
        <broadcast-warning-note :campaign="propCampaign" />
      </div>
    </div>

    <div class="broadcast-add__schedule__row">
      <div class="broadcast-add__schedule__row__label">
        Throttling
        <a target="_blank"
           :href="propCampaign?.max_mps <= mpsLimit ? getComplianceURL() : '#'">
          <information-circle-icon class="ml-2 cursor-pointer"/>
          <q-tooltip>
            This is an hourly throttling limit on your bulk message campaign.<br>
            Throttling comes directly from the carrier based on brand trust score.<br>
            <span v-if="propCampaign?.max_mps <= mpsLimit">
              To increase your MPS rate, please register your line cliking on this button.
            </span>
          </q-tooltip>
        </a>
      </div>
      <div class="broadcast-add__schedule__row__fields">
        <throttle-selector :campaign="propCampaign"
                           v-model="throttle"/>
      </div>
    </div>

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
                              @messageChanged="onMessageChanged"/>
      </div>

      <div class="broadcast-add__message__sms__composer-footer">
        <div class="d-flex items-center"
             style="z-index: 10">
          <information-circle-icon class="cursor-pointer"/>
          <q-tooltip>
            This is the text message you want to send to the selected group of contacts.<br>
            If the user has no contact name or '{{ whiteLabelContactText }} Contact' as the name, then the variable will be blank.
          </q-tooltip>
        </div>
        <div class="d-flex items-center">
          <q-checkbox class="pr-4"
                      size="xs"
                      :disable="isOptOutForced"
                      v-model="isOptoutActiveComputed">
              Add opt-out phrase for this message
              <q-tooltip v-if="isOptOutForced">
                {{ optoutTooltipText }}
              </q-tooltip>
            </q-checkbox>
          <span class="mr-4">
            Message parts: {{ messagePartCount }} / {{ charactersPerPage }}
          </span>
          <span>
            Message(s): {{ messageCount() }}
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
import ContactLineSelector from 'src/components/contact-line-selector.vue'
import ThrottleSelector from 'src/components/generic-selectors/throttle-selector.vue'
import BroadcastWarningNote from 'src/components/broadcasts/broadcast-warning-note.vue'
import { mapActions, mapGetters, mapState } from 'vuex'
import { aclMixin, broadcastsMixin, classicMixin, smsMixin, simpsocialMixin } from 'src/plugins/mixins'
import { IS_OPT_OUT_FORCED_TEXT } from '../../constants/compliance-messages'

export default {
  name: 'broadcast-add-view-message',

  mixins: [
    aclMixin,
    broadcastsMixin,
    classicMixin,
    smsMixin,
    simpsocialMixin
  ],

  components: {
    AudioRecorder,
    CloseIcon,
    FileUploader,
    InformationCircleIcon,
    MessageComposerSms,
    MessageComposerSmsPreview,
    Waveform,
    ContactLineSelector,
    ThrottleSelector,
    BroadcastWarningNote
  },

  props: {
    rvm: {
      type: Object,
      default: null
    },

    propCampaign: {
      type: Object,
      required: false,
      default: null
    },

    propThrottle: {
      type: Object,
      required: false,
      default: null
    }
  },

  data: () => ({
    type: 'sms',
    maxSmsBodyLength: 1600, // Maximum length of a single SMS message body.
    throttle: null, // Throttling settings for the campaign, controls the rate of message sending.
    mpsLimit: 0.25 // Maximum messages per second (MPS) that the campaign is allowed to send.
  }),

  computed: {
    ...mapState('cache', [
      'currentCompany'
    ]),

    ...mapState([
      'campaigns'
    ]),

    ...mapState('auth', [
      'profile'
    ]),

    ...mapState('broadcast', [
      'contactsLength'
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

    isOptOutForced () {
      return this.currentCompany.force_opt_out_phrase
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

    messagePartCount () {
      if (this.smsBodyLength > 0) {
        const count = this.smartEncodedMessageLength % this.charactersPerPage
        return (count === 0 ? this.charactersPerPage : count) || this.smartEncodedMessageLength
      }

      return 0
    },

    vmDropUploadUrl () {
      return `${window.axios.defaults.baseURL}/api/v1/broadcasts/upload/rvm`
    },

    rvmUrl () {
      return `${window.axios.defaults.baseURL}/static/uploaded_file/${this.rvm?.file_name}`
    },

    optoutTooltipText () {
      return IS_OPT_OUT_FORCED_TEXT
    }
  },

  created () {
    this.setCampaign()
    this.throttle = this.propThrottle

    // type setup
    this.type = this.rvm ? 'rvm' : 'sms'
    this.setIsOptoutActive(true)
  },

  methods: {
    ...mapActions('contacts', [
      'setMessageComposerSmsBody',
      'setIsOptoutActive'
    ]),

    applyVMDropAudioFile (data) {
      this.$emit('rvm-updated', data)
      this.updatePrice()
    },

    vmFileUploaded (file) {
      this.$emit('rvm-updated', file)
      this.updatePrice()
    },

    onRemoveRVM () {
      this.$emit('rvm-updated', null)
      this.updatePrice()
    },

    onCampaignSelected (campaign) {
      this.$emit('campaign', campaign)
    },

    setCampaign () {
      if (this.propCampaign) {
        this.onCampaignSelected(this.propCampaign)
        return
      }

      this.onCampaignSelected(this.propCampaign ?? this.profile.campaign_id
        ? this.campaigns.find(camp => camp.id === this.profile.campaign_id)
        : this.campaigns[0])
    },

    updatePrice () {
      this.$emit('price-updated', this.getEstimatedPrice())
    },

    onMessageChanged (message) {
      this.messageLength(message)
      this.updatePrice()
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

    propCampaign (campaign) {
      this.updatePrice()
    },

    throttle (value) {
      this.$emit('throttle', value)
    }
  }
}
</script>
