<template>
  <div id="q-app">
    <router-view v-if="cookieValidated"/>
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

    <intercom v-if="authenticated && profile && profile.enabled"></intercom>
  </div>
</template>
<script>
import * as storage from 'src/plugins/helpers/storage'
import ActionNotification from 'components/action-notification'
import { mapActions, mapState } from 'vuex'
import Intercom from 'components/intercom'

export default {
  name: 'App',
  components: {
    Intercom,
    ActionNotification
  },
  data () {
    return {
      cookieValidated: false,
      sharedCookie: null,
      fullstoryOrgId: process.env.FULLSTORY_ORG_ID
    }
  },
  computed: {
    ...mapState('auth', ['profile', 'authenticated', 'loading']),
    isFromClassic () {
      const urlParams = new URLSearchParams(window.location.search)
      return Number(urlParams.get('from_classic'))
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

      if (/unhold:|barge:|whisper:|call:|hs:/.test(fixedPhoneNumber)) {
        window.axios.get('/api/v1/communication/info', {
          params: {
            sid: '',
            phone_number: fixedPhoneNumber
          }
        }).then(res => {
          this.$VueEvent.fire('makeCall', {
            currentNumber: fixedPhoneNumber,
            outboundCampaignId: res.data.campaign_id,
            contactName: res.data?.contact?.name,
            companyName: res.data?.contact?.company_name,
            contactId: res.data?.contact?.id,
            contactTimezone: res.data?.contact?.timezone
          })
        })
      } else {
        window.axios.post('/api/v1/contact', {
          add_phone_number: fixedPhoneNumber
        }).then(res => {
          const contact = res.data
          const callData = {
            currentNumber: fixedPhoneNumber,
            contactName: contact.name,
            companyName: contact.company_name,
            contactId: contact.id,
            contactTimezone: contact.timezone
          }

          this.$VueEvent.fire('callContact', callData)
        })
      }
    })

    this.$VueEvent.listen('add_contact', (data) => {
      window.axios.post('/api/v1/contact', {
        add_phone_number: this.$options.filters.fixPhone(data.phone_number)
      }).then(res => {
        this.$router.replace('/contacts/' + res.data.id)
      }).catch(() => {
        this.$router.replace('/')
      })
    })

    this.$VueEvent.listen('user_logout', (data) => {
      if (this.authenticated) {
        this.clearUser()
        this.$router.push({ name: 'Login' })
      }
    })
  },
  watch: {
    authenticated () {
      this.setFullStory()
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
        this.$router.push({ name: 'Login' }).catch((err) => {
          console.log(err)
        })
      }).catch((err) => {
        console.log(err)
      })
    },
    fullStoryIdentify (profile) {
      // Sanity check: verify if user is really there
      if (!profile) {
        return
      }

      let identityInformation = {
        displayName: profile.name,
        email: profile.email,
        timezone_str: window.timezone,
        companyId_int: profile.company_id,
        companyName_str: profile.company_name,
        userRoles_strs: profile.user_roles,
        hubspotCSMOwner: profile.company.hubspot_csm_owner,
        hubspotAccountOwner: profile.company.hubspot_account_owner,
        hubspotLatestDealAmount: profile.company.hubspot_latest_deal_amount
      }
      this.$FullStory.identify(profile.id, identityInformation)
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
    ])
  }
}
</script>
