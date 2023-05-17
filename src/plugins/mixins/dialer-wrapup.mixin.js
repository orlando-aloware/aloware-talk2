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

    isContactNotDisposed () {
      const hasContactDisposition = this.isContactDisposed || this.dialer.contact?.disposition_status_id

      return this.currentCompany && this.currentCompany.force_contact_disposition &&
        !hasContactDisposition
    }
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
      if (!this.isContactNotDisposed) {
        this.wrapUpPaused = false
      }
    }
  },

  beforeDestroy () {
    this.stopDialerWrapUpEvents()
  }
}
