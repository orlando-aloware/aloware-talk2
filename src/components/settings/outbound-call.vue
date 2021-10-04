<template>
  <b-container>
    <b-form>
      <b-form-row>
        <b-col sm="12" md="12">
          <div class="d-inline-flex">
            <h1 class="mt-2"> Outbound Call Settings </h1>
          </div>
        </b-col>
      </b-form-row>
      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Caller ID</h5>
            <p class="form-helper-text">Decide what line is used when this user makes an outbound call.</p>
          </div>
          <p class="text-bold fs-12">Outbound line:</p>
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

      <b-form-row class="mt-4" v-if="user.outbound_calling_selector === 1">
        <b-col sm="12" md="6">
          <b-form-group
            label="Select the lines to get notified from"
            class="form-label"
          >
            <line-selector v-model="user.default_outbound_campaign_id"
                           :multiple="false"
                           :use-chips="true"
                           :generic-styling="false"
                           :generic-multiselect="false"
                           @change="(eventPayload) => onUpdateFields(eventPayload, 'default_outbound_campaign_id')">
            </line-selector>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Call Recordings <b-badge variant="warning" v-if="currentCompany && currentCompany.force_outbound_recording">Forced at account level</b-badge></h5>
            <p class="form-helper-text">Should outbound calls</p>
          </div>
          <b-form-group label="" v-slot="{ ariaDescribedby }">
            <b-form-radio-group
              v-model="user.outbound_call_recording_mode"
              :options="callRecordingsOptions"
              :aria-describedby="ariaDescribedby"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'outbound_call_recording_mode')"
            >
            </b-form-radio-group>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Two Legged Outbound Calls (Beta)</h5>
            <p class="form-helper-text">By enabling this option we will call your contacts with your secondary phone number.</p>
          </div>

          <b-form-group
            label=""
          >
            <b-form-checkbox switch
                             v-model="user.enabled_two_legged_outbound"
                             value="true"
                             unchecked-value="false"
                             @change="(eventPayload) => onUpdateFields(eventPayload, 'outbound_call_recording_mode')">
              Enable Two Legged Outbound Calls
            </b-form-checkbox>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-0" v-show="user.enabled_two_legged_outbound">
        <b-col sm="12" md="6">
          <b-form-group
            label="Secondary Phone Number"
            class="form-label"
          >
            <b-form-input
              type="text"
              placeholder="(123) 456-7890"
              v-model="user.secondary_phone_number"
              :disabled="user.role_name && user.read_only_access"
              @input="(eventPayload) => onUpdateFields(eventPayload, 'secondary_phone_number')">
            </b-form-input>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row class="mt-4">
        <b-col sm="12" md="12">
          <div>
            <h5 class="form-label">Voicemail Drop Library</h5>
            <p class="form-helper-text">Build you voicemail drop library here. When using the PowerDialer or calling a lot of leads manually, you can use voicemail drop to put a voicemail after the beep without being on the call.</p>
          </div>
        </b-col>
      </b-form-row>
      <user-vm-drop-library :user="user"></user-vm-drop-library>
    </b-form>
  </b-container>
</template>

<script>
import LineSelector from 'components/generic-selectors/line-selector'
import { mapActions, mapState } from 'vuex'
import { aclMixin } from 'src/plugins/mixins'
import UserVmDropLibrary from 'components/user-vm-drop-library'

export default {
  name: 'outbound-call',

  mixins: [aclMixin],

  components: { UserVmDropLibrary, LineSelector },

  props: {
    user: {
      type: Object,
      required: true
    }
  },

  computed: {
    ...mapState(['currentCompany']),
    outboundCallSettingEnabled () {
      return !this.hasRole(['Company Admin', 'Company Agent']) || (this.currentCompany && this.currentCompany.force_outbound_recording)
    },
    vmDropUploadUrl () {
      return `${window.axios.defaults.baseURL}/api/v1/user/pre-recorded-voicemail`
    }
  },

  data () {
    return {
      showPasswordFields: false,
      selected: '',
      status: '',
      options: [
        { text: 'Use Account Default', value: 2, notEnabled: this.outboundCallSettingEnabled },
        { text: 'Select Manually', value: 1, notEnabled: this.outboundCallSettingEnabled },
        { text: 'Always Ask', value: 3, notEnabled: this.outboundCallSettingEnabled }
      ],
      callRecordingsOptions: [
        { text: 'Use Account Default', value: 1 },
        { text: 'Always Record', value: 2 },
        { text: 'Never Record', value: 3 }
      ]
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
    onUpdateFields (value, prop) {
      this.user[prop] = value
      this.updateChangedUserProperties({
        name: prop,
        value: value
      })

      if (prop === 'outbound_calling_selector' && this.user[prop] !== 1) {
        this.user.outbound_calling_selector = this.userClone.outbound_calling_selector
        this.updateChangedUserProperties({
          name: 'outbound_calling_selector',
          value: this.userClone.outbound_calling_selector
        })
      }

      if (prop === 'enabled_two_legged_outbound' && !this.user[prop]) {
        this.user.secondary_phone_number = this.userClone.secondary_phone_number
        this.updateChangedUserProperties({
          name: 'secondary_phone_number',
          value: this.userClone.secondary_phone_number
        })
      }
    }
  }
}
</script>
