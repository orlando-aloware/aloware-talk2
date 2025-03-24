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
                            :data-testid="'contacts-pinned-default-list-'+item.id"
                            :countsLoading="loading">
      </contacts-pinned-item>
      <template v-if="!loadingPinned">
        <contacts-pinned-item v-for="item in nonDefaultLists"
                              :item="item"
                              :key="item.id"
                              :data-testid="'contacts-pinned-non-default-list-'+item.id"
                              :countsLoading="loading">
        </contacts-pinned-item>
      </template>
      <contacts-sidebar-loader v-if="loadingPinned"></contacts-sidebar-loader>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import * as ContactListTypes from 'src/constants/contacts-list-types'
import { DEFAULT_PINNED_LIST } from 'src/constants/contacts-list-default-pinned-list'
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

    this.$VueEvent.listen('fetchContactsLists', this.listeners.fetchContactsLists)
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
          }

          this.pinnedLoaded(pinnedIds)
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
  }
}
</script>
