<template>
  <div class="pinned">
    <div class="pinned__header d-flex align-items-center border-bottom">
      <div class="header__header__title font-weight-bold pl-3 flex-grow-1">
        Pinned
      </div>
    </div>
    <div class="d-flex pinned__content flex-column">
      <router-link
        v-for="item in defaultContactList"
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
            <b-badge pill variant="light text-muted">{{
              getCount(item.id) | fixCount
            }}</b-badge>
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
              v-if="item.type === contactListType.STATIC"
            ></folder-static-icon>
            <folder-dynamic-icon
              v-if="item.type === contactListType.DYNAMIC"
            ></folder-dynamic-icon>
          </div>
          <div class="pr-3 flex-grow-1">{{ item.name }}</div>
          <div class="pr-2">
            <b-badge pill variant="danger">{{
              getCount(item.id) | fixCount
            }}</b-badge>
          </div>
        </a>
      </router-link>
    </div>
  </div>
</template>

<script>
import qs from 'qs'
import { mapActions, mapGetters, mapState } from 'vuex'
import folderStaticIcon from 'src/components/icons/folder-static-icon.vue'
import folderDynamicIcon from 'src/components/icons/folder-dynamic-icon.vue'
import {
  STATIC,
  DYNAMIC,
  DEFAULT_CONTACT_LIST,
  OPERATORS
} from 'src/constants/contacts-list-types'

export default {
  methods: {
    ...mapActions('contacts', [
      'pinnedCountLoaded',
      'pinnedLoaded',
      'listLoaded'
    ]),
    getCount (id) {
      if (this.pinnedCounts[id] && this.pinnedCounts[id]) {
        return this.pinnedCounts[id]
      }
      return 0
    },
    loadDefaultCounts () {
      return Promise.all([
        this.loadAllCount(),
        this.loadMyContactsCount(),
        this.loadStatusCounts()
      ])
        .then(([allContacts, myContacts, statusCounts]) => {
          console.log({ allContacts, myContacts })
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
        .get(`api/v2/contacts-list/${id}/items`)
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
      return Promise.all(ids.map((id) => this.loadPinnedCount(id)))
    },
    loadPinned () {
      this.loading = true
      return window.axios
        .get('api/v2/contact-list-bookmark')
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
    }
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
      contactListType: { STATIC, DYNAMIC },
      defaultContactList: Object.values(DEFAULT_CONTACT_LIST)
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
