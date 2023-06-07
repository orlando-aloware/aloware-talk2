import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState(['isMobile']),

    horizontalPaddingClass () {
      const paddingClass = this.isMobile ? 'px-0' : ''

      return [
        paddingClass
      ]
    }
  }
}
