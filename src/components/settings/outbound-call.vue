<template>
  <b-container>
    <b-form>
      <b-form-row>
        <b-col sm="12" md="12">
          <div class="d-inline-flex">
            <slot name="header">
            </slot>
            <h1 class="mt-2"> Outbound Call Settings </h1>
          </div>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.outbound_calling_selector.hash_keyword}-container`">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Caller ID</h5>
            <p class="form-helper-text">Decide what line is used when this user makes an outbound call.</p>
          </div>
          <p class="text-bold fs-12">Outbound line: <b-badge variant="warning" v-if="currentCompany && currentCompany.force_outbound_line">Forced at account level</b-badge></p>
          <b-form-group label="" v-slot="{ ariaDescribedby }">
            <b-form-radio-group
              v-model="user.outbound_calling_selector"
              :options="options"
              :aria-describedby="ariaDescribedby"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'outbound_calling_selector')">
            </b-form-radio-group>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row :id="`${SettingsMap.default_outbound_campaign_id.hash_keyword}-container`"
                  v-if="showOutboundLineSelector">
        <b-col sm="12"
               md="6">
          <b-form-group
            label="Outbound Calling"
            class="form-label is-invalid"
          >
            <line-selector v-model.trim="$v.user.default_outbound_campaign_id.$model"
                           :class="[$v.user['default_outbound_campaign_id'].$invalid ? 'is-invalid' : '']"
                           :hasError="$v.user['default_outbound_campaign_id'].$invalid"
                           :state="validateState('default_outbound_campaign_id')"
                           :multiple="false"
                           :use-chips="false"
                           :use-input="true"
                           :generic-styling="false"
                           :generic-multiselect="false"
                           @change="(eventPayload) => onUpdateFields(eventPayload, 'default_outbound_campaign_id')">
            </line-selector>
            <b-form-invalid-feedback v-if="!$v.user.default_outbound_campaign_id.required">Please select an outbound line.</b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-form-row>
      <b-form-row class="mt-4"
                  :id="`${SettingsMap.outbound_call_recording_mode.hash_keyword}-container`">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Call Recordings <b-badge variant="warning" v-if="currentCompany && currentCompany.force_outbound_recording">Forced at account level</b-badge></h5>
            <p class="form-helper-text">Should outbound calls</p>
          </div>
          <b-form-group label="" v-slot="{ ariaDescribedby }">
            <b-form-radio-group
              v-model="user.outbound_call_recording_mode"
              :disabled="!hasRole(['Company Admin', 'Company Agent']) || (currentCompany && currentCompany.force_outbound_recording)"
              :options="callRecordingsOptions"
              :aria-describedby="ariaDescribedby"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'outbound_call_recording_mode')"
            >
            </b-form-radio-group>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4"
                  :id="`${SettingsMap.enabled_two_legged_outbound.hash_keyword}-container`">
        <b-col sm="12"
               md="12">
          <div>
            <h5 class="form-label">Two Legged Outbound Calls (Beta)</h5>
            <p class="form-helper-text">By enabling this option we will call your contacts with your secondary phone number.</p>
          </div>

          <b-form-group
            label=""
          >
            <b-form-checkbox switch
                             v-model="user.enabled_two_legged_outbound"
                             :value="true"
                             :unchecked-value="false"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'enabled_two_legged_outbound')">
              Enable Two Legged Outbound Calls
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-0"
                  :id="`${SettingsMap.secondary_phone_number.hash_keyword}-container`"
                  v-if="user.enabled_two_legged_outbound">
        <b-col sm="12"
               md="6">
          <b-form-group
            label="Secondary Phone Number"
            class="form-label"
          >
            <b-form-input
              type="text"
              placeholder="(123) 456-7890"
              v-model.trim="$v.user.secondary_phone_number.$model"
              :state="validateState('secondary_phone_number')"
              :disabled="user.role_name && user.read_only_access"
              @input="(eventPayload) => onUpdateFields(eventPayload, 'secondary_phone_number')">
            </b-form-input>
            <b-form-invalid-feedback v-if="!$v.user.secondary_phone_number.required">Enter secondary phone number.</b-form-invalid-feedback>
            <b-form-invalid-feedback v-if="!$v.user.secondary_phone_number.validPhone">Enter valid phone number (e.g. (123) 456-7890).</b-form-invalid-feedback>
          </b-form-group>
        </b-col>
      </b-form-row>

      <div :id="`${SettingsMap.vm_drop_library.hash_keyword}-container`">
        <b-form-row class="mt-4">
          <b-col sm="12"
                 md="12">
            <div>
              <h5 class="form-label">Voicemail Drop Library</h5>
              <p class="form-helper-text">Build your voicemail drop library here. When using the PowerDialer or calling a lot of leads manually, you can use voicemail drop to put a voicemail after the beep without being on the call.</p>
            </div>
          </b-col>
        </b-form-row>
        <user-vm-drop-library :user="user"></user-vm-drop-library>
      </div>
    </b-form>
  </b-container>
</template>

<script>
import LineSelector from 'components/generic-selectors/line-selector'
import { mapActions, mapState } from 'vuex'
import { aclMixin, settingsMixin } from 'src/plugins/mixins'
import UserVmDropLibrary from 'components/user-vm-drop-library'
import SettingsMap from 'components/settings/settings-map'
import { required } from 'vuelidate/lib/validators'
import _ from 'lodash'

export default {
  name: 'outbound-call',

  mixins: [aclMixin, settingsMixin],

  components: { UserVmDropLibrary, LineSelector },

  props: {
    user: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('settings', ['userClone']),
    outboundCallSettingEnabled () {
      return !this.hasRole(['Company Admin', 'Company Agent']) || (this.currentCompany && this.currentCompany.force_outbound_recording)
    },
    vmDropUploadUrl () {
      return `${window.axios.defaults.baseURL}/api/v1/user/pre-recorded-voicemail`
    },
    rules () {
      const rulesObject = { data: {} }

      if (this.showOutboundLineSelector) {
        rulesObject.data = { ...rulesObject.data,
          default_outbound_campaign_id: {
            required
          }
        }
      }

      if (this.user.enabled_two_legged_outbound) {
        rulesObject.data = { ...rulesObject.data,
          secondary_phone_number: {
            required,
            validPhone: (value) => this.$options.filters.fixPhone(value) !== false
          }
        }
      }

      return rulesObject.data
    }
  },

  validations () {
    return {
      user: this.rules
    }
  },

  data () {
    return {
      showOutboundLineSelector: false,
      selected: '',
      status: '',
      options: [
        { text: 'Use Company Default', value: 2, notEnabled: this.outboundCallSettingEnabled },
        { text: 'Select Manually', value: 1, notEnabled: this.outboundCallSettingEnabled },
        { text: 'Always Ask', value: 3, notEnabled: this.outboundCallSettingEnabled }
      ],
      callRecordingsOptions: [
        { text: 'Use Company Default', value: 1 },
        { text: 'Always Record', value: 2 },
        { text: 'Never Record', value: 3 }
      ],
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
    onUpdateFields: _.debounce(function (value, prop) {
      this.user[prop] = value
      this.updateChangedUserProperties({
        name: prop,
        value: value
      })

      if (prop === 'outbound_calling_selector') {
        this.showOutboundLineSelector = this.user.outbound_calling_selector === 1
      }

      if (prop === 'enabled_two_legged_outbound' && !this.user[prop]) {
        this.user.secondary_phone_number = this.userClone.secondary_phone_number
        this.updateChangedUserProperties({
          name: 'secondary_phone_number',
          value: this.userClone.secondary_phone_number
        })
      }

      this.updateFormValidity()
      this.$emit('onSave')
    }, 3000)
  },

  mounted () {
    this.showOutboundLineSelector = this.user.outbound_calling_selector === 1
  }
}
</script>
