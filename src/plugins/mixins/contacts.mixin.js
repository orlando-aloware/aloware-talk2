import { mapActions, mapGetters, mapState } from 'vuex'
import * as DefaultContactDateFilter from 'src/constants/company_default_contact_date_filter'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { ALL_COLUMNS } from 'src/constants/contacts-columns'
import qs from 'qs'
import _ from 'lodash'

import {
  DYNAMIC,
  STATIC
} from 'src/constants/contacts-list-types'
import { DEFAULT_PINNED_LIST } from 'src/constants/contacts-list-default-pinned-list'
import { RELATIONS } from 'src/constants/contacts-list-relations'

export default {
  data () {
    return {
      isLoading: false,
      isLoaded: false,
      isLoadingMore: false,
      myContacts: false,
      ContactListType: { STATIC, DYNAMIC },
      initialListFilters: null,
      filtersCount: 0,
      DefaultContactDateFilter,
      ContactListTypes,
      sorts: null,
      ALL_COLUMNS
    }
  },

  created () {
    this.init()
  },

  methods: {
    ...mapActions('contacts', ['selectedContactChanging', 'setSearch', 'setCurrentListFilters', 'setListSelectedContacts', 'setShouldUpdateSelectedListContactCount', 'setSelectedListContactCount']),
    init () {
      const defaultFilters = this.fixDefaultFilters()
      this.setCurrentListFilters(defaultFilters)
      this.initialListFilters = defaultFilters
      this.filtersCount = this.getFiltersCount(defaultFilters)
    },
    onSortByField (sorts) {
      this.isLoaded = false
      this.sorts = sorts
      let params = {
        search: this.search,
        page: this.listItems[this.id].current_page,
        sort: sorts.orderBy,
        order: sorts.order
      }

      this.fetch(params)
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
    onPaginate (params) {
      this.fetch(params)
    },
    onFetchMyContacts (checked) {
      this.isLoading = true
      let params = {
        contact_owner: checked ? this.profile.id : undefined,
        search: this.search,
        page: this.listItems[this.id].page
      }

      this.fetch(params)
    },
    onSearch (searchText) {
      this.isLoaded = false
      this.setSearch(searchText)
      let params = {
        search: this.search
      }

      this.fetch(params)
    },
    apiEndpoint (isContactModule, queued) {
      if (isContactModule) {
        return 'api/v2/contacts'
      } else {
        if (queued) {
          return `api/v2/power-dialer-lists/my-queue`
        } else {
          if (this.$route.meta.title === 'Power Dialer Add-list') {
            return `api/v2/contacts`
          }
          return `api/v2/power-dialer-lists/${this.id}/items`
        }
      }
    },
    processFetch: _.debounce(function (params = {}, isContactModule = true, queued = false, tempId = null) {
      params.search = this.search
      if (this.$route.name === 'Contacts') {
        params.relations = this.contactsRelations
      }
      // clear out selections every contact fetch request
      this.setListSelectedContacts({ id: this.selectedList ? this.selectedList.id : 'all', contacts: [] })
      return this.$axios
        .get(this.apiEndpoint(isContactModule, queued), {
          params: this.buildQueryString(params),
          paramsSerializer: qs.stringify
        })
        .then((response) => response.data)
        .then((data) => {
          if (tempId) {
            this.contactsLoaded({
              id: 'all',
              append: false,
              ...data
            })
          } else {
            this.contactsLoaded({
              id: this.id || 'all',
              append: false,
              ...data
            })
          }

          if (this.shouldUpdateSelectedListContactCount) {
            this.setSelectedListContactCount(data.total)
            this.setShouldUpdateSelectedListContactCount(false)
          }

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
      const sort = (this.sorts) ? this.sorts.orderBy : _.get(params, 'sort', this.defaultContactDateFilter)
      const order = (this.sorts) ? this.sorts.order : _.get(params, 'order', 'desc')
      params.sort = sort
      params.order = order

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

      query.relations = _.get(params, 'relations', [])

      query.per_page = params.per_page || 25

      query.filter_groups = []

      if (typeof this.lists[this.id] !== 'undefined' && this.lists[this.id].type === ContactListTypes.STATIC) {
        query.filter_groups = [
          {
            filters: {
              contact_lists: {
                value: [this.id],
                operator: 1
              }
            },
            is_conjunction: true
          }
        ]
      }

      if (!_.isEmpty(filters)) {
        query.filter_groups.push({
          is_conjunction: true,
          filters: filters
        })
      }

      if (!_.isEmpty(this.currentListFilters)) {
        for (let filterIndex of Object.keys(this.currentListFilters)) {
          // check if filter index is a number
          if (!isNaN(filterIndex / 1)) {
            query.filter_groups = query.filter_groups.concat(this.currentListFilters[filterIndex])
          }
        }
      }

      if (params.sort) {
        query.sort = params.sort
        query.order = params.order ? params.order : 'asc'
      }

      return query
    },
    getFiltersCount (filters) {
      let filtersCount = 0
      if (filters.constructor.name === 'Object' && Object.keys(filters).length) {
        for (let index of Object.keys(filters)) {
          const filter = _.get(filters[index], 'filters', null)
          filtersCount += filter ? Object.keys(filter).length : 0
        }
      } else if (filters.constructor.name === 'Array' && filters.length) {
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
      return typeof defaultFilters === 'string' ? JSON.parse(defaultFilters) : defaultFilters
    }
  },

  computed: {
    ...mapState('contacts', ['search', 'shouldUpdateSelectedListContactCount']),
    ...mapGetters('auth', ['profile']),
    ...mapGetters('contacts', ['lists', 'listItems', 'selectedContacts', 'currentListFilters', 'changingSelectedContact', 'selectedList']),
    ...mapState(['currentCompany']),
    defaultContactDateFilter () {
      if (this.currentCompany && this.currentCompany === DefaultContactDateFilter.DEFAULT_CONTACT_DATE_FILTER_CREATED_AT) {
        return 'created_at'
      }
      return 'last_engagement_at'
    },
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
      return DEFAULT_PINNED_LIST.MY_CONTACTS.id === this.id
    },
    isEditable () {
      return !this.defaultIds.includes(this.list.id)
    },
    defaultIds () {
      return Object.keys(DEFAULT_PINNED_LIST)
        .map((k) => DEFAULT_PINNED_LIST[k].id)
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

        for (let key in headers) {
          const found = ALL_COLUMNS.find(column => column.name === headers[key].name)

          if (!found) {
            continue
          }

          let headerRelation = _.get(headers[key], 'relationName', null)
          let columnRelation = _.get(found, 'relationName', null)

          if (columnRelation && columnRelation !== headerRelation) {
            headers[key].relationName = columnRelation
          }
        }

        return _.uniqBy(headers, 'name')
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
    },
    contactsRelations () {
      let relations = []
      for (let column of this.columns) {
        const relationName = _.get(column, 'relationName', null)
        if (relationName && RELATIONS.includes(relationName)) {
          relations.push(relationName)
        }
      }
      return relations
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
