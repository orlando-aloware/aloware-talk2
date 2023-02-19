import qs from 'qs'
import { mapActions, mapGetters } from 'vuex'
import { get } from 'lodash'

export default {
  data () {
    return {
      countCancelToken: null,
      countSource: null,
      contactsListCountListeners: {}
    }
  },

  computed: {
    ...mapGetters('contacts', [
      'pinnedLists'
    ])
  },

  created () {
    this.countCancelToken = window.axios.CancelToken
    this.countSource = this.countCancelToken.source()
    this.contactsListCountListeners.getListCount = (data) => {
      const skipCancelToken = get(data, 'skipCancelToken', false)
      const listId = get(data, 'id', null)
      this.getListDataCount(data.data, skipCancelToken).then(response => {
        if (data.thenFunctions) {
          const funcs = Object.keys(data.thenFunctions)
          for (let func of funcs) {
            if (typeof this[func] !== 'undefined') {
              this[func](this.fixFunctionData(data.thenFunctions[func], response))
            }
          }
        }

        if (data.thenEventFires) {
          const events = Object.keys(data.thenEventFires)
          for (let event of events) {
            this.$VueEvent.fire(event, this.fixFunctionData(data.thenEventFires[event], response))
          }
        }

        if (listId) {
          this.$VueEvent.fire('listCountUpdated', {
            list: {
              id: listId
            },
            count: response.data.count
          })
        }
      }).catch((err) => {
        const className = get(err, 'constructor.name', null)

        if (className && className === 'Cancel') {
          return
        }

        if (data.catchFunctions) {
          const funcs = Object.keys(data.catchFunctions)
          for (let func in funcs) {
            if (typeof this[func] !== 'undefined') {
              this[func](data.catchFunctions[func])
            }
          }
        }

        if (data.catchEventFires) {
          const events = Object.keys(data.catchEventFires)
          for (let event of events) {
            this.$VueEvent.fire(event, data.catchEventFires[event])
          }
        }
      })
    }
    this.$VueEvent.listen('get-list-count', this.contactsListCountListeners.getListCount)
  },

  methods: {
    getListDataCount (data, skipCancelToken = false) {
      if (!skipCancelToken) {
        this.countSource.cancel('Loading of contacts list count operation is canceled by the user.')
        this.countSource = this.countCancelToken.source()
      }

      return this.$axios.get(`${process.env.API_REPORTING_URL}/api/v2/contacts/count`, {
        params: this.getQueryString(typeof data.filters === 'object' ? data.filters : JSON.parse(data.filters)),
        paramsSerializer: qs.stringify,
        cancelToken: this.countSource.token
      })
    },
    getQueryString (filters) {
      const query = {}

      const keys = Object.keys(filters)
      if (keys.length > 0) {
        query.filter_groups = []
        keys.forEach(function (value, i) {
          if (!['sort', 'order', 'search', 'relations'].includes(value)) {
            query.filter_groups.push(filters[value])
          }
        })
      }
      return query
    },
    fixFunctionData (params, response) {
      if (typeof params === 'object') {
        const paramIndexes = Object.keys(params)
        for (let index of paramIndexes) {
          params[index] = typeof params[index] === 'string' &&
            params[index].includes('response.')
            ? get(response, params[index].replace('response.', ''), 0)
            : params[index]
        }
        return params
      }

      return typeof params === 'string' &&
        params.includes('response.')
        ? get(response, params.replace('response.', ''), 0)
        : params
    },
    ...mapActions('contacts', [
      'pinnedCountLoaded',
      'setPinnedListsLoaded',
      'setSelectedListContactCount'
    ])
  },
  beforeDestroy () {
    this.$VueEvent.stop('get-list-count', this.contactsListCountListeners.getListCount)
  }
}
