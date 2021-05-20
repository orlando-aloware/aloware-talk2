<template>
  <div class="pinned">
    <div class="pinned__header d-flex align-items-center border-bottom">
      <div class="header__header__title font-weight-bold pl-3 flex-grow-1">
        Pinned
      </div>
    </div>
    <div class="d-flex pinned__content flex-column">
      <router-link
        v-for="item in defaultList"
        :to="item.link"
        :key="item.id"
        v-slot="{ href, route, navigate, isActive, isExactActive }"
      >
        <a
          :href="href"
          @click="navigate"
          class="d-flex align-items-center item"
          :class="[
            isActive && 'router-link-active',
            isExactActive && 'router-link-exact-active'
          ]"
        >
          <div class="px-2 icon">
            <folder-dynamic-icon></folder-dynamic-icon>
          </div>
          <div class="pr-3 flex-grow-1">{{ item.name }}</div>
          <div class="pr-2">
            <b-badge
              pill
              :variant="
                pinnedCounts[item.id].unreads_count
                  ? 'danger'
                  : 'light text-muted'
              "
              >{{
                pinnedCounts[item.id].total_contact_count | fixCount
              }}</b-badge
            >
          </div>
        </a>
      </router-link>

      <router-link
        v-for="item in pinnedLists"
        :to="`/contacts/list/${item.id}`"
        :key="item.id"
        v-slot="{ href, route, navigate, isActive, isExactActive }"
      >
        <a
          :href="href"
          @click="navigate"
          class="d-flex align-items-center item"
          :class="[
            isActive && 'router-link-active',
            isExactActive && 'router-link-exact-active'
          ]"
        >
          <div class="px-2 icon">
            <folder-static-icon
              v-if="item.type === ContactListTypes.STATIC"
            ></folder-static-icon>
            <folder-dynamic-icon
              v-if="item.type === ContactListTypes.DYNAMIC"
            ></folder-dynamic-icon>
          </div>
          <div class="pr-3 flex-grow-1">{{ item.name }}</div>
          <div class="pr-2">
            <b-badge
              pill
              :variant="hasUnreads(item.id) ? 'danger' : 'light text-muted'"
              >{{ getCount(item.id) | fixCount }}</b-badge
            >
          </div>
        </a>
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import folderStaticIcon from 'src/components/icons/folder-static-icon.vue'
import folderDynamicIcon from 'src/components/icons/folder-dynamic-icon.vue'
import { STATIC, DYNAMIC } from 'src/constants/contacts-list-types'

export default {
  methods: {
    hasUnreads (id) {
      if (this.pinnedCounts[id] && this.pinnedCounts[id].unreads_count) {
        return true
      }
      return false
    },
    getCount (id) {
      if (this.pinnedCounts[id] && this.pinnedCounts[id].total_contact_count) {
        return this.pinnedCounts[id].total_contact_count
      }
      return 0
    },
    loadDefaultCounts () {
      return Promise.all([
        this.loadAllCount(),
        this.loadMyContactsCount(),
        this.loadNewLeadsCount(),
        this.loadUnansweredCount(),
        this.loadUnassignedCount()
      ])
        .then(([allContacts, myContacts, newleads, unanswered, unassigned]) => {
          this.pinnedCountLoaded({
            id: 'allContacts',
            count: allContacts
          })
          this.pinnedCountLoaded({
            id: 'myContacts',
            count: myContacts
          })
          this.pinnedCountLoaded({
            id: 'newleads',
            count: newleads
          })
          this.pinnedCountLoaded({
            id: 'unanswered',
            count: unanswered
          })
          this.pinnedCountLoaded({
            id: 'unassigned',
            count: unassigned
          })
        })
        .finally(() => {
          this.loading = false
        })
    },
    loadAllCount () {
      return window.axios
        .get('api/v1/contact/get-contacts-count')
        .then((response) => response.data)
    },
    loadMyContactsCount () {
      return window.axios
        .get('api/v1/contact/get-contacts-count', {
          params: { user_id: this.profile.id }
        })
        .then((response) => response.data)
    },
    loadNewLeadsCount () {
      return window.axios
        .get('api/v1/contact/get-contacts-count', {
          params: { is_new_lead: 1 }
        })
        .then((response) => response.data)
    },
    loadUnansweredCount () {
      return window.axios
        .get('api/v1/contact/get-contacts-count', {
          params: { has_unread: 1 }
        })
        .then((response) => response.data)
    },
    loadUnassignedCount () {
      return window.axios
        .get('api/v1/contact/get-contacts-count', {
          params: { unassigned_leads: 1 }
        })
        .then((response) => response.data)
    },
    loadPinnedCount (id) {
      return window.axios
        .get(`api/v1/contacts-list/${id}/items`)
        .then((response) => {
          this.pinnedCountLoaded({
            id: id,
            count: {
              new_leads_count: 0,
              total_contact_count: response.data.total,
              unreads_count: 0
            }
          })
        })
    },
    loadPinnedCounts (ids) {
      return Promise.all(ids.map(id => this.loadPinnedCount(id)))
    },
    loadPinned () {
      this.loading = true
      return window.axios
        .get('api/v1/contact-list-bookmark')
        .then((response) => response.data)
        .then((data) => {
          const pinnedIds = []

          for (let i = 0; i < data.length; i++) {
            pinnedIds.push(data[i].contact_list_id)
            this.listLoaded({
              id: data[i].contact_list_id,
              name: data[i].name,
              headers: data[i].headers,
              filters: data[i].filters,
              type: data[i].type,
              order: data[i].order
            })
          }

          this.pinnedLoaded(pinnedIds)

          this.loadPinnedCounts(pinnedIds)

          this.loading = false
        })
    },
    ...mapActions('contacts', [
      'pinnedCountLoaded',
      'pinnedLoaded',
      'listLoaded'
    ])
  },
  components: {
    folderStaticIcon,
    folderDynamicIcon
  },
  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapState('contacts', ['pinned', 'pinnedCounts', 'lists']),
    pinnedLists () {
      return this.pinned.map((i) => this.lists[i] || {})
    }
  },
  data () {
    return {
      loading: false,
      ContactListTypes: { STATIC, DYNAMIC },
      defaultList: [
        {
          id: 'allContacts',
          link: '/contacts',
          name: 'All Contacts'
        },
        {
          id: 'myContacts',
          link: '/contacts/my-contacts',
          name: 'My Contacts'
        },
        {
          id: 'unassigned',
          name: 'Unassigned Contacts',
          link: '/contacts/unassigned'
        },
        {
          id: 'unanswered',
          name: 'Unanswered Contacts',
          link: '/contacts/unanswered'
        },
        {
          id: 'newleads',
          name: 'New Leads',
          link: '/contacts/newleads'
        }
      ]
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
  overflow: auto;
  position: relative;

  &__header {
    min-height: 40px;
    font-size: 10px;
    font-weight: bold;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  &__content {
    min-height: 200px;
    max-height: 400px;
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
