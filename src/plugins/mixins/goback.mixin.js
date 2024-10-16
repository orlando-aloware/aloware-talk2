export default {
  computed: {
    canGoBack () {
      return window.history.length > 1
    }
  },
  methods: {
    goBack (forceGoBack = true) {
      if (this.canGoBack) {
        this.$router.go(-1)
      } else if (forceGoBack) {
        this.$router.push({ name: 'Inbox' })
      }
    }
  }
}
