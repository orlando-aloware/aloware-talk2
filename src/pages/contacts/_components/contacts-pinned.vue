<template>
  <div class="pinned">
    <div class="pinned__header d-flex align-items-center border-bottom">
      <div class="header__header__title font-weight-bold pl-3 flex-grow-1">
        Pinned
      </div>
    </div>
    <b-overlay
      :show="loading"
      spinner-variant="success"
      spinner-type="grow"
      spinner-small
      rounded="sm"
    >
      <div class="d-flex flex-grow-1 flex-column">
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
                  pinnedCounts[item.count].unreads_count ? 'danger' : 'light text-muted'
                "
                >{{
                  pinnedCounts[item.count].total_contact_count | fixCount
                }}</b-badge
              >
            </div>
          </a>
        </router-link>

        <router-link
          v-for="item in pinned"
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
                v-if="item.type === 'static'"
              ></folder-static-icon>
              <folder-dynamic-icon
                v-if="item.type === 'dynamic'"
              ></folder-dynamic-icon>
            </div>
            <div class="pr-3 flex-grow-1">{{ item.name }}</div>
          </a>
        </router-link>
      </div>
    </b-overlay>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import folderStaticIcon from 'src/components/icons/folder-static-icon.vue'
import folderDynamicIcon from 'src/components/icons/folder-dynamic-icon.vue'

export default {
  methods: {
    loadPinnedCounts () {
      return Promise.all([
        this.loadAllCount(),
        this.loadMyContactsCount(),
        this.loadNewLeadsCount(),
        this.loadUnansweredCount(),
        this.loadUnassignedCount()
      ])
        .then(([allcontacts, mycontacts, newleads, unanswered, unassigned]) => {
          this.pinnedCountLoaded({
            name: 'allcontacts',
            count: allcontacts
          })
          this.pinnedCountLoaded({
            name: 'mycontacts',
            count: mycontacts
          })
          this.pinnedCountLoaded({
            name: 'newleads',
            count: newleads
          })
          this.pinnedCountLoaded({
            name: 'unanswered',
            count: unanswered
          })
          this.pinnedCountLoaded({
            name: 'unassigned',
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
    ...mapActions('contacts', ['pinnedCountLoaded'])
  },
  components: {
    folderStaticIcon,
    folderDynamicIcon
  },
  computed: {
    ...mapGetters('auth', ['profile']),
    ...mapState('contacts', ['pinned', 'pinnedCounts'])
  },
  data () {
    return {
      loading: false,
      defaultList: [
        {
          id: 1,
          name: 'All Contacts',
          link: '/contacts',
          count: 'allcontacts'
        },
        {
          id: 2,
          name: 'My Contacts',
          link: '/contacts/mycontacts',
          count: 'mycontacts'
        },
        {
          id: 3,
          name: 'Unassigned Contacts',
          link: '/contacts/unassigned',
          count: 'unassigned'
        },
        {
          id: 4,
          name: 'Unanswered Contacts',
          link: '/contacts/unanswered',
          count: 'unanswered'
        },
        {
          id: 5,
          name: 'New Leads',
          link: '/contacts/newleads',
          count: 'newleads'
        }
      ]
    }
  },
  mounted () {
    this.loadPinnedCounts()
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
}
.icon {
  margin-top: -5px;
}
.item {
  color: $dark;
  cursor: pointer;
  line-height: 25px;
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
