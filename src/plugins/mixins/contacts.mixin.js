import { mapActions, mapGetters, mapState } from 'vuex'
import qs from 'qs'
import _ from 'lodash'

import {
  DEFAULT_CONTACT_LIST,
  OPERATORS,
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
    this.initialListFilters = this.currentListFilters
    this.filtersCount = this.getFiltersCount(this.currentListFilters)
  },

  methods: {
    ...mapActions('contacts', ['selectedContactChanging', 'setSearch']),
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
    fetch (params = {}) {
      this.isLoading = true
      params.search = this.search
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
    },
    buildQueryString (params) {
      const invalidIds = this.defaultIds

      const query = {
        page: 1
      }

      let filters = {}

      if (this.id === DEFAULT_CONTACT_LIST.UNANSWERED.id) {
        filters.is_unanswered_contact = {}
        filters.is_unanswered_contact.value = 1
      }

      if (this.id === DEFAULT_CONTACT_LIST.UNASSIGNED.id) {
        filters.is_unassigned = {}
        filters.is_unassigned.value = 1
      }

      if (this.id === DEFAULT_CONTACT_LIST.NEWLEADS.id) {
        filters.is_new_contact = {}
        filters.is_new_contact.value = 1
      }

      if (this.id === DEFAULT_CONTACT_LIST.MY_CONTACTS.id || this.myContacts) {
        filters.contact_owner = {}
        filters.contact_owner.value = [this.profile.id]
        filters.contact_owner.operator = OPERATORS.IS_ANY_OF
      }

      if (this.id && !invalidIds.includes(this.id) && this.list && this.list.type !== DYNAMIC) {
        filters.contact_lists = {}
        filters.contact_lists.value = [this.id]
        filters.contact_lists.operator = OPERATORS.IS_ANY_OF
      }

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
        query.filter_groups = query.filter_groups.concat(this.currentListFilters)
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
    }
  },

  computed: {
    ...mapState('contacts', ['search']),
    ...mapGetters('auth', ['profile']),
    ...mapGetters('contacts', ['lists', 'listItems', 'selectedContacts', 'currentListFilters', 'changingSelectedContact']),
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
  }
}
