export default {
  computed: {
    isSmallScreen () {
      return this.$q.screen.lt.md
    },

    contentClass () {
      const contentClass = this.isSmallScreen
        ? 'align-items-center justify-content-center h-auto flex-column'
        : 'justify-content-end'

      return [
        contentClass
      ]
    },

    actionButtonsClass () {
      const paddingClass = this.isSmallScreen ? 'pt-1' : ''

      return [
        paddingClass
      ]
    }
  },

  watch: {
    isVisible (value) {
      this.$VueEvent.fire('hide_mobile_footer', value)
    }
  }
}
