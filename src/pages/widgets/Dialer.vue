<template>
  <div>
    <div v-if="showAlertAgentOnCall"
         class="p-3">
      <p><strong>Call in Progress on Another Device</strong></p>
      <hr>
      <p>You're currently engaged in another call on Aloware Talk. Please complete your current conversation before initiating a new call.</p>
    </div>
    <webrtc :carrier_name="profile.carrier_name"
            :is_widget="true"
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
    api_key: {
      required: false
    }
  },
  data () {
    return {
      loading: false,
      small: false,
      initialized: false,
      needs_extensions: false,
      extensions_initialized: false,
      extensions_visibility: false,
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
            this.extensions_initialized = true
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
            this.extensions_visibility = !data.isHidden
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
      this.needs_extensions = true
    } else {
      this.needs_extensions = false
    }

    if (!this.needs_extensions) {
      this.extensions_visibility = true
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
    init () {
      if (this.api_key) {
        localStorage.setItem('api_token', this.api_key)
      }
      this.loading = true
      this.check().then((res) => {
        if (!this.needs_extensions) {
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
      if (this.needs_extensions && this.extensions_initialized && this.initialized) {
        this.extensions_visibility = true
        this.phoneNumber = null
        this.$VueEvent.fire('make_hs_new_call', { phone_number: phoneNumber })
      } else if (this.needs_extensions && this.extensions_initialized && !this.initialized) {
        this.timeout = setTimeout(() => {
          console.log('Retry calling ' + phoneNumber)
          this.handleDialNumber(phoneNumber)
        }, 250)
      }
    },

    handleUserLogin () {
      if (this.needs_extensions && this.extensions_initialized) {
        this.extensions.userLoggedIn()
      }
    },

    handleCallConnectedEvent () {
      if (this.needs_extensions && this.extensions_initialized) {
        this.extensions.callAnswered()
      }
    },

    handleCallCompletedEvent () {
      if (this.needs_extensions && this.extensions_initialized) {
        this.extensions.callEnded()
      }
    },

    ...mapActions(['resetVuex']),
    ...mapActions('cache', ['setCurrentCompany'])
  },
  watch: {
    initialized () {
      if (this.initialized) {
        if (this.profile.company_id === 119) {
          document.domain = 'justpressone.com'
        }
      }
    },

    extensions_visibility () {
      console.log('Extension visibility: ' + this.extensions_visibility)

      if (this.extensions_visibility) {
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
