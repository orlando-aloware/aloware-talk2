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
  </div>
</template>
<script>
import ActionNotification from 'components/action-notification'
import { mapActions, mapState } from 'vuex'
export default {
  name: 'App',
  components: { ActionNotification },
  data () {
    return {
      cookieValidated: false,
      sharedCookie: null
    }
  },
  computed: {
    ...mapState('auth', ['profile', 'authenticated'])
  },
  created () {
    // proceed to cookie validation if account is talk allowed access
    this.getSharedCookie().then(sharedCookie => {
      this.sharedCookie = sharedCookie

      // localStorage.getItem('shared_cookie') !== this.sharedCookie &&
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

        if (localStorage.getItem('shared_cookie') !== this.sharedCookie && this.$route.name !== 'Login') {
          this.validateCookieUser()
        }
      })
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
      this.resetVuex()
      this.setCurrentCompany(company)
      this.setUsage(usage)
      this.cookieValidated = true

      localStorage.setItem('shared_cookie', this.sharedCookie)
      localStorage.setItem('company_id', company.id)

      const urlParams = new URLSearchParams(window.location.search)
      const fromClassic = Number(urlParams.get('from_classic'))

      // we need to redirect and reload if coming from classic instead of simply router push
      if (fromClassic) {
        location.href = '/'
      }
    },
    logout () {
      this.logoutUser().then((res) => {
        this.response = res.data
        this.$router.push({ name: 'Login' }).catch((err) => {
          console.log(err)
        })
      }).catch((err) => {
        console.log(err)
      })
    },
    ...mapActions('auth', {
      logoutUser: 'logout',
      getCookieUser: 'getCookieUser',
      getSharedCookie: 'getSharedCookie'
    }),
    ...mapActions([
      'resetVuex',
      'setUsage',
      'setCurrentCompany'
    ])
  }
}
</script>
