<template>
  <b-container>
    <b-form>
      <b-form-row>
        <b-col sm="12" md="12">
          <div class="d-inline-flex">
            <h1 class="mt-2"> Inbound Call Settings </h1>
          </div>
        </b-col>
      </b-form-row>
      <b-form-row class="mt-4"
                  :id="`${SettingsMap.extension.hash_keyword}-container`">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Extension</h5>
            <p class="form-helper-text">An extension is a unique company-wide identifier for a user. You can select an extension here and setup your line's IVR to listen for extensions. When a caller enters an extension we will automatically connect the call to the respective user.</p>
          </div>

          <b-form-group label="" class="w-50">
            <extension-selector v-model="user.extension"
                                @select="(eventPayload) => onUpdateFields(eventPayload, 'observing_campaigns')">
            </extension-selector>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.operating_hours.hash_keyword}-container`">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Working Hours</h5>
            <p class="form-helper-text">
              This setting sets the working hours for this user. If a call comes in outside of these hours it won't ring this user. Note that the times are local to <b>your company</b> timezone, currently set to <b>America/Los_Angeles</b>
            </p>
          </div>
          <business-hours v-if="!isLoadingOperatingHours && user.operating_hours"
                          type="select"
                          color="#256EFF"
                          :days="user.operating_hours"
                          :time-increment="timeIncrement">
          </business-hours>
        </b-col>
      </b-form-row>

      <div :id="`${SettingsMap.missed_calls_settings.hash_keyword}-container`">
        <b-form-row class="mt-4">
          <b-col sm="12" md="12">
            <div>
              <h5 class="form-label">Personal Voicemail</h5>
              <p class="form-helper-text">Should {{ statics.name }} take a voicemail when this user is not available and their extension is dialed?</p>
            </div>
            <p class="text-bold fs-12">When a direct call is missed:</p>
            <b-form-group label="" v-slot="{ ariaDescribedby }">
              <b-form-radio-group
                id="radio-slots"
                name="radio-options-slots"
                v-model="user.missed_calls_settings.missed_call_handling_mode"
                :options="options"
                :aria-describedby="ariaDescribedby"
                @change="(eventPayload) => onUpdateFields(eventPayload, 'missed_calls_settings.missed_call_handling_mode')">
              </b-form-radio-group>
            </b-form-group>
          </b-col>
        </b-form-row>
        <div v-if="user.missed_calls_settings && user.missed_calls_settings.missed_call_handling_mode === MISSED_CALL_BEHAVIOR_VOICEMAIL">
        <b-card
          header-tag="header"
          footer-tag="footer"
          v-if="user.missed_calls_settings.voicemail_file !== null">
          <div>
            <audio
                ref="vmAudio"
                id="vm-audio-file"
                controls>
              <source :src="`${baseUrl}/static/uploaded_file/${user.missed_calls_settings.voicemail_file}`">
              Your browser does not support the audio element.
            </audio>
          </div>

          <template #footer>
            <b-button size="sm"
                      variant="primary"
                      :disabled="isDeletingMissedCallVMAudioFile"
                      @click="playMissedCallVMAudioFile">
              <i class="fa fa-play"></i> Play
            </b-button>
            <b-button size="sm"
                      variant="danger"
                      class="ml-2"
                      :disabled="isDeletingMissedCallVMAudioFile"
                      @click="deleteMissedCallVMFile">
              <q-spinner-bars v-if="isDeletingMissedCallVMAudioFile" color="white" />
              <i class="fa fa-trash" v-else></i>
              {{ isDeletingMissedCallVMAudioFile ? 'Removing File...' : 'Remove File' }}
            </b-button>
          </template>
        </b-card>
        <b-card-group deck v-if="!user.missed_calls_settings.voicemail_file">
        <audio-recorder :upload-url="missedCallVMUploadUrl"
                        @recordedAudioUploaded="applyMissedCallVMAudioFile">
        </audio-recorder>

        <b-card title="Upload an audio file" header-tag="header" footer-tag="footer">
          <file-uploader accepted-file-types=".mp3, .wav"
                         :upload-url="missedCallVMUploadUrl"
                         @fileUploaded="fileUploaded">
            <template slot="description">
              <div class="text-center mt-2 notice">
                <p class="mb-0">Supports MP3/WAV only.</p>
                <p class="mb-0">Max. files size for images is 8MB</p>
              </div>
            </template>
          </file-uploader>
        </b-card>
      </b-card-group>
      </div>
      </div>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.operating_states_limit.hash_keyword}-container`">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Operating States</h5>
            <p class="form-helper-text">Check all that apply. If you operate nation-wide, click "Check All".</p>
          </div>

          <b-form-group label="" >
            <b-form-checkbox
              v-model="disableGeoRouting"
              :value="true"
              :unchecked-value="false"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'disableGeoRouting')">
              Do not enable geo-routing for this user
            </b-form-checkbox>
          </b-form-group>

          <div v-if="!disableGeoRouting">
            <b-form-group label="United States" v-slot="{ ariaDescribedby }">
              <b-form-checkbox-group
                class="group-checkbox d-flex flex-wrap"
                v-model="user.operating_states_limit.us"
                :options="states.us"
                :aria-describedby="ariaDescribedby"
                @change="(eventPayload) => onUpdateFields(eventPayload, 'operating_states_limit.us')"
              ></b-form-checkbox-group>
            </b-form-group>

            <b-form-group label="Canada" v-slot="{ ariaDescribedby }" v-if="user.country === 'CA'">
              <b-form-checkbox-group
                class="group-checkbox d-flex flex-wrap"
                v-model="user.operating_states_limit.ca"
                :options="states.ca"
                :aria-describedby="ariaDescribedby"
                @change="(eventPayload) => onUpdateFields(eventPayload, 'operating_states_limit.ca')"
              ></b-form-checkbox-group>
            </b-form-group>
          </div>
        </b-col>
      </b-form-row>

      <div :id="`${SettingsMap.operating_area_codes_limit.hash_keyword}-container`">
        <b-form-row class="mt-4">
          <b-col sm="12" md="12">
            <div>
              <h5 class="form-label">Operating Area Codes (Beta)</h5>
              <p class="form-helper-text">Customize the area codes that you operate on.</p>
            </div>

            <b-form-group label="" >
              <b-form-checkbox
                v-model="disableAreaCodeRouting"
                :value="true"
                :unchecked-value="false"
                :disabled="!hasRole(['Company Admin', 'Company Agent'])"
                @change="(eventPayload) => onUpdateFields(eventPayload, 'disableAreaCodeRouting')">
                Do not enable area code routing for this user
              </b-form-checkbox>
            </b-form-group>
          </b-col>
        </b-form-row>

        <b-form-row class="mt-4" v-if="!disableAreaCodeRouting">
        <b-col sm="12" md="6">
          <b-form-group
            label=""
            class="form-label"
          >
            <us-area-code-selector v-model="user.operating_area_codes_limit"
                                   :generic-styling="false"
                                   :use-chips="true"
                                   :multiple="true"
                                   @select="(eventPayload) => onUpdateFields(eventPayload, 'operating_area_codes_limit')">
            </us-area-code-selector>
          </b-form-group>
        </b-col>
      </b-form-row>
      </div>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.should_message_if_missed.hash_keyword}-container`">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Follow up</h5>
            <p class="form-helper-text">Send a message to the attempted agent who missed a call. The lead information (phone number) will be automatically appended.</p>
          </div>

          <b-form-group label="" >
            <b-form-checkbox
              v-model="user.should_message_if_missed"
              :value="true"
              :unchecked-value="false"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'should_message_if_missed')">
              If the call is missed, send a text message to this agent.
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.missed_call_message.hash_keyword}-container`"
                  v-if="user.should_message_if_missed">
        <b-col sm="12"
               md="12">
          <b-form-group
            label=""
            class="form-label"
          >
            <b-form-textarea
              id="textarea"
              v-model="user.missed_call_message"
              placeholder="Enter missed call message here..."
              rows="3"
              max-rows="6"
              @input="(eventPayload) => onUpdateFields(eventPayload, 'missed_call_message')"
            ></b-form-textarea>
            <b-button size="sm" variant="primary" class="mt-2">
              <q-menu content-class="mx-height-300"
                      ref="templatesMenu"
                      :offset="[0,5]">
                <div class="row no-wrap q-pa-md">
                  <message-templates @templateSelected="(e) => templateSelected(e, 'missed_call_message')"></message-templates>
                </div>
              </q-menu>
              <calendar-today-icon color="#FFF"
                                   :height="16"
                                   :width="16" ></calendar-today-icon> Templates
            </b-button>

            <b-button size="sm" variant="primary" class="mt-2 ml-2">
              <q-menu content-class="mx-height-300"
                      ref="variablesMenu"
                      :offset="[0,5]">
                <div class="row no-wrap q-pa-md">
                  <variables always-open
                             @variableSelected="(e) => variableSelected(e, 'missed_call_message')"></variables>
                </div>
              </q-menu>
              <variable-icon color="#FFF"
                             :height="18"
                             :width="18"></variable-icon> Variables
            </b-button>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4" :id="`${SettingsMap.should_message_caller_if_completed.hash_keyword}-container`">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Caller Notification</h5>
            <p class="form-helper-text">Notify caller with a text message</p>
          </div>

          <b-form-group label="" >
            <b-form-checkbox
              v-model="user.should_message_caller_if_completed"
              :value="1"
              :unchecked-value="0"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'should_message_caller_if_completed')">
              If the call is completed, send a text message to the caller.
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.completed_call_message_caller.hash_keyword}-container`"
                  v-if="user.should_message_caller_if_completed">
        <b-col sm="12"
               md="12">
          <b-form-group
            label=""
            class="form-label"
          >
            <b-form-textarea
              id="textarea"
              v-model="user.completed_call_message_caller"
              placeholder="Enter missed call message here..."
              rows="3"
              max-rows="6"
              @input="(eventPayload) => onUpdateFields(eventPayload, 'completed_call_message_caller')"
            ></b-form-textarea>
            <b-button size="sm" variant="primary" class="mt-2">
              <q-menu content-class="mx-height-300"
                      ref="templatesMenu"
                      :offset="[0,5]">
                <div class="row no-wrap q-pa-md">
                  <message-templates @templateSelected="(e) => templateSelected(e, 'completed_call_message_caller')"></message-templates>
                </div>
              </q-menu>
              <calendar-today-icon color="#FFF"
                                   :height="16"
                                   :width="16" ></calendar-today-icon> Templates
            </b-button>

            <b-button size="sm" variant="primary" class="mt-2 ml-2">
              <q-menu content-class="mx-height-300"
                      ref="variablesMenu"
                      :offset="[0,5]">
                <div class="row no-wrap q-pa-md">
                  <variables always-open
                             @variableSelected="(e) => variableSelected(e, 'completed_call_message_caller')"></variables>
                </div>
              </q-menu>
              <variable-icon color="#FFF"
                             :height="18"
                             :width="18">
              </variable-icon> Variables
            </b-button>
          </b-form-group>
        </b-col>
      </b-form-row>
    </b-form>
  </b-container>
</template>

<script>
import { MISSED_CALL_BEHAVIOR_NOTHING, MISSED_CALL_BEHAVIOR_VOICEMAIL } from 'src/constants/missed-call-behavior'
import ExtensionSelector from 'components/generic-selectors/extension-selector'
import MessageTemplates from 'components/message-composer/options/message-templates'
import CalendarTodayIcon from 'components/icons/calendar-today-icon'
import Variables from 'components/message-composer/options/variables'
import VariableIcon from 'components/icons/variable-icon'
import UsAreaCodeSelector from 'components/generic-selectors/us-area-code-selector'
import AudioRecorder from 'components/audio-recorder'
import talk2Api from 'src/plugins/api/api'
import FileUploader from 'components/file-uploader'
import { mapActions, mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'
import SettingsMap from 'components/settings/settings-map'

export default {
  name: 'inbound-call',

  mixins: [aclMixin],

  components: { FileUploader, AudioRecorder, UsAreaCodeSelector, VariableIcon, Variables, CalendarTodayIcon, MessageTemplates, ExtensionSelector },

  props: {
    user: {
      type: Object,
      required: true
    },
    statics: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapState('settings', ['userClone']),
    baseUrl () {
      return window.axios.defaults.baseURL
    },
    missedCallVMUploadUrl () {
      return `${window.axios.defaults.baseURL}/api/v1/user/${this.user.id}/missed-call-voicemail`
    }
  },

  data () {
    return {
      isLoadingOperatingHours: false,
      isDeletingMissedCallVMAudioFile: false,
      disableAreaCodeRouting: true,
      disableGeoRouting: true,
      options: [
        { text: 'Do Nothing', value: MISSED_CALL_BEHAVIOR_NOTHING },
        { text: 'Voicemail', value: MISSED_CALL_BEHAVIOR_VOICEMAIL }
      ],
      states: {
        us: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'],
        ca: ['AB', 'BC', 'MB', 'NB', 'NL', 'NT', 'NS', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']
      },
      MISSED_CALL_BEHAVIOR_VOICEMAIL,
      MISSED_CALL_BEHAVIOR_NOTHING,
      timeIncrement: 30,
      SettingsMap
    }
  },

  methods: {
    ...mapActions('settings', ['updateChangedUserProperties']),

    extensionSelected (extension) {
      this.user.extension = extension
    },
    campaignSelected (campaignId) {
      this.user.campaign_id = campaignId
    },
    templateSelected (template, field) {
      this.user[field] += ' ' + template.body

      this.$refs.templatesMenu.hide()
    },
    variableSelected (variable, field) {
      this.user[field] += ' ' + variable
      this.$refs.variablesMenu.hide()
    },
    playMissedCallVMAudioFile () {
      this.$refs.vmAudio.play()
    },
    deleteMissedCallVMFile () {
      this.isDeletingMissedCallVMAudioFile = true
      return talk2Api.V1.user.deleteMissedCallVM(this.user.id).then(response => {
        this.isDeletingMissedCallVMAudioFile = false
        this.user.missed_calls_settings.voicemail_file = null
        this.$generalNotification('Missed call voicemail has been successfully deleted.', 'success')
      }).catch(err => {
        this.isDeletingMissedCallVMAudioFile = false
        this.$generalNotification(err.response, 'error')
      })
    },
    applyMissedCallVMAudioFile (audio) {
      this.user.missed_calls_settings.voicemail_file = audio.uid
    },
    fileUploaded (file) {
      this.user.missed_calls_settings.voicemail_file = file['file_name']
    },
    onUpdateFields (value, prop) {
      if (!['disableGeoRouting', 'disableAreaCodeRouting'].includes(prop)) {
        this.user[prop] = value
        this.updateChangedUserProperties({
          name: prop,
          value: value
        })
      }

      if (prop === 'disableGeoRouting' && !this.user[prop]) {
        this.user.operating_states_limit.us = this.userClone.operating_states_limit.us
        this.updateChangedUserProperties({
          name: 'operating_states_limit.us',
          value: this.userClone.operating_states_limit.us
        })

        this.user.operating_states_limit.ca = this.userClone.operating_states_limit.ca
        this.updateChangedUserProperties({
          name: 'operating_states_limit.ca',
          value: this.userClone.operating_states_limit.ca
        })
      }

      if (prop === 'disableAreaCodeRouting' && !this.user[prop]) {
        this.user.operating_area_codes_limit = this.userClone.operating_area_codes_limit
        this.updateChangedUserProperties({
          name: 'operating_area_codes_limit',
          value: this.userClone.operating_area_codes_limit
        })
      }
    }
  },

  watch: {
    'user.operating_hours': {
      handler () {
        this.updateChangedUserProperties({
          name: 'operating_hours',
          value: this.user.operating_hours
        })
      },
      deep: true
    }
  },

  mounted () {
    if (this.user.operating_states_limit.us.length || this.user.operating_states_limit.ca.length) {
      this.disableGeoRouting = false
    }

    if (this.user.operating_area_codes_limit.length) {
      this.disableAreaCodeRouting = false
    }
  }
}
</script>
