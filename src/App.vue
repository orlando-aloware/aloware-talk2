<template>
  <div class="position-relative d-flex flex-column"
       id="q-app">
    <b-overlay class="h-100 w-100 position-absolute"
               :show="isPageLoading">
      <template #overlay>
        <q-spinner-bars color="primary"
                        size="40px" />
      </template>
    </b-overlay>
    <header-notification class="flex-grow-0"
                         v-if="isLoggedIn"/>
    <router-view class="flex-grow-1 overflow-hidden"
                 v-if="cookieValidated"/>
    <portal-target name="app"
                   multiple>
    </portal-target>
    <action-notification id="system"/>
    <action-notification id="sms"/>
    <action-notification id="call"/>
    <action-notification id="voicemail"/>
    <action-notification id="mention"/>
    <action-notification id="incomingCall"
                         position="b-toaster-top-center"/>
    <action-notification id="callFishing"
                         position="b-toaster-top-center"/>

    <custom-scripts v-show="isLoggedIn"/>
    <intercom v-if="isIntercomEnabled"/>
  </div>
</template>
<script>
import * as storage from 'src/plugins/helpers/storage'
import { customScriptsMixin, helperMixin } from 'src/plugins/mixins'
import ActionNotification from 'components/action-notification'
import { mapActions, mapState } from 'vuex'
import Intercom from 'components/intercom'
import CustomScripts from 'components/custom-scripts'
import HeaderNotification from 'components/header-notification'

export default {
  name: 'App',

  mixins: [customScriptsMixin, helperMixin],

  components: {
    HeaderNotification,
    Intercom,
    CustomScripts,
    ActionNotification
  },

  data () {
    return {
      cookieValidated: false,
      sharedCookie: null,
      isPageLoading: false,
      fullstoryOrgId: process.env.FULLSTORY_ORG_ID,
      isWhitelabel: false
    }
  },

  computed: {
    ...mapState('auth', ['profile', 'authenticated', 'loading']),

    ...mapState(['statics', 'staticsLoaded', 'isWhiteLabel']),

    isFromClassic () {
      const urlParams = new URLSearchParams(window.location.search)

      return Number(urlParams.get('from_classic'))
    },

    isLoggedIn () {
      return this.authenticated && this.profile && this.profile.enabled
    },

    isIntercomEnabled () {
      return this.isLoggedIn && this.staticsLoaded && !this.isWhitelabel
    }
  },

  created () {
    // proceed to cookie validation if account is talk allowed access
    this.getSharedCookie().then(sharedCookie => {
      this.sharedCookie = sharedCookie

      // storage.local.getItem('shared_cookie') !== this.sharedCookie &&
      if (this.$route.name !== 'Login') {
        this.validateCookieUser()
      }
    })

    if (this.isFromClassic) {
      this.setDefaultShowMyContacts()
      this.setDefaultIsShortenedUrlRemembered()
    }
  },

  mounted () {
    // if account is not allowed to access talk, we need to logout
    if (this.profile && !this.profile.company.talk_enabled) {
      this.logout()
    } else {
      // proceed to cookie validation if account is talk allowed access
      this.getSharedCookie().then(sharedCookie => {
        this.sharedCookie = sharedCookie

        if (storage.local.getItem('shared_cookie') !== this.sharedCookie && this.$route.name !== 'Login') {
          this.validateCookieUser()
        }
      })
    }

    this.$VueEvent.listen('make_new_call', (data) => {
      let fixedPhoneNumber = this.$options.filters.fixPhone(data.phone_number)
      this.isPageLoading = true

      if (/unhold:|barge:|whisper:|call:|hs:/.test(fixedPhoneNumber)) {
        window.axios.get('/api/v1/communication/info', {
          params: {
            sid: '',
            phone_number: fixedPhoneNumber
          }
        }).then(res => {
          this.isPageLoading = false

          this.$VueEvent.fire('makeCall', {
            currentNumber: fixedPhoneNumber,
            outboundCampaignId: res.data.campaign_id,
            contactName: res.data?.contact?.name,
            companyName: res.data?.contact?.company_name,
            contactId: res.data?.contact?.id,
            contactTimezone: res.data?.contact?.timezone
          })
        }).catch(() => {
          this.isPageLoading = false
        })

        return
      }

      window.axios.post('/api/v1/contact', {
        add_phone_number: fixedPhoneNumber
      }).then(res => {
        this.isPageLoading = false
        const contact = res.data
        const callData = {
          currentNumber: fixedPhoneNumber,
          contactName: contact.name,
          companyName: contact.company_name,
          contactId: contact.id,
          contactTimezone: contact.timezone
        }

        this.$router.push({
          name: 'Phone'
        }, () => {
          this.$VueEvent.fire('callContact', callData)
        }, () => {
          if (this.$route.name === 'Phone') {
            this.$VueEvent.fire('callContact', callData)
          }
        })
      }).catch(() => {
        this.isPageLoading = false
      })
    })

    this.$VueEvent.listen('add_contact', (data) => {
      this.isPageLoading = true

      window.axios.post('/api/v1/contact', {
        add_phone_number: this.$options.filters.fixPhone(data.phone_number)
      }).then(res => {
        this.isPageLoading = false
        this.$router.replace('/contacts/' + res.data.id)
          .catch(this.$handleRouteError)
      }).catch(() => {
        this.isPageLoading = false
        this.$router.replace('/')
          .catch(this.$handleRouteError)
      })
    })

    this.$VueEvent.listen('user_logout', (data) => {
      const currentAuthToken = this.getCookie('aloware_shared_auth_token')
      console.log('User logged out > event >', data, 'currentAuthToken >', currentAuthToken)

      if (this.authenticated && currentAuthToken === data.cookie_auth_token) {
        this.clearUser()
        this.$router.push({ name: 'Login' })
          .catch(this.$handleRouteError)
      }
    })
  },

  watch: {
    authenticated () {
      this.setFullStory()
      this.addSentryContext()
    }
  },

  methods: {
    async validateCookieUser () {
      if (this.sharedCookie) {
        this.getCookieUser().then(response => {
          this.cookieUserValidated(response)
        }).catch(() => {
          this.logout()
        })
      }

      if (!this.sharedCookie) {
        this.cookieValidated = true
      }
    },

    async cookieUserValidated ({ data: { data } }) {
      const {
        usage,
        company
      } = data
      this.resetVuex(['non-cache'])
      this.setCurrentCompany(company)
      this.setUsage(usage)
      this.cookieValidated = true

      storage.local.setItem('shared_cookie', this.sharedCookie)
      storage.local.setItem('company_id', company.id)

      // we need to redirect and reload if coming from classic instead of simply router push
      if (this.isFromClassic) {
        location.href = '/'
      }
    },

    logout () {
      this.logoutUser().then((res) => {
        this.setFullStory()
        this.response = res.data
        this.$router.push({ name: 'Login' })
          .catch(this.$handleRouteError)
      }).catch((err) => {
        console.log(err)
      })
    },

    fullStoryIdentify (profile) {
      // Sanity check: verify if user is really there
      if (!profile) {
        return
      }

      window.axios.get('/fullstory-meta').then(({ data }) => {
        this.$FullStory.identify(profile.id, {
          ...data,
          timezone_str: window.timezone
        })
      }).catch(() => {
        console.log('Error while retrieving fullstory metadata from server. Using local variables.')

        this.$FullStory.identify(profile.id, {
          displayName: profile.name,
          email: profile.email,
          timezone_str: window.timezone,
          companyId_int: profile.company_id,
          companyName_str: profile.company_name,
          userRoles_strs: profile.user_roles
        })
      })
    },

    // identify or anonymize user
    setFullStory () {
      // Identify user on fullstory
      if (this.loading || !this.fullstoryOrgId) {
        return
      }

      if (this.profile && this.authenticated) {
        this.fullStoryIdentify(this.profile)
        return
      }

      this.$FullStory.anonymize()
    },

    addSentryContext () {
      if (!this.profile) {
        return
      }

      this.$Sentry.configureScope((scope) => {
        scope.setUser({
          id: this.profile.id,
          email: this.profile.email,
          name: this.profile.name,
          company_id: this.profile.company_id,
          company_name: this.profile.company_name
        })
      })
    },

    ...mapActions('auth', {
      logoutUser: 'logout',
      getCookieUser: 'getCookieUser',
      getSharedCookie: 'getSharedCookie',
      clearUser: 'clear'
    }),

    ...mapActions('cache', [
      'setCurrentCompany'
    ]),

    ...mapActions([
      'resetVuex',
      'setUsage'
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
