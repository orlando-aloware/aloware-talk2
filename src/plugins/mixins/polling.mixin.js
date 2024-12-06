import { mapMutations, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import { isEmpty, omit } from 'lodash'

export default {
  data () {
    return {
      pollingInterval: 5, // in seconds
      usersPollInterval: null,
      contactsPollInterval: null
    }
  },

  computed: {
    ...mapState(['forceContactsPoll'])
  },

  methods: {
    ...mapMutations([
      'UPDATE_USER_STATUS',
      'FORCE_CONTACTS_POLL'
    ]),

    addUsersPoll () {
      // runs after 'polling_interval' seconds the app is initiated, every 'polling_interval' seconds
      this.usersPollInterval = setInterval(() => {
        this.pollUsers()
      }, this.pollingInterval * 1000)
    },

    pollUsers () {
      console.log('Polling agents status...')

      talk2Api.V1.company.getAgentsStatus().then((result) => {
        // update agent_status of every user

        for (const user of result.data) {
          this.UPDATE_USER_STATUS(user)

          if (this.profile.company_id === user.company_id) {
            this.$VueEvent.fire('agent_status_updated', user)
          }
        }
      })
    },

    addContactsPoll () {
      // runs after 'polling_interval' seconds the app is initiated, every 'polling_interval' seconds
      this.usersPollInterval = setInterval(() => {
        this.pollContacts()
      }, 10 * 1000) // every 10 seconds
    },

    pollContacts () {
      /*
      These are the scenarios where the poll shouldn't happen automatically:
      - some contacts are selected
      - filters component is opened
      - filters aren't empty
      any of the rules above won't be considered when forceContactsPoll is forced
       */
      const hasCheckedContacts = this.checkedItemIds.length > 0
      const hasFilters = !isEmpty(omit(this.currentListFilters, ['contact_lists'])) // hack for PD
      const hasSearch = !isEmpty(this.search)

      if ((hasCheckedContacts || this.isFiltersOpen || hasFilters || hasSearch) && !this.forceContactsPoll) {
        return
      }

      switch (this.$route.name) {
        case 'Contacts':
          this.pollContactsIntoContactsPage()
          break
        case 'Power Dialer':
          this.pollContactsIntoPowerDialerPage()
      }

      // reset force flag
      this.FORCE_CONTACTS_POLL(false)
    },

    pollContactsIntoContactsPage () {
      console.log('polling contacts into contacts page...')

      this.$VueEvent.fire('fetchContacts', {
        clear: true,
        skipCache: true
      })
    },

    pollContactsIntoPowerDialerPage () {
      console.log('polling contacts into PD page...')

      this.loadList(this.selectedList.id)
    }
  },

  beforeDestroy () {
    clearInterval(this.usersPollInterval)
    clearInterval(this.contactsPollInterval)
  }
}
