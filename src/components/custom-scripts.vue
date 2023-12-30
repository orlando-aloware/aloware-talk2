<template>
  <div></div>
</template>

<script>
import { mapState } from 'vuex'
import api from 'src/plugins/api/api'

export default {
  name: 'custom-scripts',

  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', ['profile', 'authenticated']),

    isModGenius () {
      return this.currentCompany?.reseller_id === 2132
    },

    isSimpSocial () {
      return this.currentCompany?.reseller_id === 357
    }
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

      if (this.isModGenius) {
        this.loadScript(process.env.HS_CUSTOM_JS_MOD_GENIUS)
      } else {
        this.loadScript(process.env.HS_CUSTOM_JS)
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
      if (this.isSimpSocial()) {
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
        loadImmediately: false,
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
      document.querySelector('#hs-script-loader').remove()
    },

    refresh () {
      if (this.authenticated) {
        this.setup()
        return
      }

      this.remove()
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
