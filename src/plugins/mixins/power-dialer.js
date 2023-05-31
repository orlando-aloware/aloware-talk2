import { mapGetters, mapMutations } from 'vuex'

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
      'search',
      'myQueueId'
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
    },

    cleanedListId () {
      return this.getCleanedListId(this.$route?.params?.id)
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
    }
  }
}
