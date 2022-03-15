import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import * as DefaultContactDateFilter from 'src/constants/company_default_contact_date_filter'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { ALL_COLUMNS } from 'src/constants/contacts-columns'
import { POWER_DIALER_FILTERS } from 'src/constants/power-dialer/power-dialer'
import qs from 'qs'
import _ from 'lodash'
import { DEFAULT_PINNED_LIST } from 'src/constants/contacts-list-default-pinned-list'
import { RELATIONS } from 'src/constants/contacts-list-relations'
import moment from 'moment'
import talk2Api from 'src/plugins/api/api'

export default {
  data () {
    return {
      isLoading: false,
      isLoaded: false,
      isLoadingMore: false,
      initialListFilters: null,
      filtersCount: 0,
      DefaultContactDateFilter,
      ContactListTypes,
      sorts: null,
      contactsData: {
        total: 0,
        current_page: 1,
        next_page_url: null,
        prev_page_url: null,
        data: []
      },
      isNavigated: false,
      ALL_COLUMNS
    }
  },

  created () {
    this.init()
    const hasOrder = { data: null }
    const params = { data: null }
    this.$VueEvent.listen('fetchContacts', (data) => {
      hasOrder.data = _.get(data, 'hasOrder', true)
      params.data = _.get(data, 'params', {})
      this.fetch(params.data, hasOrder.data)
    })
    this.$VueEvent.listen('clearContacts', () => {
      this.clearContacts()
    })
    this.$VueEvent.listen('onLoadMoreContacts', () => {
      this.onLoadMore()
    })

    const _this = this

    this.$VueEvent.listen('new_communication', function (communication) {
      if (['Contact', 'Inbox', 'Inbox Contact Task', 'Inbox Channel Task Status', 'Inbox Contact', 'Inbox Contact Communication', 'Inbox Channel'].includes(_this.$route.name)) {
        return
      }

      const index = _this.contactsData.data.findIndex(item => item.id === communication.contact_id)
      if (index >= 0) {
        talk2Api.V2.contacts.get(communication.contact_id).then(response => {
          _this.contactsData.data[index] = response.data

          if (_this.contact.id === communication.contact_id) {
            _this.setContact(response.data)
          }
        })
      }
    })
  },

  methods: {
    ...mapActions('contacts', [
      'selectedContactChanging',
      'setSearch',
      'setCurrentListFilters',
      'setListSelectedContacts',
      'setShouldUpdateSelectedListContactCount',
      'setSelectedListContactCount',
      'setSelectedList',
      'setListContactsLoaded',
      'setContact'
    ]),
    ...mapActions('powerDialer', [
      'updateMyQueueListData',
      'setSelectedPDList'
    ]),
    ...mapMutations('powerDialer', ['SET_FILTERED_ENDPOINT']),
    init: _.debounce(function () {
      const defaultFilters = this.fixDefaultFilters()
      this.setCurrentListFilters(defaultFilters)
      this.fetch(typeof defaultFilters === 'string' ? {} : defaultFilters)
      this.initialListFilters = defaultFilters
      this.filtersCount = this.getFiltersCount(defaultFilters)
    }, 200),
    onSortByField (sorts) {
      this.isLoaded = false
      this.sorts = sorts
      this.fetch({
        search: this.search,
        page: 1,
        sort: sorts.orderBy,
        order: sorts.order
      })
      document.getElementsByClassName('scrollableArea')[0].scrollTop = 0
    },
    onLoadMore () {
      if (this.hasMore) {
        this.setListContactsLoaded(false)
        this.isLoadingMore = true
        const nextPage = this.contactsData.current_page + 1

        const sort = (this.sorts) ? this.sorts.orderBy : this.defaultContactDateFilter
        const order = (this.sorts) ? this.sorts.order : 'desc'

        return this.$axios
          .get('api/v2/contacts', {
            params: this.buildQueryString({
              page: nextPage,
              search: this.search,
              sort: sort,
              order: order,
              relations: this.contactsRelations
            }),
            paramsSerializer: qs.stringify
          })
          .then((response) => response.data)
          .then((data) => {
            this.setListContactsLoaded(true)
            this.contactsLoaded(data)
            this.markCheckedAll()
          })
          .finally(() => {
            this.isLoadingMore = false
          })
          .catch((err) => {
            this.setListContactsLoaded(true)
            this.isLoadingMore = false
            console.log(err)
          })
      }
    },
    onPaginate (params) {
      this.fetch(params)
    },
    onFetchMyContacts (checked) {
      this.isLoading = true
      this.$VueEvent.fire('clearContacts')
      this.fetch({
        contact_owner: checked ? this.profile.id : undefined,
        search: this.search,
        page: this.contactsData.page
      })
    },
    onSearch (searchText) {
      this.isLoaded = false
      this.setSearch(searchText)
      this.$VueEvent.fire('clearContacts')
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
      this.setListContactsLoaded(false)
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
          this.contactsLoaded(data)
          this.setListContactsLoaded(true)

          if (this.apiEndpoint(queued).includes('my-queue')) {
            // TODOs: Use vuex for storing filtered power dialer contact lists
            this.updateMyQueueListData(data.data)
          }

          let listId = this.id === 'my-queue' ? this.myQueue?.id : this.id
          const list = _.get(this.lists, listId, { id: null, name: '', type: null })

          this.setSelectedList({
            id: listId,
            name: list.name,
            type: list.type
          })

          this.markCheckedAll()
        })
        .finally(() => {
          this.isLoading = false
          this.isLoaded = true
        })
        .catch((err) => {
          this.isLoading = false
          this.isLoaded = true
          this.setListContactsLoaded(true)
          console.log(err)
        })
    }, 1000),
    fetch (params = {}, hasOrder = true) {
      const defaultSort = { data: _.get(params, 'sort', this.defaultContactDateFilter) }
      if (defaultSort.data.constructor !== 'Function') {
        defaultSort.data = this.defaultContactDateFilter
      }
      // const sort = (this.sorts) ? this.sorts.orderBy : defaultSort
      const order = (this.sorts) ? this.sorts.order : _.get(params, 'order', 'desc')
      if (hasOrder) {
        params.sort = _.isString(this.defaultDateFilter) ? this.defaultDateFilter : defaultSort.data // sort
        params.order = order
      }

      this.isLoading = true
      if (typeof this.isPowerDialer !== 'undefined') {
        // the variable is defined
        switch (this.$route.meta.id) {
          case 'power-dialer-queue-filter':
            this.processFetch(params, false, true)
            break
          case 'power-dialer-list-filter':
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

      if (params?.sort) {
        query.sort = params.sort
        query.order = params.order ? params.order : 'asc'
        powerQuery.sort_by = params.sort
        powerQuery.sort_order = params.order ? params.order : 'asc'
      }

      if (params.contact_owner) {
        query.filter_groups.push({ filters: {
          contact_owner: {
            value: [params.contact_owner],
            operator: 1
          }
        },
        is_conjunction: true })
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
      if (this.selectedContacts[this.id] && !_.isEmpty(this.contactsData) && document.querySelector('.data-table-check-all')) {
        document.querySelector('.data-table-check-all').checked = this.contactsData.data.length > 0 && this.selectedContacts[this.id].length >= this.contactsData.data.length
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
          defaultFilters[0].filters.contact_owner.default = 1
        }
      }

      if (['unassigned'].includes(this.$route.params.id)) {
        defaultFilters[0].filters.is_unassigned.default = 1
      }

      if (['unanswered'].includes(this.$route.params.id)) {
        defaultFilters[0].filters.is_unanswered_contact.default = 1
      }

      if (['new-leads'].includes(this.$route.params.id)) {
        defaultFilters[0].filters.is_new_contact.default = 1
      }

      return typeof defaultFilters === 'string' ? JSON.parse(defaultFilters) : defaultFilters
    },
    contactsLoaded (listData) {
      const dataLength = listData.data.length
      const found = { data: null }
      const item = { data: null }
      const currentPage = _.get(listData, 'current_page', 0)

      if (!_.isEmpty(this.contactsData.data)) {
        for (item.data in this.contactsData.data) {
          found.data = listData.data.find(contact => contact.id === this.contactsData.data[item.data].id)
          found.data = found.data ? listData.data.indexOf(found.data) : null

          if (currentPage === 1 && found.data !== -1 && found.data !== null) {
            this.contactsData.data[item.data] = listData.data[found.data]
          }

          if (found.data !== -1 && found.data !== null) {
            listData.data.splice(found.data, 1)
          }
        }
      }

      // we have to skip the pagination data from api
      // if we navigated from Contact to Contacts page
      if (!this.isNavigated) {
        for (item.data in listData) {
          if (item.data === 'data') {
            continue
          }

          if (this.contactsData[item.data] !== 'undefined') {
            this.contactsData[item.data] = listData[item.data]
          }
        }
      }

      this.isNavigated = false

      for (item.data of listData.data) {
        this.contactsData.data.push(item.data)
      }

      if (currentPage === 1 && this.contactsData.data.length > dataLength) {
        this.contactsData.data.sort((a, b) => { return moment(b.last_engagement_at).unix() - moment(a.last_engagement_at).unix() })
      }
    },
    clearContacts () {
      this.contactsData = {
        data: []
      }
    },
    stopEvents () {
      this.$VueEvent.stop('fetchContacts')
      this.$VueEvent.stop('clearContacts')
      this.$VueEvent.stop('onLoadMoreContacts')
    }
  },

  computed: {
    ...mapState('contacts', ['search', 'shouldUpdateSelectedListContactCount']),
    ...mapGetters('auth', ['profile']),
    ...mapGetters('contacts', ['lists', 'listItems', 'selectedContacts', 'currentListFilters', 'changingSelectedContact', 'selectedList', 'contact']),
    ...mapState('cache', ['currentCompany']),
    ...mapState(['defaultDateFilter']),
    ...mapGetters('powerDialer', [
      'activeFilter'
    ]),
    id () {
      if (['Contacts List', 'Public Contacts List', 'Default Contacts List'].includes(this.$route.meta.page)) {
        return this.$route.params.id
      } else if (['power-dialer', 'power-dialer-queue-filter'].includes(this.$route.meta.id)) {
        return this.$route.params.id
      } else if (['power-dialer-session', 'power-dialer-list', 'power-dialer-list-filter'].includes(this.$route.meta.id)) {
        return this.$route.params.id
      }

      return 'all'
    },
    myQueueId () {
      return this.selectedList.type ? null : this.selectedList.id
    },
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
      return (this.contactsData?.next_page_url &&
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
      const data = _.get(this.contactsData, 'data', [])
      return this.isLoaded && !data.length
    },
    isMyContactsView () {
      return DEFAULT_PINNED_LIST.MY_CONTACTS.id === this.id
    },
    isEditable () {
      const listId = _.get(this.list, 'id', null)
      return !listId || (listId && !this.defaultIds.includes(listId))
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
      if (!this.id) {
        return this.lists['all']
      }
      if (this.myQueueId) {
        return this.lists['my-queue']
      }

      return this.lists[this.id]
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
    // 'list.filters': function () {
    //   this.init()
    // },
    currentListFilters: {
      deep: true,
      handler: function () {
        if (this.$route.name === 'Contacts') {
          // const params = typeof this.currentListFilters === 'string' ? {} : this.currentListFilters
          // this.fetch(params)
          this.filtersCount = this.getFiltersCount(this.currentListFilters)
        }
      }
    },
    'list.id': function (value) {
      if (value && this.$route.name === 'Contacts') {
        this.clearContacts()
      }
    },
    $route (to, from) {
      this.isNavigated = true

      if (to.name === 'Contacts' || to.name === 'Power Dialer') {
        this.init()
      }

      if (from.name === 'Contact' && to.name === 'Contacts') {
        this.isNavigated = false
        return
      }

      if ((from.name === 'Contacts' && to.name === 'Contacts') || (from.name === 'Power Dialer' && to.name === 'Power Dialer')) {
        this.isNavigated = false
      }
    }
  },

  beforeDestroy () {
    if (!(this.$route.meta.id === 'power-dialer-queue-filter' || this.$route.meta.id === 'power-dialer-list-filter')) {
      this.stopEvents()
    }
  }
}
