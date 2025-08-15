<template>
  <div class="row no-wrap pt-3 pb-3 width-380 dialer-wrapper"
       id="dialer-popover"
       data-testid="dialer-form-wrapper"
       :class="dialerFormClass">
    <div class="loading-container"
         v-if="isMakingCall"
         data-testid="dialer-loading-container">
      <div class="mobile-call-loader">
        <q-spinner-bars color="white" size="5em"/>
      </div>
    </div>
    <div class="col phone-padding dialer-tabs-wrapper"
         :class="{'no-padding': !isMobile}"
         v-if="!isMakingCall"
         data-testid="dialer-tabs-container">
      <b-tabs class="dialer-tabs"
              pills
              vertical
              data-testid="dialer-tabs">
        <block-tooltip placement="left"
                       triggers="hover focus"
                       target="dialer-popover"
                       :show.sync="blockTooltipHandler.show"
                       :task="blockTooltipHandler.task"
                       :message="getMessagingBlocked(selectedCampaign)"
                       v-if="isBlockTooltipPopoverEnabled"
                       data-testid="dialer-block-tooltip">
        </block-tooltip>
        <b-tab title="Call"
               :active="mode === 'call'"
               @click="setMode('call')"
               data-testid="dialer-call-tab">
          <b-form-group class="mb-1"
                        :invalid-feedback="invalidCampaign"
                        :state="validCampaign"
                        data-testid="dialer-call-campaign-group">
            <line-selector class="line-selector"
                           prepend="From:"
                           specificClass="dialer-line-selector"
                           is-dialer
                           :disable="lineSelectorDisabled"
                           :generic-multiselect="false"
                           :is-loading="isLoadingLastUsedCallLine"
                           v-model="campaignId"
                           @change="changeCampaignId"
                           data-testid="dialer-call-line-selector">
            </line-selector>
          </b-form-group>

          <div class="d-inline-flex align-items-center justify-content-between dialer w-100"
               v-if="mode === 'call'"
               data-testid="dialer-call-controls">
            <b-form-group class="mb-0"
                          :invalid-feedback="invalidPhoneNumber"
                          :state="validPhoneNumberSearch"
                          data-testid="dialer-call-phone-group">
              <contact-phone-number-search class="width-190"
                                           id="calls-popover"
                                           ref="callContactPhoneNumberSearch"
                                           :no_prepend="true"
                                           v-model="phoneNumber"
                                           @change="phoneNumberChanged"
                                           @keyup.enter.native="onCall"
                                           @searchResults="onPhoneNumberSearch"
                                           data-testid="dialer-call-phone-search">
              </contact-phone-number-search>
            </b-form-group>
            <div data-testid="dialer-call-button-container">
              <q-btn icon="img:app-icons/dialer/call_btn.svg"
                     size="32px"
                     class="icon-btn auto-size height-32"
                     align="right"
                     padding="none"
                     rounded
                     flat
                     :ripple="true"
                     :disable="callDisabled"
                     @click="onCall"
                     data-testid="dialer-call-button">
              </q-btn>
              <q-tooltip v-if="isAgentOnCall"
                         data-testid="dialer-agent-on-call-tooltip">
                There is a call in progress on another device. If you think this is an error, please refresh your screen.
              </q-tooltip>
            </div>
          </div>

          <div class="dialer-contact-info width-190"
               v-if="contactId"
               data-testid="dialer-call-contact-info">
            <div class="text-size-sm text-grey-80 _400 mb-0 d-flex justify-content-between"
                 v-if="contactId"
                 data-testid="dialer-call-contact-header">
              <div class="d-inline-flex text-left" data-testid="dialer-call-contact-name">{{ isMobile ? contactName : $options.filters.truncate(contactName, 15) }}</div>
              <div class="d-inline-flex text-right"
                   v-if="currentLocalTime"
                   data-testid="dialer-call-contact-time">
                ~{{ currentLocalTime }}
              </div>
            </div>
            <p class="text-size-sm text-grey-80 _400 mb-1"
               v-if="contactId && companyName"
               data-testid="dialer-call-company-name">
              {{ companyName }}
            </p>
            <div v-if="!contactId && validPhoneNumber && phoneNumber && !loadingContact"
                 data-testid="dialer-call-new-number">
              <span class="text-size-sm text-grey-80 _400">New number</span>
            </div>
          </div>
        </b-tab>
        <b-tab title="Message"
               :active="mode === 'text'"
               @click="setMode('text')"
               data-testid="dialer-message-tab">
          <b-form-group class="mb-1"
                        :invalid-feedback="invalidCampaign"
                        :state="validCampaign"
                        data-testid="dialer-message-campaign-group">
            <line-selector class="line-selector"
                           prepend="From:"
                           check-blocked-messaging
                           :generic-multiselect="false"
                           :use-only-actives="true"
                           v-model="campaignId"
                           @change="changeCampaignId"
                           data-testid="dialer-message-line-selector">
            </line-selector>
          </b-form-group>
          <div class="d-inline-flex align-items-end justify-content-between dialer w-100"
               v-if="mode === 'text'"
               data-testid="dialer-message-controls">
            <b-form-group class="mb-0 w-100"
                          :invalid-feedback="invalidPhoneNumber"
                          :state="validPhoneNumberSearch"
                          data-testid="dialer-message-phone-group">
              <contact-phone-number-search ref="textContactPhoneNumberSearch"
                                           id="texts-popover"
                                           v-model="phoneNumber"
                                           @change="phoneNumberChanged"
                                           @keyup.enter.native="sendText"
                                           @searchResults="onPhoneNumberSearch"
                                           data-testid="dialer-message-phone-search">
              </contact-phone-number-search>
            </b-form-group>
          </div>

          <div class="dialer-contact-info w-100"
               v-if="contactId"
               data-testid="dialer-message-contact-info">
            <div class="text-size-sm text-grey-80 _400 mb-0 d-flex justify-content-between"
                 v-if="contactId"
                 data-testid="dialer-message-contact-header">
              <div class="d-inline-flex text-left" data-testid="dialer-message-contact-name">{{ isMobile ? contactName : $options.filters.truncate(contactName, 15) }}</div>
              <div class="d-inline-flex text-right"
                   v-if="currentLocalTime"
                   data-testid="dialer-message-contact-time">
                ~{{ currentLocalTime }}
              </div>
            </div>
            <p class="text-size-sm text-grey-80 _400 mb-1"
               v-if="contactId && companyName"
               data-testid="dialer-message-company-name">
              {{ companyName }}
            </p>
            <div v-if="!contactId && validPhoneNumber && phoneNumber && !loadingContact"
                 data-testid="dialer-message-new-number">
              <span class="text-size-sm text-grey-80 _400">New number</span>
            </div>
          </div>

          <div class="mobile-message-composer mb-2"
               data-testid="dialer-message-composer">
            <b-input-group data-testid="dialer-message-input-group">
              <template #append>
                <b-input-group-text class="bg-white border-left-0 align-items-end"
                                    data-testid="dialer-message-send-container">
                  <q-btn class="height-16 no-q-btn-focus"
                         padding="none"
                         flat
                         :disable="sendDisabled || isSending || isMessagingBlocked(selectedCampaign, true)"
                         :ripple="false"
                         @click="sendText"
                         data-testid="dialer-message-send-button">
                    <send-text-icon :width="isMobile ? 18 : 16"
                                    :height="isMobile ? 18: 16"
                                    :color="sendTextColor">
                    </send-text-icon>
                  </q-btn>
                </b-input-group-text>
              </template>
              <b-form-textarea class="textarea-no-auto-shrink text-size-sm _400 border-right-0 overflow-hidden pl-2 pr-2 border-half-rounded"
                               placeholder="Text Message..."
                               rows="2"
                               max-rows="3"
                               :disabled="isBlockTooltipPopoverEnabled"
                               v-model="textMessage"
                               data-testid="dialer-message-textarea">
              </b-form-textarea>
            </b-input-group>
          </div>
        </b-tab>
      </b-tabs>
    </div>
    <h1 class="phone-padding lh-27 mb-3"
        v-if="isMobile && parkedCalls.length > 0"
        data-testid="dialer-parked-calls-title">
      Parked Call{{ parkedCalls.length > 1 ? 's' : '' }}
    </h1>
    <div class="mobile-parked-calls-list"
         v-if="isMobile"
         data-testid="dialer-parked-calls-container">
      <div class="loading-container"
           v-if="loadingParkedCalls"
           data-testid="dialer-parked-calls-loading">
        <div class="mobile-call-loader">
          <q-spinner-bars color="white"
                          size="5em"
          />
        </div>
      </div>
      <div class="position-relative h-100"
           v-if="parkedCalls.length"
           data-testid="dialer-parked-calls-list">
        <div class="overflow-y-scroll h-100"
             data-testid="dialer-parked-calls-scroll">
          <template v-for="parkedCall in parkedCalls">
            <mobile-parked-call :key="parkedCall.id"
                                :communication="parkedCall"
                                :data-testid="`dialer-parked-call-${parkedCall.id}`"/>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import ContactPhoneNumberSearch from 'components/dialer/contact-phone-number-search'
import LineSelector from 'components/generic-selectors/line-selector'
import SendTextIcon from 'components/icons/send-text-icon'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'
import MobileParkedCall from 'components/dialer/mobile-parked-call'
import BlockTooltip from 'components/kyc/block-tooltip'
import {
  aclMixin,
  contactMixin,
  contactV2AttributesMixin,
  kycMixin,
  outboundCallingModesMixin,
  selectorMixin,
  settingsMixin,
  timezoneCheckMixin,
  visibilityMixin
} from 'src/plugins/mixins'
import * as AgentStatus from 'src/constants/agent-status'
import useContactApi from 'src/shared/composables/use-contact-api.composable'

export default {
  name: 'dialer-form',

  mixins: [
    contactMixin,
    contactV2AttributesMixin,
    timezoneCheckMixin,
    visibilityMixin,
    aclMixin,
    selectorMixin,
    kycMixin,
    outboundCallingModesMixin,
    settingsMixin
  ],

  components: {
    MobileParkedCall,
    ContactPhoneNumberSearch,
    LineSelector,
    SendTextIcon,
    BlockTooltip
  },

  props: {
    value: {
      type: Boolean,
      required: false
    }
  },

  data () {
    return {
      mode: 'call',
      defaultOutboundCampaignId: null,
      campaignId: null,
      phoneNumber: '',
      contactName: '',
      companyName: '',
      contactId: null,
      contactTimezone: null,
      currentLocalTime: null,
      lastContactCampaignId: null,
      loadingContact: false,
      textMessage: '',
      isMakingCall: false,
      isSending: false,
      hasPhoneNumberSearchResults: false,
      previousOutboundCallingMode: null,
      blockTooltipHandler: {
        task: 'call',
        show: false
      },
      isLoadingLastUsedCallLine: false
    }
  },

  setup () {
    const { getLastUsedCallLineByContactId } = useContactApi()

    return {
      getLastUsedCallLineByContactId
    }
  },

  computed: {
    ...mapState('cache', ['currentCompany']),

    ...mapState([
      'dialer',
      'parkedCalls',
      'loadingParkedCalls',
      'isMobile',
      'campaigns'
    ]),

    ...mapGetters('auth', ['profile']),

    sendTextColor () {
      return this.sendDisabled ? '#D8D8D8' : '#256EFF'
    },

    validPhoneNumber () {
      return this.$options.filters.fixPhone(this.phoneNumber) !== false
    },

    validPhoneNumberSearch () {
      return this.hasPhoneNumberSearchResults || this.$options.filters.fixPhone(this.phoneNumber) !== false
    },

    invalidPhoneNumber () {
      return 'Please enter a valid phone number'
    },

    validCampaign () {
      return this.campaignId !== null
    },

    invalidCampaign () {
      return 'Please select a line'
    },

    isAgentOnCall () {
      return this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL
    },

    callDisabled () {
      const isCallDisabled = !this.validPhoneNumber ||
      !this.phoneNumber.length ||
      !this.campaignId ||
      this.isAgentOnCall

      return isCallDisabled
    },

    sendDisabled () {
      return !this.validPhoneNumber || !this.phoneNumber.length || !this.campaignId || !this.textMessage
    },

    isBlockTooltipPopoverEnabled () {
      let selectedCampaign = this.campaigns.find(campaign => campaign.id === this.selectedCampaignId)

      if (this.mode !== 'text') {
        return false
      }

      if (!this.shouldAllowSmsTraffic(selectedCampaign)) {
        return true
      }

      if (this.disabledComplianceMessage) {
        return true
      }

      return false
    },

    dialerFormClass () {
      const callClass = this.isMakingCall ? 'loading-cover-screen' : ''
      let modeClass = ''

      switch (this.mode) {
        case 'call':
          modeClass = 'on-call-tab'
          break
        case 'text':
          modeClass = 'on-text-tab'
      }

      return [
        callClass,
        modeClass
      ]
    },

    disabledComplianceMessage () {
      return this.selectedCampaign && this.isMessagingBlocked(this.selectedCampaign, true) && this.mode === 'text' ? this.selectedCampaign?.blocked_messaging_information?.['reason'] : ''
    },

    lineSelectorDisabled () {
      return (this.defaultOutboundCampaignId && this.mode === 'call') && this.forceOutboundLine
    }
  },

  created () {
    this.$VueEvent.listen('changePhoneNumber', async (data) => {
      if (!this.campaignId) {
        await this.findDefaultOutboundCampaign()
      }

      this.setMode('call')

      await this.changePhoneNumber(data)
      await this.setLastUsedCallLine()

      if (this.campaignId && (this.shouldMakeCallDirectlyAccountLevel || this.shouldMakeCallDirectlyUserLevel) && !this.callDisabled) {
        this.makeCall()
      }
    })
  },

  mounted () {
    if (this.value) {
      this.showDialer()
    } else {
      this.hideDialer()
    }

    if (this.profile) {
      this.previousOutboundCallingMode = this.profile.outbound_calling_mode
    }
  },

  methods: {
    showDialer () {
      // find default outbound campaign
      this.findDefaultOutboundCampaign()
      this.$emit('show')
    },

    hideDialer () {
      this.$emit('hide')
      this.resetForm()
    },

    resetForm () {
      this.phoneNumber = ''
      this.contactName = ''
      this.companyName = ''
      this.contactId = null
      this.contactTimezone = null
      this.lastContactCampaignId = null

      if (!this.isMobile) {
        this.defaultOutboundCampaignId = null
        this.campaignId = null
      }

      this.mode = 'call'
      this.textMessage = ''
    },

    phoneNumberChanged (data) {
      this.changePhoneNumber(data).catch(_ => {
      })
      // check if a line has not yet been selected, select the last used line for the contact
      if (!this.campaignId) {
        this.campaignId = this.lastContactCampaignId
      }
    },

    async changePhoneNumber (data) {
      this.phoneNumber = data.currentNumber
      this.contactName = data.contactName
      this.companyName = data.companyName
      this.contactId = data.contactId
      this.contactTimezone = data.contactTimezone

      if (!this.contactId) {
        this.loadingContact = true

        await this.getContactByPhoneNumber(this.phoneNumber).then((data) => {
          this.contactName = data?.name
          this.companyName = data?.company_name
          this.contactId = data?.id
          this.contactTimezone = data?.timezone
          this.lastContactCampaignId = data?.last_campaign_id
          this.loadingContact = false
        }).catch(_ => {
          this.loadingContact = false
        })
      }

      this.setupContactLocalTime()

      return Promise.resolve()
    },

    setupContactLocalTime () {
      if (this.contactTimezone) {
        this.getContactLocalTime()
        this.$options.localTimeInterval = setInterval(this.getContactLocalTime, 60 * 1000)
      }
    },

    hideLocalTime () {
      this.showLocalTime = false
    },

    getContactLocalTime () {
      if (this.contactTimezone) {
        this.currentLocalTime = this.$moment.utc().tz(this.contactTimezone).format('h:mm a')
      }
    },

    changeCampaignId (campaignId) {
      this.campaignId = campaignId
    },

    findDefaultOutboundCampaign () {
      if (this.previousOutboundCallingMode &&
        this.profile &&
        this.previousOutboundCallingMode === this.profile.outbound_calling_mode &&
        this.previousOutboundCallingMode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ACCOUNT_ALWAYS_ASK) {
        return
      }

      this.previousOutboundCallingMode = this.profile.outbound_calling_mode
      this.campaignId = null
      this.defaultOutboundCampaignId = null

      // 1. [Account level] force outbound line on all users
      if (this.currentCompany && this.currentCompany.force_outbound_line) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId

        return
      }

      // 2. [User level] Outbound line is set to follow account default
      if (this.currentCompany && this.profile && this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ACCOUNT_DEFAULT && !this.profile.default_outbound_campaign_id) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId

        return
      }

      // 3. [User level] user has a default outbound line
      if (this.profile && this.profile.default_outbound_campaign_id && this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ACCOUNT_DEFAULT) {
        console.log('dialer: user level - user has a default outbound line')
        this.defaultOutboundCampaignId = this.profile.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId
      }

      // 4. We couldn't find anything
    },

    setMode (mode) {
      this.mode = mode
      this.blockTooltipHandler.task = mode
    },

    onCall () {
      const params = {
        timezone: this.contactTimezone,
        name: this.contactName,
        calls_notifications_open_time: this.currentCompany.calls_notifications_open_time,
        calls_notifications_close_time: this.currentCompany.calls_notifications_close_time
      }
      this.checkContactTimezone(params, () => this.makeCall(true))
    },

    makeCall (isFromDialer = false) {
      if (this.callDisabled) {
        return
      }

      this.$VueEvent.fire('makeCall', {
        isFromDialer,
        currentNumber: this.$options.filters.fixPhone(this.phoneNumber),
        outboundCampaignId: this.campaignId,
        contactName: this.contactName,
        companyName: this.companyName,
        contactId: this.contactId
      })

      if (!this.isMobile) {
        this.hideDialer()
      }

      if (this.isMobile) {
        this.isMakingCall = true
      }
    },

    sendText () {
      if (this.sendDisabled || this.isSending) {
        return
      }

      this.isSending = true

      this.$axios.post('/api/v1/campaign/send-message-to-phone-number/' + this.campaignId, {
        phone_number: this.$options.filters.fixPhone(this.phoneNumber),
        message: this.textMessage
      }).then(res => {
        this.isSending = false
        this.hideDialer()
        this.$generalNotification('Message sent')

        if (!this.isMobile) {
          this.$router.push({
            name: 'Contact',
            params: {
              id: res.data.id
            }
          }).catch(err => {
            console.error(err)
          })
        }
      }).catch(err => {
        this.isSending = false
        this.$handleErrors(err.response)
      })
    },

    resetSMS () {
      this.sms = {
        campaign_id: null,
        phone_number: null,
        message: null
      }
    },

    onPhoneNumberSearch (value) {
      this.hasPhoneNumberSearchResults = value
    },

    showBlockTooltip () {
      this.blockTooltipHandler.show = true
    },

    hideBlockTooltip () {
      this.blockTooltipHandler.show = false
    },

    async setLastUsedCallLine () {
      // if there is a campaignId or no contactId, we don't need to fetch the last used call line
      if (this.campaignId || !this.contactId) return

      try {
        this.isLoadingLastUsedCallLine = true
        const data = await this.getLastUsedCallLineByContactId(this.contactId)

        this.campaignId = data.campaign_id
      } catch (error) {
        this.$handleErrors(error.response)
      } finally {
        this.isLoadingLastUsedCallLine = false
      }
    }
  },

  watch: {
    value () {
      if (this.value) {
        this.showDialer()

        return
      }

      this.hideDialer()
    },

    campaignId (value) {
      this.selectedCampaignId = value
    },

    'dialer.currentStatus': function () {
      if (!this.dialer.currentStatus || (this.dialer.currentStatus && this.dialer.currentStatus === 'READY')) {
        this.isMakingCall = false
      }
    },

    mode (value) {
      if (value === 'call') {
        this.findDefaultOutboundCampaign()
      }
    },

    'profile': {
      deep: true,
      handler: function () {
        if (!this.previousOutboundCallingMode) {
          this.previousOutboundCallingMode = this.profile.outbound_calling_mode
        }

        this.findDefaultOutboundCampaign()
      }
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('changePhoneNumber')
    clearInterval(this.$options.localTimeInterval)
  }
}
</script>
