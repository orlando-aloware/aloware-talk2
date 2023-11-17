<template>
  <div></div>
</template>

<script>
import { mapState } from 'vuex'
import api from 'src/plugins/api/api'
import { customScriptsMixin } from 'src/plugins/mixins'

export default {
  name: 'custom-scripts',

  mixins: [customScriptsMixin],

  computed: {
    ...mapState('cache', ['currentCompany']),
    ...mapState('auth', ['profile', 'authenticated']),

    isModGenius () {
      return this.currentCompany?.reseller_id === 2132
    }
  },

  mounted () {
    this.setup()
  },

  methods: {
    setup () {
      if (!this.currentCompany || this.currentCompany.id !== this.profile.company.id) {
        return
      }

      if (this.isModGenius) {
        this.loadScript(process.env.HS_CUSTOM_JS_MOD_GENIUS)
      } else if (this.isAloware) {
        this.loadScript(process.env.HS_CUSTOM_JS)
      }

      if (this.authenticated) {
        this.initiateHubspotConversationsWithUserDetails()
      }
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
      if (!this.isAloware) {
        return
      }

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
      window.hsConversationsSettings = {
        loadImmediately: false,
        identificationEmail: this.profile.email,
        identificationToken: token
      }

      if (window.HubSpotConversations?.widget) {
        window.HubSpotConversations.widget.refresh()
        window.HubSpotConversations.widget.load()
      }
    },

    remove () {
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
