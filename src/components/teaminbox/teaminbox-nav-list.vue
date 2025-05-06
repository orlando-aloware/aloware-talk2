<template>
  <div class="teaminbox-nav-list"
       data-testid="teaminbox-nav-list">
    <div class="teaminbox-nav-list__header border-bottom d-flex flex-column justify-content-center">
      <search-input class="teaminbox-nav-list__header__search"
                    placeholder="Type ENTER to search inboxes..."
                    data-testid="teaminbox-search"
                    limit-search-characters
                    :id="`teaminbox-nav-list-search-${_uid}`"
                    @search="onSearch"
                    @focus="setShowSearchTooltip(true)"
                    @blur="setShowSearchTooltip(false)"
                    @show-error="showLimitCharactersError"/>
      <b-tooltip custom-class="talk-table__tooltip"
                 placement="top"
                 :boundary="`teaminbox-nav-list-search-${_uid}`"
                 :target="`teaminbox-nav-list-search-${_uid}`"
                 :show="showSearchTooltip">
        Search inboxes by name
      </b-tooltip>
    </div>
    <div class="teaminbox-nav-list__content blue-scroll"
         @scroll="onScroll">
      <TeamInboxNavType :type="type.id"
                       :label="type.name"
                       :typed-inboxes="type.inboxes"
                       :key="type.name"
                       :active-inbox-id="activeInboxId"
                       v-for="type in typedInboxes"
                       @inbox="onInboxSelect" />

      <div :class="[isLoadingInboxes ? 'py-5' : 'py-4', 'relative']"
           v-if="isLoadingInboxes">
        <b-overlay rounded="sm"
                   variant="white"
                   data-testid="teaminbox-nav-list-overlay"
                   :show="isLoadingInboxes">
          <template #overlay>
            <div class="text-center">
              <q-spinner-bars color="primary"
                              size="2em"/>
            </div>
          </template>
        </b-overlay>
      </div>

      <!-- Empty state -->
      <div class="text-center q-pa-md text-grey"
           v-else-if="!inboxes.length">
        No Inboxes

        <br/>

        <button class="btn btn-sm btn-primary mt-4"
                v-if="showRefreshInboxesButton"
                @click.prevent="onRefreshInboxes">
          <refresh-icon color="#fff"/> Refresh
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import TeamInboxNavType from './teaminbox-nav-type.vue'
import TeamInboxMixin from 'src/plugins/mixins/teaminbox.mixin'
import SearchInput from 'src/components/search-input.vue'
import RefreshIcon from 'src/components/icons/refresh-icon.vue'
import { TEAMINBOXES_MENU_TITLE } from 'src/router/routes'
import { INBOX_TYPE_PERSONAL, INBOX_TYPE_CONNECTED, INBOX_TYPE_WATCHING } from 'src/store/teaminbox/teaminbox.store'
import { mapState, mapActions, mapGetters } from 'vuex'

export default {
  components: {
    TeamInboxNavType,
    SearchInput,
    RefreshIcon
  },

  mixins: [
    TeamInboxMixin
  ],

  data () {
    return {
      search: '',
      showSearchTooltip: false,
      finishedInitialLoad: false
    }
  },

  computed: {
    ...mapState('TeamInbox', [
      'inboxes',
      'activeInboxId',
      'hasMoreInboxes',
      'isLoadingInboxes',
      'inboxesUnreadCount',
      'showRefreshInboxesButton'
    ]),

    ...mapState('auth', ['profile']),

    ...mapState(['isMobile', 'teams']),

    ...mapGetters('TeamInbox', ['getConnectedInboxesLength']),

    teamsIds () {
      return this.teams
        .filter(team => team.users.includes(this.profile.id))
        .map(team => team.id)
    },

    parsedInboxes () {
      const personal = []
      const connected = []
      const watching = []

      this.inboxes.forEach(inbox => {
        const isConnected = inbox.user_ids.includes(this.profile.id) || inbox.team_ids.some(id => this.teamsIds.includes(id))
        const isWatching = inbox.watcher_user_ids.includes(this.profile.id) || inbox.watcher_team_ids.some(id => this.teamsIds.includes(id))

        if (inbox.call_waiting && isConnected) {
          personal.push(inbox)
        } else if (!inbox.call_waiting && isConnected) {
          connected.push(inbox)
        } else if (isWatching) {
          watching.push(inbox)
        }
      })

      return {
        personal,
        connected,
        watching
      }
    },

    typedInboxes () {
      return [
        {
          id: INBOX_TYPE_PERSONAL,
          name: 'Personal Inboxes',
          inboxes: this.parsedInboxes.personal
        },
        {
          id: INBOX_TYPE_CONNECTED,
          name: 'Connected Inboxes',
          inboxes: this.parsedInboxes.connected
        },
        {
          id: INBOX_TYPE_WATCHING,
          name: 'Watching Inboxes',
          inboxes: this.parsedInboxes.watching
        }
      ]
    }
  },

  methods: {
    ...mapActions('TeamInbox', [
      'setActiveInboxId',
      'setActiveInbox',
      'resetInboxes',
      'resetItems',
      'setInboxes'
    ]),

    onScroll ({ target }) {
      const bottomThreshold = 20

      // Check if scrolled to bottom (with a small threshold)
      const isNearBottom = target.scrollHeight - (target.scrollTop + target.clientHeight) <= bottomThreshold

      if (isNearBottom && !this.isLoadingInboxes && this.hasMoreInboxes) {
        this.loadMoreInboxes(this.search)
      }
    },

    async onInboxSelect (inboxId, contactId = null, force = false) {
      if (inboxId === this.activeInboxId && !force) {
        return
      }

      if (inboxId !== this.activeInboxId) {
        // checks if user has access to the inbox
        if (!this.checkInboxAccess(inboxId)) {
          this.$generalNotification('You don\'t have access to this inbox.', 'error')
          this.$router.push({ name: TEAMINBOXES_MENU_TITLE })

          return
        }

        this.setActiveInboxId(parseInt(inboxId))
      }

      this.resetItems()
      // Pass current filters and sorting
      const filters = this.$store.state.TeamInbox.activeFilters || {}
      const sort = this.$store.state.TeamInbox.activeSort || {}
      const search = this.$store.state.TeamInbox.currentSearch || null
      await this.fetchItems(inboxId, search, filters, sort)

      const route = `/team-inboxes/${inboxId}` + (contactId ? `/contacts/${contactId}/communications` : '')

      // avoid redundant navigation
      if (this.$route.path !== route) {
        if (force) {
          // force redirect to the first inbox to prevent the user from navigating back to the Team Inboxes page without any inboxId
          this.$router.replace(route)
          return
        }

        this.$router.push(route)
      }
    },

    onSearch (search) {
      this.search = search
    },

    onRefreshInboxes () {
      this.fetchInboxes(this.search)
    },

    orderInboxes () {
      const sortedInboxes = [...this.inboxes].sort((a, b) => a.name.localeCompare(b.name))
      this.setInboxes({ data: sortedInboxes })
    },

    getFirstInboxId () {
      if (this.isMobile || !this.inboxes.length) {
        return null
      }

      return this.parsedInboxes.personal.length ? this.parsedInboxes.personal[0]?.id : this.inboxes[0]?.id
    },

    checkAndRedirectActiveInbox (ringGroup) {
      const inboxId = this.$route.params.inboxId ? parseInt(this.$route.params.inboxId) : this.getFirstInboxId()

      if (inboxId && inboxId === ringGroup.id) {
        this.$router.push({ name: TEAMINBOXES_MENU_TITLE })
      }
    },

    allUserIds (ringGroup) {
      const connectedUserIds = ringGroup.connected_user_ids || []
      const watcherUserIds = ringGroup.watcher_user_ids || []

      return [...connectedUserIds, ...watcherUserIds]
    },

    newRingGroupListener (ringGroup) {
      console.log(ringGroup)

      if (this.allUserIds(ringGroup)?.includes(this.profile.id)) {
        const updatedInboxes = [...this.inboxes, ringGroup]
        this.setInboxes({ data: updatedInboxes })
        this.orderInboxes()
      }
    },

    updateRingGroupListener (ringGroup) {
      if (this.allUserIds(ringGroup)?.includes(this.profile.id)) {
        const index = this.inboxes.findIndex(inbox => inbox.id === ringGroup.id)
        const updatedInboxes = [...this.inboxes]

        if (index !== -1) {
          updatedInboxes[index] = ringGroup
        } else {
          updatedInboxes.push(ringGroup)
        }

        this.setInboxes({ data: updatedInboxes })
        this.orderInboxes()
      } else {
        const index = this.inboxes.findIndex(inbox => inbox.id === ringGroup.id)

        if (index !== -1) {
          const updatedInboxes = this.inboxes.filter(inbox => inbox.id !== ringGroup.id)

          this.setInboxes({ data: updatedInboxes })
          this.checkAndRedirectActiveInbox(ringGroup)
        }
      }
    },

    deleteRingGroupListener (ringGroup) {
      const index = this.inboxes.findIndex(inbox => inbox.id === ringGroup.id)
      if (index !== -1) {
        const updatedInboxes = this.inboxes.filter(inbox => inbox.id !== ringGroup.id)

        this.setInboxes({ data: updatedInboxes })
        this.checkAndRedirectActiveInbox(ringGroup)
      }
    },

    setShowSearchTooltip (show) {
      this.showSearchTooltip = show
    },

    showLimitCharactersError (show) {
      if (show) {
        this.$generalNotification('Search requires at least 3 characters', 'error')
      }
    },

    async resetTeamInbox () {
      await this.resetInboxes()
      await this.fetchInboxes()

      if (this.activeInboxId) {
        await this.onInboxSelect(this.activeInboxId, null, true)
      }
    },

    einboxCommunicationMarkedAllAsReadListener ({ inboxId, count }) {
      this.einboxCommunicationMarkedAllAsRead(inboxId, count)
    },

    einboxCommunicationMarkedAsReadListener ({ inboxId }) {
      this.einboxCommunicationMarkedAsRead(inboxId)
    },

    einboxCommunicationMarkedAsUnreadListener ({ inboxId }) {
      this.einboxCommunicationMarkedAsUnread(inboxId)
    }
  },

  async created () {
    // set unread counters as loading so we don't show it if
    // user is navigating back to the Team Inboxes page
    this.setIsLoadingInboxesUnreadCount(true)

    await this.fetchInboxes()
    this.finishedInitialLoad = true

    if (this.inboxes.length) {
      const inboxId = this.$route.params.inboxId ? parseInt(this.$route.params.inboxId) : this.getFirstInboxId()
      const contactId = this.$route.params.id && inboxId ? parseInt(this.$route.params.id) : null

      if (this.activeInboxId && this.inboxes.find(inbox => inbox.id === this.activeInboxId)) {
        // Redirect to the last opened inbox to keep persistence
        this.onInboxSelect(this.activeInboxId, contactId, true)
      } else if (inboxId) {
        const forceRedirectToFirstInbox = !this.$route.params.inboxId
        this.onInboxSelect(inboxId, contactId, forceRedirectToFirstInbox)
      }
    }

    // Listen to ring group events
    this.$VueEvent.listen('ring_group_created', this.newRingGroupListener)
    this.$VueEvent.listen('ring_group_updated', this.updateRingGroupListener)
    this.$VueEvent.listen('ring_group_deleted', this.deleteRingGroupListener)

    this.$VueEvent.listen('resetTeamInbox', this.resetTeamInbox)
  },

  watch: {
    '$route.params.inboxId' (inboxId) {
      if (!inboxId && this.inboxes.length && !this.isMobile) {
        this.onInboxSelect(this.getFirstInboxId())
        return
      }

      const newInboxId = parseInt(inboxId)

      if (!isNaN(newInboxId) && newInboxId !== this.activeInboxId) {
        // Handle back navigation to a different inbox
        this.onInboxSelect(newInboxId)
      }
    },

    '$route.name' (route) {
      // reset active inbox id when this page is opened
      if (this.isMobile && route === TEAMINBOXES_MENU_TITLE) {
        this.setActiveInboxId(null)
      }
    },

    parsedInboxes (parsedInboxes) {
      const inboxIds = Object.keys(parsedInboxes ?? {}).flatMap((parsedInbox) => parsedInboxes[parsedInbox].map((inbox) => inbox.id))

      if (!inboxIds.length) {
        return
      }

      this.fetchInboxesUnreadCount(inboxIds)
    },

    search (val) {
      this.resetInboxes()
      this.fetchInboxes(val)
    },

    getConnectedInboxesLength (length, oldLength) {
      if (oldLength || !this.finishedInitialLoad) {
        return
      }

      const previousActiveInboxExists = this.inboxes.findIndex(({ id }) => id === this.activeInboxId) !== -1

      if (!previousActiveInboxExists) {
        // Handles edge cases when an inbox is assigned to the user while they have the page open without any existing inboxes
        this.onInboxSelect(this.getFirstInboxId())
      }
    }
  },

  beforeDestroy () {
    this.setActiveInboxId(null)
    this.setActiveInbox({})

    this.$VueEvent.stop('ring_group_created', this.newRingGroupListener)
    this.$VueEvent.stop('ring_group_updated', this.updateRingGroupListener)
    this.$VueEvent.stop('ring_group_deleted', this.deleteRingGroupListener)

    this.$VueEvent.stop('resetTeamInbox', this.resetTeamInbox)
  }
}
</script>

<style lang="scss">
.teaminbox-nav-list {
  height: 100%;
  background-color: #fff;
  color: #000;
  padding: 7px 0 7px 7px;

  &__header {
    width: 100%;
    height: 45px;

    &__search {
      label {
        border: none;
      }
    }
  }

  &__content {
    height: calc(100% - 45px);
    display: flex;
    flex-direction: column;
    row-gap: 10px;
    padding: 10px 0px 10px 10px;
    overflow-y: auto;
  }
}
</style>
