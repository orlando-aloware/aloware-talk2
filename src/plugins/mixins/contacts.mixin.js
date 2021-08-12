import { mapActions, mapGetters, mapState } from 'vuex'
import qs from 'qs'
import _ from 'lodash'

import {
  DEFAULT_CONTACT_LIST,
  DYNAMIC,
  STATIC
} from 'src/constants/contacts-list-types'

export default {
  data () {
    return {
      isLoading: false,
      isLoaded: false,
      isLoadingMore: false,
      myContacts: false,
      ContactListType: { STATIC, DYNAMIC },
      initialListFilters: null,
      filtersCount: 0
    }
  },

  created () {
    this.init()
  },

  methods: {
    ...mapActions('contacts', ['selectedContactChanging', 'setSearch', 'setCurrentListFilters', 'setListSelectedContacts']),
    init () {
      const defaultFilters = this.fixDefaultFilters()
      this.setCurrentListFilters(defaultFilters)
      this.initialListFilters = defaultFilters
      this.filtersCount = this.getFiltersCount(defaultFilters)
    },
    onSortByField (sorts) {
      this.isLoaded = false
      this.fetch({
        search: this.search,
        page: this.listItems[this.id].current_page,
        sort: sorts.orderBy,
        order: sorts.order
      })
    },
    onLoadMore () {
      if (this.hasMore) {
        this.isLoadingMore = true
        const nextPage = this.listItems[this.id].current_page + 1
        return this.$axios
          .get('api/v2/contacts', {
            params: this.buildQueryString({
              page: nextPage,
              search: this.search
            }),
            paramsSerializer: qs.stringify
          })
          .then((response) => response.data)
          .then((data) => {
            this.contactsLoaded({
              id: this.id || 'all',
              append: true,
              ...data
            })
            this.markCheckedAll()
          })
          .finally(() => {
            this.isLoadingMore = false
          })
          .catch((err) => {
            console.log(err)
          })
      }
    },
    onFetchMyContacts (checked) {
      this.isLoading = true
      this.fetch({
        contact_owner: checked ? this.profile.id : undefined,
        search: this.search,
        page: this.listItems[this.id].page
      })
    },
    onSearch (searchText) {
      this.isLoaded = false
      this.setSearch(searchText)
      this.fetch({ search: this.search })
    },
    processFetch: _.debounce(function (params = {}) {
      params.search = this.search
      // clear out selections every contact fetch request
      this.setListSelectedContacts({ id: this.selectedList ? this.selectedList.id : 'all', contacts: [] })
      return this.$axios
        .get('api/v2/contacts', {
          params: this.buildQueryString(params),
          paramsSerializer: qs.stringify
        })
        .then((response) => response.data)
        .then((data) => {
          this.contactsLoaded({
            id: this.id || 'all',
            append: false,
            ...data
          })
          this.markCheckedAll()
        })
        .finally(() => {
          this.isLoading = false
          this.isLoaded = true
        })
        .catch((err) => {
          console.log(err)
        })
    }, 1000),
    fetch (params = {}) {
      this.isLoading = true
      this.processFetch(params)
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

      query.filter_groups = []

      if (!_.isEmpty(filters)) {
        query.filter_groups.push({
          is_conjunction: true,
          filters: filters
        })
      }

      if (!_.isEmpty(this.currentListFilters)) {
        query.filter_groups = query.filter_groups.concat(this.currentListFilters[0])
      }

      if (params.sort) {
        query.sort = params.sort
        query.order = params.order ? params.order : 'asc'
      }

      return query
    },
    getFiltersCount (filters) {
      let filtersCount = 0
      if (filters.length) {
        for (let group of filters) {
          const filter = _.get(group, 'filters', null)
          filtersCount += filter ? Object.keys(filter).length : 0
        }
      }
      return filtersCount
    },
    markCheckedAll () {
      if (this.selectedContacts[this.id] && this.listItems[this.id]) {
        if (document.querySelector('.data-table-check-all')) {
          document.querySelector('.data-table-check-all').checked = this.selectedContacts[this.id].length >= this.listItems[this.id].data.length
        }
      }
    },
    fixDefaultFilters () {
      if (!this.list) {
        return []
      }
      let defaultFilters = JSON.parse(JSON.stringify(this.list.filters))
      if (this.$route.params.id === 'my-contacts') {
        const filter = _.get(defaultFilters, '[0].filters.contact_owner', null)
        const profileId = _.get(this.profile, 'id', null)
        if (filter && profileId) {
          defaultFilters[0].filters.contact_owner.value = [profileId]
        }
      }
      return defaultFilters
    }
  },

  computed: {
    ...mapState('contacts', ['search']),
    ...mapGetters('auth', ['profile']),
    ...mapGetters('contacts', ['lists', 'listItems', 'selectedContacts', 'currentListFilters', 'changingSelectedContact', 'selectedList']),
    hasMore () {
      return (
        this.listItems[this.id].next_page_url &&
        !this.isLoadingMore &&
        !this.isLoading
      )
    },
    isLoadingDisabled () {
      return this.isLoading || !this.isLoaded
    },
    isStartState () {
      const start = _.get(this.$route, 'query.start', null)
      return start !== null
    },
    isEmpty () {
      return this.isLoaded && !this.listItems[this.id].data.length
    },
    isMyContactsView () {
      return DEFAULT_CONTACT_LIST.MY_CONTACTS.id === this.id
    },
    isEditable () {
      return !this.defaultIds.includes(this.list.id)
    },
    defaultIds () {
      return Object.keys(DEFAULT_CONTACT_LIST)
        .map((k) => DEFAULT_CONTACT_LIST[k].id)
        .concat(['static'])
    },
    columns () {
      try {
        let headers = []
        if (this.lists[this.id] && this.lists[this.id].headers) {
          headers = this.lists[this.id].headers
          if (typeof headers === 'string') {
            headers = JSON.parse(headers)
          }
        }

        if (!Array.isArray(headers)) {
          throw new Error('Headers field is broken')
        }

        return headers
      } catch (err) {
        console.log(err)
        return []
      }
    },
    listFilters () {
      let filters = {}

      if (this.lists[this.id] && this.lists[this.id].filters) {
        filters = this.lists[this.id].filters
        if (typeof filters === 'string') {
          filters = JSON.parse(filters)
        }
      }

      return filters
    },
    list () {
      if (!this.$route.params.id) {
        return this.lists['all']
      }
      return this.lists[this.$route.params.id]
    }
  },
  watch: {
    list: {
      deep: true,
      handler: function () {
        this.init()
      }
    }
  }
}
