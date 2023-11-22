<template>
  <b-container>
    <b-form>
      <b-form-row>
        <b-col sm="12" md="12">
          <div class="d-inline-flex">
            <slot name="header">
            </slot>
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
                                :disable="viewOnly"
                                @select="(eventPayload) => onUpdateFields(eventPayload, 'extension')">
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
              This setting sets the working hours for this user. If a call comes in outside of these hours it won't ring this user. Note that the times are local to <b>your company</b> timezone, currently set to <b>{{ companyTimezone }}</b>
            </p>
          </div>
          <business-hours v-if="!isLoadingOperatingHours && operatingHours"
                          type="select"
                          color="#256EFF"
                          :days="user.operating_hours"
                          :time-increment="timeIncrement"
                          :switch-width="75"
                          :disabled="viewOnly"
                          @updated-hours="(eventPayload) => onUpdateFields(eventPayload, 'operating_hours')">
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
                v-model="missedCallHandlingMode"
                :options="options"
                :aria-describedby="ariaDescribedby"
                :disabled="viewOnly"
                @input="(eventPayload) => onUpdateFields(eventPayload, 'missedCallHandlingMode')">
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
                  :id="`${SettingsMap.operating_states_limit.hash_keyword}-container`"
                  v-if="isAdmin">
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
              :disabled="viewOnly"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'disableGeoRouting')">
              Do not enable geo-routing for this user
            </b-form-checkbox>
          </b-form-group>

          <div v-if="!disableGeoRouting">
            <b-form-group label="United States"
                          v-if="[null, 'US'].includes(user.country)"
                          v-slot="{ ariaDescribedby }">
              <b-form-checkbox-group
                class="group-checkbox d-flex flex-wrap"
                v-model="user.operating_states_limit.us"
                :options="states.us"
                :aria-describedby="ariaDescribedby"
                @change="(eventPayload) => onUpdateFields(eventPayload, 'operating_states_limit.us')">
              </b-form-checkbox-group>
              <br>
              <br>
              <b-form-group label="" >
                <b-form-checkbox
                  switch
                  v-model="checkAllUS"
                  :value="true"
                  :unchecked-value="false"
                  @change="(eventPayload) => onUpdateFields(eventPayload, 'checkAllUS')">
                  Check All
                </b-form-checkbox>
              </b-form-group>
            </b-form-group>

            <b-form-group label="Canada"
                          v-if="user.country === 'CA'"
                          v-slot="{ ariaDescribedby }">
              <b-form-checkbox-group
                class="group-checkbox d-flex flex-wrap"
                v-model="user.operating_states_limit.ca"
                :options="states.ca"
                :aria-describedby="ariaDescribedby"
                @change="(eventPayload) => onUpdateFields(eventPayload, 'operating_states_limit.ca')">
              </b-form-checkbox-group>

              <br>
              <br>
              <b-form-group label="" >
                <b-form-checkbox
                  switch
                  v-model="checkAllCA"
                  :value="true"
                  :unchecked-value="false"
                  @change="(eventPayload) => onUpdateFields(eventPayload, 'checkAllCA')">
                  Check All
                </b-form-checkbox>
              </b-form-group>
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
              :disabled="viewOnly"
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
              placeholder="Enter missed call message here..."
              rows="3"
              max-rows="6"
              id="ta-text-follow up"
              :disabled="viewOnly"
              v-model.trim="$v.user.missed_call_message.$model"
              :state="validateState('missed_call_message')"
              @input="(eventPayload) => onUpdateFields(eventPayload, 'missed_call_message')"
            ></b-form-textarea>

            <b-form-invalid-feedback v-if="!$v.user.missed_call_message.required">Please provide a missed call message.</b-form-invalid-feedback>

            <b-button size="sm"
                      variant="primary"
                      class="mt-2"
                      :disabled="viewOnly">
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

            <b-button size="sm"
                      variant="primary"
                      class="mt-2 ml-2"
                      :disabled="viewOnly">
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
              :disabled="viewOnly"
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
            <b-form-textarea placeholder="Enter missed call message here..."
                             rows="3"
                             max-rows="6"
                             id="ta-user-completed-call-message"
                             v-model.trim="$v.user.completed_call_message_caller.$model"
                             :state="validateState('completed_call_message_caller')"
                             @input="(eventPayload) => onUpdateFields(eventPayload, 'completed_call_message_caller')"
            ></b-form-textarea>
            <b-form-invalid-feedback v-if="!$v.user.completed_call_message_caller.required">Please provide a completed call message to the caller.</b-form-invalid-feedback>

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
import _ from 'lodash'
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
import { aclMixin, settingsMixin, kycMixin } from 'src/plugins/mixins'
import SettingsMap from 'components/settings/settings-map'
import { required } from 'vuelidate/lib/validators'
export default {
  name: 'inbound-call',

  mixins: [aclMixin, settingsMixin, kycMixin],

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

  validations () {
    return {
      user: this.rules
    }
  },

  computed: {
    ...mapState('settings', ['userClone', 'changedUserProperties']),
    baseUrl () {
      return window.axios.defaults.baseURL
    },
    missedCallVMUploadUrl () {
      return `${window.axios.defaults.baseURL}/api/v1/user/${this.user.id}/missed-call-voicemail`
    },
    shouldMessageIfCallCompleted () {
      return this.user.should_message_caller_if_completed === 1
    },
    rules () {
      const rulesObject = { data: {} }

      if (this.user.should_message_if_missed) {
        rulesObject.data = { ...rulesObject.data, missed_call_message: { required } }
      }

      if (this.user.should_message_caller_if_completed) {
        rulesObject.data = { ...rulesObject.data, completed_call_message_caller: { required } }
      }

      return rulesObject.data
    },
    companyTimezone () {
      return this.profile?.company?.timezone || 'America/Los_Angeles'
    }
  },

  data () {
    return {
      isLoadingOperatingHours: false,
      isDeletingMissedCallVMAudioFile: false,
      disableAreaCodeRouting: true,
      disableGeoRouting: true,
      checkAllUS: false,
      checkAllCA: false,
      operatingStatesLimit: {
        us: [],
        ca: []
      },
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
      SettingsMap,
      missedCallHandlingMode: null,
      operatingHours: null
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
      if (!this.user[field]) {
        this.user[field] = template.body
      } else {
        this.user[field] += ' ' + template.body
      }

      this.focusOwnerElement()
      this.$refs.templatesMenu.hide()
    },
    variableSelected (variable, field) {
      if (!this.user[field]) {
        this.user[field] = variable
      } else {
        this.user[field] += ' ' + variable
      }

      this.focusOwnerElement()
      this.$refs.variablesMenu.hide()
    },
    focusOwnerElement () {
      this.$nextTick(function () {
        const textAreaCompletedCallElement = document.getElementById('ta-user-completed-call-message')
        if (textAreaCompletedCallElement) {
          textAreaCompletedCallElement.dispatchEvent(new Event('input'))
          textAreaCompletedCallElement.focus()
        }

        const textAreaFollowUpElement = document.getElementById('ta-text-follow up')

        if (textAreaFollowUpElement) {
          textAreaFollowUpElement.dispatchEvent(new Event('input'))
          textAreaFollowUpElement.focus()
        }
      })
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
      if (!['disableGeoRouting', 'disableAreaCodeRouting', 'checkAllUS', 'checkAllCA', 'operating_hours', 'missed_calls_settings.missed_call_handling_mode', 'operating_states_limit.us', 'operating_states_limit.ca', 'missedCallHandlingMode', 'operatingHours'].includes(prop)) {
        const newValue = value || this.user[prop]
        this.user[prop] = newValue
        this.updateChangedUserProperties({
          name: prop,
          value: newValue
        })
      }

      if (prop === 'operating_hours') {
        const key = Object.keys(value)[0]
        this.updateChangedUserProperties({
          name: 'operating_hours.' + key,
          value: value[key]
        })
      }

      if (prop === 'missedCallHandlingMode') {
        this.user['missed_calls_settings'] = { ...this.user.missed_calls_settings, 'missed_call_handling_mode': value }
        this.updateChangedUserProperties({
          name: 'missed_calls_settings.missed_call_handling_mode',
          value: value
        })
      }

      if (prop === 'disableGeoRouting') {
        if ([null, 'US'].includes(this.user.country)) {
          this.user.operating_states_limit.us = []
          this.updateChangedUserProperties({
            name: 'operating_states_limit.us',
            value: []
          })
        }

        if (this.user.country === 'CA') {
          this.user.operating_states_limit.ca = []
          this.updateChangedUserProperties({
            name: 'operating_states_limit.ca',
            value: []
          })
        }
      }

      if (prop === 'operating_states_limit.us') {
        this.user['operating_states_limit'] = { ...this.user.operating_states_limit, us: value }
        this.updateChangedUserProperties({
          name: prop,
          value: value
        })
      }

      if (prop === 'checkAllUS') {
        const states = value ? this.states.us : []
        this.user['operating_states_limit'] = { ...this.user.operating_states_limit, us: states }
        this.updateChangedUserProperties({
          name: 'operating_states_limit.us',
          value: states
        })
      }

      if (prop === 'operating_states_limit.ca') {
        this.user.operating_states_limit.ca = value
        this.updateChangedUserProperties({
          name: prop,
          value: value
        })
      }

      if (prop === 'checkAllCA') {
        const states = value ? this.states.ca : []
        this.user.operating_states_limit.ca = states
        this.updateChangedUserProperties({
          name: 'operating_states_limit.ca',
          value: states
        })
      }

      if (prop === 'disableAreaCodeRouting' && value) {
        // this.user.operating_area_codes_limit = this.clone.operating_area_codes_limit
        // this.updateChangedUserProperties({
        //   name: 'operating_area_codes_limit',
        //   value: this.clone.operating_area_codes_limit
        // })
      }

      this.updateFormValidity()
    },
    resetDisableGeoRouting (value) {
      // If the form is saved without operating_states_limits for any country, return to disabled
      let country = (this.user.country || 'us').toLowerCase()
      if (_.get(value, 'operating_states_limit.' + country, []).length === 0) {
        this.disableGeoRouting = true
      }
    }
  },

  watch: {
    'user.operating_states_limit.us': function (value) {
      if (value) {
        this.checkAllUS = value.length === this.states.us.length
      }
    },
    'user.operating_states_limit.ca': function (value) {
      if (value) {
        this.checkAllCA = value.length === this.states.ca.length
      }
    },
    'user.missed_calls_settings.missed_call_handling_mode': function (value) {
      this.missedCallHandlingMode = value
    },
    'userClone': function (value) {
      this.resetDisableGeoRouting(value)
    },
    'changedUserProperties': function (value) {
      // Reset disable geoRouting if changes are cancelled
      if (value.length === 0) {
        this.resetDisableGeoRouting(this.userClone)
      }
    }
  },

  mounted () {
    if ((this.user.operating_states_limit.us && this.user.operating_states_limit.us.length) || (this.user.operating_states_limit && this.user.operating_states_limit.ca.length)) {
      this.disableGeoRouting = false
    }

    this.missedCallHandlingMode = this.user.missed_calls_settings.missed_call_handling_mode
    this.operatingHours = { ...this.user.operating_hours }
  }
}
</script>
