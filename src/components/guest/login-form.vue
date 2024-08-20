<template>
  <div class="login-form-bg h-100 w-100 d-flex justify-content-center align-items-sm-center text-sm-left text-lg-center">
    <div :class="{'login-container px-3 px-sm-2 pt-sm-0': true, 'pt-5': !hubspotWidget, 'pt-2': hubspotWidget}">
      <div class="d-flex w-100 justify-content-center"
           v-if="shouldShowAppLogo">
        <img :class="{'col-6 w-auto login-form-logo px-0': true, 'pb-5': !hubspotWidget, 'pb-2': hubspotWidget}"
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
          <router-link :to="{ name: 'Forgot Password' }">
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
             v-if="!isSimpSocial">
          Don’t have an account?
          <a href="https://meetings.hubspot.com/alwr/aloware-demo"
             target="_blank">
            Book a demo now!
          </a>
        </div>
        <div class="field text-left pt-3 mt-1"
             v-if="!isSimpSocial">
          <b-link href="https://support.aloware.com/en/articles/9037819-troubleshooting-aloware-authentication-issues"
                  class="cursor-pointer field text-left text-decoration-none"
                  target="_blank">
            Trouble authenticating?
          </b-link>
        </div>
      </form>
      <div :class="['login-form', 'w-100', 'text-center', hubspotWidget ? 'px-3' : 'px-5']"
           v-else>
        <h2 class="text-black mb-3">2FA Email Sent</h2>
        <p v-html="error"></p>
        <div>
          <security-code v-model="token"
                         ref="securityCode"
                         class="mb-2"
                         :hubspot-widget="hubspotWidget"
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
import { aclMixin, guestFormsMixin, recaptchaMixin, simpsocialMixin } from 'src/plugins/mixins'
import SecurityCode from 'components/guest/security-code'
import * as AppDefaultLogin from 'src/constants/user-default-login'
import * as storage from 'src/plugins/helpers/storage'

export default {
  components: { SecurityCode },

  mixins: [
    aclMixin,
    guestFormsMixin,
    recaptchaMixin,
    simpsocialMixin
  ],

  name: 'login-form',

  computed: {
    ...mapState('auth', ['profile', 'authenticated']),
    ...mapState(['statics', 'staticsLoaded']),

    shouldRedirectToClassic () {
      return this.profile &&
        this.profile.default_app === AppDefaultLogin.APP_ALOWARE_CLASSIC &&
        !this.isAdmin &&
        !this.profile?.company?.force_talk
    }
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
      hubspotWidget: false,
      shouldShowAppLogo: false
    }
  },

  methods: {
    verifyToken () {
      window.axios.post(`verify-token/${this.token}`).then(res => {
        storage.local.setItem('shared_cookie', res.data.meta.hashed_token)
        storage.local.setItem('api_token', res.data.meta.token)
        this.clearError()
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

      // redirect to Alo classic for agents
      if (this.shouldRedirectToClassic && !this.$q.platform.is.electron) {
        location.href = process.env.API_URL + '?from_talk_2=1&token=' + storage.local.getItem('shared_cookie')
        return
      }

      let redirectPath = '/'
      const redirectQuery = this.$route.query?.redirect

      if (redirectQuery) {
        redirectPath = decodeURIComponent(redirectQuery)
      }

      if (this.hubspotWidget) {
        redirectPath = '/widgets/hubspot-call-extension'
        this.setIsRedirectedToHubspotWidget(true)
      }

      this.$emit('userLoggedIn')
      console.log('Redirecting to: ', redirectPath)
      await this.$router.push(String(redirectPath))
      await this.redirectTimeout()

      this.resetUser()
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

    ...mapActions('cache', [
      'setCurrentCompany'
    ]),

    ...mapActions([
      'resetVuex',
      'setUsage',
      'setIsRedirectedToHubspotWidget'
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

  mounted () {
    this.hubspotWidget = this.$route.query.redirect === '/widgets/hubspot-call-extension'
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
  }
}
</script>
