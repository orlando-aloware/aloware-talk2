import { mapGetters, mapActions, mapMutations } from 'vuex'
import qs from 'qs'
import { isEmpty, get } from 'lodash'

export default {
  data () {
    return {
      isLoading: false,
      filterParams: {
        'page': 1,
        'per_page': 25,
        'filter_groups[0][filters][contact_lists][value][0]': 18,
        'filter_groups[0][filters][contact_lists][operator]': 1,
        'filter_groups[0][is_conjunction]': true,
        'order': 'desc'
      }
    }
  },
  computed: {
    ...mapGetters('powerDialer', [
      'listItems',
      'currentListFilters',
      'powerDialerListItems',
      'currentList',
      'search'
    ]),
    columns () {
      return this.currentList?.headers || []
    },
    list () {
      if (!this.$route.params.id) {
        return this.listItems['all']
      }
      return this.listItems[this.$route.params.id]
    },
    tempId () {
      if (this.filter === 'in-queue') {
        return 'in-queue'
      }
      return this.id
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      'contactsLoaded',
      'setSearch'
    ]),
    ...mapMutations('powerDialer', [
      'TOGGLE_TABLE_LOADER'
    ]),
    async processFetch (params) {
      // console.log('100 :>> ', this.powerDialerListItems[this.tempId])
      // console.log('101 :>> ', this.powerDialerListItems)
      // console.log('102 :>> ', this.tempId)
      return this.$axios
        .get('api/v2/contacts', {
          params: this.buildQueryString(params),
          paramsSerializer: qs.stringify
        })
        .then((response) => response.data)
        .then((data) => {
          // console.log('params :>> ', params)
          // console.log('data from api : ', data)
          this.contactsLoaded({
            id: this.tempId || '',
            append: false,
            ...data
          })
          this.TOGGLE_TABLE_LOADER(false)
        })
    },
    buildQueryString (params) {
      const query = {
        page: 1
      }

      let filters = {}

      if (params.search) {
        filters.search = {}
        filters.search.value = params.search
      }

      if (params.page) {
        query.page = params.page
      }

      query.per_page = params.per_page || 25

      query.filter_groups = []

      if (typeof this.powerDialerListItems[this.tempId] !== 'undefined' && this.tempId !== 'all') {
        query.filter_groups = [
          {
            filters: {
              contact_lists: {
                value: [this.tempId],
                operator: 1
              }
            },
            is_conjunction: true
          }
        ]
      }

      if (!isEmpty(filters)) {
        // console.log('200 :>> ', 200)
        query.filter_groups.push({
          is_conjunction: true,
          filters: filters
        })
      }

      if (!isEmpty(this.currentListFilters)) {
        // console.log('300 :>> ', 300)
        for (let filterIndex of Object.keys(this.currentListFilters)) {
          // check if filter index is a number
          if (!isNaN(filterIndex / 1)) {
            query.filter_groups = query.filter_groups.concat(this.currentListFilters[filterIndex])
          }
        }
      }

      if (params.sort) {
        // console.log('400 :>> ', 400)
        query.sort = params.sort
        query.order = params.order ? params.order : 'asc'
      }

      return query
    },
    fetch (params = {}) {
      const sort = get(params, 'sort', 'created-at')
      const order = get(params, 'order', 'desc')
      params.sort = sort
      params.order = order
      this.isLoading = true
      this.processFetch(params)
    },
    onSearch (searchText) {
      this.isLoaded = false
      this.setSearch(searchText)
      this.fetch({ search: this.search })
    },
    onSortByField (sorts) {
      console.log('sorts :>> ', sorts)
      // this.isLoaded = false
      this.TOGGLE_TABLE_LOADER(true)
      this.fetch({
        search: this.search,
        page: '1',
        sort: sorts.orderBy,
        order: sorts.order
      })
    },
    onLoadMore () {
      console.log('...on load more...')
    }
  }
}
