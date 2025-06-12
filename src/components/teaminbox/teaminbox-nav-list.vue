<template>
  <div class="teaminbox-nav-list"
       data-testid="teaminbox-nav-list">
    <div class="teaminbox-nav-list__header border-bottom d-flex flex-column justify-content-center">
      <search-input class="teaminbox-nav-list__header__search"
                    placeholder="Type ENTER to search inboxes..."
                    data-testid="teaminbox-search"
                    limit-search-characters
                    :id="`teaminbox-nav-list-search-${_uid}`"
                    :search="search"
                    :no-clear-on-route-change="true"
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

      <div
        :class="['text-center text-grey teaminbox-nav-list__empty-state', isMobile ? '' : 'q-pa-md']"
           v-else-if="!inboxes.length">
        <div v-if="isMobile" class="empty-state-aloai-style-mobile">
          <div class="empty-state-header">
            <h3 class="title-text">Build Your Team's Command Center!</h3>
          </div>
          <div class="empty-state-image-container">
            <img src="/images/teaminbox-request-line-instruction.png"
                 alt="How to request a line and ring group from admin"/>
          </div>
          <div class="empty-state-footer">
            <p class="info-text">
              Ready to see the full picture? Contact your administrator and ask them to set up this Team Inbox to connect your entire team today!
            </p>
          </div>
        </div>

        <template v-else>
          No Inboxes

          <br/>

          <button class="btn btn-sm btn-primary mt-4"
                  v-if="showRefreshInboxesButton"
                  @click.prevent="onRefreshInboxes">
            <refresh-icon color="#fff"/>
            Refresh
          </button>
        </template>
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
import {
  INBOX_TYPE_CONNECTED,
  INBOX_TYPE_PERSONAL,
  INBOX_TYPE_WATCHING,
  UNTHREADED
} from 'src/store/teaminbox/teaminbox.store'
import { mapActions, mapGetters, mapState } from 'vuex'
import { getQueryString } from 'src/plugins/helpers/functions'

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
      'viewMode',
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
        const isConnected = inbox.user_ids.includes(this.profile.id) ||
          inbox.team_ids.some(id => this.teamsIds.includes(id)) ||
          inbox.teams.some(team => team.users.some(user => user.id === this.profile.id))

        const isWatching = inbox.watcher_user_ids.includes(this.profile.id) ||
          inbox.watcher_team_user_ids.includes(this.profile.id) ||
          inbox.watcher_team_ids.some(id => this.teamsIds.includes(id))

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

    findInboxById (id) {
      return this.inboxes.find(inbox => inbox.id === id)
    },

    determineInboxToSelect () {
      const defaultInboxId = this.getFirstInboxId()
      const urlInboxId = this.$route.params.inboxId ? parseInt(this.$route.params.inboxId, 10) : null
      const urlContactId = this.$route.params.id ? parseInt(this.$route.params.id, 10) : null

      // Check if URL has inbox ID and inbox exists
      if (urlInboxId && this.findInboxById(urlInboxId)) {
        return { id: urlInboxId, contactId: urlContactId, force: true }
      }

      // Default to first inbox
      if (defaultInboxId) {
        return {
          id: defaultInboxId,
          contactId: urlContactId,
          force: !urlInboxId // Only force redirect if no inbox ID in URL
        }
      }

      return null
    },

    onScroll ({ target }) {
      const bottomThreshold = 20

      // Check if scrolled to bottom (with a small threshold)
      const isNearBottom = target.scrollHeight - (target.scrollTop + target.clientHeight) <= bottomThreshold

      if (isNearBottom && !this.isLoadingInboxes && this.hasMoreInboxes) {
        this.loadMoreInboxes(this.search)
      }
    },

    onInboxSelect (inboxId, contactId = null, force = false) {
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
      this.fetchItems(inboxId, search, filters, sort)

      const queryString = getQueryString(this.$route.query)
      const contactRouteId = contactId ? `/contacts/${contactId}/communications` : ''
      const communicationRouteId = this.viewMode === UNTHREADED && contactRouteId ? `/${this.$route.params.communicationId}` : ''
      const route = `/team-inboxes/${inboxId}` + contactRouteId + communicationRouteId + queryString

      // avoid redundant navigation (including query)
      if (this.$route.fullPath !== route) {
        if (force) {
          // force redirect to the first inbox to prevent the user from navigating back to the Team Inboxes page without any inboxId
          this.$router.replace(route).catch(err => {
            if (err.name !== 'NavigationDuplicated' && err.name !== 'NavigationCancelled') {
              console.error(err)
            }
          })
          return
        }

        // Catch added since we are only adding a query string
        this.$router.push(route).catch(err => {
          if (err.name !== 'NavigationDuplicated' && err.name !== 'NavigationCancelled') {
            console.error(err)
          }
        })
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
      const watcherTeamsUserIds = ringGroup.watcher_team_user_ids || []
      const usersConnectedToTeams = ringGroup.teams.map(team => team.users.map(user => user.id)).flat()

      return [...connectedUserIds, ...watcherUserIds, ...watcherTeamsUserIds, ...usersConnectedToTeams]
    },

    newRingGroupListener (ringGroup) {
      if (this.allUserIds(ringGroup)?.includes(this.profile.id)) {
        const updatedInboxes = [...this.inboxes, ringGroup]
        this.setInboxes({ data: updatedInboxes })
        this.orderInboxes()
      }
    },

    updateRingGroupListener (ringGroup) {
      const isUserIncluded = this.allUserIds(ringGroup)?.includes(this.profile.id)
      const isTeamIncluded = ringGroup.team_ids?.some(id => this.teamsIds.includes(id))
      const isWatchingTeam = ringGroup.watcher_team_ids?.some(id => this.teamsIds.includes(id))

      if (isUserIncluded || isTeamIncluded || isWatchingTeam) {
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

    async refreshTeamInbox () {
      await this.resetInboxes()
      await this.fetchInboxes(this.search)

      if (this.activeInboxId) {
        this.onInboxSelect(this.activeInboxId, null, true)
      }
    },

    checkUrlInboxIdPermission () {
      const urlInboxId = this.$route.params.inboxId ? parseInt(this.$route.params.inboxId) : null
      return !urlInboxId || this.findInboxById(urlInboxId)
    }
  },

  async created () {
    // set unread counters as loading so we don't show it if
    // user is navigating back to the Team Inboxes page
    this.setIsLoadingInboxesUnreadCount(true)

    await this.fetchInboxes()
    this.finishedInitialLoad = true

    if (!this.checkUrlInboxIdPermission()) {
      this.$generalNotification('You don\'t have access to this inbox.', 'error')
      return this.$router.replace({ name: TEAMINBOXES_MENU_TITLE })
    }

    if (this.inboxes.length) {
      const inboxToSelect = this.determineInboxToSelect()

      if (inboxToSelect) {
        this.onInboxSelect(
          inboxToSelect.id,
          inboxToSelect.contactId,
          inboxToSelect.force
        )
      }
    }

    // Listen to ring group events
    this.$VueEvent.listen('ring_group_created', this.newRingGroupListener)
    this.$VueEvent.listen('ring_group_updated', this.updateRingGroupListener)
    this.$VueEvent.listen('ring_group_deleted', this.deleteRingGroupListener)

    this.$VueEvent.listen('refreshTeamInbox', this.refreshTeamInbox)
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

    this.$VueEvent.stop('refreshTeamInbox', this.refreshTeamInbox)
  }
}
</script>

<style lang="scss">
.teaminbox-nav-list {
  height: 100%;
  background-color: #fff;
  color: #000;
  padding: 7px 0 7px 0;

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
    padding: 10px;
    overflow-y: auto;
    box-sizing: border-box;

    .empty-state-aloai-style-mobile {
      display: flex;
      flex-direction: column;
      height: 100%;
      width: 100%;
      background: url('/assets/images/fomo/Gradient.png') no-repeat center center;
      background-size: cover;
      background-position: center;

      .empty-state-header {
        text-align: center;
        padding: 15px 10px 10px;

        .title-text {
          color: #000;
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          line-height: 1.2;
        }
      }

      .empty-state-image-container {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 0;
        padding: 10px;

        img {
          max-width: 90%;
          max-height: 100%;
          object-fit: contain;
          border-radius: 4px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }

      .empty-state-footer {
        padding: 10px 15px 15px;
        text-align: center;

        .info-text {
          margin: 0;
          font-size: 14px;
          line-height: 1.4;
          color: #333;
        }
      }
    }
  }

  &__empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    box-sizing: border-box;

    .mobile-empty-state-image {
      max-width: calc(100% - 20px);
      max-height: 80vh;
      object-fit: contain;
      box-sizing: border-box;
    }
  }
}
</style>
