<template>
  <section :class="[success ? 'default-bg' : '']"
           class="row w-100 h-100 mx-0">
    <login-large-screens-info v-show="!success" class="col-5 px-0" />
    <div v-if="!success" class="login-form-bg col-12 col-lg-7 px-0 h-100 d-flex justify-content-center align-items-sm-center text-sm-left text-lg-center">
      <div class="login-container px-3 px-sm-2 pt-5 pt-sm-0">
        <img src="app-icons/misc/logo.svg" class="col-6 col-sm-auto login-form-logo d-lg-none pb-5 px-0" />
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
                    @click="isPwdNew = !isPwdNew" />
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
            <q-btn
              label="Reset Password"
              class="button"
              color="positive"
              type="submit"
              style="width: 190px; height: 50px;"
              :loading="loading" />
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
          <q-space />
          <q-btn icon="close" flat round dense />
        </q-card-section>

        <q-card-section class="text-center">
          <q-icon
            name="fas fa-check"
            color="positive"
            class="cursor-pointer rounded-icon-opaque p-2 mx-4 mb-4"
            style="font-size: 1.3em" />
          <div class="title w-100 pb-2">Success!</div>
          <div class="message pb-4 mb-1">Lets go ahead and login with that new password.</div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </section>
</template>

<script>
import auth from '../boot/auth'
import LoginLargeScreensInfo from 'components/guest/login-large-screens-info'
import { mapActions } from 'vuex'
import { guestMixin } from 'boot/mixins'

export default {
  name: 'ResetPassword',

  mixins: [guestMixin],

  components: { LoginLargeScreensInfo },

  data () {
    return {
      auth: auth,
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
    confirmPassword () {
      return [
        (val) => (val && val.length >= 6) || 'Password should have at least 6 characters',
        (val) => val === this.user.password || 'Passwords should match'
      ]
    }
  },

  created () {
    this.title = 'Reset Password'
    this.user.email = this.$route.query.email
    this.user.token = this.$route.params.token
  },

  methods: {
    resetPassword () {
      this.loading = true
      const isMobile = this.$q.platform.is.cordova
      if (isMobile) {
        this.deviceInfo = {
          registration_id: localStorage.getItem('registrationId'),
          registration_type: localStorage.getItem('registrationType'),
          model: window.device.model,
          platform: window.device.platform,
          is_virtual: window.device.isVirtual,
          uuid: window.device.uuid,
          version: window.device.version,
          manufacturer: window.device.manufacturer,
          serial: window.device.serial,
          app_version: localStorage.getItem('version')
        }
      }
      this.$axios.post('/reset', this.user).then((res) => {
        if (this.$q.platform.is.cordova) {
          window.Keyboard.hide()
          this.setKeyboardScroll(false)
        }
        this.loading = false
        this.success = true
        this.resetUser()
        setTimeout(() => {
          this.login()
          this.closeDialog(isMobile)
        }, 2000)
      }).catch(err => {
        this.loading = false
        if (err.response.status !== 401) {
          console.log(err)
        } else {
          // show notification
          this.$q.notify({
            message: err.response.data.error,
            type: 'negative',
            textColor: 'white',
            actions: [
              {
                icon: 'close'
              }
            ]
          })
        }
      })
    },

    login (isMobile = false) {
      this.auth.login(this.user.email, this.user.password, this.user.remember_me, isMobile, this.deviceInfo).then(res => {
        let usage = res.data.data.usage
        this.setCurrentCompany(res.data.data.company)
        this.resetVuex()
        this.setUsage(usage)
        if (this.$q.platform.is.cordova) {
          window.Keyboard.hide()
          this.setKeyboardScroll(false)
        }
        localStorage.setItem('company_id', res.data.data.company.id)
        this.loading = false
        this.$router.push(this.$route.query.redirect || '/').then(() => {
          setTimeout(() => {
            this.resetUser()
          }, 2000)
        }).catch((err) => {
          console.log(err)
        })
      }).catch(err => {
        console.log(err)
        this.loading = false
        if (err.response.status !== 401) {
          console.log(err)
        } else {
          // show notification
          this.$buefy.snackbar.open({
            duration: 1000,
            message: err.response.data.error,
            type: 'is-danger',
            position: 'is-top',
            actionText: 'Ok',
            queue: false,
            onAction: () => {

            }
          })
        }
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
      let next = $event.target.tabIndex
      if (next < this.$refs.myForm.$el.elements.length) {
        this.$refs.myForm.$el.elements[next + 1].focus()
      }
    },

    ...mapActions(['setCurrentCompany', 'resetVuex', 'setUsage', 'setKeyboardScroll'])
  }
}
</script>

<style scoped>

</style>
