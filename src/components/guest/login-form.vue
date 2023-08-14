<template>
  <div
    class="login-form-bg h-100 w-100 d-flex justify-content-center align-items-sm-center text-sm-left text-lg-center">
    <div class="login-container px-3 px-sm-2 pt-5 pt-sm-0">
      <img :src="appLogo" class="col-6 w-auto login-form-logo d-lg-none pb-5 px-0"/>
      <div class="title mb-30 w-100 text-left px-2 pb-2 pb-sm-4 mb-4 mb-sm-1">
        Login
      </div>
      <form class="login-form w-100 px-2"
            ref="myForm"
            @submit.prevent="submit">
        <div class="field pb-2">
          <div class="control has-icons-left">
            <q-input outlined
                     class="input rectangle"
                     type="email"
                     label="Email"
                     autocomplete="username"
                     v-model="user.email"
                     @keyup.enter="goToNextInput"
                     required/>
          </div>
        </div>
        <div class="field">
          <div class="control has-icons-left">
            <q-input outlined
                     :type="isPwd ? 'password' : 'text'"
                     class="input rectangle"
                     label="Password"
                     v-model="user.password"
                     autocomplete="current-password"
                     required>
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
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
                      v-model="user.remember_me">
          </q-checkbox>
        </div>
        <div class="field mt-2 text-left">
          <div id="recaptcha-element"
               class="pb-2"/>
          <q-btn
            label="Login"
            class="button"
            color="positive"
            type="submit"
            style="width: 148px; height: 50px;"
            :disable="loading || disabledSubmit"
            :loading="loading"/>
        </div>
        <div class="description-sm field text-left pt-3 mt-1">
          Don’t have an account?
          <a href="https://meetings.hubspot.com/alwr/aloware-demo"
             target="_blank">
            Book a demo now!
          </a>
        </div>
        <div class=" field text-left pt-3 mt-1">
          <b-link href="https://support.aloware.com/en/articles/5456128-aloware-authentication-issues"
                  class="cursor-pointer field text-left text-decoration-none"
                  target="_blank">
            Trouble authenticating?
          </b-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import {
  aclMixin,
  guestFormsMixin,
  recaptchaMixin
} from 'src/plugins/mixins'
import * as AppDefaultLogin from 'src/constants/user-default-login'
import * as storage from 'src/plugins/helpers/storage'

export default {
  mixins: [
    aclMixin,
    guestFormsMixin,
    recaptchaMixin
  ],

  name: 'login-form',

  computed: {
    ...mapState('auth', ['profile', 'authenticated']),

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
        remember_me: !!this.$q.platform.is.electron,
        recaptcha_response: null
      },
      loading: false,
      sb: null,
      deviceInfo: null,
      isPwd: true
    }
  },

  methods: {
    onVerify (response) {
      this.user.recaptcha_response = response
    },

    onExpired () {
      this.user.recaptcha_response = null
    },

    getLoginParams () {
      return {
        email: this.user.email,
        password: this.user.password,
        rememberMe: this.user.remember_me
      }
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
      if (err.response?.status !== 401) {
        console.log(err)
        this.$handleErrors(err.response)
      } else {
        // show notification
        this.$generalNotification(err.response?.data?.error, 'error')
      }
    },

    async onLoginSuccess ({ data: { data } }) {
      const { usage, company } = data

      this.resetVuex(['all'])
      this.setCurrentCompany(company)
      this.setUsage(usage)
      this.setDefaultShowMyContacts()
      this.setDefaultIsShortenedUrlRemembered()

      storage.local.setItem('company_id', company.id)

      // redirect to Alo classic for agents
      if (this.shouldRedirectToClassic && !this.$q.platform.is.electron) {
        location.href = process.env.API_URL + '?from_talk_2=1&token=' + storage.local.getItem('shared_cookie')
      } else {
        const redirectPath = (this.$route.query.redirect === '/suspended' ? '' : this.$route.query.redirect) || '/'
        await this.$router.push(String(redirectPath))
        await this.redirectTimeout()

        this.resetUser()
      }
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
  }
}
</script>
