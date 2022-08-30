export default {
  data () {
    return {
      addViewListeners: {}
    }
  },
  computed: {
    id () {
      if (['Contacts List', 'Public Contacts List', 'Default Contacts List'].includes(this.$route.meta.page)) {
        return this.$route.params.id
      } else if (['power-dialer', 'power-dialer-queue-filter'].includes(this.$route.meta.id)) {
        return this.$route.params.id
      } else if (['power-dialer-session', 'power-dialer-list', 'power-dialer-list-filter'].includes(this.$route.meta.id)) {
        return this.$route.params.id
      }

      if (this.$route.name !== 'Contacts' && this.$route.name !== 'Power Dialer') {
        return null
      }

      return 'all'
    }
  },
  mounted () {
    this.setDataCount([], true)
    this.addViewListeners.shouldUpdateListCountOnSearch = (data) => {
      this.setDataCount(data, true)
    }
    this.addViewListeners.addViewSetCount = (value) => {
      this.contactCount = value
    }
    this.$VueEvent.listen('shouldUpdateListCountOnSearch', this.addViewListeners.shouldUpdateListCountOnSearch)
    this.$VueEvent.listen('addViewSetCount', this.addViewListeners.addViewSetCount)
  },
  methods: {
    setDataCount (data, skipCancelToken) {
      if (!data) {
        return
      }

      this.$VueEvent.fire('get-list-count', {
        data: { filters: data },
        id: this.id,
        skipCancelToken: skipCancelToken,
        thenEventFires: {
          addViewSetCount: 'response.data.count'
        }
      })
    }
  },
  beforeDestroy () {
    this.$VueEvent.stop('shouldUpdateListCountOnSearch', this.addViewListeners.shouldUpdateListCountOnSearch)
    this.$VueEvent.stop('addViewSetCount', this.addViewListeners.addViewSetCount)
  }
}
