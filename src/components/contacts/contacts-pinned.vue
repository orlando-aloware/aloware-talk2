<template>
  <div class="pinned">
    <div class="pinned__header d-flex align-items-center list--header">
      <div class="header__header__title font-weight-bold flex-grow-1">
        Pinned
      </div>
    </div>
    <div class="d-flex pinned__content flex-column">
      <contacts-pinned-item v-for="item in defaultLists"
                            :item="item"
                            :key="item.id"
                            :countsLoading="loading">
      </contacts-pinned-item>
      <template v-if="!loadingPinned">
        <contacts-pinned-item v-for="item in nonDefaultLists"
                              :item="item"
                              :key="item.id"
                              :countsLoading="loading">
        </contacts-pinned-item>
      </template>
      <contacts-sidebar-loader v-if="loadingPinned"></contacts-sidebar-loader>
    </div>
  </div>
</template>

<script>
import qs from 'qs'
import { mapActions, mapGetters } from 'vuex'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { DEFAULT_PINNED_LIST } from 'src/constants/contacts-list-default-pinned-list'
import { OPERATORS } from 'src/constants/contacts-filter-operators'
import ContactsPinnedItem from 'components/contacts/contacts-pinned-item'
import ContactsSidebarLoader from 'components/contacts/contacts-sidebar-loader'

export default {
  components: {
    ContactsSidebarLoader,
    ContactsPinnedItem
  },

  data () {
    return {
      loadingDefaultCounts: false,
      loadingPinned: false,
      listeners: {},
      ContactListTypes
    }
  },

  computed: {
    ...mapGetters('auth', ['profile', 'authenticated']),
    ...mapGetters('contacts', ['pinnedLists', 'pinned', 'pinnedCounts']),
    loading () {
      return this.loadingDefaultCounts || this.loadingPinned
    },
    defaultIds () {
      return Object.keys(DEFAULT_PINNED_LIST).map(key => DEFAULT_PINNED_LIST[key].id)
    },
    defaultLists () {
      return this.pinnedLists.filter(list => this.defaultIds.includes(list.id))
    },
    nonDefaultLists () {
      return this.pinnedLists.filter(list => !this.defaultIds.includes(list.id))
    }
  },

  mounted () {
    this.init()
    this.listeners.fetchContactsLists = () => {
      this.init()
    }
    this.listeners.getListCount = (list) => {
      if (list.type === this.ContactListTypes.DYNAMIC && list.id !== 'my-contacts') {
        this.loadDynamicListPinnedCount(list, true)
      }

      // if (list.type === this.ContactListTypes.DYNAMIC && list.id === 'my-contacts') {
      //   this.loadMyContactsCount()
      // }

      if (list.type === this.ContactListTypes.STATIC) {
        this.loadPinnedCount(list.id)
      }
    }
    this.listeners.listCountUpdated = (data) => {
      const isPinned = this.pinnedLists.find(item => item.id.toString() === data.list.id.toString())

      if (!isPinned) {
        return
      }

      this.pinnedCountLoaded({
        id: data.list.id,
        count: data.count
      })
    }

    this.listeners.updateLoadingPinned = (value) => {
      this.loadingPinned = value
    }

    this.$VueEvent.listen('fetchContactsLists', this.listeners.fetchContactsLists)
    this.$VueEvent.listen('getListCount', this.listeners.getListCount)
    this.$VueEvent.listen('listCountUpdated', this.listeners.listCountUpdated)
    this.$VueEvent.listen('update-loading-pinned', this.listeners.updateLoadingPinned)
  },

  methods: {
    ...mapActions('contacts', [
      'pinnedCountLoaded',
      'pinnedLoaded',
      'listLoaded',
      'setPinnedListsLoaded'
    ]),

    init () {
      if (this.authenticated) {
        this.loadPinned()
      }
    },

    loadDefaultCounts () {
      this.loadingDefaultCounts = true
      return Promise.all([
        // this.loadAllCount(),
        // this.loadMyContactsCount(),
        this.loadStatusCounts()
      ]).then((
        [
          // allContacts,
          // myContacts,
          statusCounts
        ]) => {
        this.pinnedCountLoaded({
          id: DEFAULT_PINNED_LIST.ALL_CONTACTS.id,
          count: statusCounts.all_contacts_count
        })
        this.pinnedCountLoaded({
          id: DEFAULT_PINNED_LIST.MY_CONTACTS.id,
          count: statusCounts.my_contacts_count
        })
        this.pinnedCountLoaded({
          id: DEFAULT_PINNED_LIST.NEWLEADS.id,
          count: statusCounts.new_contacts_count
        })
        this.pinnedCountLoaded({
          id: DEFAULT_PINNED_LIST.UNANSWERED.id,
          count: statusCounts.unanswered_contacts_count
        })
        this.pinnedCountLoaded({
          id: DEFAULT_PINNED_LIST.UNASSIGNED.id,
          count: statusCounts.unassigned_contacts_count
        })
      }).catch((err) => {
        console.error(err)
        this.$generalNotification('Unable to load pinned list counts, please try again.', 'error')
        this.setPinnedListsLoaded(true)
        this.loadingDefaultCounts = false
      }).finally(() => {
        this.loadingDefaultCounts = false
      })
    },

    loadAllCount () {
      return this.$axios.get(`${process.env.API_REPORTING_URL}/api/v2/contacts/count`).then((response) => response.data.count)
    },

    loadMyContactsCount () {
      return this.$axios.get(`${process.env.API_REPORTING_URL}/api/v2/contacts/count`, {
        params: {
          filter_groups: [{
            filters: {
              contact_owner: [
                {
                  operator: OPERATORS.IS_ANY_OF,
                  value: [this.profile.id]
                }
              ]
            },
            is_conjunction: true
          }]
        },
        paramsSerializer: qs.stringify
      }).then((response) => {
        this.pinnedCountLoaded({
          id: 'my-contacts',
          count: response.data.count
        })
      })
    },

    loadStatusCounts () {
      return this.$axios.get(`${process.env.API_REPORTING_URL}/api/v2/contacts/status-counts`).then((response) => response.data)
        .catch((err) => {
          console.error(err)
          this.$generalNotification('Unable to load status counts, please try again.', 'error')
          this.setPinnedListsLoaded(true)
          this.loadingPinned = false
        })
    },

    async loadPinnedCount (id) {
      await this.$axios.get(`api/v2/contacts-list/${id}/items?per_page=1`)
        .then((response) => {
          this.pinnedCountLoaded({
            id: id,
            count: response.data.total
          })
        }).catch((err) => {
          console.error(err)
          this.$generalNotification('Unable to load pinned count, please try again.', 'error')
          this.setPinnedListsLoaded(true)
          this.loadingPinned = false
        })
    },

    async loadDynamicListPinnedCount (data, skipCancelToken = false) {
      this.$VueEvent.fire('get-list-count', {
        data: data,
        skipCancelToken: skipCancelToken,
        thenFunctions: {
          'pinnedCountLoaded': {
            id: data.contact_list_id || data.id,
            count: 'response.data.count'
          }
        },
        catchFunctions: {
          'setPinnedListsLoaded': true
        },
        catchEventFires: {
          'update-loading-pinned': true
        }
      })
    },

    loadPinned () {
      this.loadingPinned = true
      const pinnedIds = []
      const item = { i: 0 }
      const contactListId = { data: null }
      return this.$axios.get('api/v2/contact-list-bookmark').then((response) => response.data)
        .then(async (data) => {
          for (item.i = 0; item.i < data.length; item.i++) {
            contactListId.data = data[item.i].contact_list_id
            pinnedIds.push(contactListId.data)
            this.listLoaded({
              id: contactListId.data,
              name: data[item.i].name,
              headers: data[item.i].headers,
              filters: data[item.i].filters,
              type: data[item.i].type,
              order: data[item.i].order
            })

            if (data[item.i].type === this.ContactListTypes.STATIC) {
              await this.loadPinnedCount(contactListId.data)
            }

            if (data[item.i].type === this.ContactListTypes.DYNAMIC) {
              await this.loadDynamicListPinnedCount(data[item.i], true)
            }
          }

          this.pinnedLoaded(pinnedIds)
          // this.loadDefaultCounts()
          this.loadingPinned = false
        }).catch((err) => {
          console.error(err)
          this.$generalNotification('Unable to load pinned contacts list, please try again.', 'error')
          this.setPinnedListsLoaded(true)
          this.loadingPinned = false
        })
    }
  },
  watch: {
    '$route.name': function (value) {
      if (value === 'Contacts') {
        this.init()
      }
    },
    loading (value) {
      this.setPinnedListsLoaded(!value)
    }
  },
  beforeDestroy () {
    this.$VueEvent.stop('fetchContactsLists', this.listeners.fetchContactsLists)
    this.$VueEvent.stop('getListCount', this.listeners.getListCount)
    this.$VueEvent.stop('listCountUpdated', this.listeners.listCountUpdated)
    this.$VueEvent.stop('update-loading-pinned', this.listeners.updateLoadingPinned)
  }
}
</script>
