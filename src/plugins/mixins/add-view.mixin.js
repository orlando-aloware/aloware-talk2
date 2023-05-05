import { isEmpty, get } from 'lodash'

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
    },

    fixDefaultFilters () {
      if (isEmpty(this.list)) {
        return []
      }

      let defaultFilters = !isEmpty(this.list.filters) ? this.$jsonClone(this.list.filters) : {}

      if (this.$route.params.id === 'my-contacts') {
        const filter = get(defaultFilters, '[0].filters.contact_owner', null)
        const profileId = get(this.profile, 'id', null)

        if (filter && profileId) {
          defaultFilters[0].filters.contact_owner[0].value = [profileId]
        }
      }

      if (typeof defaultFilters === 'string') {
        defaultFilters = JSON.parse(defaultFilters)
      }

      return defaultFilters
    }
  },
  beforeDestroy () {
    this.$VueEvent.stop('shouldUpdateListCountOnSearch', this.addViewListeners.shouldUpdateListCountOnSearch)
    this.$VueEvent.stop('addViewSetCount', this.addViewListeners.addViewSetCount)
  }
}
