import { mapGetters } from 'vuex'
import qs from 'qs'
import isPlainObject from 'lodash/isPlainObject'
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
      searchText: '',
      ContactListType: { STATIC, DYNAMIC }
    }
  },
  methods: {
    onSortByField (sorts) {
      this.isLoaded = false
      this.fetch({
        search: this.searchText,
        page: this.listItems[this.id].current_page,
        comm_sort_by: `${sorts.orderBy}:${sorts.order}`
      })
    },
    onLoadMore () {
      if (this.hasMore) {
        this.isLoadingMore = true
        const nextPage = this.listItems[this.id].current_page + 1
        return window.axios
          .get('api/v2/contacts', {
            params: this.buildQueryString({
              page: nextPage,
              search: this.searchText
            }),
            paramsSerializer: qs.stringify
          })
          .then((response) => response.data)
          .then((data) => {
            this.contactsLoaded({
              id: this.id,
              append: true,
              ...data
            })
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
        search: this.searchText,
        page: this.listItems[this.id].page
      })
    },
    onSearch (searchText) {
      this.isLoaded = false
      this.searchText = searchText
      this.fetch({ search: this.searchText })
    },
    fetch (params = {}) {
      this.isLoading = true
      return window.axios
        .get('api/v2/contacts', {
          params: this.buildQueryString(params),
          paramsSerializer: qs.stringify
        })
        .then((response) => response.data)
        .then((data) => {
          this.contactsLoaded({
            id: this.id,
            append: false,
            ...data
          })
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

      let filters = { ...this.listFilters }

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

      if (this.id && !invalidIds.includes(this.id)) {
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

      return query
    }
  },
  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapGetters('contacts', ['lists', 'listItems', 'selectedContacts', 'currentListFilters']),
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
      return this.$route.query.start
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
      try {
        let filters = {}

        if (this.lists[this.id] && this.lists[this.id].filters) {
          filters = this.lists[this.id].filters
          if (typeof filters === 'string') {
            filters = JSON.parse(filters)
          }
        }

        if (!isPlainObject(filters)) {
          throw new Error('Filters field is broken')
        }

        return filters
      } catch (err) {
        console.log(err)
        return {}
      }
    },
    list () {
      if (!this.$route.params.id) {
        return this.lists['all']
      }
      return this.lists[this.$route.params.id]
    }
  },
  mounted () {
    this.fetch()
  },
  watch: {
    '$route.params.id': function () {
      this.fetch()
    },
    currentListFilters: {
      deep: true,
      handler: function () {
        this.fetch(this.currentListFilters)
      }
    }
  }
}
