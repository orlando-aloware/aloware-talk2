import { mapGetters, mapMutations } from 'vuex'
import { isEmpty } from 'lodash'

export default {
  data () {
    return {
      isOpen: false,
      selectedItem: { id: '' },
      filterParams: {
        'page': 1,
        'per_page': 25,
        'filter_groups[0][filters][contact_lists][0][value][0]': 18,
        'filter_groups[0][filters][contact_lists][0][operator]': 1,
        'filter_groups[0][is_conjunction]': true,
        'order': 'desc'
      }
    }
  },

  computed: {
    ...mapGetters('powerDialer', [
      'listItems',
      'currentListFilters',
      'myQueueId'
    ]),

    ...mapGetters('contacts', {
      currentSelectedContacts: 'selectedContacts',
      selectedFilters: 'currentListFilters',
      search: 'search'
    }),

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
    ...mapMutations('powerDialer', [
      'TOGGLE_TABLE_LOADER'
    ]),

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
    },

    getCleanedListId (id) {
      let cleanedId = this.$isNumeric(id) ? parseInt(id) : id

      return cleanedId === 'in-queue' ? this.myQueueId : cleanedId
    },

    prepareFilters (params, listId) {
      let filters = {}
      // add current filters to the params
      const currentFilters = this.$jsonClone(this.selectedFilters)

      // exclude contact_lists from the filters, since it will always be present
      delete currentFilters.contact_lists

      if (!isEmpty(currentFilters)) {
        filters.filter_groups = currentFilters
      }

      console.log('preparing filters listId', listId)
      console.log('preparing filters this.currentSelectedContacts', this.currentSelectedContacts)
      // add selected contacts to the params, when they arent empty
      if (this.currentSelectedContacts && Array.isArray(this.currentSelectedContacts[listId]) && this.currentSelectedContacts[listId].length) {
        const contactIds = this.currentSelectedContacts[listId].map(contact => contact.id)

        if (contactIds.length) {
          filters.contact_ids = contactIds
        }
      }

      // add current search to the params
      if (this.search.trim()) {
        filters.keyword = this.search.trim()
      }

      if (!isEmpty(filters)) {
        // if there is some filter applied, save it in the local storage
        window.localStorage.setItem('current_pd_filters', JSON.stringify(filters))
      } else {
        // when there is no filter, try to get the filters from the local storage
        // this is necessary in some cases, like when the user refreshes the page during the PD session
        filters = JSON.parse(window.localStorage.getItem('current_pd_filters')) || {}
      }

      return { ...params, ...filters }
    }
  }
}
