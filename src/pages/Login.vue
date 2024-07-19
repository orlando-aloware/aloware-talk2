<template>
  <section class="row w-100 h-100 mx-0">
    <login-large-screens-info
      class="col-7 px-0"
      :xmasEnabled="isXmasBannerEnabled" />
    <login-form class="col-12 col-lg-5 px-0"/>
    <user-already-have-account-dialog :show="shouldRedirectToLogin" />
  </section>
</template>

<script>
import {
  guestMixin,
  aclMixin,
  settingsMixin,
  htmlMixin
} from 'boot/mixins'
import LoginLargeScreensInfo from 'components/guest/login-large-screens-info'
import LoginForm from 'components/guest/login-form'
import { mapActions, mapState } from 'vuex'
import * as AppDefaultLogin from 'src/constants/user-default-login'
import * as storage from 'src/plugins/helpers/storage'
import UserAlreadyHaveAccountDialog from 'src/components/account-registration/user-already-have-account-dialog.vue'
import talk2Api from 'src/plugins/api/api'

export default {
  name: 'login',

  mixins: [
    guestMixin,
    aclMixin,
    settingsMixin,
    htmlMixin
  ],

  components: { LoginForm, LoginLargeScreensInfo, UserAlreadyHaveAccountDialog },

  computed: {
    ...mapState('auth', ['profile']),
    ...mapState('accountRegistration', ['shouldRedirectToLogin']),
    ...mapState(['statics']),

    shouldRedirectToClassic () {
      const urlParams = new URLSearchParams(window.location.search)
      const fromClassic = Number(urlParams.get('from_classic'))

      return this.profile &&
        this.profile.default_app === AppDefaultLogin.APP_ALOWARE_CLASSIC &&
        fromClassic !== 1 &&
        !this.isAdmin &&
        !this.profile?.company?.force_talk
    }
  },

  methods: {
    ...mapActions(['setStatics', 'setStaticsLoaded']),
    ...mapActions('auth', ['getCookieUser', 'getSharedCookie']),
    ...mapActions(['resetVuex', 'setUsage']),
    ...mapActions('cache', ['setCurrentCompany']),
    async validateCookieUser () {
      this.getSharedCookie().then(sharedCookie => {
        if (sharedCookie) {
          const response = this.getCookieUser()
          if (response) {
            response.then(res => {
              if (res.data.data.company.talk_enabled) {
                this.cookieUserValidated(res)
              }
            })
          }
        }
      })
    },
    async cookieUserValidated ({ data: { data } }) {
      const { usage, company } = data
      this.resetVuex(['all'])
      this.setCurrentCompany(company)
      this.setUsage(usage)

      this.getSharedCookie().then(sharedCookie => {
        storage.local.setItem('shared_cookie', sharedCookie)
      })

      storage.local.setItem('company_id', company.id)

      if (this.shouldRedirectToClassic) {
        location.href = process.env.API_URL + '?from_talk_2=1&token=' + storage.local.getItem('shared_cookie')
      } else {
        window.location.reload()
      }
    },

    redirectTimeout () {
      return new Promise(resolve => {
        setTimeout(() => {
          resolve()
        }, 2000)
      })
    },

    async getStatics () {
      this.setStaticsLoaded(false)
      await talk2Api.V1.statics.get(this.currentCompany?.id)
        .then(res => {
          this.setStatics(res.data)

          if (this.statics.domain === 'app.simpsocial.com') {
            this.setPageTitle(`${this.statics?.name} - Login`)
            this.setDocumentFavicon(this.statics?.favicon)
          }
        })
        .catch(err => {
          this.setPageTitle('Login - Talk')
          console.log(err)
          this.$root.handleErrors(err.response)
        })
        .finally(() => {
          this.setStaticsLoaded(true)
        })
    }
  },

  created () {
    this.validateCookieUser()
    this.getStatics()
  },

  async beforeCreate () {
    this.$store.commit('SET_STATICS_LOADED', false)
  }
}
</script>

<style lang="scss" scoped>
@import '../css/breakpoints.scss';
.login-form-bg {
  background: url('../../public/bg/login_form_bg.png') no-repeat top left;
  background-size: cover;
}

.login-container {
  width: 100%;
  max-width: 380px;
}

.login-carousel {
  .login-slide-heading {
    height: 62px;
    color: #FFFFFF;
    font-size: 22px;
    font-weight: bold;
    letter-spacing: 0.29px;
    line-height: 31px;
    text-align: center;
  }
  .q-carousel__navigation-icon--active {
    color: #00BF4A !important;
  }
  .q-carousel__navigation-icon--inactive {
    color: #D2D2D2 !important;
  }
}

.login-form {
  .login-submit {
    height: 50px;
    width: 148px;
    border-radius: 8px;
    border-color: transparent;
    background-color: #00BF4A;
    color: #fff;
  }
}
@include screen('xs') {
  .login-form-logo {
    width: 65%;
  }
}
</style>
