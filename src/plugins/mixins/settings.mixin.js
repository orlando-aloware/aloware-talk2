export default {

  methods: {
    scrollToElement () {
      this.$nextTick(function () {
        const targetEl = document.querySelector(this.$route.hash + '-container')
        const containerEl = document.querySelector('.setting-content-wrapper')
        containerEl.scrollTop = targetEl.offsetTop
      })
    }
  },

  watch: {
    '$route.hash': function () {
      if (['Settings Tab'].includes(this.$route.name)) {
        this.$nextTick(function () {
          const targetEl = document.querySelector(this.$route.hash + '-container')

          targetEl.classList.add('highlighted')

          setTimeout(function () {
            targetEl.classList.remove('highlighted')
          }, 2000)

          const containerEl = document.querySelector('.settings-content-wrapper')
          containerEl.scrollTop = targetEl.offsetTop - 10
        })
      }
    }
  }
}
