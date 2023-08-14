<template>
  <section :class="[success ? 'default-bg' : '']"
           class="row w-100 h-100 mx-0">
    <login-large-screens-info v-show="!success" class="col-5 px-0"/>
    <div v-if="!success"
         class="login-form-bg col-12 col-lg-7 px-0 h-100 d-flex justify-content-center align-items-sm-center text-sm-left text-lg-center">
      <div class="login-container px-3 px-sm-2 pt-5 pt-sm-0">
        <img :src="appLogo" class="col-6 col-sm-auto login-form-logo d-lg-none pb-5 px-0"/>
        <div class="title mb-30 w-100 text-left px-2 pb-2 pb-sm-4 mb-4 mb-sm-1">
          Reset Password
        </div>
        <form class="login-form w-100 px-2"
              ref="myForm"
              @submit.prevent="resetPassword">
          <div class="field pb-2">
            <div class="control has-icons-left">
              <q-input v-model="user.password"
                       class="input rectangle"
                       label="Password"
                       outlined
                       required
                       lazy-rules
                       @keyup.enter="goToNextInput"
                       :type="isPwdNew ? 'password' : 'text'"
                       :rules="[ val => val && val.length >= 6 || 'Password should have at least 6 characters']">
                <template v-slot:append>
                  <q-icon
                    :name="isPwdNew ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwdNew = !isPwdNew"/>
                </template>
              </q-input>
            </div>
          </div>
          <div class="field pb-2">
            <div class="control has-icons-left">
              <q-input v-model="user.password_confirmation"
                       class="input rectangle"
                       label="Confirm Password"
                       outlined
                       lazy-rules
                       required
                       :type="isPwdConfirm ? 'password' : 'text'"
                       :rules="confirmPassword">
                <template v-slot:append>
                  <q-icon
                    :name="isPwdConfirm ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="isPwdConfirm = !isPwdConfirm"
                  />
                </template>
              </q-input>
            </div>
          </div>
          <div class="field mt-4 pt-1 text-left">
            <div id="recaptcha-element"
                 class="pb-2"/>
            <q-btn
              label="Reset Password"
              class="button"
              color="positive"
              type="submit"
              style="width: 190px; height: 50px;"
              :disable="loading || disabledSubmit"
              :loading="loading"/>
          </div>
        </form>
      </div>
    </div>
    <q-dialog v-model="success"
              seamless
              no-backdrop-dismiss
              no-esc-dismiss
              class="h-100 w-100 d-flex justify-content-center align-items-center text-center">
      <q-card
        class="thank-you-container">
        <q-card-section class="row items-center q-pb-none mx-1">
          <q-space/>
          <q-btn icon="close" flat round dense/>
        </q-card-section>

        <q-card-section class="text-center">
          <q-icon
            name="fas fa-check"
            color="positive"
            class="cursor-pointer rounded-icon-opaque p-2 mx-4 mb-4"
            style="font-size: 1.3em"/>
          <div class="title w-100 pb-2">Success!</div>
          <div class="message pb-4 mb-1">Lets go ahead and login with that new password.</div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </section>
</template>

<script>
import LoginLargeScreensInfo from 'components/guest/login-large-screens-info'
import { mapActions, mapState } from 'vuex'
import {
  guestMixin,
  guestFormsMixin,
  recaptchaMixin
} from 'boot/mixins'
import * as storage from 'src/plugins/helpers/storage'

export default {
  name: 'ResetPassword',

  mixins: [
    guestMixin,
    guestFormsMixin,
    recaptchaMixin
  ],

  components: { LoginLargeScreensInfo },

  data () {
    return {
      user: {
        email: null,
        password: null,
        password_confirmation: null
      },
      isPwdNew: true,
      isPwdConfirm: true,
      loading: false,
      deviceInfo: null,
      success: false
    }
  },

  computed: {
    ...mapState(['statics']),

    confirmPassword () {
      return [
        (val) => (val && val.length >= 6) || 'Password should have at least 6 characters',
        (val) => val === this.user.password || 'Passwords should match'
      ]
    }
  },

  created () {
    this.title = 'Reset Password'
    this.setTitle()
    this.user.email = this.$route.query.email
    this.user.token = this.$route.params.token
  },

  methods: {
    resetPassword () {
      this.loading = true
      this.$axios.post('/reset', this.user).then((res) => {
        this.loading = false
        this.success = true
        this.resetUser()
        setTimeout(() => {
          this.loginUser()
          this.closeDialog(false)
        }, 2000)
      }).catch(err => {
        this.loading = false
        if (err.response.status !== 401) {
          console.log(err)
        } else {
          // show notification
          this.$generalNotification(err.response.data.error, 'error')
        }
      })
    },

    async loginUser (isMobile = false) {
      try {
        const response = await this.login({
          email: this.user.email,
          password: this.user.password,
          rememberMe: this.user.remember_me,
          isMobile,
          deviceInfo: this.deviceInfo
        })
        await this.onLoginSuccess(response)
      } catch (err) {
        this.onLoginFailed(err)
      }
    },

    onLoginFailed (err) {
      console.log(err)
      this.loading = false
      if (err.response.status !== 401) {
        console.log(err)
        return
      }
      // show notification
      this.$buefy.snackbar.open({
        duration: 1000,
        message: err.response.data.error,
        type: 'is-danger',
        position: 'is-top',
        actionText: 'Ok',
        queue: false
      })
    },

    async onLoginSuccess ({ data: { data } }) {
      const { usage, company } = data

      this.resetVuex(['all'])
      this.setCurrentCompany(company)
      this.setUsage(usage)

      storage.local.setItem('company_id', company.id)

      this.loading = false

      const redirectPath = String(this.$route.query.redirect || '/')

      await this.$router.push(redirectPath)

      await this.resetTimeout()

      this.resetUser()
    },

    resetTimeout () {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 2000)
      })
    },

    resetUser () {
      this.user = {
        email: null
      }
    },

    closeDialog () {
      this.success = false
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

    ...mapActions(['resetVuex', 'setUsage']),

    ...mapActions('cache', ['setCurrentCompany']),

    ...mapActions('auth', ['login', 'resetPass'])
  }
}
</script>
