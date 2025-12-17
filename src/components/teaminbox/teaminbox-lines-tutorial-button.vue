<template>
  <div v-if="showLinesTutorialButton" :style="{ position: 'relative' }">
    <q-btn
      outline
      class="q-btn-standard q-mr-md"
      @click="showLinesTutorial">
        <i class="material-icons text-primary" :style="{ fontSize: '20px' }">tour</i>
        <span>Take a Tour</span>
    </q-btn>
    <q-badge
      rounded
      floating
      label="x"
      color="primary"
      :style="{ right: '8px', cursor: 'pointer' }"
      @click="hideButton" />
  </div>
</template>

<script>
import { Platform } from 'quasar'
import { CID_AND_LINES_DEMO } from 'src/plugins/helpers/navattic'
import { userMixin } from 'src/plugins/mixins'
import { mapState } from 'vuex'
import VueCookies from 'vue-cookies'

export default {
  name: 'teaminbox-lines-tutorial-button',

  mixins: [
    userMixin
  ],

  created () {
    this.$cookies = VueCookies
  },

  mounted () {
    const wasShown = Platform.is.electron ? localStorage.getItem(this.cookieName) : this.$cookies.get(this.cookieName)

    if (wasShown) {
      // If the button was already shown and user closed it, we don't need to show it again
      return
    }

    this.isVisible = true
  },

  data () {
    return {
      isVisible: false
    }
  },

  computed: {
    ...mapState('auth', ['profile']),

    showLinesTutorialButton () {
      return this.isVisible &&
        this.$q.screen.width > 1200 &&
        this.$route.path.startsWith('/team-inboxes') &&
        this.hasCompanyTeamInboxLineManagementEnhancements
    },

    cookieName () {
      return `teaminbox-lines-tutorial-button-${this.profile?.id}`
    },

    teamInboxVideoCookieName () {
      return `team-inbox-${this.profile?.id}`
    }
  },

  methods: {
    showLinesTutorial () {
      this.$navattic.openPopup(CID_AND_LINES_DEMO)
    },

    hideButton () {
      if (Platform.is.electron) {
        localStorage.setItem(this.cookieName, 'viewed')
      } else {
        this.$cookies.set(this.cookieName, 'viewed', '3650d')
      }

      this.isVisible = false
    }
  }
}
</script>
