<template>
  <div></div>
</template>

<script>
import { mapState } from 'vuex'
import { userMixin, simpsocialMixin, customScriptsMixin } from 'src/plugins/mixins'
import api from 'src/plugins/api/api'

export default {
  name: 'custom-scripts',

  mixins: [
    simpsocialMixin,
    userMixin,
    customScriptsMixin
  ],

  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', ['profile', 'authenticated'])
  },

  mounted () {
    this.setup()
  },

  methods: {
    setup () {
      if (!this.currentCompany || this.currentCompany?.id !== this.profile?.company_id ||
        !this.authenticated || window?.HubSpotConversations) {
        return
      }

      if (this.isModGen) {
        if (!process.env.HS_CUSTOM_JS_MOD_GENIUS) {
          return
        }

        this.loadScript(process.env.HS_CUSTOM_JS_MOD_GENIUS)
      } else if (!this.isSimpsocial) {
        if (!process.env.HS_CUSTOM_JS) {
          return
        }

        this.loadScript(process.env.HS_CUSTOM_JS)
      }

      // set to false so the widget isn't load without user identification
      window.hsConversationsSettings = {
        loadImmediately: false
      }

      if (this.isTrackerDisabled()) {
        window._hsq = window._hsq || []
        window._hsq.push(['doNotTrack', true])
      } else {
        document.cookie = '__hs_do_not_track=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
      }

      this.initiateHubspotConversationsWithUserDetails()
    },

    loadScript (src) {
      const customJavaScript = document.createElement('script')

      customJavaScript.setAttribute(
        'src',
        src
      )
      customJavaScript.setAttribute(
        'id',
        'hs-script-loader'
      )

      customJavaScript.async = true
      customJavaScript.defer = true

      document.body.appendChild(customJavaScript)
    },

    initiateHubspotConversationsWithUserDetails () {
      if (this.isSimpsocial) {
        return
      }

      // Disable Hubspot chat for Aloware and local environments
      if (!this.isModGen || this.isLocal) {
        return
      }

      console.log('getting hubspot visitor token')
      api.V1.profile.getHubspotConversationsVisitorToken()
        .then((res) => {
          if (window?.HubSpotConversations) {
            this.conversationsSettings(res.data)
          } else {
            window.hsConversationsOnReady = [
              this.conversationsSettings(res.data)
            ]
          }
        })
    },

    conversationsSettings (token) {
      console.log('setting up hubspot conversations settings')
      window.hsConversationsSettings = {
        identificationEmail: this.profile.email,
        identificationToken: token
      }

      setTimeout(() => {
        this.reloadHubspotConversations()
      }, 2000)
    },

    reloadHubspotConversations () {
      if (window.HubSpotConversations?.widget) {
        console.log('reloading hubspot conversations widget')
        window.HubSpotConversations.widget.refresh()
        window.HubSpotConversations.widget.load()
      }
    },

    remove () {
      console.log('removing hubspot conversations widget')

      if (!window?.HubSpotConversations?.widget) {
        return
      }

      window.HubSpotConversations.widget.remove()
      const hsScriptLoader = document.querySelector('#hs-script-loader')

      if (!hsScriptLoader) {
        return
      }

      hsScriptLoader.remove()
    },

    refresh () {
      if (this.authenticated) {
        this.setup()
        return
      }

      this.remove()
    },

    isTrackerDisabled () {
      return process.env.HS_DISABLE_TRACKER || false
    }
  },

  watch: {
    authenticated () {
      this.refresh()
    },

    currentCompany: {
      deep: true,
      handler () {
        this.refresh()
      }
    }
  },

  beforeDestroy () {
    this.remove()
  }
}
</script>
