<template>
  <div>
    <div class="p-3"
         v-if="showAlertAgentOnCall">
      <p><strong>Call in Progress on Another Device</strong></p>
      <hr>
      <p>You're currently engaged in another call on Aloware Talk. Please complete your current conversation before initiating a new call.</p>
    </div>
    <webrtc :carrierName="profile.carrier_name"
            :isWidget="true"
            :class="[small ? 'small' : '']"
            v-else-if="allowed"
            @callConnected="handleCallConnectedEvent"
            @callCompleted="handleCallCompletedEvent">
    </webrtc>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import * as AgentStatus from 'src/constants/agent-status'
import CallingExtensions from '@hubspot/calling-extensions-sdk'
import Webrtc from 'components/webrtc'

export default {
  name: 'Dialer',

  components: { Webrtc },

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
      }
    }
  },
  computed: {
    ...mapGetters('auth', ['authenticated', 'profile']),

    allowed () {
      return this.profile && this.initialized
    }
  },

  created () {
    this.$root.$data.is_widget = true
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

    this.extensions = new CallingExtensions(this.callSdkOptions)
  },

  mounted () {
    this.init()
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
      if (this.api_key) {
        localStorage.setItem('api_token', this.api_key)
      }
      this.loading = true
      this.check().then((res) => {
        if (!this.needsExtensions) {
          localStorage.setItem('company_id', res.data.user.company.id)
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

    handleDialNumber (phoneNumber) {
      if (this.needsExtensions && this.extensionsInitialized && this.initialized) {
        this.extensionsVisibility = true
        this.phoneNumber = null
        this.$VueEvent.fire('make_hs_new_call', { phone_number: phoneNumber })
      } else if (this.needsExtensions && this.extensionsInitialized && !this.initialized) {
        this.timeout = setTimeout(() => {
          console.log('Retry calling ' + phoneNumber)
          this.handleDialNumber(phoneNumber)
        }, 250)
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
      }
    }
  },

  watch: {
    initialized () {
      if (this.initialized) {
        if (this.profile.company_id === 119) {
          document.domain = 'justpressone.com'
        }
      }
    },

    extensionsVisibility () {
      console.log('Extension visibility: ' + this.extensionsVisibility)

      if (this.extensionsVisibility) {
        this.showAlertAgentOnCall = this.profile.agent_status === AgentStatus.AGENT_STATUS_ON_CALL
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
