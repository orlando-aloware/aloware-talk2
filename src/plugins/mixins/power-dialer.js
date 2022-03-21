import { mapGetters, mapActions, mapMutations } from 'vuex'
import qs from 'qs'
import { isEmpty, get, debounce } from 'lodash'

export default {
  data () {
    return {
      isOpen: false,
      selectedItem: { id: '' },
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
      'search'
    ]),
    tempId () {
      if (this.filter === 'in-queue') {
        return 'in-queue'
      }
      return this.id
    },
    totalList () {
      return this.listItems[this.id]?.total || 0
    },
    powerDialerListOfObjects () {
      return this.powerDialerDirectoryList || []
    },
    currentContacts () {
      return this.powerDialerListItems?.[this.id]?.data || []
    },
    dialogName () {
      return `remove-power-dialer-item-dialog`
    }
  },
  methods: {
    ...mapActions('powerDialer', [
      // 'contactsLoaded'
    ]),
    ...mapMutations('powerDialer', [
      'TOGGLE_TABLE_LOADER'
    ]),
    processFetch2: debounce(function (params = {}) {
      return this.$axios
        .get('api/v2/contacts', {
          params: this.buildQueryString(params),
          paramsSerializer: qs.stringify
        })
        .then((response) => response.data)
        .then((data) => {
          // this.contactsLoaded({
          //   id: this.tempId || '',
          //   append: false,
          //   ...data
          // })
          this.TOGGLE_TABLE_LOADER(false)
        })
    }, 1000),
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
        query.filter_groups.push({
          is_conjunction: true,
          filters: filters
        })
      }

      if (!isEmpty(this.currentListFilters)) {
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
    fetch (params = {}) {
      const sort = get(params, 'sort', 'created-at')
      const order = get(params, 'order', 'desc')
      params.sort = sort
      params.order = order
      // this.processFetch2(params)
    },
    onSortByField (sorts) {
      this.TOGGLE_TABLE_LOADER(true)
      this.fetch({
        search: this.search,
        page: '1',
        sort: sorts.orderBy,
        order: sorts.order
      })
    },
    closeModal () {
      this.selectedItem = null
      this.isOpen = false
    }
  }
}
