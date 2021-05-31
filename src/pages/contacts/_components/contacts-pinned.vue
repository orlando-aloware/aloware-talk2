<template>
  <div class="pinned">
    <div class="pinned__header d-flex align-items-center border-bottom">
      <div class="header__header__title font-weight-bold pl-3 flex-grow-1">
        Pinned
      </div>
    </div>
    <div class="d-flex pinned__content flex-column">
      <router-link
        v-for="item in pinned"
        :to="`/contacts/pinned/${item.id}`"
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
          <div v-if="getPinnedCountById(item.id)"
               class="pr-2">
            <b-badge
              pill
              :variant="pinnedCountsVariant(item)"
              >{{
                getPinnedCountById(item.id) | fixCount
              }}</b-badge
            >
          </div>
        </a>
      </router-link>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters, mapState } from 'vuex'
import * as ContactListTypes from '../../../constants/contacts-list-types'
import folderStaticIcon from 'src/components/icons/folder-static-icon.vue'
import folderDynamicIcon from 'src/components/icons/folder-dynamic-icon.vue'
import _ from 'lodash'

export default {
  methods: {
    loadPinnedLists () {
      this.loading = true
      return window.axios.get('api/v2/contact-list-bookmark')
        .then((data) => {
          this.pinnedContactlistsLoaded(data.data)
          this.initializePinnedListsCount(data.data)
          this.loading = false
        })
    },
    initializePinnedListsCount (lists) {
      for (let list of lists) {
        this.fetchCount(list.id)
      }
    },
    fetchCount (id) {
      return window.axios.get(`api/v2/contacts-list/${id}/items`)
        .then((response) => {
          this.pinnedCountLoaded({
            id: id,
            count: response.data.total
          })
        })
    },
    getPinnedCountById (id) {
      const index = this.pinnedCounts.findIndex(count => count.id === id)

      if (index !== -1) {
        return this.pinnedCounts[index].count
      }

      return 0
    },
    pinnedCountsVariant (list) {
      const name = _.get(list, 'name', '').toLowerCase()

      if (name.includes('unanswered') ||
        name.includes('new leads')) {
        return 'danger'
      }

      return 'light text-muted'
    },
    ...mapActions('contacts', ['pinnedCountLoaded', 'pinnedContactlistsLoaded'])
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
      defaultList: [],
      ContactListTypes
    }
  },
  mounted () {
    this.loadPinnedLists()
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
