<template>
  <div class="login-form-bg h-100 w-100 d-flex justify-content-center align-items-sm-center text-sm-left text-lg-center">
    <div class="login-container px-3 px-sm-2 pt-5 pt-sm-0">
      <img src="app-icons/misc/logo.svg" class="col-6 w-auto login-form-logo pb-5 px-0" />
      <div class="title mb-30 w-100 text-left px-2 pb-2 pb-sm-4 mb-4 mb-sm-1">
        Login
      </div>
      <form class="login-form w-100 px-2"
            ref="myForm"
            @submit.prevent="login">
        <div class="field pb-2">
          <div class="control has-icons-left">
            <q-input outlined
                     class="input rectangle"
                     type="email"
                     label="Email"
                     autocomplete="username"
                     v-model="user.email"
                     @keyup.enter="goToNextInput"
                     required />
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
             v-if="!$q.platform.is.cordova && !$q.platform.is.electron">
          <router-link :to="{ name: 'Forgot Password' }">
            <label class="link mb-3 w-100 pb-2">
              Forgot Password?
            </label>
          </router-link>
          <q-checkbox class="checkbox pl-1 remember-me"
                      label="Remember me"
                      color="positive"
                      v-model="user.remember_me" />
        </div>
        <div class="field mt-2 text-left">
          <q-btn
            label="Login"
            class="button"
            color="positive"
            type="submit"
            style="width: 148px; height: 50px;"
            :loading="loading" />
        </div>
        <div class="description-sm field text-left pt-3 mt-1">
          Don’t have an account?
          <a href="https://meetings.hubspot.com/alwr/aloware-demo"
             target="_blank">
            Book a demo now!
          </a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import auth from '../../boot/auth'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'login-form',

  data () {
    return {
      user: {
        email: null,
        password: null,
        remember_me: !!this.$q.platform.is.cordova && !!this.$q.platform.is.electron
      },
      loading: false,
      sb: null,
      deviceInfo: null,
      isPwd: true
    }
  },

  computed: {
    ...mapState(['current_company'])
  },

  methods: {
    login () {
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
      auth.login(this.user.email, this.user.password, this.user.remember_me, isMobile, this.deviceInfo).then(res => {
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

    resetUser () {
      this.user = {
        email: null,
        password: null,
        remember_me: !!this.$q.platform.is.cordova && !!this.$q.platform.is.electron
      }
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
