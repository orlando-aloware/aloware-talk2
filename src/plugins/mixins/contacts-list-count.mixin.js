import qs from 'qs'
import { mapActions, mapGetters } from 'vuex'
import { get, isEmpty } from 'lodash'
import { STATIC } from 'src/constants/contacts-list-types'

export default {
  data () {
    return {
      countCancelToken: null,
      countSource: null,
      contactsListCountListeners: {},
      fetchCount: 0,
      STATIC
    }
  },

  computed: {
    ...mapGetters('contacts', [
      'pinnedLists',
      'lists',
      'selectedList'
    ])
  },

  created () {
    this.countCancelToken = window.axios.CancelToken
    this.countSource = this.countCancelToken.source()

    this.contactsListCountListeners.getListCount = (data) => {
      this.fetchCount = 0
      const skipCancelToken = get(data, 'skipCancelToken', false)
      const listId = get(data, 'id', null)
      const isStaticList = listId !== null && this.lists?.[listId] && this.lists[listId]?.type === STATIC

      this.setIsDatatableCountLoading(true)

      this.getListDataCount(data.data, skipCancelToken, isStaticList, listId)
        .then(response => {
          // we have to re-fetch the count if count is less than
          // current contacts fetched
          if (!this.$route.path.includes('/add') && this.contactsData &&
            this.contactsData?.data.length > 0 &&
            listId === this.selectedList.id &&
            response.data.count < this.contactsData.data.length) {
            this.fetchCount++

            setTimeout(() => {
              this.getListDataCount(data.data, skipCancelToken, isStaticList, listId)
            }, 5000)

            if (this.fetchCount < 5) {
              return
            }
          }

          this.fetchCount = 0

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

          this.setIsDatatableCountLoading(false)
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

          this.setIsDatatableCountLoading(false)
        })
    }

    this.$VueEvent.listen('get-list-count', this.contactsListCountListeners.getListCount)
  },

  methods: {
    getListDataCount (data, skipCancelToken = false, isStaticList = false, listId = null) {
      if (!skipCancelToken) {
        this.countSource.cancel('Loading of contacts list count operation is canceled by the user.')
        this.countSource = this.countCancelToken.source()
      }

      const filters = typeof data.filters === 'object'
        ? this.$jsonClone(data.filters)
        : JSON.parse(data.filters)
      const tempFilters = this.$jsonClone(filters)

      // we remove unnecessary filter so we can check for emptiness
      if (tempFilters?.list_id) {
        delete tempFilters.list_id
      }

      // check if list is a static list, then we should fetch
      // from the static list count endpoint
      if (isStaticList && !this.$route.path.includes('/add') && isEmpty(tempFilters)) {
        return this.$axios.get(`${process.env.API_REPORTING_URL}/api/v2/contacts-list/${listId}/count`, {
          cancelToken: this.countSource.token
        })
      }

      const params = this.getQueryString(filters, true)

      return this.$axios.get(`${process.env.API_REPORTING_URL}/api/v2/contacts/count`, {
        params: params,
        paramsSerializer: qs.stringify,
        cancelToken: this.countSource.token
      })
    },

    getQueryString (filters, isCount = false) {
      const query = {}
      const keys = Object.keys(filters)

      if (keys.length > 0) {
        query.filter_groups = []
        const isNumeric = this.$isNumeric

        keys.forEach(function (key) {
          const isArrayValue = filters[key] && filters[key].constructor.name === 'Array'
          const isObjectValue = filters[key] && filters[key].constructor.name === 'Object'
          // get length or count according to value's type
          const groupLengthOrPropertyCount = isArrayValue
            ? filters[key].length
            : (isObjectValue
              ? Object.keys(filters[key]).filter(key => isNumeric(key)).length
              : 0)

          // assign filter_groups according to value's type
          if (isArrayValue && key === 'filter_groups' && groupLengthOrPropertyCount > 0) {
            query.filter_groups.push(...filters[key])
          } else if (isObjectValue && key === 'filter_groups' && groupLengthOrPropertyCount > 0) {
            // remove unnecessary props
            delete filters[key].sort
            delete filters[key].order
            delete filters[key].relations
            query.filter_groups = filters[key]
          }

          // search becomes a separate filter
          if (key === 'search') {
            query.search = filters[key]
          }

          // contact list id becomes a separate filter
          if (key === 'list_id') {
            query.list_id = filters[key]
          }

          // contact list id becomes a separate filter
          if (key === 'my_contacts') {
            query.my_contacts = filters[key]
          }
        })
      }

      if (query?.list_id && query?.filter_groups && query.filter_groups.length) {
        query.filter_groups.forEach((item, index) => {
          Object.assign(query.filter_groups[index].filters, {
            'contact_lists': [
              {
                value: [query.list_id],
                operator: 1
              }
            ]
          })
        })
      }

      // cleanup
      if (query.hasOwnProperty('filter_groups') && query.filter_groups.length < 1) {
        delete query.filter_groups
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
    ]),

    ...mapActions(['setIsDatatableCountLoading'])
  },

  beforeDestroy () {
    this.$VueEvent.stop('get-list-count', this.contactsListCountListeners.getListCount)
  }
}
