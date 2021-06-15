<template>
  <div class="pinned">
    <div class="pinned__header d-flex align-items-center border-bottom">
      <div class="header__header__title font-weight-bold pl-3 flex-grow-1">
        Pinned
      </div>
    </div>
    <div class="d-flex pinned__content flex-column">
      <contacts-pinned-item v-for="item in pinnedLists" :item="item" :key="item.id"></contacts-pinned-item>
    </div>
  </div>
</template>

<script>
import qs from 'qs'
import { mapActions, mapGetters } from 'vuex'
import {
  STATIC,
  DYNAMIC,
  DEFAULT_CONTACT_LIST,
  OPERATORS
} from 'src/constants/contacts-list-types'
import ContactsPinnedItem from 'pages/contacts/_components/contacts-pinned-item'

export default {
  methods: {
    ...mapActions('contacts', [
      'pinnedCountLoaded',
      'pinnedLoaded',
      'listLoaded'
    ]),
    loadDefaultCounts () {
      return Promise.all([
        this.loadAllCount(),
        this.loadMyContactsCount(),
        this.loadStatusCounts()
      ])
        .then(([allContacts, myContacts, statusCounts]) => {
          this.pinnedCountLoaded({
            id: DEFAULT_CONTACT_LIST.ALL_CONTACTS.id,
            count: allContacts
          })
          this.pinnedCountLoaded({
            id: DEFAULT_CONTACT_LIST.MY_CONTACTS.id,
            count: myContacts
          })
          this.pinnedCountLoaded({
            id: DEFAULT_CONTACT_LIST.NEWLEADS.id,
            count: statusCounts['new_contacts_count']
          })
          this.pinnedCountLoaded({
            id: DEFAULT_CONTACT_LIST.UNANSWERED.id,
            count: statusCounts['unanswered_contacts_count']
          })
          this.pinnedCountLoaded({
            id: DEFAULT_CONTACT_LIST.UNASSIGNED.id,
            count: statusCounts['unassigned_contacts_count']
          })
        })
        .finally(() => {
          this.loading = false
        })
    },
    loadAllCount () {
      return window.axios
        .get('api/v2/contacts/count')
        .then((response) => response.data.count)
    },
    loadMyContactsCount () {
      return window.axios
        .get('api/v2/contacts/count', {
          params: {
            filters: {
              contact_owner: {
                operator: OPERATORS.IS_ANY_OF,
                value: [this.profile.id]
              }
            }
          },
          paramsSerializer: qs.stringify
        })
        .then((response) => response.data.count)
    },
    loadStatusCounts () {
      return window.axios
        .get('api/v2/contacts/status-counts')
        .then((response) => response.data)
    },
    loadPinnedCount (id) {
      return window.axios
        .get(`api/v2/contacts-list/${id}/items?per_page=1`)
        .then((response) => {
          this.pinnedCountLoaded({
            id: id,
            count: response.data.total
          })
        })
    },
    loadPinned () {
      this.loading = true
      return window.axios
        .get('api/v2/contact-list-bookmark')
        .then((response) => response.data)
        .then(async (data) => {
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
  },
  components: {
    ContactsPinnedItem
  },
  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapGetters('contacts', ['pinnedLists', 'pinned'])
  },
  data () {
    return {
      loading: false,
      contactListType: { STATIC, DYNAMIC }
    }
  },
  mounted () {
    this.loadDefaultCounts()
    this.loadPinned()
  }
}
</script>

<style lang="scss">
@import 'src/css/mixins.scss';
@import 'src/css/variables.scss';
.pinned {
  display: flex;
  flex-direction: column;
  height: 20rem;
  &__header {
    min-height: 40px;
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  &__content {
    height: calc(100% - 40px);
    overflow: auto;
  }
}
.icon {
  margin-top: -5px;
}
.item {
  color: $dark;
  cursor: pointer;
  min-height: 40px;
  display: flex;
  align-items: center;
  overflow: hidden;
  text-decoration: none;
  text-overflow: ellipsis;
  transition: background-color 100ms ease-in-out;
  white-space: nowrap;
}
.item:hover {
  background: $light-green2;
  color: $dark;
  text-decoration: none;
}
.item.router-link-exact-active {
  background: $light-green2;
}
</style>
