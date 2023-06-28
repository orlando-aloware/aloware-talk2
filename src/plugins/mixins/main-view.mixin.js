import { mapGetters } from 'vuex'

export default {
  data () {
    return {
      listAddRemoveContactsProgress: {
        id: null,
        loading: false
      },
      mainViewListeners: {},
      selectedContactsCount: 0
    }
  },

  computed: {
    ...mapGetters('powerDialer', ['myQueueId']),

    isMainView () {
      const isListPages = this.isContacts || this.isPowerDialer

      return isListPages && this.$route.path && !this.$route.path.includes('/add')
    },

    isComponentLoading () {
      const eventListId = this.getCleanedListId(this.listAddRemoveContactsProgress.id)
      const isListLoading = this.isMainView && this.cleanedListId === eventListId &&
        this.listAddRemoveContactsProgress.loading

      return this.isLoading || isListLoading
    },

    isPowerDialer () {
      return this.$route.name === 'Power Dialer'
    },

    isContacts () {
      return this.$route.name === 'Contacts'
    }
  },

  created () {
    this.mainViewListeners.addContactsProgress = (data) => {
      this.listAddRemoveContactsProgress = data
    }

    this.$VueEvent.listen('add_contacts_progress', this.mainViewListeners.addContactsProgress)
  },

  methods: {
    getCleanedListId (id) {
      let cleanedId = this.$isNumeric(id) ? parseInt(id) : id

      return cleanedId === 'in-queue' ? this.myQueueId : cleanedId
    },

    stopMainViewEvents () {
      this.$VueEvent.stop('add_contacts_progress', this.mainViewListeners.addContactsProgress)
    },

    onSelectedCountChange (count) {
      this.selectedContactsCount = count
    }
  }
}
