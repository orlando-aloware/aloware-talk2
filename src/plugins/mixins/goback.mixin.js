export default {
  computed: {
    canGoBack () {
      return window.history.length > 1
    }
  },
  methods: {
    goBack: function () {
      if (this.canGoBack) {
        this.$router.go(-1)
      } else {
        this.$router.push({ name: 'Inbox' })
      }
    }
  }
}
