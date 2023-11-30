<template>
  <section class="row w-100 h-100 mx-0"
           :class="[success ? 'default-bg' : '']">
    <login-large-screens-info class="col-5 px-0"
                              :xmasEnabled="isXmasEnabled"
                              v-show="!success"/>
    <div class="login-form-bg col-12 col-lg-7 px-0 h-100 d-flex justify-content-center align-items-sm-center text-sm-left text-lg-center"
         v-if="!success">
      <div class="login-container px-3 px-sm-2 pt-5 pt-sm-0">
        <img class="col-6 col-sm-auto login-form-logo d-lg-none pb-5 px-0"
             :src="appLogo"/>
        <div class="title mb-30 w-100 text-left px-2 pb-2 pb-sm-2 mb-1">
          Reset Password
        </div>
        <div class="description-sm w-100 px-2 text-left mb-4 pb-2 pb-sm-2">
          We will send you instructions on how to reset your<br>
          password by email.
        </div>
        <form class="login-form w-100 px-2"
              ref="myForm"
              @submit.prevent="forgotPassword">
          <div class="field pb-2 pb-sm-2">
            <div class="control has-icons-left">
              <q-input class="input rectangle"
                       type="email"
                       label="Email"
                       autocomplete="username"
                       outlined
                       required
                       v-model="user.email">
              </q-input>
            </div>
          </div>
          <div class="field mt-4 pt-1 text-left">
            <div id="recaptcha-element"
                 class="g-recaptcha pb-2"/>
            <q-btn label="Reset Password"
                   class="v"
                   color="positive"
                   type="submit"
                   style="width: 190px; height: 50px;"
                   :disabled="loading || disabledSubmit"
                   :loading="loading"/>
          </div>
          <div class="description-sm field text-left pt-3 mt-1">
            Just Remembered?
            <router-link :to="{ name: 'Login' }">
              Login
            </router-link>
          </div>
        </form>
      </div>
    </div>
    <q-dialog class="h-100 w-100 d-flex justify-content-center align-items-center text-center"
              seamless
              v-model="success">
      <q-card class="thank-you-container">
        <q-card-section class="row items-center q-pb-none mx-1">
          <q-space/>
          <q-btn icon="close"
                 flat
                 round
                 dense
                 v-close-popup>
          </q-btn>
        </q-card-section>

        <q-card-section class="text-center">
          <q-icon name="fas fa-check"
                  color="positive"
                  class="cursor-pointer rounded-icon-opaque p-2 mx-4 mb-4"
                  style="font-size: 1.3em"/>
          <div class="title w-100 pb-2">Thank You!</div>
          <div class="message pb-4 mb-1">Please check your email.</div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </section>
</template>

<script>
import { mapState } from 'vuex'
import LoginLargeScreensInfo from 'components/guest/login-large-screens-info'
import {
  guestMixin,
  guestFormsMixin,
  recaptchaMixin
} from '../boot/mixins'

export default {
  name: 'forgot-password',

  mixins: [
    guestMixin,
    guestFormsMixin,
    recaptchaMixin
  ],

  components: { LoginLargeScreensInfo },

  data () {
    return {
      user: {
        email: null
      },
      loading: false,
      deviceInfo: null,
      success: false
    }
  },

  created () {
    this.title = 'Forgot Password'
    this.setTitle()
  },

  methods: {
    forgotPassword () {
      this.loading = true

      this.$axios.post('/forgot', this.user).then((res) => {
        this.loading = false
        this.success = true
        this.resetUser()
      }).catch(err => {
        this.loading = false

        if (err.response.status !== 401) {
          console.log(err)
          return
        }

        // show notification
        this.$generalNotification(err.response.data.error, 'error')
      })
    },

    resetUser () {
      this.user = {
        email: null
      }

      if (!this.$q.platform.is.electron) {
        this.user.recaptcha_response = null
      }
    },

    closeDialog () {
      this.success = false
    },

    onCaptchaVerified (response) {
      this.disabledSubmit = false

      if (!this.$q.platform.is.electron) {
        this.user.recaptcha_response = response
      }
    }
  },

  computed: {
    ...mapState('statics')
  },

  isXmasEnabled () {
    return process.env.XMAS_ENABLED && process.env.XMAS_BANNERS_ENABLED && (this.statics?.xmas_enabled || false)
  }
}
</script>
