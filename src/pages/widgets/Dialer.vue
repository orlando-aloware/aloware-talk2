<template>
  <div>
    <div class="p-3" v-if="showAlertAgentOnCall">
      <p><strong>Call in Progress on Another Device</strong></p>
      <hr>
      <p>You're currently engaged in another call on Aloware Talk. Please complete your current conversation before initiating a new call.</p>
    </div>
    <div class="p-3" v-else-if="showAlertCallFinished">
      <p><strong>Call Finished</strong></p>
      <hr>
      <p>Please close this window or click the back button to continue.</p>
    </div>
    <webrtc
      :carrierName="authProfile.carrier_name"
      :isWidget="true"
      :campaignId="campaignId"
      :class="[small ? 'small' : '']"
      v-else-if="allowed"
      @callConnected="handleCallConnectedEvent"
      @callCompleted="handleCallCompletedEvent"
      @changeCampaignId="handleChangeCampaignEvent"
      @handleCall="handleCall"
    />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import * as AgentStatus from 'src/constants/agent-status'
import CallingExtensions from '@hubspot/calling-extensions-sdk'
import Webrtc from 'components/webrtc'
import * as storage from 'src/plugins/helpers/storage'
import * as UserOutboundCallingModes from 'src/constants/user-outbound-calling-modes'
import { timezoneCheckMixin, helperMixin } from 'src/plugins/mixins'

export default {
  name: 'Dialer',
  components: { Webrtc },

  mixins: [ timezoneCheckMixin, helperMixin ],

  props: {
    apiKey: {
      required: false
    }
  },

  data () {
    return {
      loading: false,
      small: false,
      initialized: false,
      needsExtensions: false,
      extensionsInitialized: false,
      extensionsVisibility: false,
      extensions: null,
      timeout: null,
      showAlertAgentOnCall: false,
      callSdkOptions: {
        // Whether to log various inbound/outbound messages to console
        debugMode: true,
        // eventHandlers handle inbound messages
        eventHandlers: {
          onReady: () => {
            const payload = {
              // Whether a user is logged-in
              isLoggedIn: this.authenticated,
              // Optionally send the desired widget size
              sizeInfo: {
                height: 522,
                width: 300
              }
            }
            this.extensions.initialized(payload)
            console.log('onReady', this.extensions)
            this.extensionsInitialized = true
          },
          onDialNumber: (event) => {
            console.log('onDialNumber', event)

            if (event.phone_number) {
              this.setPhoneNumber(event.phone_number)
              if (this.timeout) {
                clearTimeout(this.timeout)
              }
              this.handleDialNumber(event.phone_number)
            }
          },
          onVisibilityChanged: (data) => {
            console.log('onVisibilityChanged', data)
            this.extensionsVisibility = !data?.isHidden
          }
        }
      },
      contactName: '',
      contactTimezone: '',
      companyName: '',
      contactId: '',
      campaignId: null,
      defaultOutboundCampaignId: null,
      previousOutboundCallingMode: null,
      showAlertCallFinished: false,
      authProfile: null
    }
  },
  computed: {
    // ...mapGetters('auth', ['authenticated', 'profile']),
    ...mapState('cache', ['currentCompany', 'phoneNumber', 'isRedirectedToHubspotWidget']),
    ...mapState('auth', ['authenticated', 'profile']),
    ...mapState(['isWidget', 'dialer']),

    allowed () {
      return this.authProfile && this.initialized
    },

    canHandleDialNumber () {
      if (this.isRedirectedToHubspotWidget && this.defaultOutboundCampaignId) {
        return this.needsExtensions &&
        this.initialized &&
        this.authProfile &&
        this.dialer?.isReady &&
        this.campaignId !== null
      }

      return this.needsExtensions &&
        this.extensionsInitialized &&
        this.extensionsVisibility &&
        this.initialized &&
        this.authProfile &&
        this.dialer?.isReady &&
        this.campaignId !== null
    }
  },

  created () {
    this.setIsWidget(true)

    if (this.$route.query.small) {
      this.small = true
    }

    if (this.$route.name === 'Hubspot Call Extension') {
      this.needsExtensions = true
    } else {
      this.needsExtensions = false
    }

    if (!this.needsExtensions) {
      this.extensionsVisibility = true
    }

    console.log('Dialer created', this.extensions)

    if (!this.extensions) {
      this.extensions = new CallingExtensions(this.callSdkOptions)
    }
  },

  async mounted () {
    console.log('Dialer mounted')
    await this.init()

    // this.setPhoneNumber('+19403737418')
    // this.extensionsInitialized = true
    // this.extensionsVisibility = true

    this.$VueEvent.listen('agent_status_updated', this.handleAgentStatusUpdate)
  },

  methods: {
    ...mapActions('auth', {
      logoutUser: 'logout',
      check: 'check',
      clear: 'clear'
    }),

    ...mapActions([
      'resetVuex',
      'setIsWidget'
    ]),

    ...mapActions('cache', [
      'setCurrentCompany',
      'setPhoneNumber'
    ]),

    init () {
      if (this.apiKey) {
        storage.local.setItem('api_token', this.apiKey)
      }
      this.loading = true
      this.check().then((res) => {
        if (!this.needsExtensions) {
          storage.local.setItem('company_id', res.data.user.company.id)
          this.setCurrentCompany(res.data.user.company)
          this.resetVuex(['all'])
        }
        this.authProfile = res.data.user
        this.loading = false
        this.initialized = true
        this.handleUserLogin()
      }).catch((err) => {
        console.log('Error: api key is not valid', err)
        this.$handleErrors(err.response)
        this.loading = false
        this.$router.push({ name: 'Login', query: { redirect: this.$route.fullPath } })
      })
    },

    setContactDetails (contact) {
      this.contactName = this.getContactName(contact)
      this.contactTimezone = contact.timezone
      this.companyName = contact.company_name
      this.contactId = contact.contact_id
    },

    getContactEmitPayload () {
      return {
        currentNumber: this.phoneNumber,
        contactName: this.contactName,
        companyName: this.companyName,
        contactId: this.contactId,
        contactTimezone: this.contactTimezone
      }
    },

    async searchContact (phoneNumber) {
      const url = '/api/v2/contacts/quick-search'
      const response = await this.$axios.get(url, {
        params: {
          search: phoneNumber
        }
      })

      return response.data.data.length > 0 ? response.data.data[0] : null
    },

    async handleDialNumber (phoneNumber) {
      if (!this.phoneNumber && phoneNumber) {
        this.setPhoneNumber(phoneNumber)
      }

      console.log('handleDialNumber() --->', this.phoneNumber, this.needsExtensions, this.extensionsInitialized, this.extensionsVisibility, this.initialized, this.authProfile, this.dialer?.isReady, this.campaignId)

      console.log('canHandleDialNumber -->', this.canHandleDialNumber)
      console.log('phoneNumber -->', this.phoneNumber)
      console.log('needsExtensions -->', this.needsExtensions)
      console.log('extensionsInitialized -->', this.extensionsInitialized)
      console.log('extensionsVisibility -->', this.extensionsVisibility)
      console.log('initialized -->', this.initialized)
      console.log('authProfile -->', this.authProfile)
      console.log('dialer.isReady -->', this.dialer?.isReady)
      console.log('campaignId -->', this.campaignId)

      if (this.canHandleDialNumber) {
        const contact = await this.searchContact(this.phoneNumber)

        if (contact) {
          this.setContactDetails(contact)
          this.$emit('change', this.$emit('change', this.getContactEmitPayload()))
          this.handleCall()
        }
      } else if (!this.authProfile) {
        this.timeout = setTimeout(async () => {
          await this.init()
          this.handleDialNumber(this.phoneNumber)
        }, 3000)
      } else if (!this.dialer?.isReady) {
        this.timeout = setTimeout(() => {
          this.handleDialNumber(this.phoneNumber)
        }, 3000)
      }
    },

    handleUserLogin () {
      if (this.needsExtensions && this.extensionsInitialized) {
        this.extensions.userLoggedIn()
      }

      if (this.defaultOutboundCampaignId) {
        this.campaignId = this.defaultOutboundCampaignId
        this.handleDialNumber(this.phoneNumber)
      }
    },

    handleCallConnectedEvent () {
      if (this.needsExtensions && this.extensionsInitialized) {
        this.extensions.callAnswered()
      }
    },

    handleCallCompletedEvent () {
      if (this.extensions) {
        this.extensions.callEnded()
        this.showAlertCallFinished = true
      }
    },

    handleChangeCampaignEvent (campaignId) {
      this.defaultOutboundCampaignId = campaignId
      this.campaignId = campaignId
    },

    handleCall (shouldHandleDialNumber) {
      const contactData = {
        timezone: this.contactTimezone,
        name: this.contactName
      }

      this.checkContactTimezone(contactData, this.makeCall)

      if (shouldHandleDialNumber) {
        this.handleDialNumber(this.phoneNumber)
      }
    },

    handleAgentStatusUpdate (data) {
      const agentStatus = data.agent_status

      if (this.showAlertAgentOnCall && agentStatus !== AgentStatus.AGENT_STATUS_ON_CALL) {
        this.showAlertAgentOnCall = !this.showAlertAgentOnCall
        this.showAlertCallFinished = true
      }

      if (!this.showAlertAgentOnCall && this.showAlertCallFinished && agentStatus === AgentStatus.AGENT_STATUS_ON_CALL) {
        this.showAlertCallFinished = false
        this.showAlertAgentOnCall = !this.showAlertAgentOnCall
      }
    },

    makeCall () {
      if (this.callDisabled || this.campaignId === null) {
        return
      }

      this.$VueEvent.fire('makeCall', {
        currentNumber: this.$options.filters.fixPhone(this.phoneNumber),
        outboundCampaignId: this.campaignId.toString(),
        contactName: this.contactName,
        companyName: this.companyName,
        contactId: this.contactId
      })
    },

    findDefaultOutboundCampaign () {
      if (this.previousOutboundCallingMode &&
        this.authProfile &&
        this.previousOutboundCallingMode === this.authProfile?.outbound_calling_mode &&
        this.previousOutboundCallingMode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ALWAYS_ASK) {
        return
      }

      this.previousOutboundCallingMode = this.authProfile?.outbound_calling_mode

      if (this.currentCompany && this.currentCompany.force_outbound_line) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
      } else if (this.currentCompany && this.authProfile && this.authProfile?.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT && !this.authProfile.default_outbound_campaign_id) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
      } else if (this.authProfile && this.authProfile.default_outbound_campaign_id && this.authProfile?.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT) {
        this.defaultOutboundCampaignId = this.authProfile.default_outbound_campaign_id
      }

      if (this.defaultOutboundCampaignId) {
        this.campaignId = this.defaultOutboundCampaignId
        this.handleDialNumber(this.phoneNumber)
      }
    }
  },

  watch: {
    initialized () {
      if (this.initialized) {
        if (this.authProfile.company_id === 119) {
          document.domain = 'justpressone.com'
        }
      }
    },

    extensionsVisibility () {
      if (this.extensionsVisibility) {
        this.showAlertAgentOnCall = this.authProfile && this.authProfile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL
        // this.findDefaultOutboundCampaign()
      } else {
        this.showAlertCallFinished = false
      }
    },

    authProfile () {
      console.log('authProfile', this.authProfile)
      this.findDefaultOutboundCampaign()
    }

    // defaultOutboundCampaignId: {
    //   handler () {
    //     console.log('defaultOutboundCampaignId', this.defaultOutboundCampaignId)
    //     if (this.defaultOutboundCampaignId) {
    //       this.campaignId = this.defaultOutboundCampaignId
    //       this.handleDialNumber(this.phoneNumber)
    //     }
    //   },
    //   immediate: true
    // }
  },
  // check if user is logged in
  beforeRouteEnter (to, from, next) {
    next(vm => {
      if (!vm.authenticated) {
        vm.$router.push({ name: 'Login', query: { redirect: vm.$route.fullPath } })
      }
    })
  }
}
</script>

<style scoped>
html, body {
  background: transparent !important;
  width: 300px;
  height: 522px;
}
</style>
