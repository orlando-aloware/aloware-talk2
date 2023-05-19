import { mapState } from 'vuex'

export default {
  data () {
    return {
      wrapUpPaused: false,
      wrapUpListeners: {}
    }
  },

  computed: {
    ...mapState([
      'dialer',
      'isCallDisposed',
      'isContactDisposed'
    ]),

    ...mapState('cache', ['currentCompany']),

    isForcedContactDisposition () {
      return this.currentCompany && this.currentCompany.force_contact_disposition
    },

    isContactNotDisposed () {
      const hasContactDisposition = this.isContactDisposed || this.dialer.contact?.disposition_status_id

      return this.currentCompany && this.currentCompany.force_contact_disposition &&
        !hasContactDisposition
    },

    isForcedCallDisposition () {
      return this.currentCompany && this.currentCompany.force_call_disposition
    }
  },

  created () {
    if (this.isForcedContactDisposition || this.isForcedCallDisposition) {
      this.wrapUpPaused = true
    }

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
    isContactNotDisposed (value) {
      if (!value && !this.isForcedCallDisposition) {
        this.wrapUpPaused = false
      }
    }
  },

  beforeDestroy () {
    this.stopDialerWrapUpEvents()
  }
}
