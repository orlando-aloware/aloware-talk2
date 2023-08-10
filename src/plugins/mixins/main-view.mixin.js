import { mapGetters } from 'vuex'
import Vue from 'vue'

export default {
  provide () {
    return {
      contactsData: this.contactsData,
      selectedContacts: this.selectedContacts
    }
  },

  data () {
    return {
      listAddRemoveContactsProgress: {
        id: null,
        loading: false
      },
      mainViewListeners: {},
      selectedContacts: {},
      selectedContactsCount: 0
    }
  },

  computed: {
    ...mapGetters('powerDialer', ['myQueueId']),

    isMainView () {
      const isListPages = this.$route.name === 'Power Dialer' || this.$route.name === 'Contacts'

      return isListPages && this.$route.path && !this.$route.path.includes('/add')
    },

    isComponentLoading () {
      const eventListId = this.getCleanedListId(this.listAddRemoveContactsProgress.id)
      const isListLoading = this.isMainView &&
        this.getCleanedListId(this.$route?.params?.id) === eventListId &&
        this.listAddRemoveContactsProgress.loading

      return this.isLoading || isListLoading
    }
  },

  created () {
    this.mainViewListeners.addContactsProgress = (data) => {
      this.listAddRemoveContactsProgress = data
    }

    this.mainViewListeners.setListSelectedContacts = (data) => {
      Vue.set(
        this.selectedContacts,
        data.id,
        data.contacts.map(
          item => ({
            'id': item.id,
            'contact_list_item_id': item.contact_list_item_id
          })
        )
      )
    }

    this.$VueEvent.listen('addContactsProgress', this.mainViewListeners.addContactsProgress)
    this.$VueEvent.listen('setListSelectedContacts', this.mainViewListeners.setListSelectedContacts)
  },

  methods: {
    getCleanedListId (id) {
      let cleanedId = this.$isNumeric(id) ? parseInt(id) : id

      return cleanedId === 'in-queue' ? this.myQueueId : cleanedId
    },

    stopMainViewEvents () {
      this.$VueEvent.stop('addContactsProgress', this.mainViewListeners.addContactsProgress)
      this.$VueEvent.stop('setListSelectedContacts', this.mainViewListeners.setListSelectedContacts)
    },

    onSelectedCountChange (count) {
      this.selectedContactsCount = count
    }
  }
}
