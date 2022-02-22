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
import { DYNAMIC, STATIC } from 'src/constants/contacts-list-types'
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
      loading: false,
      contactListType: {
        STATIC,
        DYNAMIC
      }
    }
  },

  computed: {
    ...mapGetters('auth', ['profile', 'authenticated']),
    ...mapGetters('contacts', ['pinnedLists', 'pinned'])
  },

  mounted () {
    if (this.authenticated) {
      this.loadDefaultCounts()
      this.loadPinned()
    }
  },

  methods: {
    ...mapActions('contacts', [
      'pinnedCountLoaded',
      'pinnedLoaded',
      'listLoaded'
    ]),

    loadDefaultCounts () {
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
      }).finally(() => {
        this.loading = false
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
    },

    loadPinnedCount (id) {
      return this.$axios.get(`api/v2/contacts-list/${id}/items?per_page=1`).then((response) => {
        this.pinnedCountLoaded({
          id: id,
          count: response.data.total
        })
      })
    },

    loadDynamicListPinnedCount (data) {
      return this.$axios.get(`api/v2/contacts`, { params: this.buildQueryString(JSON.parse(data.filters)), paramsSerializer: qs.stringify }).then((response) => {
        this.pinnedCountLoaded({
          id: data.contact_list_id,
          count: response.data.total
        })
      })
    },

    loadPinned () {
      this.loading = true
      return this.$axios.get('api/v2/contact-list-bookmark').then((response) => response.data).then(async (data) => {
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

          if (data[item.i].type === STATIC) {
            this.loadPinnedCount(contactListId)
          }

          if (data[item.i].type === DYNAMIC) {
            this.loadDynamicListPinnedCount(data[item.i])
          }
        }

        this.pinnedLoaded(pinnedIds)

        this.loading = false
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
        this.loadPinned()
      }
    }
  }
}
</script>
