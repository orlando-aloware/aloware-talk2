<template>
  <div class="login-form-bg h-100 w-100 d-flex justify-content-center align-items-sm-center text-sm-left text-lg-center">
    <div :class="{'login-container px-3 px-sm-2 pt-sm-0': true, 'pt-5': !isWidget, 'pt-2': isWidget}">
      <div class="d-flex w-100 justify-content-center"
           v-if="shouldShowAppLogo">
        <img :class="{'col-6 w-auto login-form-logo px-0': true, 'pb-5': !isWidget, 'pb-2': isWidget}"
             :src="appLogo"/>
      </div>
      <form class="login-form w-100 px-2"
            ref="myForm"
            v-if="!magicLink"
            @submit.prevent="submit">
        <div class="field pb-2">
          <div class="control has-icons-left">
            <q-input class="input rectangle"
                     type="email"
                     label="Email"
                     autocomplete="username"
                     outlined
                     required
                     v-model="user.email"
                     @keyup.enter="goToNextInput"/>
          </div>
        </div>
        <div class="field">
          <div class="control has-icons-left">
            <q-input class="input rectangle"
                     label="Password"
                     autocomplete="current-password"
                     outlined
                     required
                     :type="isPwd ? 'password' : 'text'"
                     v-model="user.password">
              <template v-slot:append>
                <q-icon class="cursor-pointer"
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        @click="isPwd = !isPwd"/>
              </template>
            </q-input>
          </div>
        </div>
        <div class="field text-left"
             v-if="!$q.platform.is.electron">
          <router-link :to="{ name: 'Forgot Password' }"
                       v-if='!isWidget'>
            <label class="link mb-3 w-100 pb-2 cursor-pointer">
              Forgot Password?
            </label>
          </router-link>
          <q-checkbox class="checkbox pl-1 remember-me"
                      label="Remember me"
                      color="positive"
                      v-model="user.remember_me"/>
        </div>
        <div class="field mt-2 text-left">
          <div id="recaptcha-element"
               class="g-recaptcha pb-2"/>
          <q-btn label="Login"
                 class="button"
                 color="positive"
                 type="submit"
                 style="width: 148px; height: 50px;"
                 :disable="loading || disabledSubmit"
                 :loading="loading"/>
        </div>
        <div class="description-sm field text-left pt-3 mt-1"
             v-if="!isWidget">
          Don’t have an account?
          <a href="https://meetings.hubspot.com/alwr/aloware-demo"
             target="_blank">
            Book a demo now!
          </a>
        </div>
        <div class="field text-left pt-3 mt-1"
             v-if="!isWidget">
          <b-link href="https://support.aloware.com/en/articles/9037819-troubleshooting-aloware-authentication-issues"
                  class="cursor-pointer field text-left text-decoration-none"
                  target="_blank">
            Trouble authenticating?
          </b-link>
        </div>
      </form>
      <div :class="['login-form', 'w-100', 'text-center', isWidget ? 'px-3' : 'px-5']"
           v-else>
        <h2 class="text-black mb-3">2FA Email Sent</h2>
        <p v-html="error"></p>
        <div>
          <security-code v-model="token"
                         ref="securityCode"
                         class="mb-2"
                         @input="clearError"
                         @completed="verifyToken">
          </security-code>
          <p v-if="verificationMessage.length > 0"
             :class="'text-' + verificationMessageType">
            {{ verificationMessage }}
          </p>
        </div>
        <h3 class="text-black mt-3">Go check your email!</h3>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { aclMixin, guestFormsMixin, recaptchaMixin } from 'src/plugins/mixins'
import SecurityCode from 'components/guest/security-code'
import * as storage from 'src/plugins/helpers/storage'
import { BroadcastMessageTypes } from 'src/constants/hubspot-softphone-broadcast'
import HubSpotBroadcastManager from 'src/services/integrations/hubspot/HubSpotBroadcastManager'

export default {
  components: { SecurityCode },

  mixins: [
    aclMixin,
    guestFormsMixin,
    recaptchaMixin
  ],

  name: 'login-form',

  computed: {
    ...mapState('auth', ['profile', 'authenticated']),
    ...mapState(['statics', 'staticsLoaded', 'isWidget', 'isHubSpotWidget']),
    ...mapState('cache', ['currentCompany'])
  },

  data () {
    return {
      user: {
        email: null,
        password: null,
        remember_me: !!this.$q.platform.is.electron
      },
      loading: false,
      sb: null,
      deviceInfo: null,
      isPwd: true,
      magicLink: false,
      error: null,
      token: '',
      resendingValidation: false,
      verificationMessageType: 'success',
      verificationMessage: '',
      verificationRequestSent: false,
      shouldShowAppLogo: false,
      hubspotLoginChannel: null
    }
  },

  methods: {
    ...mapActions('auth', ['setProfile']),

    verifyToken () {
      window.axios.post(`verify-token/${this.token}`).then(res => {
        storage.local.setItem('shared_cookie', res.data.meta.hashed_token)
        storage.local.setItem('api_token', res.data.meta.token)
        this.clearError()
        // make sure the whole user was set
        this.setProfile(res.data?.data)
        this.onLoginSuccess({
          data: {
            data: {
              usage: res.data?.data?.usage ?? null,
              company: res.data?.data?.company ?? null
            }
          }
        })
      }).catch(err => {
        console.log(err)
        this.verificationMessage = err.response.data.message
        this.verificationMessageType = 'danger'
      })
    },

    clearError () {
      this.verificationMessageType = 'success'
      this.verificationMessage = ''
    },

    getLoginParams () {
      let params = {
        email: this.user.email,
        password: this.user.password,
        rememberMe: this.user.remember_me
      }

      if (!this.$q.platform.is.electron) {
        params.recaptchaResponse = this.user.recaptchaResponse
      }

      return params
    },

    async submit () {
      try {
        this.loading = true

        const response = await this.login({
          ...this.getLoginParams()
        })

        await this.onLoginSuccess(response)

        this.loading = false
      } catch (err) {
        console.error(err)
        this.loading = false
        this.onLoginError(err)
      }
    },

    onLoginError (err) {
      this.loading = false

      if (err.response?.data?.type === 10) {
        this.magicLink = true
        this.error = err.response.data.error
        return
      }

      if (err.response?.status !== 401) {
        console.log(err)
        this.$handleErrors(err.response)
        return
      }

      // show notification
      this.$generalNotification(err.response?.data?.error, 'error')
    },

    async onLoginSuccess ({ data: { data } }) {
      const {
        usage,
        company
      } = data

      this.resetVuex(['all'])
      this.setCurrentCompany(company)
      this.setUsage(usage)
      this.setDefaultShowMyContacts()
      this.setDefaultIsShortenedUrlRemembered()

      storage.local.setItem('company_id', company.id)

      let redirectPath = '/'
      const redirectQuery = this.$route.query?.redirect

      if (redirectQuery) {
        redirectPath = decodeURIComponent(redirectQuery)
      }

      // This will fix redirect path if the app is in the HubSpot Extension Context
      redirectPath = await this.getCorrectRedirectPathForContext(redirectPath)

      this.$emit('userLoggedIn')

      // For HubSpot widgets: broadcast login and navigate with reload trigger
      // Check if we're redirecting to HubSpot widget (not if we're currently on it)
      const isRedirectingToHubSpot = redirectPath.includes('hubspot-call-extension')
      if (isRedirectingToHubSpot) {
        // Use broadcast manager static method for one-time broadcast
        console.log('[Login Form] Broadcasting login success via Broadcast Manager...')
        HubSpotBroadcastManager.sendOneTimeBroadcast(
          BroadcastMessageTypes.USER_LOGGED_IN,
          { timestamp: Date.now() }
        )

        // Navigate with from_login=true query param to trigger reload in the widget
        // Small delay to ensure broadcast is fully transmitted before page unload
        setTimeout(() => {
          const url = `${window.location.origin}${redirectPath}${redirectPath.includes('?') ? '&' : '?'}from_login=true`
          console.log('[Login Form] Navigating to:', url)
          window.location.replace(url)
        }, 100)
        return
      }

      await this.$router.push(String(redirectPath))
      await this.redirectTimeout()

      this.resetUser()
    },

    /**
     * Checks if the current context requires HubSpot extension redirect
     *
     * @returns {Object} - Object containing redirect decision and context info
     */
    checkHubSpotRedirectContext () {
      // Check if we're in HubSpot extension mode or redirecting to HubSpot extension
      const isHubSpotExtension = this.$route.name === 'HubSpot Call Extension' ||
                                 this.$route.path.includes('hubspot-call-extension')

      // Get the dynamic HubSpot domain from company settings
      const hubspotDomain = this.$store?.state?.auth?.profile?.company?.hubspot_company_ui_domain || 'app.hubspot.com'

      // Check if user is coming from HubSpot calling window mode (popup/iframe)
      // This handles scenarios like: https://app.hubspot.com/calling-integration-popup-ui/49267018
      // or custom domains like: https://custom.hubspot.com/calling-integration-popup-ui/49267018
      const referrerHasHubSpot = document.referrer && document.referrer.includes('hubspot-call-extension')
      const referrerIsHubSpot = document.referrer && document.referrer.includes(hubspotDomain)

      // Determine if any HubSpot extension conditions are met
      const hasHubSpotConditions = isHubSpotExtension ||
                                   this.$route.path.includes('hubspot-call-extension') ||
                                   referrerHasHubSpot ||
                                   referrerIsHubSpot

      // Check if HubSpot integration is enabled
      const isHubSpotEnabled = this.$store?.state?.auth?.profile?.company?.hubspot_integration_enabled

      // Determine if we should redirect to HubSpot extension
      const shouldRedirect = hasHubSpotConditions && isHubSpotEnabled

      return {
        shouldRedirect,
        hasHubSpotConditions,
        isHubSpotEnabled,
        hubspotDomain
      }
    },

    /**
     * Ensures the redirect path is correct for the current context
     * This fixes issues where users in HubSpot extension mode get redirected to wrong pages
     * @param {string} originalPath - The original redirect path from query parameters
     * @returns {string} - The corrected redirect path
     */
    async getCorrectRedirectPathForContext (originalPath) {
      // Wait for Vuex to resolve completely before checking HubSpot context
      await this.$nextTick()

      const hubSpotContext = this.checkHubSpotRedirectContext()

      // Redirect to HubSpot extension if conditions are met and integration is enabled
      if (hubSpotContext.shouldRedirect) {
        console.log('[HubSpot Login Redirect] ✅ Redirecting to HubSpot extension')
        return '/widgets/hubspot-call-extension'
      }

      // Return original path for all other contexts
      return originalPath
    },

    redirectTimeout () {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 2000)
      })
    },

    resetUser () {
      this.user = {
        email: null,
        password: null,
        remember_me: !!this.$q.platform.is.electron
      }

      if (!this.$q.platform.is.electron) {
        this.user.recaptchaResponse = null
      }
    },

    goToNextInput ($event) {
      if (!this.$refs.myForm || !this.$refs.myForm.$el || !this.$refs.myForm.$el.elements) {
        return
      }

      const next = $event.target.tabIndex

      if (next < this.$refs.myForm.$el.elements.length) {
        this.$refs.myForm.$el.elements[next + 1].focus()
      }
    },

    onCaptchaVerified (response) {
      this.disabledSubmit = false

      if (!this.$q.platform.is.electron) {
        this.user.recaptchaResponse = response
      }
    },

    /**
     * Handles login event from other HubSpot widget instance
     * Redirects away from login page when another instance successfully logs in
     */
    onHubSpotLoginFromOtherInstance (event) {
      const { type } = event.data

      if (type === BroadcastMessageTypes.USER_LOGGED_IN) {
        // Only navigate if we're not already authenticated to avoid reload loops
        if (!this.authenticated) {
          console.log('[Login Form] Other HubSpot instance logged in, navigating to widget...')
          const redirectPath = this.$route.query.redirect || '/widgets/hubspot-call-extension'
          window.location.replace(`${window.location.origin}${redirectPath}`)
        } else {
          console.log('[Login Form] Other instance logged in, but already authenticated - ignoring')
        }
      }
    },

    ...mapActions('cache', [
      'setCurrentCompany'
    ]),

    ...mapActions([
      'resetVuex',
      'setUsage'
    ]),

    ...mapActions('auth', [
      'login'
    ]),

    ...mapActions('inbox', [
      'setDefaultShowMyContacts'
    ]),

    ...mapActions('contacts', [
      'setDefaultIsShortenedUrlRemembered'
    ])
  },

  watch: {
    staticsLoaded: {
      immediate: true,
      handler (val) {
        if (val) {
          this.shouldShowAppLogo = val
        }
      }
    }
  },

  mounted () {
    // Listen for login events from other HubSpot widget instances
    // Initialize temporary listener if we're on HubSpot widget OR redirecting to it
    const redirectPath = this.$route.query?.redirect
    const isHubSpotContext = this.isHubSpotWidget || (redirectPath && redirectPath.includes('hubspot-call-extension'))

    if (isHubSpotContext) {
      try {
        // Use broadcast manager static method for temporary listening
        this.hubspotLoginChannel = HubSpotBroadcastManager.createTemporaryListener(this.onHubSpotLoginFromOtherInstance)
        console.log('[Login Form] Listening for HubSpot login events from other instances')
      } catch (error) {
        console.error('[Login Form] Failed to initialize login listener:', error)
      }
    }
  },

  beforeDestroy () {
    // Clean up BroadcastChannel if still open
    if (this.hubspotLoginChannel) {
      this.hubspotLoginChannel.close()
      this.hubspotLoginChannel = null
      console.log('[Login Form] Closed BroadcastChannel in beforeDestroy')
    }
  }
}
</script>
