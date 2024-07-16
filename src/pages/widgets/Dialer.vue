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
      :carrierName="profile.carrier_name"
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
import { mapActions, mapGetters, mapState } from 'vuex'
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
      phoneNumber: null,
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
            this.extensionsInitialized = true
          },
          onDialNumber: event => {
            if (event.phone_number) {
              this.phoneNumber = event.phone_number
              if (this.timeout) {
                clearTimeout(this.timeout)
              }
              this.handleDialNumber(event.phone_number)
            }
          },
          onVisibilityChanged: data => {
            this.extensionsVisibility = !data.isHidden
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
      showAlertCallFinished: false
    }
  },
  computed: {
    ...mapGetters('auth', ['authenticated', 'profile']),
    ...mapState('cache', ['currentCompany']),

    allowed () {
      return this.profile && this.initialized
    }
  },

  created () {
    this.$root.$data.is_widget = true
    if (this.$route.query.small) {
      this.small = true
    }

    this.needsExtensions = this.$route.name === 'Hubspot Call Extension'

    if (!this.needsExtensions) {
      this.extensionsVisibility = true
    }

    this.extensions = new CallingExtensions(this.callSdkOptions)
  },

  mounted () {
    this.init()

    this.$VueEvent.listen('agent_status_updated', this.handleAgentStatusUpdate)
  },

  methods: {
    ...mapActions('auth', {
      logoutUser: 'logout',
      check: 'check',
      clear: 'clear'
    }),
    ...mapActions(['resetVuex']),
    ...mapActions('cache', ['setCurrentCompany']),

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
      if (this.needsExtensions && this.extensionsInitialized)  {
        if (this.initialized) {
          this.extensionsVisibility = true
          this.phoneNumber = phoneNumber
          const contact = await this.searchContact(phoneNumber)
          if (contact) {
            this.setContactDetails(contact)
            this.$emit('change', this.$emit('change', this.getContactEmitPayload()))
            this.handleCall()
          }
        } else {
          this.timeout = setTimeout(() => {
            console.log('Retry calling ' + phoneNumber)
            this.handleDialNumber(phoneNumber)
          }, 250)
        }
      }
    },

    handleUserLogin () {
      if (this.needsExtensions && this.extensionsInitialized) {
        this.extensions.userLoggedIn()
      }
    },

    handleCallConnectedEvent () {
      if (this.needsExtensions && this.extensionsInitialized) {
        this.extensions.callAnswered()
      }
    },

    handleCallCompletedEvent () {
      if (this.needsExtensions && this.extensionsInitialized) {
        this.extensions.callEnded()
        this.showAlertCallFinished = true
      }
    },

    handleChangeCampaignEvent (campaignId) {
      this.defaultOutboundCampaignId = campaignId
      this.campaignId = campaignId
    },

    handleCall () {
      const contactData = {
        timezone: this.contactTimezone,
        name: this.contactName
      }

      this.checkContactTimezone(contactData, this.makeCall)
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
      if (
        this.previousOutboundCallingMode === this.profile?.outbound_calling_mode &&
        this.previousOutboundCallingMode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_ALWAYS_ASK
      ) {
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
      if (
        this.currentCompany && 
        this.profile?.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT &&
        !this.profile.default_outbound_campaign_id
      ) {
        this.defaultOutboundCampaignId = this.currentCompany.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId

        return
      }

      // 3. [User level] user has a default outbound line
      if (
        this.profile && this.profile.default_outbound_campaign_id &&
        this.profile.outbound_calling_mode === UserOutboundCallingModes.OUTBOUND_CALLING_MODE_DEFAULT
      ) {
        this.defaultOutboundCampaignId = this.profile.default_outbound_campaign_id
        this.campaignId = this.defaultOutboundCampaignId
      }

      // 4. We couldn't find anything
    }
  },

  watch: {
    extensionsVisibility () {
      console.log('Extension visibility: ' + this.extensionsVisibility)

      if (this.extensionsVisibility) {
        this.showAlertAgentOnCall = this.profile && this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL
        this.findDefaultOutboundCampaign()
      } else {
        this.defaultOutboundCampaignId = null
        this.campaignId = null
        this.showAlertCallFinished = false
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
