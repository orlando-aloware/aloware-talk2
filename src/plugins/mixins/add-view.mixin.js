import { isEmpty, get } from 'lodash'

export default {
  data () {
    return {
      addViewListeners: {},
      contactCount: 0
    }
  },

  computed: {
    addContactsGuideText () {
      return this.openEdit
        ? 'You can add contacts either by manually selecting them or by creating a filter'
        : 'Manually select contacts or create a filter'
    }
  },

  mounted () {
    this.addViewListeners.shouldUpdateListCountOnSearch = (data) => {
      const event = data.event
      const filters = data.filters
      const clear = data?.clear ?? false
      this.setDataCount(filters, event, true, clear)
    }
    this.addViewListeners.addViewSetCount = (value) => {
      this.contactCount = value
    }
    this.$VueEvent.listen('shouldUpdateListCountOnSearch', this.addViewListeners.shouldUpdateListCountOnSearch)
    this.$VueEvent.listen('addViewSetCount', this.addViewListeners.addViewSetCount)
  },

  methods: {
    setDataCount (data, event, skipCancelToken, clear = false) {
      if (!data) {
        return
      }

      this.$VueEvent.fire('get-list-count', {
        data: { filters: data },
        id: this.id,
        event: event,
        clear: clear,
        skipCancelToken: skipCancelToken,
        thenEventFires: {
          addViewSetCount: 'response.data.count'
        }
      })
    },

    isColumnArrayValueEmpty (columnValue) {
      const isEmptyArray = columnValue instanceof Array && !columnValue.length
      return columnValue === '' ||
        columnValue === null ||
        columnValue === 'NULL' ||
        isEmptyArray
    },

    isColumnArrayValueNotEmpty (columnValue) {
      return columnValue &&
        columnValue instanceof Array &&
        columnValue.length
    },

    isColumnObjectValueEmpty (columnValue) {
      return columnValue && columnValue instanceof Object && !Object.keys(columnValue).length
    },

    isColumnObjectValueNotEmpty (columnValue) {
      return columnValue &&
        columnValue instanceof Object &&
        Object.keys(columnValue).length
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
