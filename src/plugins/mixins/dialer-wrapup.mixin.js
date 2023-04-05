import { mapState } from 'vuex'

export default {
  data () {
    return {
      wrapUpPaused: false,
      dialerListeners: {}
    }
  },

  computed: {
    ...mapState(['dialer'])
  },

  created () {
    this.dialerListeners.pauseWrapUp = (pauseWrapUp) => {
      this.wrapUpPaused = pauseWrapUp
    }

    this.startDialerWrapUpEvents()
  },

  methods: {
    startDialerWrapUpEvents () {
      this.$VueEvent.listen('pauseWrapUp', this.dialerListeners.pauseWrapUp)
    },

    stopDialerWrapUpEvents () {
      this.$VueEvent.stop('pauseWrapUp', this.dialerListeners.pauseWrapUp)
    }
  },

  watch: {
    'dialer.contact': function () {
      this.wrapUpPaused = false
    }
  },

  beforeDestroy () {
    this.stopDialerWrapUpEvents()
  }
}
