<template>
  <div class="pinned">
    <div class="pinned__header d-flex align-items-center list--header">
      <div class="header__header__title font-weight-bold flex-grow-1">
        Pinned
      </div>
    </div>
    <div class="d-flex pinned__content flex-column">
      <contacts-pinned-item v-for="item in pinnedLists"
                            :item="item"
                            :key="item.id">
      </contacts-pinned-item>
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

export default {
  components: {
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

    loadPinned () {
      this.loading = true
      return this.$axios.get('api/v2/contact-list-bookmark').then((response) => response.data).then(async (data) => {
        const pinnedIds = []

        for (let i = 0; i < data.length; i++) {
          const contactListId = data[i].contact_list_id

          pinnedIds.push(contactListId)

          this.listLoaded({
            id: contactListId,
            name: data[i].name,
            headers: data[i].headers,
            filters: data[i].filters,
            type: data[i].type,
            order: data[i].order
          })

          await this.loadPinnedCount(contactListId)
        }

        this.pinnedLoaded(pinnedIds)

        this.loading = false
      })
    }
  }
}
</script>
