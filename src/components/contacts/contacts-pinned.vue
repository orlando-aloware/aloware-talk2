<template>
  <div class="pinned">
    <div class="pinned__header d-flex align-items-center list--header">
      <div class="header__header__title font-weight-bold flex-grow-1">
        Pinned
      </div>
    </div>
    <div class="d-flex pinned__content flex-column">
      <div v-if="!loading">
        <contacts-pinned-item v-for="item in pinnedLists"
                              :item="item"
                              :key="item.id">
        </contacts-pinned-item>
      </div>
      <contacts-sidebar-loader v-if="loading"></contacts-sidebar-loader>
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
      ContactListTypes
    }
  },

  computed: {
    ...mapGetters('auth', ['profile', 'authenticated']),
    ...mapGetters('contacts', ['pinnedLists', 'pinned']),
    loading () {
      return this.loadingDefaultCounts || this.loadingPinned
    }
  },

  mounted () {
    this.init()
    this.$VueEvent.listen('fetchContactsLists', () => {
      this.init()
    })
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
        this.loadDefaultCounts()
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
      return this.$axios.get('api/v2/contacts/count').then((response) => response.data.count)
    },

    loadMyContactsCount () {
      return this.$axios.get('api/v2/contacts/count', {
        params: {
          filter_groups: [{
            filters: {
              contact_owner: {
                operator: OPERATORS.IS_ANY_OF,
                value: [this.profile.id]
              }
            },
            is_conjunction: true
          }]
        },
        paramsSerializer: qs.stringify
      }).then((response) => response.data.count)
    },

    loadStatusCounts () {
      return this.$axios.get('api/v2/contacts/status-counts').then((response) => response.data)
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

    async loadDynamicListPinnedCount (data) {
      await this.$axios.get(`api/v2/contacts`, { params: this.buildQueryString(JSON.parse(data.filters)), paramsSerializer: qs.stringify })
        .then((response) => {
          this.pinnedCountLoaded({
            id: data.contact_list_id,
            count: response.data.total
          })
        }).catch((err) => {
          console.error(err)
          this.$generalNotification('Unable to load pinned count, please try again.', 'error')
          this.setPinnedListsLoaded(true)
          this.loadingPinned = false
        })
    },

    loadPinned () {
      this.loadingPinned = true
      return this.$axios.get('api/v2/contact-list-bookmark').then((response) => response.data)
        .then(async (data) => {
          const pinnedIds = []
          const item = { i: 0 }
          for (item.i = 0; item.i < data.length; item.i++) {
            const contactListId = data[item.i].contact_list_id
            pinnedIds.push(contactListId)
            this.listLoaded({
              id: contactListId,
              name: data[item.i].name,
              headers: data[item.i].headers,
              filters: data[item.i].filters,
              type: data[item.i].type,
              order: data[item.i].order
            })

            if (data[item.i].type === this.ContactListTypes.STATIC) {
              await this.loadPinnedCount(contactListId)
            }

            if (data[item.i].type === this.ContactListTypes.DYNAMIC) {
              await this.loadDynamicListPinnedCount(data[item.i])
            }
          }

          this.pinnedLoaded(pinnedIds)
          this.loadingPinned = false
        }).catch((err) => {
          console.error(err)
          this.$generalNotification('Unable to load pinned count, please try again.', 'error')
          this.setPinnedListsLoaded(true)
          this.loadingPinned = false
        })
    },

    buildQueryString (filters) {
      const query = {
        page: 1
      }

      if (filters.length > 0) {
        query.filter_groups = []

        query.filter_groups.push({
          is_conjunction: true,
          filters: filters[0].filters
        })
      }

      return query
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
  }
}
</script>
