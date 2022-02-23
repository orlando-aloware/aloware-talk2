import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import * as DefaultContactDateFilter from 'src/constants/company_default_contact_date_filter'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { ALL_COLUMNS } from 'src/constants/contacts-columns'
import { POWER_DIALER_FILTERS } from 'src/constants/power-dialer/power-dialer'
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
    ...mapActions('contacts', [
      'selectedContactChanging',
      'setSearch',
      'setCurrentListFilters',
      'setListSelectedContacts',
      'setShouldUpdateSelectedListContactCount',
      'setSelectedListContactCount',
      'setSelectedList'
    ]),
    ...mapActions('powerDialer', [
      'updateMyQueueListData'
    ]),
    ...mapMutations('powerDialer', ['SET_FILTERED_ENDPOINT']),
    init () {
      const defaultFilters = this.fixDefaultFilters()
      this.setCurrentListFilters(defaultFilters)
      this.initialListFilters = defaultFilters
      this.filtersCount = this.getFiltersCount(defaultFilters)
    },
    onSortByField (sorts) {
      this.isLoaded = false
      this.sorts = sorts
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
    onPaginate (params) {
      this.fetch(params)
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
      this.fetch({
        search: this.search
      })
    },
    apiEndpoint (queued) {
      if (!this.isPowerDialer) {
        return 'api/v2/contacts'
      }
      if (queued) {
        return `api/v2/power-dialer-lists/my-queue/items`
      }
      switch (this.$route.meta.id) {
        case 'power-dialer-add-list':
          return `api/v2/contacts`
        case 'power-dialer':
        case 'power-dialer-queue-filter':
          return `api/v2/power-dialer-lists/my-queue/items`
        default:
          return `api/v2/power-dialer-lists/${this.id === 'all' ? 'my-queue' : this.id}/items`
      }
    },
    processFetch: _.debounce(function (params = {}, isContactModule = true, queued = false) {
      params.search = this.search
      if (this.$route.name === 'Contacts') {
        params.relations = this.contactsRelations
      }
      if (this.$route.name === 'Power Dialer') {
        this.SET_FILTERED_ENDPOINT(this.apiEndpoint(queued))
      }

      // clear out selections every contact fetch request
      this.setListSelectedContacts({ id: this.selectedList ? this.selectedList.id : 'all', contacts: [] })

      return this.$axios
        .get(this.apiEndpoint(queued), {
          params: this.buildQueryString(params, isContactModule),
          paramsSerializer: qs.stringify
        })
        .then((response) => response.data)
        .then((data) => {
          this.contactsLoaded({
            id: this.id || 'all',
            append: false,
            ...data
          })

          if (this.shouldUpdateSelectedListContactCount) {
            this.setSelectedListContactCount(data.total)
            this.setShouldUpdateSelectedListContactCount(false)
          }

          if (this.apiEndpoint(queued).includes('my-queue')) {
            this.updateMyQueueListData(data.data)
          }

          const list = _.get(this.lists, this.id, { id: null, name: '', type: null })
          this.setSelectedList({ id: list.id, name: list.name, type: list.type })
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
    fetch (params = {}, hasOrder = true) {
      const defaultSort = _.get(params, 'sort', this.defaultContactDateFilter, null)
      // const sort = (this.sorts) ? this.sorts.orderBy : defaultSort
      const order = (this.sorts) ? this.sorts.order : _.get(params, 'order', 'desc')
      if (hasOrder) {
        params.sort = _.isString(this.defaultDateFilter) ? this.defaultDateFilter : defaultSort // sort
        params.order = order
      }

      this.isLoading = true
      if (typeof this.isPowerDialer !== 'undefined') {
        // the variable is defined
        switch (this.$route.meta.id) {
          case 'power-dialer':
            this.processFetch(params, false, true)
            break
          case 'power-dialer-list':
            this.processFetch(params, false, false)
            break
          default:
            this.processFetch(params, false, false)
        }
      } else {
        this.processFetch(params)
      }
    },
    buildQueryString (params, isContactModule = true) {
      const query = {
        page: 1
      }

      const powerQuery = {
        page: query.page,
        per_page: params.per_page || 25
      }

      const filters = {}

      if (params.search) {
        filters.search = {}
        filters.search.value = params.search
        powerQuery.keyword = params.search
      }

      if (params.page) {
        query.page = params.page
        powerQuery.page = params.page
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
        const filterIndex = { data: null }
        for (filterIndex.data of Object.keys(this.currentListFilters)) {
          // check if filter index is a number
          if (!isNaN(filterIndex.data / 1)) {
            query.filter_groups = query.filter_groups.concat(this.currentListFilters[filterIndex.data])
          }
        }
      }

      if (params.sort) {
        query.sort = params.sort
        query.order = params.order ? params.order : 'asc'
        powerQuery.sort_by = params.sort
        powerQuery.sort_order = params.order ? params.order : 'asc'
      }

      if (params.task_status) {
        powerQuery.task_status = params.task_status
      }

      if (this.$route.params.filter) {
        powerQuery.task_status = this.pdFilters[this.$route.params.filter] // this.$route.params.filter
      }

      if (this.$route.meta.id === 'power-dialer' || this.$route.meta.id === 'power-dialer-queue-filter') {
        powerQuery.task_status = this.pdFilters[this.activeFilter]
      }

      return this.isPowerDialer ? powerQuery : query
    },
    getFiltersCount (filters) {
      const filtersCount = { data: 0 }
      if (filters && filters.constructor.name === 'Object' && Object.keys(filters).length) {
        const index = { data: null }
        for (index.data of Object.keys(filters)) {
          const filter = _.get(filters[index.data], 'filters', null)
          filtersCount.data += filter ? Object.keys(filter).length : 0
        }
      } else if (filters.constructor.name === 'Array' && filters.length) {
        const group = { data: null }
        for (group.data of filters) {
          const filter = _.get(group.data, 'filters', null)
          filtersCount.data += filter ? Object.keys(filter).length : 0
        }
      }

      return filtersCount.data
    },
    markCheckedAll () {
      if (this.selectedContacts[this.id] && this.listItems[this.id] && document.querySelector('.data-table-check-all')) {
        document.querySelector('.data-table-check-all').checked = this.listItems[this.id].data.length > 0 && this.selectedContacts[this.id].length >= this.listItems[this.id].data.length
      }
    },
    fixDefaultFilters () {
      if (_.isEmpty(this.list)) {
        return []
      }
      const defaultFilters = !_.isEmpty(this.list.filters) ? JSON.parse(JSON.stringify(this.list.filters)) : {}
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
    ...mapState('cache', ['currentCompany']),
    ...mapState(['defaultDateFilter']),
    ...mapGetters('powerDialer', [
      'activeFilter'
    ]),
    defaultContactDateFilter () {
      if (this.currentCompany && this.defaultDateFilter === DefaultContactDateFilter.DEFAULT_CONTACT_DATE_FILTER_CREATED_AT) {
        return 'created_at'
      }
      if (typeof this.isPowerDialer !== 'undefined' && this.isPowerDialer) {
        return 'created_at'
      }
      return 'last_engagement_at'
    },
    hasMore () {
      return (this.listItems[this.id]?.next_page_url &&
        !this.isLoadingMore &&
        !this.isLoading) ||
        false
    },
    isPowerDialer () {
      const routeMetaId = _.get(this.$route, 'meta.id', null)
      return (this.$route.name === 'Power Dialer' &&
        (
          routeMetaId !== 'power-dialer-add-list' &&
          routeMetaId !== 'power-dialer-add-queue-list'
        )
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
      const data = _.get(this.listItems[this.id], 'data', null)
      return this.isLoaded && !data
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
        const headers = { data: [] }
        if (this.lists[this.id] && this.lists[this.id].headers) {
          headers.data = this.lists[this.id].headers
          if (typeof headers === 'string') {
            headers.data = JSON.parse(headers.data)
          }
        }

        if (!Array.isArray(headers.data)) {
          throw new Error('Headers field is broken')
        }

        const item = { key: null }
        for (item.key in headers.data) {
          const found = ALL_COLUMNS.find(column => column.name === headers.data[item.key].name)

          if (!found) {
            continue
          }

          const headerRelation = _.get(headers.data[item.key], 'relationName', null)
          const columnRelation = _.get(found, 'relationName', null)

          if (columnRelation && columnRelation !== headerRelation) {
            headers.data[item.key].relationName = columnRelation
          }
        }

        return _.uniqBy(headers.data, 'name')
      } catch (err) {
        console.log('Error', err)
        return []
      }
    },
    listFilters () {
      if (_.isEmpty(this.lists[this.id]) || _.isEmpty(this.lists[this.id].filters)) {
        return {}
      }

      if (typeof this.lists[this.id].filters === 'string') {
        return JSON.parse(this.lists[this.id].filters)
      }

      return this.lists[this.id].filters
    },
    list () {
      if (!this.$route.params.id) {
        return this.lists['all']
      }

      return this.lists[this.$route.params.id]
    },
    contactsRelations () {
      const relations = []
      const column = { data: null }
      for (column.data of this.columns) {
        const relationName = _.get(column.data, 'relationName', null)
        if (relationName && RELATIONS.includes(relationName)) {
          relations.push(relationName)
        }
      }
      return relations
    },
    pdFilters () {
      return POWER_DIALER_FILTERS
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
