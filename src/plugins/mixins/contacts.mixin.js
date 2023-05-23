import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import { mapFields } from 'vuex-map-fields'
import * as DefaultContactDateFilter from 'src/constants/company_default_contact_date_filter'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { ALL_COLUMNS } from 'src/constants/contacts-columns'
import { POWER_DIALER_FILTERS } from 'src/constants/power-dialer/power-dialer'
import qs from 'qs'
import _ from 'lodash'
import { DEFAULT_PINNED_LIST } from 'src/constants/contacts-list-default-pinned-list'
import { RELATIONS } from 'src/constants/contacts-list-relations'
import moment from 'moment'
import { DEFAULT_STATE } from 'src/constants/contacts-default'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import { OPERATORS } from 'src/constants/contacts-filter-operators'

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
      previousRelations: [],
      hasContactsListChanges: false,
      fromContactFilters: false,
      listDataCancelToken: null,
      listDataSource: null,
      listContactsCancelToken: null,
      listContactsSource: null,
      previousSearch: null,
      listeners: {},
      addListMetaIds: [
        'power-dialer-add-queue-list',
        'power-dialer-add-list'
      ],
      appliedFiltersPreviousFilters: null,
      ALL_COLUMNS
    }
  },

  created () {
    this.processFetch = _.debounce(this.debouncedFetch, 300)
    this.listDataCancelToken = window.axios.CancelToken
    this.listDataSource = this.listDataCancelToken.source()
    this.listContactsCancelToken = window.axios.CancelToken
    this.listContactsSource = this.listContactsCancelToken.source()
    this.startEvents()
  },

  mounted () {
    if (!this.isPowerDialer) {
      this.loadData()
    }
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
      'setContact',
      'listLoaded',
      'setPreviousListFilters',
      'setPreviouslySavedListId',
      'setPreviousListId',
      'updateContactsListFilter'
    ]),

    ...mapActions('powerDialer', [
      'updateMyQueueListData',
      'setSelectedPDList'
    ]),

    ...mapMutations('powerDialer', ['SET_FILTERED_ENDPOINT']),

    init: _.debounce(function (clear = false) {
      if (this.$route.name === 'Contact') {
        this.isLoadingMore = true
      }

      const defaultFilters = this.fixDefaultFilters()
      this.setCurrentListFilters(defaultFilters)

      // path for add modal
      if (this.isAddContactsView) {
        this.onFetchMyContacts(this.showAddViewMyContacts)
        return
      }

      if (this.showMyContacts && this.$route.name === 'Contacts') {
        this.onFetchMyContacts(true)
        return
      }

      this.fetch(typeof defaultFilters === 'string' ? {} : defaultFilters, true, clear)
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
      }, true, true)

      document.getElementsByClassName('scrollableArea')[0].scrollTop = 0
    },

    onLoadMore (list = null) {
      let path = 'api/v2/contacts'

      if (this.hasMore) {
        this.setListContactsLoaded(false)
        this.isLoadingMore = true
        const nextPage = this.contactsData.current_page + 1
        const isAddList = this.addListMetaIds.includes(this.$route.meta.id)
        let sort = ''
        let order = ''

        // - if there's a selected column to sort, use the selected column or
        // - use 'order' for sort only if in power dialer list and view is not
        //   in the add contacts
        // - else, use default contact date filter (last engagement at or created at)

        // - if there's a selected column to order by, use the selected column's order
        //   (asc or desc) or
        // - use 'asc' for order only if in power dialer list and view is not
        //   in the add contacts or else, use 'desc'
        if (this.sorts) {
          sort = this.sorts.orderBy
          order = this.sorts.order
        } else if (!isAddList && this.isPowerDialer) {
          sort = 'order'
          order = 'asc'
        } else {
          sort = this.defaultContactDateFilter
          order = 'desc'
        }

        if (list) {
          path = this.apiEndpoint(this.myQueueId !== null)
        }

        let params = {
          page: nextPage,
          search: this.search,
          sort: sort,
          order: order,
          relations: this.contactsRelations
        }

        // my contacts toggle is not applicable in "Unassigned Contacts" list
        if (this.$route.params.id !== 'unassigned') {
          params.my_contacts = this.showMyContactsViewBased
        }

        return this.$axios
          .get(path, {
            params: this.buildQueryString(params),
            paramsSerializer: qs.stringify
          })
          .then((response) => response.data)
          .then((data) => {
            this.setListContactsLoaded(true)
            // Load contacts and force concatenation
            this.contactsLoaded(data, true)
            this.markCheckedAll()

            if (this.isPowerDialer) {
              this.forcedCheckAllItems()
            }
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

      this.fetch({
        my_contacts: checked,
        search: this.search,
        page: this.contactsData.page
      }, true, true)
    },

    onSearch (searchText) {
      // ignore search if previous and current search are the same
      if (this.previousSearch === searchText) {
        return
      }

      // requires at least 3 characters to allow the request or
      // empty so that the result will reset back to the original
      if (searchText && searchText.length < 3) {
        return
      }

      this.previousSearch = searchText
      this.isLoaded = false
      this.setSearch(searchText)

      this.fetch({
        my_contacts: this.showMyContactsViewBased,
        search: this.search,
        isSearch: true
      }, true, true)
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
        case 'power-dialer-add-queue-list':
          return `api/v2/contacts`

        case 'power-dialer':
        case 'power-dialer-queue-filter':
          return `api/v2/power-dialer-lists/my-queue/items`

        default:
          return `api/v2/power-dialer-lists/${this.id === 'all' ? 'my-queue' : this.id}/items`
      }
    },

    debouncedFetch (params = {}, isContactModule = true, queued = false, clear = false, isSearch = false) {
      this.setListContactsLoaded(false)
      params.search = this.search

      if (this.$route.name === 'Contacts' || this.$route.name === 'Power Dialer') {
        this.previousRelations = this.contactsRelations
        params.relations = this.contactsRelations
      }

      if (this.$route.name === 'Power Dialer') {
        this.SET_FILTERED_ENDPOINT(this.apiEndpoint(queued))
      }

      // my contacts toggle is not applicable in "Unassigned Contacts" list
      if (this.$route.params.id === 'unassigned' && params.hasOwnProperty('my_contacts')) {
        delete params.my_contacts
      }

      // clear out selections every contact fetch request
      this.setListSelectedContacts({ id: this.id, contacts: [] })
      const queryString = this.buildQueryString(params, isContactModule)

      // use the same query string to update the list count
      // eslint-disable-next-line camelcase
      const countQueryString = (({ filter_groups, search, list_id, my_contacts }) => ({ filter_groups, search, list_id, my_contacts }))(queryString)
      this.$VueEvent.fire('shouldUpdateListCountOnSearch', countQueryString)

      this.listContactsSource.cancel('Loading of contacts operation is canceled by the user')
      this.listContactsSource = this.listContactsCancelToken.source()

      let listDataId = this.id
      const isMyQueuePaths = [
        'power-dialer/in-queue',
        'power-dialer/called',
        'power-dialer/failed',
        'power-dialer/scheduled',
        'power-dialer/all'
      ]
      const isInMyQueuePaths = isMyQueuePaths.find(path => this.$route.path.includes(path)) !== undefined
      const isInMyQueue = isInMyQueuePaths || this.id === 'my-queue'

      if (this.$route.name.includes('Power Dialer') && isInMyQueue) {
        listDataId = this.myQueue?.id
      }

      if (listDataId === null) {
        listDataId = 'all'
      }

      const list = _.get(this.lists, listDataId, { id: null, name: '', type: null })

      this.setSelectedList({
        id: listDataId,
        name: list.name,
        type: list.type
      })

      return this.$axios
        .get(this.apiEndpoint(queued), {
          params: queryString,
          paramsSerializer: qs.stringify,
          cancelToken: this.listContactsSource.token
        })
        .then((response) => response.data)
        .then((data) => {
          if (this.isInPowerDialerList) {
            // clear add contacts loading screen in PD list
            this.$VueEvent.fire('add_contacts_progress', {
              id: null,
              loading: false
            })
          }

          if (clear) {
            this.clearContacts()
          }

          this.contactsLoaded(data)
          this.setListContactsLoaded(true)

          if (this.$route.name === 'Contact') {
            this.$VueEvent.fire('contactsListSidebarDataLoaded', data.data)
          }

          if (this.apiEndpoint(queued).includes('my-queue')) {
            // TODOs: Use vuex for storing filtered power dialer contact lists
            this.updateMyQueueListData(data)
          }

          this.markCheckedAll()
        })
        .finally(() => {
          this.isLoading = false
          this.isLoaded = true
          this.isLoadingMore = false
        })
        .catch((err) => {
          // revert  list's filters to previous
          if (!_.isEmpty(this.appliedFiltersPreviousFilters)) {
            this.setCurrentListFilters(this.appliedFiltersPreviousFilters)
            this.$VueEvent.fire('updateHasFilterChanges')
          }

          this.isLoading = false
          this.isLoaded = true
          this.isLoadingMore = false
          this.setListContactsLoaded(true)
          console.log(err)
        })
    },

    fetch (params = {}, hasOrder = true, clear = false, isLoading = false, fromRefresh = false) {
      let listId = null
      let eventListId = null

      if (typeof this.getCleanedListId !== 'undefined') {
        listId = this.getCleanedListId(this.$route?.params?.id)
        eventListId = this.getCleanedListId(this.powerDialerListAddContactsProgress?.id)
      }

      // prevent fetching contacts when PD is still in-progress
      // in adding contacts if current list is the affected list
      if (this.isInPowerDialerList && this.powerDialerListAddContactsProgress?.loading &&
        listId === eventListId) {
        return
      }

      const isSearch = _.get(params, 'isSearch', false)

      if (isSearch) {
        delete params.isSearch
      }

      if (isLoading) {
        this.isLoadingMore = true
      }

      if (!this.fromContactFilters && !fromRefresh) {
        this.setPreviousListFilters(params)
        this.setPreviousListId(this.id)
      }

      const defaultSort = {
        data: _.get(params, 'sort', this.defaultContactDateFilter)
      }

      if (defaultSort.data.constructor !== 'Function') {
        defaultSort.data = this.defaultContactDateFilter
      }

      // const sort = (this.sorts) ? this.sorts.orderBy : defaultSort
      const order = (this.sorts)
        ? this.sorts.order
        : _.get(params, 'order', 'desc')

      if (hasOrder) {
        params.sort = _.isString(this.defaultDateFilter) ? this.defaultDateFilter : defaultSort.data // sort
        params.order = order
      }

      this.isLoading = true

      // for power dialer list contacts fetching
      if (typeof this.isPowerDialer !== 'undefined') {
        // the variable is defined
        switch (this.$route.meta.id) {
          case 'power-dialer-queue-filter':
            this.processFetch(params, false, true, clear, isSearch)
            break

          case 'power-dialer-list-filter':
            this.processFetch(params, false, false, clear, isSearch)
            break

          default:
            this.processFetch(params, false, false, clear, isSearch)
        }

        return
      }

      // contacts list contacts fetching
      this.processFetch(params, true, false, clear, isSearch)
    },

    buildQueryString (params, isContactModule = true) {
      // contacts query
      const query = {
        page: 1
      }

      // power dialer query
      const powerQuery = {
        page: query.page,
        per_page: params.per_page || 25
      }

      const filters = {}

      if (params.search) {
        // for contacts list
        query.search = params.search
        // for power dialer query
        powerQuery.keyword = params.search
      }

      if (params.page) {
        query.page = params.page
        powerQuery.page = params.page
      }

      query.relations = _.get(params, 'relations', [])

      query.per_page = params.per_page || 25

      query.filter_groups = []

      // initial filter for static contact lists
      if (this.list && this.list.type === ContactListTypes.STATIC) {
        query.list_id = this.id
      }

      if (!_.isEmpty(filters)) {
        query.filter_groups.push({
          is_conjunction: true,
          filters: filters
        })
      }

      // build filter group(s)
      if (!_.isEmpty(this.currentListFilters)) {
        const listFilters = this.$jsonClone(this.currentListFilters)

        for (const filterIndex of Object.keys(listFilters)) {
          // check if filter index is a number
          if (isNaN(filterIndex / 1)) {
            continue
          }

          const filters = _.get(listFilters[filterIndex], 'filters', null)

          if (!filters) {
            continue
          }

          // loop through each filters
          for (const filterKey of Object.keys(filters)) {
            const filter = this.filters.find(filterItem => filterItem.key === filterKey)
            const filterType = _.get(filter, 'type', null)

            if (filterType && filterType !== 'date') {
              continue
            }

            for (const filterItemKey in filters[filterKey]) {
              // if filter type is 'date', add the browser's timezone
              listFilters[filterIndex].filters[filterKey][filterItemKey].timezone = moment.tz.guess()
            }
          }

          // first index of list's filter groups must be joined/associated with the list's initial filter
          // to get correct query results
          if (query?.filter_groups[0] && +filterIndex === 0) {
            const mergedFirstFilterIndex = {
              ...query.filter_groups[0].filters,
              ...listFilters[filterIndex].filters
            }

            query.filter_groups[0].filters = mergedFirstFilterIndex
            continue
          }

          query.filter_groups = query.filter_groups.concat(listFilters[filterIndex])
        }
      }

      // cleanup
      if (query.hasOwnProperty('filter_groups') && query.filter_groups.length < 1) {
        delete query.filter_groups
      }

      if (params?.sort) {
        query.sort = this.getSortByColumn(params.sort)
        query.order = params.order ? params.order : 'asc'
        powerQuery.sort_by = this.getSortByColumn(params.sort)
        powerQuery.sort_order = params.order ? params.order : 'asc'
      }

      if (params?.my_contacts) {
        query.my_contacts = params.my_contacts
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
      let groupAllFiltersSize = 0
      const keys = Object.keys(filters)

      keys.forEach((key) => {
        // only proceed if key is numeric
        if (this.$isNumeric(key)) {
          groupAllFiltersSize += Object.values(filters[key].filters).flat().length
        }
      })

      return groupAllFiltersSize
    },

    markCheckedAll () {
      if (this.selectedContacts[this.id] && !_.isEmpty(this.contactsData) &&
        document.querySelector('.data-table-check-all')) {
        const hasMoreContacts = this.contactsData.data.length > 0 &&
          this.selectedContacts[this.id].length >= this.contactsData.data.length
        document.querySelector('.data-table-check-all').checked = hasMoreContacts ||
          this.isAllContactsSelected
      }
    },

    fixDefaultFilters () {
      if (_.isEmpty(this.list)) {
        return []
      }

      let defaultFilters = !_.isEmpty(this.list.filters) ? this.$jsonClone(this.list.filters) : {}

      if (typeof defaultFilters === 'string') {
        return JSON.parse(defaultFilters)
      }

      if (this.id === 'my-contacts') {
        const filter = _.get(defaultFilters, '[0].filters.contact_owner', null)
        const profileId = _.get(this.profile, 'id', null)

        if (filter && profileId) {
          defaultFilters[0].filters.contact_owner[0].value = [profileId]
          defaultFilters[0].filters.contact_owner[0].default = 1
        }
      }

      if (typeof defaultFilters[0] === 'undefined') {
        defaultFilters[0] = {
          filters: {}
        }
      }

      if (_.isEmpty(defaultFilters[0].filters) &&
        [
          'unassigned',
          'unanswered',
          'new-leads'
        ].includes(this.$route.params.id)) {
        defaultFilters[0].filters = DEFAULT_STATE.lists[this.$route.params.id].filters
      }

      if (['unassigned'].includes(this.$route.params.id)) {
        defaultFilters[0].filters.is_unassigned[0].default = 1
      }

      if (['unanswered'].includes(this.$route.params.id)) {
        defaultFilters[0].filters.is_unanswered_contact[0].default = 1
      }

      if (['new-leads'].includes(this.$route.params.id)) {
        defaultFilters[0].filters.contact_task_status[0].default = 1
      }

      // load filters from URL
      defaultFilters = this.loadUrlFilters(defaultFilters)

      if (_.isEmpty(defaultFilters[0].filters)) {
        delete defaultFilters[0]
      }

      return defaultFilters
    },

    contactsLoaded (listData, isConcatenated = false) {
      const dataLength = listData.data.length
      let contactIndex = null
      const currentPage = _.get(listData, 'current_page', 0)

      if (!_.isEmpty(this.contactsData.data)) {
        for (const item in this.contactsData.data) {
          if (this.isPowerDialer) {
            contactIndex = listData.data.find(contact => contact.contact_list_item_id === this.contactsData.data[item].contact_list_item_id)
            contactIndex = contactIndex ? listData.data.indexOf(contactIndex) : null
          } else {
            contactIndex = listData.data.find(contact => contact.id === this.contactsData.data[item].id)
            contactIndex = contactIndex ? listData.data.indexOf(contactIndex) : null
          }

          if (currentPage === 1 && contactIndex !== -1 && contactIndex !== null) {
            for (const childItem in listData.data[contactIndex]) {
              if (typeof this.contactsData.data[item][childItem] !== 'undefined') {
                this.contactsData.data[item][childItem] = listData.data[contactIndex][childItem]
              }
            }
          }

          if (!this.isPowerDialer && contactIndex !== -1 && contactIndex !== null) {
            listData.data.splice(contactIndex, 1)
          }
        }
      }

      // we have to skip the pagination data from api
      // if we navigated from Contact to Contacts page
      if (!this.isNavigated) {
        for (const item in listData) {
          if (item === 'data') {
            continue
          }

          if (this.contactsData[item] !== 'undefined') {
            this.contactsData[item] = listData[item]
          }
        }
      }

      this.isNavigated = false

      for (const item of listData.data) {
        this.contactsData.data.push(item)
      }

      if (currentPage === 1 && this.contactsData.data.length > dataLength) {
        this.contactsData.data.sort((a, b) => {
          return moment(b.last_engagement_at).unix() - moment(a.last_engagement_at).unix()
        })
      }

      if (this.isPowerDialer) {
        this.powerDialerActiveList = { ...listData }

        if (isConcatenated) {
          this.powerDialerActiveList.data = this.contactsData.data
        }
      }
    },

    clearContacts () {
      this.contactsData = {
        data: []
      }
    },

    stopEvents () {
      this.$VueEvent.stop('filteredFetchContacts', this.listeners.filteredFetchContacts)
      this.$VueEvent.stop('fetchContacts', this.listeners.fetchContacts)
      this.$VueEvent.stop('clearContacts', this.listeners.clearContacts)
      this.$VueEvent.stop('onLoadMoreContacts', this.listeners.onLoadMoreContacts)
      this.$VueEvent.stop('new_communication', this.listeners.newCommunication)
      this.$VueEvent.stop('contactUpdated', this.listeners.contactUpdated)
    },

    initiateFetch (data, fromRefresh = false) {
      this.appliedFiltersPreviousFilters = _.get(data, 'previousFilters', null)
      const fetchData = { hasOrder: null, params: null, clear: null, isLoading: null }
      fetchData.params = _.get(data, 'params', {})
      fetchData.hasOrder = _.get(data, 'hasOrder', true)
      fetchData.clear = _.get(data, 'clear', false)
      fetchData.isLoading = _.get(data, 'isLoading', false)

      // Keeps only user's contacts on list after fetching
      _.set(fetchData, 'params.my_contacts', this.showMyContactsViewBased)

      this.fetch(fetchData.params, fetchData.hasOrder, fetchData.clear, fetchData.isLoading, fromRefresh)
    },

    startEvents () {
      this.listeners.filteredFetchContacts = (data) => {
        this.fromContactFilters = true
        this.initiateFetch(data)
      }

      this.listeners.fetchContacts = (data) => {
        const fromRefresh = _.get(data, 'fromRefresh', false)
        this.fromContactFilters = false
        data = fromRefresh ? {} : data
        this.initiateFetch(data, fromRefresh)
      }

      this.listeners.clearContacts = () => {
        this.clearContacts()
      }

      this.listeners.onLoadMoreContacts = () => {
        this.onLoadMore()
      }

      this.listeners.newCommunication = (communication) => {
        const excludeRouteNames = [
          'Contact',
          'Inbox',
          'Inbox Contact Task',
          'Inbox Channel Task Status',
          'Inbox Contact',
          'Inbox Contact Communication',
          'Inbox Channel'
        ]

        if (excludeRouteNames.includes(this.$route.name)) {
          return
        }

        if (!this.checkCommunicationMatchesUserAccessibility(communication)) {
          return
        }

        const index = this.contactsData.data.findIndex(item => item.id === communication.contact_id)

        if (index >= 0) {
          const contact = this.$jsonClone(communication.contact)
          // add the v2 contact attributes that we need
          Object.assign(contact, this.addV2ContactAttributes(contact))
          // update the contact attributes
          Object.assign(this.contactsData.data[index], contact)

          if (parseInt(this.contact.id) === parseInt(communication.contact_id)) {
            this.setContact(this.contactsData.data[index])
          }
        }
      }

      this.listeners.contactUpdated = () => {
        this.hasContactsListChanges = true
      }

      this.$VueEvent.listen('filteredFetchContacts', this.listeners.filteredFetchContacts)
      this.$VueEvent.listen('fetchContacts', this.listeners.fetchContacts)
      this.$VueEvent.listen('clearContacts', this.listeners.clearContacts)
      this.$VueEvent.listen('onLoadMoreContacts', this.listeners.onLoadMoreContacts)
      this.$VueEvent.listen('new_communication', this.listeners.newCommunication)
      this.$VueEvent.listen('contactUpdated', this.listeners.contactUpdated)
    },

    getListData () {
      this.listDataSource.cancel('Loading of contacts list operation is canceled by the user')
      this.listDataSource = this.listDataCancelToken.source()

      return this.$axios
        .get('/api/v2/contacts-list/' + this.id + (this.$route.query.type && this.$route.query.type === 'public' ? '?is_public_list=true' : ''), {
          cancelToken: this.listDataSource.token
        })
        .then((response) => response.data)
        .then((response) => {
          this.listLoaded({ ...response, id: this.id })
          this.setSelectedList({ id: response.id, name: response.name, type: response.type })
          this.setPreviousListFilters(response.filters)
          this.setPreviousListId(this.id)
        }).catch((err) => {
          const { message, html } = extractErrorMessage(err)
          console.log(html)
          this.$generalNotification(message, 'error')

          // if page is not in contacts page root (All Contacts), navigate to it
          if (this.$route.name === 'Contacts' &&
            this.$route.meta.page !== 'Contacts') {
            this.$router.push({
              name: 'Contacts'
            })
          }
        })
    },

    loadData (skipCancelToken = true, clear = false) {
      const isIneligibleList = !this.list || typeof this.list === 'undefined' ||
        this.list.id !== this.$route.params.id

      if (isIneligibleList && this.id !== 'all' && this.$route.name === 'Contacts') {
        this.getListData().then(() => {
          this.init(clear)
        }).catch(err => {
          console.log(err)
        })

        return
      }

      if (!skipCancelToken) {
        this.listDataSource.cancel('Loading of contacts list operation is canceled by the user')
        this.listDataSource = this.listDataCancelToken.source()
      }

      this.init(clear)
    },

    loadUrlFilters (filters) {
      const url = new URL(window.location.href)

      // if there are any filter in URL, build them individually
      if (url.search) {
        const params = url.searchParams

        // filter by tag
        const tag = params.has('tag_id') ? _.parseInt(params.get('tag_id')) : false

        if (tag) {
          filters[0].filters.tags = [
            {
              operator: OPERATORS.IS_ANY_OF,
              value: [ tag ]
            }
          ]
        }

        filters[0].is_conjunction = true
      }

      return filters
    },

    /**
     * Backend columns might differ from front end names being used.
     * This function maps this if encountered some different column
     */
    getSortByColumn (key) {
      if (key in this.backendTablesDictionary) {
        return this.backendTablesDictionary[key]
      }

      return key
    }
  },

  computed: {
    ...mapState('contacts', [
      'search',
      'shouldUpdateSelectedListContactCount',
      'showMyContacts',
      'showAddViewMyContacts',
      'previousListId',
      'previouslySavedListId',
      'previousListFilters',
      'isAllContactsSelected'
    ]),

    ...mapGetters('auth', [
      'profile'
    ]),

    ...mapGetters('contacts', [
      'lists',
      'listItems',
      'selectedContacts',
      'currentListFilters',
      'changingSelectedContact',
      'selectedList',
      'contact'
    ]),

    ...mapState('cache', [
      'currentCompany'
    ]),

    ...mapState([
      'defaultDateFilter',
      'filters'
    ]),

    ...mapGetters('powerDialer', [
      'activeFilter'
    ]),

    ...mapFields('powerDialer', [
      'myQueue'
    ]),

    id () {
      if (['Contacts List', 'Public Contacts List', 'Default Contacts List'].includes(this.$route.meta.page)) {
        return this.$route.params.id
      }

      if (['power-dialer', 'power-dialer-queue-filter'].includes(this.$route.meta.id)) {
        return this.$route.params.id
      }

      if (['power-dialer-session', 'power-dialer-list', 'power-dialer-list-filter'].includes(this.$route.meta.id)) {
        return this.$route.params.id
      }

      if (this.$route.name !== 'Contacts' && this.$route.name !== 'Power Dialer') {
        return null
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
      return this.contactsData?.next_page_url &&
        !this.isLoadingMore &&
        !this.isLoading
    },

    isPowerDialer () {
      const routeMetaId = _.get(this.$route, 'meta.id', null)
      const notInAddContactsRoute = routeMetaId !== 'power-dialer-add-list' &&
        routeMetaId !== 'power-dialer-add-queue-list'

      return this.$route.name === 'Power Dialer' && notInAddContactsRoute
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
      const id = isNaN(this.id) && !this.$route.name.includes('Contacts') ? 'my-queue' : this.id

      try {
        let headers = []

        if (this.lists[id] && this.lists[id].headers) {
          headers = this.lists[id].headers

          if (typeof headers === 'string') {
            headers = JSON.parse(headers)
          }
        }

        if (!Array.isArray(headers)) {
          throw new Error('Headers field is broken')
        }

        for (const key in headers) {
          const headerExists = ALL_COLUMNS.find(column => column.name === headers[key].name)

          if (!headerExists) {
            continue
          }

          const headerRelation = _.get(headers[key], 'relationName', null)
          const headerExistsRelation = _.get(headerExists, 'relationName', null)

          if (headerExistsRelation && headerExistsRelation !== headerRelation) {
            headers[key].relationName = headerExistsRelation
          }
        }

        return _.uniqBy(headers, 'name')
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

      if (this.myQueueId && this.isPowerDialer) {
        return this.lists['my-queue']
      }

      return this.lists[this.id]
    },

    contactsRelations () {
      const relations = []

      for (const column of this.columns) {
        const relationName = _.get(column, 'relationName', null)
        const pdListAddRoutePattern = /\/power-dialer\/list(\/\d*)?\/add/gi

        if (pdListAddRoutePattern.test(this.$route.path) && relationName === 'taskStatus') {
          continue
        }

        if (relationName && RELATIONS.includes(relationName)) {
          relations.push(relationName)
        }
      }

      return relations
    },

    pdFilters () {
      return POWER_DIALER_FILTERS
    },

    backendTablesDictionary () {
      return {
        'inbound_calls_count': 'inbound_call_count',
        'inbound_texts_count': 'inbound_sms_count',
        'outbound_calls_count': 'outbound_call_count',
        'outbound_texts_count': 'outbound_sms_count'
      }
    },

    isAddContactsView () {
      // e.g. contacts/list/3/add; power-dialer/list/add; power-dialer/list/1/add
      return /list\/(\d+\/)?add/.test(this.$route.path)
    },

    showMyContactsViewBased () {
      return this.isAddContactsView ? this.showAddViewMyContacts : this.showMyContacts
    }
  },

  watch: {
    currentListFilters: {
      deep: true,
      handler: function () {
        if (this.$route.name === 'Contacts') {
          this.filtersCount = this.getFiltersCount(this.currentListFilters)
        }
      }
    },

    $route (to, from) {
      this.previousSearch = null
      this.isNavigated = false
      const backToContacts = from.name === 'Contact' && to.name === 'Contacts'
      const movedToContacts = from.name === 'Contacts' && to.name === 'Contact'
      const contactToContact = from.name === 'Contact' && to.name === 'Contact'
      const listHasNoUpdate = backToContacts && !this.hasContactsListChanges

      if (listHasNoUpdate || movedToContacts || contactToContact) {
        if (this.$route.name === 'Contacts') {
          setTimeout(() => {
            this.startEvents()
          }, 500)
        }

        return
      }

      const contactsToOtherRoutes = from.name === 'Contacts' &&
        !['Contacts', 'Contact'].includes(to.name)
      const otherRoutesToContacts = !['Contacts', 'Contact'].includes(from.name) &&
        to.name === 'Contacts'
      const inOrOutOfContactsOrToPD = (contactsToOtherRoutes || otherRoutesToContacts || to.name === 'Power Dialer')

      if (inOrOutOfContactsOrToPD || this.$route.name === 'Contacts') {
        this.isNavigated = true

        setTimeout(() => {
          this.startEvents()
        }, 500)
      }

      const pdToPD = from.name === 'Power Dialer' && !['Power Dialer'].includes(to.name)
      const otherRoutesToPD = !['Power Dialer'].includes(from.name) && to.name === 'Power Dialer'
      const pdToPdOrToContacts = pdToPD || otherRoutesToPD || to.name === 'Contacts'

      if (this.isPowerDialer && pdToPdOrToContacts) {
        this.isNavigated = true

        setTimeout(() => {
          this.startEvents()
        }, 500)
      }

      const listHasUpdated = from.name === 'Contact' && to.name === 'Contacts' &&
        this.hasContactsListChanges
      const contactsListToOtherContactsList = from.name === 'Contacts' && to.name === 'Contacts' &&
        from.path !== to.path

      if (listHasUpdated || contactsListToOtherContactsList) {
        this.hasContactsListChanges = false
        this.clearContacts()
      }

      if (to.name === 'Contacts' && this.$options.name === 'PowerDialer') {
        return
      }

      if (!this.isPowerDialer) {
        const isFromAddContacts = _.get(from, 'params.id', false) !== false &&
          from.path.includes('/add')
        this.loadData(false, isFromAddContacts)
      }
    },

    id: function (newValue, oldValue) {
      // we only revert back the previous filter of the previous list
      // only if the changes in the list's filter was not saved.
      if (this.previouslySavedListId !== oldValue &&
        this.initiateUpdateContactsListFilter !== undefined) {
        this.initiateUpdateContactsListFilter({
          oldIdValue: oldValue
        })
        this.setPreviousListFilters({})
        this.setPreviouslySavedListId(null)
        this.setPreviousListId(null)
      }
    }
  },

  beforeDestroy () {
    this.stopEvents()
  }
}
