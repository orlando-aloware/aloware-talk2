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
                         v-if="isLoggedIn && !isWidget" />

    <router-view class="flex-grow-1 overflow-hidden"
                 v-if="cookieValidated" />
    <portal-target name="app"
                   multiple />
    <action-notification id="system"
                         v-if="!isWidget" />
    <action-notification id="sms"
                         v-if="!isWidget" />
    <action-notification id="call"
                         v-if="!isWidget" />
    <action-notification id="voicemail"
                         v-if="!isWidget" />
    <action-notification id="mention"
                         v-if="!isWidget" />
    <action-notification id="incomingCall"
                         v-if="isWidget ? isSalesforceWidget : true"
                         position="b-toaster-top-center" />
    <action-notification id="callFishing"
                         position="b-toaster-top-center"
                         v-if="isWidget ? isSalesforceWidget : true" />
    <intercom v-if="isIntercomEnabled && !isWidget" />
  </div>
</template>
<script>
import ActionNotification from 'components/action-notification'
import HeaderNotification from 'components/header-notification'
import Intercom from 'components/intercom'
import * as storage from 'src/plugins/helpers/storage'
import { accessMixin } from 'src/plugins/mixins'
import { mapActions, mapState } from 'vuex'

export default {
  name: 'App',

  mixins: [
    accessMixin
  ],

  components: {
    HeaderNotification,
    Intercom,
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
    ...mapState(['statics', 'staticsLoaded', 'isWhiteLabel', 'isWidget', 'isSalesforceWidget']),

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
    // proceed to cookie validation if account is talk allowed access
    this.getSharedCookie().then(sharedCookie => {
      this.sharedCookie = sharedCookie
      this.checkAccesses()

      if (storage.local.getItem('shared_cookie') !== this.sharedCookie && this.$route.name !== 'Login') {
        this.validateCookieUser()
      }
    })

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

      const requestData = {
        phone_number: fixedPhoneNumber
      }

      if (data.first_name) {
        requestData.first_name = data.first_name
      }

      if (data.last_name) {
        requestData.last_name = data.last_name
      }

      if (data.is_company) {
        requestData.is_company = data.is_company
      }

      window.axios.post('/api/v2/contacts/click-to-call', requestData).then(res => {
        this.isPageLoading = false
        const contact = res.data
        const callData = {
          currentNumber: fixedPhoneNumber,
          contactName: contact.name,
          companyName: contact.company_name,
          contactId: contact.id,
          contactTimezone: contact.timezone
        }

        const route = data.open_contact_page ? '/contacts/' + callData.contactId : {
          name: 'Phone'
        }

        this.$router.push(route, () => {
          this.$VueEvent.fire('callContact', callData)
        }, () => {
          if (['Phone', 'Contact'].includes(this.$route.name)) {
            this.$VueEvent.fire('callContact', callData)
          }
        })
      }).catch(() => {
        this.isPageLoading = false
      })
    })

    this.$VueEvent.listen('add_contact', (data) => {
      this.isPageLoading = true
      const requestData = {
        phone_number: this.$options.filters.fixPhone(data.phone_number)
      }

      if (data.first_name) {
        requestData.first_name = data.first_name
      }

      if (data.last_name) {
        requestData.last_name = data.last_name
      }

      if (data.is_company === 'true') {
        requestData.is_company = true
      }

      window.axios.post('/api/v2/contacts/click-to-call', requestData).then(res => {
        this.isPageLoading = false
        this.$router.replace('/contacts/' + res.data.id)
          .catch(this.$handleRouteError)
      }).catch(() => {
        this.isPageLoading = false
        this.$router.replace('/')
          .catch(this.$handleRouteError)
      })
    })

    this.$VueEvent.listen('user_logout', async (data) => {
      const currentAuthToken = storage.local.getItem('shared_cookie')

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

    checkAccesses () {
      if (this.profile?.has_multiple_access) {
        this.getAccesses(true)
      }
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
