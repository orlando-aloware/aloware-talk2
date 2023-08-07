<template>
  <div class="row no-wrap pt-3 pb-3 width-380 dialer-wrapper"
       :class="dialerFormClass">
    <div class="loading-container"
         v-if="isMakingCall">
      <div class="mobile-call-loader">
        <q-spinner-bars color="white" size="5em"/>
      </div>
    </div>
    <div class="col phone-padding dialer-tabs-wrapper"
         :class="{'no-padding': !isMobile}"
         v-if="!isMakingCall">
      <b-tabs class="dialer-tabs"
              pills
              vertical>
        <b-tab title="Call"
               :active="mode === 'call'"
               @click="setMode('call')">
          <b-form-group class="mb-1"
                        :invalid-feedback="invalidCampaign"
                        :state="validCampaign">
            <line-selector class="line-selector"
                           prepend="From:"
                           specificClass="dialer-line-selector"
                           :disable="defaultOutboundCampaignId && mode === 'call'"
                           :generic-multiselect="false"
                           v-model="campaignId"
                           @change="changeCampaignId">
            </line-selector>
          </b-form-group>
          <div class="d-inline-flex align-items-center justify-content-between dialer w-100"
               v-if="mode === 'call'">
            <b-form-group class="mb-0"
                          :invalid-feedback="invalidPhoneNumber"
                          :state="validPhoneNumberSearch">
              <contact-phone-number-search class="width-190"
                                           ref="callContactPhoneNumberSearch"
                                           :no_prepend="true"
                                           v-model="phoneNumber"
                                           @change="phoneNumberChanged"
                                           @keyup.enter.native="onCall"
                                           @searchResults="onPhoneNumberSearch">
              </contact-phone-number-search>
            </b-form-group>
            <q-btn icon="img:app-icons/dialer/call_btn.svg"
                   size="32px"
                   class="icon-btn auto-size height-32"
                   align="right"
                   padding="none"
                   rounded
                   flat
                   :ripple="true"
                   :disable="callDisabled"
                   @click="onCall">
            </q-btn>
          </div>

          <div class="dialer-contact-info width-190"
               v-if="contactId">
            <div class="text-size-sm text-grey-80 _400 mb-0 d-flex justify-content-between"
                 v-if="contactId">
              <div class="d-inline-flex text-left">{{ isMobile ? contactName : $options.filters.truncate(contactName, 15) }}</div>
              <div class="d-inline-flex text-right"
                   v-if="currentLocalTime">
                ~{{ currentLocalTime }}
              </div>
            </div>
            <p class="text-size-sm text-grey-80 _400 mb-1"
               v-if="contactId && companyName">
              {{ companyName }}
            </p>
            <div v-if="!contactId && validPhoneNumber && phoneNumber && !loadingContact">
              <span class="text-size-sm text-grey-80 _400">New number</span>
            </div>
          </div>
        </b-tab>
        <b-tab title="Message"
               :active="mode === 'text'"
               @click="setMode('text')">
          <b-form-group class="mb-1"
                        :invalid-feedback="invalidCampaign"
                        :state="validCampaign">
            <line-selector class="line-selector"
                           prepend="From:"
                           check-blocked-messaging
                           :generic-multiselect="false"
                           :use-only-actives="true"
                           v-model="campaignId"
                           @change="changeCampaignId">
            </line-selector>
            <div v-if="isMessagingBlocked(selectedCampaign, true)" class="compliance-badge mb-2">
              {{ selectedCampaign.blocked_messaging_information['reason'] }}
            </div>
          </b-form-group>
          <div class="d-inline-flex align-items-end justify-content-between dialer w-100"
               v-if="mode === 'text'">
            <b-form-group class="mb-0 w-100"
                          :invalid-feedback="invalidPhoneNumber"
                          :state="validPhoneNumberSearch">
              <contact-phone-number-search ref="textContactPhoneNumberSearch"
                                           v-model="phoneNumber"
                                           @change="phoneNumberChanged"
                                           @keyup.enter.native="sendText"
                                           @searchResults="onPhoneNumberSearch">
              </contact-phone-number-search>
            </b-form-group>
          </div>

          <div class="dialer-contact-info w-100"
               v-if="contactId">
            <div class="text-size-sm text-grey-80 _400 mb-0 d-flex justify-content-between"
                 v-if="contactId">
              <div class="d-inline-flex text-left">{{ isMobile ? contactName : $options.filters.truncate(contactName, 15) }}</div>
              <div class="d-inline-flex text-right"
                   v-if="currentLocalTime">
                ~{{ currentLocalTime }}
              </div>
            </div>
            <p class="text-size-sm text-grey-80 _400 mb-1"
               v-if="contactId && companyName">
              {{ companyName }}
            </p>
            <div v-if="!contactId && validPhoneNumber && phoneNumber && !loadingContact">
              <span class="text-size-sm text-grey-80 _400">New number</span>
            </div>
          </div>

          <div class="mobile-message-composer mb-2">
            <b-input-group>
              <template #append>
                <b-input-group-text class="bg-white border-left-0 align-items-end">
                  <q-btn class="height-16 no-q-btn-focus"
                         padding="none"
                         flat
                         :disable="sendDisabled || isSending || isMessagingBlocked(selectedCampaign, true)"
                         :ripple="false"
                         @click="sendText">
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
                               v-model="textMessage">
              </b-form-textarea>
            </b-input-group>
          </div>
        </b-tab>
      </b-tabs>
    </div>
    <h1 class="phone-padding lh-27 mb-3"
        v-if="isMobile && parkedCalls.length > 0">
      Parked Call{{ parkedCalls.length > 1 ? 's' : '' }}
    </h1>
    <div class="mobile-parked-calls-list"
         v-if="isMobile">
      <div class="loading-container"
           v-if="loadingParkedCalls">
        <div class="mobile-call-loader">
          <q-spinner-bars color="white"
                          size="5em"
          />
        </div>
      </div>
      <div class="position-relative h-100"
           v-if="parkedCalls.length">
        <div class="overflow-y-scroll h-100">
          <template v-for="parkedCall in parkedCalls">
            <mobile-parked-call :key="parkedCall.id"
                                :communication="parkedCall"/>
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
import { aclMixin, contactMixin, contactV2AttributesMixin, selectorMixin, timezoneCheckMixin, visibilityMixin } from 'src/plugins/mixins'

export default {
  name: 'dialer-form',

  mixins: [
    contactMixin,
    contactV2AttributesMixin,
    timezoneCheckMixin,
    visibilityMixin,
    aclMixin,
    selectorMixin
  ],

  components: {
    MobileParkedCall,
    ContactPhoneNumberSearch,
    LineSelector,
    SendTextIcon
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
      loadingContact: false,
      textMessage: '',
      isMakingCall: false,
      isSending: false,
      hasPhoneNumberSearchResults: false,
      previousOutboundCallingMode: null
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

    callDisabled () {
      return !this.validPhoneNumber || !this.phoneNumber.length || !this.campaignId
    },

    sendDisabled () {
      return !this.validPhoneNumber || !this.phoneNumber.length || !this.campaignId || !this.textMessage
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
    }
  },

  created () {
    this.$VueEvent.listen('changePhoneNumber', (data) => {
      if (!this.campaignId) {
        this.findDefaultOutboundCampaign()
      }

      this.setMode('call')

      this.changePhoneNumber(data).then(() => {
        this.makeCall()
      })
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
          this.loadingContact = false
        }).catch((err) => {
          console.log(err)
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
        this.previousOutboundCallingMode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ALWAYS_ASK) {
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
      if (this.currentCompany && this.profile && this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT && !this.profile.default_outbound_campaign_id) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId

        return
      }

      // 3. [User level] user has a default outbound line
      if (this.profile && this.profile.default_outbound_campaign_id && this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT) {
        this.defaultOutboundCampaignId = this.profile.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId
      }

      // 4. We couldn't find anything
    },

    setMode (mode) {
      this.mode = mode
    },

    onCall () {
      let contact = {
        timezone: this.contactTimezone,
        name: this.contactName
      }
      this.checkContactTimezone(contact, this.makeCall)
    },

    makeCall () {
      if (this.callDisabled) {
        return
      }

      this.$VueEvent.fire('makeCall', {
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
            console.log(err)
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
