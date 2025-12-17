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
            <h5 class="form-label">Caller ID
              <span
                v-if="hasCompanyTeamInboxLineManagementEnhancements"
                class="mx-1"
              >
                <information-circle-icon color="#2F80ED" />
                <q-tooltip
                  anchor="center start"
                  self="center left"
                  :offset="[-20, 10]"
                >
                  <div>
                    <span class="d-flex font-weight-bold">How Caller ID Works</span>
                    <ul class="mb-0 pl-3">
                      <li>When calling inside a Team Inbox, the system prioritizes the <strong>last used line in that inbox</strong> instead of the Caller ID you selected.</li>
                      <li>If the last used line in the inbox <strong>matches your Caller ID selection</strong>, the system auto-dials.</li>
                      <li>If the inbox has <strong>only one line</strong>, the system auto-dials using that line.</li>
                      <li>Your Caller ID setting is mainly used when making calls <strong>from the dialer outside the Team Inbox</strong>.</li>
                    </ul>
                  </div>
                </q-tooltip>
              </span>
            </h5>
            <p class="form-helper-text">Decide what line is used when this user makes an outbound call.</p>
          </div>
          <p class="text-bold fs-12"
             :class="{ 'mb-1': selectedCampaignInAccountLevel && outboundLineSettingsDisabled }">
            Outbound line: <b-badge variant="warning" v-if="currentCompany && currentCompany.force_outbound_line">Forced at account level</b-badge>
          </p>
          <p class="fs-12"
             v-if="selectedCampaignInAccountLevel">
             Selected line in the account level: <b>{{ selectedCampaignInAccountLevel }}</b></p>
          <b-form-group label="" v-slot="{ ariaDescribedby }">
            <b-form-radio-group
              class="outbound-line-selector"
              triggers="manual"
              :options="options"
              :aria-describedby="ariaDescribedby"
              :disabled="outboundLineSettingsDisabled"
              :title="outboundLineTooltipTitle"
              v-b-tooltip.hover.bottom
              v-model="user.outbound_calling_selector"
              @change="(eventPayload) => onUpdateFields(eventPayload, 'outbound_calling_selector')">
            </b-form-radio-group>
          </b-form-group>
        </b-col>
      </b-form-row>

      <b-form-row v-if="showInvalidCompanyDefaultLineAlert" class="mt-n4">
        <b-col sm="12">
          <p class="form-helper-text text-danger">
            {{ invalidForcedOutboundLineErrorMessage }}
          </p>
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
                           :hide-bottom-space="true"
                           :generic-styling="false"
                           :generic-multiselect="false"
                           :disable="outboundLineSettingsDisabled"
                           @change="(eventPayload) => onUpdateFields(eventPayload, 'default_outbound_campaign_id')"
                           @invalid-line-selection="onInvalidLineSelection">
            </line-selector>
            <b-form-invalid-feedback v-if="showInvalidLineSelectedError">
              {{ invalidLineSelectedErrorMessage }}
            </b-form-invalid-feedback>
            <b-form-invalid-feedback v-else-if="!$v.user.default_outbound_campaign_id.required">
              Please select an outbound line.
            </b-form-invalid-feedback>
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
              :disabled="(user.role_name && user.read_only_access)"
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

      <outbound-greeting :user="user" />
    </b-form>
  </b-container>
</template>

<script>
import LineSelector from 'components/generic-selectors/line-selector'
import { mapActions, mapState } from 'vuex'
import { aclMixin, settingsMixin, kycMixin, userMixin } from 'src/plugins/mixins'
import UserVmDropLibrary from 'components/user-vm-drop-library'
import SettingsMap from 'components/settings/settings-map'
import OutboundGreeting from 'components/settings/outbound-greeting.vue'
import InformationCircleIcon from 'components/icons/information-circle-icon'
import { required } from 'vuelidate/lib/validators'
import {
  OUTBOUND_CALLING_MODE_SELECTOR_USER_USE_COMPANY_DEFAULT,
  OUTBOUND_CALLING_MODE_SELECTOR_USER_SELECT_MANUALLY,
  OUTBOUND_CALLING_MODE_SELECTOR_USER_ALWAYS_ASK
} from 'src/constants/user-outbound-calling-modes'
import { COMPANY_AGENT } from 'src/constants/roles'
import { agentAvailableCampaignsCallback } from 'src/plugins/helpers/campaigns'

export default {
  name: 'outbound-call',

  mixins: [aclMixin, settingsMixin, kycMixin, userMixin],

  components: { UserVmDropLibrary, LineSelector, OutboundGreeting, InformationCircleIcon },

  props: {
    user: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      showOutboundLineSelector: false,
      selected: '',
      status: '',
      options: [
        { text: 'Use Company Default', value: OUTBOUND_CALLING_MODE_SELECTOR_USER_USE_COMPANY_DEFAULT, notEnabled: this.outboundLineSettingsDisabled },
        { text: 'Select Manually', value: OUTBOUND_CALLING_MODE_SELECTOR_USER_SELECT_MANUALLY, notEnabled: this.outboundLineSettingsDisabled },
        { text: 'Always Ask', value: OUTBOUND_CALLING_MODE_SELECTOR_USER_ALWAYS_ASK, notEnabled: this.outboundLineSettingsDisabled }
      ],
      callRecordingsOptions: [
        { text: 'Use Company Default', value: 1 },
        { text: 'Always Record', value: 2 },
        { text: 'Never Record', value: 3 }
      ],
      accountLevelOutboundCampaign: null,
      SettingsMap,
      invalidLineSelected: null,
      showInvalidLineSelectedError: false
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('settings', ['userClone']),
    ...mapState(['campaigns', 'campaignsIsLoading']),

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
    },

    outboundLineSettingsDisabled () {
      return this.currentCompany.force_outbound_line
    },

    outboundLineTooltipTitle () {
      return this.outboundLineSettingsDisabled ? 'Outbound line settings are disabled because it is forced at the account level' : ''
    },

    selectedCampaignInAccountLevel () {
      if (!this.currentCompany || !this.currentCompany.force_outbound_line) {
        return ''
      }

      return this.accountLevelOutboundCampaign?.name
    },

    availableAgentCampaigns () {
      if (this.shouldLimitAgentLinesVisibility) {
        return this.campaigns.filter(
          campaign => agentAvailableCampaignsCallback(campaign, this.profile.id)
        )
      }

      return this.campaigns
    },

    showInvalidCompanyDefaultLineAlert () {
      if (this.campaignsIsLoading) {
        return false
      }

      if (
        this.user.outbound_calling_selector !== OUTBOUND_CALLING_MODE_SELECTOR_USER_USE_COMPANY_DEFAULT &&
        !this.currentCompany?.force_outbound_line
      ) {
        return this.user.outbound_calling_selector === OUTBOUND_CALLING_MODE_SELECTOR_USER_ALWAYS_ASK
          ? !this.availableAgentCampaigns.length
          : false
      }

      if (!this.hasRole(COMPANY_AGENT)) {
        return false
      }

      return !this.availableAgentCampaigns.find(campaign => campaign.id === this.currentCompany?.default_outbound_campaign_id)
    },

    invalidLineSelectedErrorMessage () {
      if (!this.showInvalidLineSelectedError) {
        return ''
      }

      if (this.invalidLineSelected?.name) {
        return `Line '${this.invalidLineSelected.name}' is no longer available. Please select a different line.`
      }

      return 'The previously selected line is no longer available. Please select a different line.'
    },

    invalidForcedOutboundLineErrorMessage () {
      if (!this.availableAgentCampaigns.length) {
        return 'You don\'t have access to any lines. Please contact your company admin to be added to a Team Inbox before making calls.'
      }

      return this.outboundLineSettingsDisabled
        ? 'You don\'t have access to your assigned outbound line. Please contact your company admin to fix this issue.'
        : 'The company default line is no longer available. Please select a different line.'
    },

    shouldLimitAgentLinesVisibility () {
      return this.hasRole(COMPANY_AGENT) &&
        this.hasCompanyTeamInboxLineManagementEnhancements
    }
  },

  validations () {
    return {
      user: this.rules
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
      if (prop === 'default_outbound_campaign_id' && value) {
        this.invalidLineSelected = null
        this.showInvalidLineSelectedError = false
      }

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
    },

    setupAccountLevelOutboundCampaign () {
      if (this.currentCompany && this.currentCompany.force_outbound_line) {
        this.accountLevelOutboundCampaign = this.campaigns?.find(campaign => campaign.id === this.currentCompany.default_outbound_campaign_id)
      }
    },

    onInvalidLineSelection (campaign) {
      this.onUpdateFields(null, 'default_outbound_campaign_id')
      this.invalidLineSelected = campaign
      this.showInvalidLineSelectedError = true
    }
  },

  mounted () {
    this.showOutboundLineSelector = this.user.outbound_calling_selector === 1
  },

  watch: {
    'currentCompany.force_outbound_line': {
      immediate: true,
      handler () {
        this.setupAccountLevelOutboundCampaign()
      }
    },

    'campaigns': {
      immediate: true,
      handler () {
        this.setupAccountLevelOutboundCampaign()
      }
    }
  }
}
</script>
