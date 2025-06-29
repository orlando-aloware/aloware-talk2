<template>
  <div class="teaminbox-tab__header">
    <collapse-button class="teaminbox-tab__header__collapse-button"
                     :target="collapseTarget"
                     v-model="collapsed"
                     v-if="collapseTarget && !isMobile"/>

    <template v-if="!isSearchActive">
      <div class="d-flex align-items-center position-relative max-w-100 overflow-hidden pr-1">
        <label class="teaminbox-tab__header__label ellipse"
               :id="`teaminbox-tab-header-label-${_uid}`"
               v-if="activeInbox.name">
          {{ activeInbox.name }}
        </label>
        <b-tooltip custom-class="talk-table__tooltip teaminbox-tooltip"
                   placement="right"
                   boundary="window"
                   :target="`teaminbox-tab-header-label-${_uid}`"
                   :delay="500">
          {{ activeInbox.name }}
        </b-tooltip>
        <b-badge pill
                 class="unread-badge mr-1"
                 :id="`teaminbox-tab-header-unread-counter-${_uid}`"
                 v-if="collapsed && activeInboxUnreadCount > 0">
          <span>
            <template v-if="activeInboxUnreadCount <= 99">{{ activeInboxUnreadCount }}</template>
            <template v-else>99<sup>+</sup></template>
          </span>
          <b-tooltip custom-class="talk-table__tooltip teaminbox-tooltip"
                     placement="right"
                     boundary="window"
                     :target="`teaminbox-tab-header-unread-counter-${_uid}`"
                     :delay="500"
                     v-if="activeInboxUnreadCount > 99">
            {{ activeInboxUnreadCount }} unread communications
          </b-tooltip>
        </b-badge>
      </div>

      <q-space></q-space>

      <span class="cursor-pointer mr-2 comms-page-icon-position-fix"
            :id="`teaminbox-tab-open-comms-page-icon-${_uid}`"
            @click="openCommunicationsPage">
        <watch-icon />
        <b-tooltip custom-class="talk-table__tooltip teaminbox-tooltip"
                   placement="right"
                   boundary="window"
                   :target="`teaminbox-tab-open-comms-page-icon-${_uid}`">
          Open Communications Page
        </b-tooltip>
      </span>

      <span class="cursor-pointer search-icon-position-fix"
            :id="`teaminbox-tab-search-icon-${_uid}`"
            @click="onEnterSearch">
        <search-icon color="#256eff"
                     width="18"
                     height="18" />
        <b-tooltip custom-class="talk-table__tooltip teaminbox-tooltip"
                   placement="right"
                   boundary="window"
                   :target="`teaminbox-tab-search-icon-${_uid}`">
          Click to search
        </b-tooltip>
      </span>
    </template>

    <template v-else>
      <search-input no-clear-on-route-change
                    ref="search"
                    placeholder="Type ENTER to search comms..."
                    class="teaminbox-tab__header__search"
                    limit-search-characters
                    :id="`teaminbox-tab-search-${_uid}`"
                    @search="$emit('search', $event)"
                    @blur="onLeaveSearch"
                    @focus="setShowSearchTooltip(true)"
                    @show-error="showLimitCharactersError"/>
      <b-tooltip custom-class="talk-table__tooltip teaminbox-tooltip"
                 placement="right"
                 boundary="window"
                 :target="`teaminbox-tab-search-${_uid}`"
                 :show="showSearchTooltip">
        Search communications by contact's name or phone number
      </b-tooltip>
    </template>
  </div>
</template>

<script>
import CollapseButton from 'src/components/teaminbox/collapse-button.vue'
import SearchIcon from 'src/components/icons/search-icon.vue'
import WatchIcon from 'src/components/icons/watch-icon.vue'
import SearchInput from 'src/components/search-input.vue'
import { DEFAULT_COMMUNICATIONS_ROUTE_PATH } from 'src/router/routes'
import { mapState } from 'vuex'
import { mapFields } from 'vuex-map-fields'

export default {
  props: {
    collapseTarget: {
      type: HTMLElement,
      default: null
    },

    search: {
      type: String,
      required: true
    }
  },

  components: {
    CollapseButton,
    SearchInput,
    WatchIcon,
    SearchIcon
  },

  data: () => ({
    isSearchActive: false,
    showSearchTooltip: false,
    collapsed: false,
    DEFAULT_COMMUNICATIONS_ROUTE_PATH
  }),

  computed: {
    ...mapState('TeamInbox', [
      'viewMode',
      'activeInbox',
      'inboxesUnreadCount'
    ]),

    ...mapState(['isMobile']),

    ...mapFields('settings', ['isTeamInboxNavListCollapsed']),

    activeInboxUnreadCount () {
      if (!this.activeInbox?.id) {
        return 0
      }

      return this.inboxesUnreadCount?.find((inbox) => inbox.ring_group_id === this.activeInbox.id)?.unread_count || 0
    }
  },

  mounted () {
    if (this.isTeamInboxNavListCollapsed !== undefined) {
      this.collapsed = this.isTeamInboxNavListCollapsed
    } else if (window.innerWidth < 1367) {
      this.collapsed = true
    }
  },

  methods: {
    async onEnterSearch () {
      this.isSearchActive = true

      await this.$nextTick()

      // auto focus inside inner search input
      if (this.$refs.search) {
        this.$refs.search.$el.querySelector('input').focus()
      }
    },

    openCommunicationsPage () {
      const route = {
        path: DEFAULT_COMMUNICATIONS_ROUTE_PATH,
        query: {}
      }

      // Add the inbox ID as ring_groups query parameter if available
      if (this.activeInbox && this.activeInbox.id) {
        route.query.ring_groups = this.activeInbox.id
      }

      this.$router.push(route)
    },

    onLeaveSearch () {
      if (this.search === '') {
        this.isSearchActive = false
      }
    },

    setShowSearchTooltip (show) {
      this.showSearchTooltip = show
    },

    showLimitCharactersError (show) {
      if (show) {
        this.$generalNotification('Search requires at least 3 characters', 'error')
      }
    }
  },

  watch: {
    search (search) {
      if (search === '') {
        this.isSearchActive = false
      }

      this.$emit('search', search)
    },

    isTeamInboxNavListCollapsed () {
      this.collapsed = this.isTeamInboxNavListCollapsed
    }
  }
}
</script>

<style lang="scss">
@import 'src/css/variables.scss';
.teaminbox-tab__header {
  display: flex;
  align-items: center;
  padding: 14px 12px;
  width: 100%;

  &__label {
    position: relative;
    margin: 0px;
    font-weight: 500;
    font-size: 16px;
  }

  &__search {
    width: 100%;

    label {
      border: none;
    }
  }

  @media(min-width: 785px) {
    & {
      &__label {
        margin-left: 10px;
      }

      &__search {
        .q-field__prepend {
          padding-left: 5px !important;
        }
      }
    }
  }

  .unread-badge {
    cursor: pointer;
    flex-shrink: 0;
    margin: 0 5px;
    font-size: 10px;
    font-weight: bold;
    height: 19px;
    width: 19px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: $red-95;
  }

  .comms-page-icon-position-fix {
    margin-top: -4px;
  }

  .search-icon-position-fix {
    margin-top: -3px;
  }
}
</style>
