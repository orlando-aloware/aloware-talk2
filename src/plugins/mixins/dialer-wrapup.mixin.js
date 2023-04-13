import { mapState } from 'vuex'

export default {
  data () {
    return {
      wrapUpPaused: false,
      wrapUpListeners: {}
    }
  },

  computed: {
    ...mapState(['dialer'])
  },

  created () {
    this.wrapUpListeners.pauseWrapUp = (pauseWrapUp) => {
      this.wrapUpPaused = pauseWrapUp
    }

    this.startDialerWrapUpEvents()
  },

  methods: {
    startDialerWrapUpEvents () {
      this.$VueEvent.listen('pauseWrapUp', this.wrapUpListeners.pauseWrapUp)
    },

    stopDialerWrapUpEvents () {
      this.$VueEvent.stop('pauseWrapUp', this.wrapUpListeners.pauseWrapUp)
    }
  },

  watch: {
    'dialer.contact.id': function () {
      this.wrapUpPaused = false
    }
  },

  beforeDestroy () {
    this.stopDialerWrapUpEvents()
  }
}
