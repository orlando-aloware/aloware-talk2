<template>
  <div id="q-app">
    <router-view v-if="cookieValidated" />
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

    <intercom></intercom>
  </div>
</template>
<script>
import * as storage from 'src/plugins/helpers/storage'
import ActionNotification from 'components/action-notification'
import { mapActions, mapState } from 'vuex'
import Intercom from 'components/intercom'
export default {
  name: 'App',
  components: { Intercom, ActionNotification },
  data () {
    return {
      cookieValidated: false,
      sharedCookie: null,
      fullstoryOrgId: process.env.FULLSTORY_ORG_ID
    }
  },
  computed: {
    ...mapState('auth', ['profile', 'authenticated', 'loading'])
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
      window.axios.post('/api/v1/contact', {
        add_phone_number: this.$options.filters.fixPhone(data.phone_number)
      }).then(res => {
        const contact = res.data
        const callData = {
          currentNumber: this.$options.filters.fixPhone(data.phone_number),
          contactName: contact.name,
          companyName: contact.company_name,
          contactId: contact.id,
          contactTimezone: contact.timezone
        }

        this.$VueEvent.fire('callContact', callData)
      })
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
      const { usage, company } = data
      this.resetVuex(['non-cache'])
      this.setCurrentCompany(company)
      this.setUsage(usage)
      this.cookieValidated = true

      storage.local.setItem('shared_cookie', this.sharedCookie)
      storage.local.setItem('company_id', company.id)

      const urlParams = new URLSearchParams(window.location.search)
      const fromClassic = Number(urlParams.get('from_classic'))

      // we need to redirect and reload if coming from classic instead of simply router push
      if (fromClassic) {
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
        displayName: profile.full_name,
        email: profile.email,
        timezone: profile.timezone,
        usage: profile.usage,
        company_name: profile.company_name,
        user_permissions: profile.user_permissions,
        user_roles: profile.user_roles
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
      getSharedCookie: 'getSharedCookie'
    }),
    ...mapActions('cache', ['setCurrentCompany']),
    ...mapActions([
      'resetVuex',
      'setUsage'
    ])
  }
}
</script>
