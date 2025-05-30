import { TEAMINBOXES_MENU_TITLE } from 'src/router/routes'
import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('cache', ['currentCompany']),

    canGoBack () {
      return window.history.length > 1
    }
  },
  methods: {
    goBack (forceGoBack = true) {
      if (this.canGoBack) {
        this.$router.go(-1)
      } else if (forceGoBack) {
        this.$router.push({ name: this.currentCompany?.enable_legacy_inbox ? 'Inbox' : TEAMINBOXES_MENU_TITLE })
      }
    }
  }
}
