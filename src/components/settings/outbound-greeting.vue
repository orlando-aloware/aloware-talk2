<template>
<b-form-row class="mt-4">
  <b-col sm="12">
    <p class="text-bold fs-12">
      Outbound Greeting: <b-badge variant="warning" v-if="disableOutboundGreeting">Forced at account level</b-badge>
    </p>
    <b-form-group label="" v-slot="{ ariaDescribedby }">
      <b-form-radio-group
        triggers="manual"
        :options="options"
        :aria-describedby="ariaDescribedby"
        :disabled="disableOutboundGreeting"
        :title="outboundGreetingTooltipTitle"
        v-b-tooltip.hover.bottom
        v-model="user.outbound_greeting_option"
        @change="(eventPayload) => onUpdateFields(eventPayload, 'outbound_greeting_option')">
      </b-form-radio-group>
    </b-form-group>
  </b-col>

  <b-col sm="12" v-if="showOutboundGreetingOptions">
    <q-tabs indicator-color="transparent"
            active-color="white"
            active-bg-color="primary"
            align="justify"
            class="w-500"
            narrow-indicator
            style="max-width: 300px;"
            v-model="activeTab">
      <q-tab name="tts" :ripple="false" no-caps :class="{'border': activeTab !== 'tts'}">
        <template v-slot>
          <div class="row items-center no-wrap">
            <i aria-hidden="true" role="img" class="q-icon on-left notranslate material-icons q-mr-xs">smart_toy</i>
            <span>Text to Speech</span>
          </div>
        </template>
      </q-tab>
      <q-tab name="upload" :ripple="false" no-caps :class="{'border': activeTab !== 'upload'}">
        <template v-slot>
          <div class="row items-center no-wrap">
            <i aria-hidden="true" role="img" class="q-icon on-left notranslate material-icons q-mr-xs">play_arrow</i>
            <span>Play Recording</span>
          </div>
        </template>
      </q-tab>
    </q-tabs>

    <q-tab-panels v-model="activeTab" class="border" style="margin-top: -1px;">
      <q-tab-panel name="tts">
        <div>
          <h5 class="form-label mb-2">Recording Message</h5>
          <div class="row no-wrap">
            <b-form-input type="text"
                          class="col h-auto"
                          v-model="user.outbound_record_tts"
                          @input="eventPayload => onUpdateFields(eventPayload, 'outbound_record_tts')" />
            <div class="d-flex align-items-center">
              <b-button class="ml-1"
                        variant="primary"
                        title="Add Variable"
                        data-testid="tags-button-add-tag"
                        @click="showVariableSelector = true">
                <i class="fa fa-plus"></i>
                <span> Add Variable</span>
              </b-button>
              <q-menu content-class="mx-height-300"
                      ref="variablesMenu"
                      data-testid="outbound-greeting-add-variable-menu"
                      :offset="[0,5]">
                <div class="row no-wrap q-pa-md">
                  <variables always-open
                             data-testid="outbound-greeting-variables-selected"
                             @variableSelected="variableSelected">
                  </variables>
                </div>
              </q-menu>
            </div>
          </div>
        </div>
      </q-tab-panel>

      <q-tab-panel name="upload" class="outbound-greeting-upload-tab">
        <b-form-row v-if="user.outbound_record_file !== null">
          <b-col sm="12">
            <audio controls>
                <source :src="recordedAudioSource">
                Your browser does not support the audio element.
            </audio>
            <button
              :disabled="loadingRemoveOutbound"
              class="btn btn-sm btn-danger ml-3"
              @click.prevent="deleteFile('outbound_recording_notices')"
            >
              <i class="fa fa-trash mr-2"/>
              <span>Remove file</span>
            </button>
          </b-col>
        </b-form-row>

        <b-form-row v-else>
          <b-col sm="12" md="6">
            <audio-recorder
              class="flex-grow-1 h-100"
              :upload-url="outboundGreetingUploadUrl"
              @recordedAudioUploaded="onFileUploaded"
            />
          </b-col>
          <b-col sm="12" md="6">
            <b-card class="flex-grow-1" title="Upload an audio file">
              <file-uploader
                accepted-file-types=".mp3, .wav"
                :upload-url="outboundGreetingUploadUrl"
                @fileUploaded="onFileUploaded"
              >
                <template slot="description">
                  <div class="text-center mt-2 notice">
                    <p class="mb-0">Supports MP3/WAV only.</p>
                    <p class="mb-0">Max. files size for images is 8MB</p>
                  </div>
                </template>
              </file-uploader>
            </b-card>
          </b-col>
        </b-form-row>
      </q-tab-panel>
    </q-tab-panels>
  </b-col>
</b-form-row>
</template>

<script>
import Variables from 'components/message-composer/options/variables'
import AudioRecorder from 'components/audio-recorder'
import FileUploader from 'components/file-uploader'
import { mapActions, mapGetters, mapState } from 'vuex'
import { OUTBOUND_GREETING_COMPANY_DEFAULT, OUTBOUND_GREETING_OPTIONS, OUTBOUND_GREETING_PLAY_MY_OWN_GREETING } from 'src/constants/user-outbound-greeting-options'

export default {
  name: 'outbound-greeting',

  components: {
    Variables,
    AudioRecorder,
    FileUploader
  },

  props: {
    user: {
      type: Object,
      required: true
    }
  },

  created () {
    if (this.disableOutboundGreeting) {
      // disable user outbound greeting if forced at account level
      this.user.outbound_greeting_option = OUTBOUND_GREETING_COMPANY_DEFAULT
    }
  },

  data () {
    return {
      activeTab: this.user?.outbound_record_file ? 'upload' : 'tts',
      showVariableSelector: false,
      loadingRemoveOutbound: false,
      options: OUTBOUND_GREETING_OPTIONS
    }
  },

  watch: {
    'user.outbound_record_file': {
      immediate: true,
      handler (newValue) {
        if (newValue) {
          this.activeTab = 'upload'
        }
      }
    },

    outboundGreetingSettings: {
      handler ({ outboundRecordTts, outboundRecordFile, outboundGreetingOption }) {
        if (
          outboundGreetingOption === OUTBOUND_GREETING_PLAY_MY_OWN_GREETING &&
          !outboundRecordFile &&
          !outboundRecordTts
        ) {
          this.setFormValidity(false)
          return
        }

        this.setFormValidity(true)
      }
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapGetters('auth', ['profile']),

    outboundGreetingSettings () {
      return {
        outboundRecordTts: this.user.outbound_record_tts,
        outboundRecordFile: this.user.outbound_record_file,
        outboundGreetingOption: this.user.outbound_greeting_option
      }
    },

    disableOutboundGreeting () {
      return this.currentCompany?.force_outbound_greeting
    },

    recordedAudioSource () {
      return `${this.$axios.defaults.baseURL}/static/uploaded_file/${this.user.outbound_record_file}`
    },

    outboundGreetingUploadUrl () {
      return `/api/v1/user/${this.user.id}/outbound-greeting`
    },

    outboundGreetingTooltipTitle () {
      return this.disableOutboundGreeting ? 'Outbound greeting settings are disabled because it is forced at the account level' : ''
    },

    showOutboundGreetingOptions () {
      return this.user.outbound_greeting_option === OUTBOUND_GREETING_PLAY_MY_OWN_GREETING
    }
  },

  methods: {
    ...mapActions('settings', [
      'updateChangedUserProperties',
      'setFormValidity',
      'resetChangedUserProperties'
    ]),

    onUpdateFields (value, prop) {
      this.user[prop] = value
      this.updateChangedUserProperties({
        name: prop,
        value: value
      })
    },

    variableSelected (variable) {
      this.user.outbound_record_tts = (this.user.outbound_record_tts ?? '') + ' ' + variable
      this.onUpdateFields(this.user.outbound_record_tts, 'outbound_record_tts')
    },

    onFileUploaded ({ file_name: fileName }) {
      this.user.outbound_record_file = fileName
      this.user.outbound_greeting_option = OUTBOUND_GREETING_PLAY_MY_OWN_GREETING
      this.resetChangedUserProperties()
      this.$generalNotification('File uploaded successfully.', 'success')
    },

    deleteFile () {
      const title = 'Remove file'
      const message = 'Your recorded file will be lost forever. Are you sure you want to remove it?'

      this.$bvModal.msgBoxConfirm(message, {
        title,
        size: 'md',
        noCloseOnBackdrop: true,
        noCloseOnEsc: true,
        buttonSize: 'sm',
        okTitle: 'Yes, Remove',
        cancelTitle: 'No, Don\'t remove it',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true
      }).then(result => {
        if (!result) {
          return
        }

        this.loadingRemoveOutbound = true

        this
          .$axios
          .delete(`/api/v1/user/${this.user.id}/outbound-greeting`)
          .then(() => {
            this.activeTab = 'tts'
            this.user.outbound_record_file = null
            this.$generalNotification('File deleted successfully.', 'success')

            if (!this.user.outbound_record_tts) {
              // if no TTS is set, set the outbound greeting option to the company default
              this.user.outbound_greeting_option = OUTBOUND_GREETING_COMPANY_DEFAULT
            }
          }).catch(err => {
            console.log(err)
            this.$generalNotification(err?.response || 'Failed to delete file.', 'error')
          }).finally(() => {
            this.loadingRemoveOutbound = false
          })
      })
    }
  }
}
</script>

<style>
.outbound-greeting-upload-tab {
  padding: 0 !important;
}
</style>
