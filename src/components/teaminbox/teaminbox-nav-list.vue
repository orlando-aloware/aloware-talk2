<template>
  <div class="teaminbox-nav-list"
       data-testid="teaminbox-nav-list"
       ref="teaminboxNavList">
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

      <!-- Full empty state when user has no team inboxes at all -->
      <div
        v-else-if="!inboxes.length && !hasAnyInboxes"
        :class="['text-center text-grey teaminbox-nav-list__empty-state', isMobile ? '' : 'q-pa-md']">
        <team-inbox-empty-state v-if="isMobile">
          <template #list-content>
            <p class="info-text">
              <strong>Connected Inboxes:</strong> See and collaborate on the real-time calls and messages being handled
              by every active member of this team.
            </p>
            <p class="info-text">
              <strong>Watching Inboxes:</strong> Give managers and supervisors a bird's-eye view of all communications
              for coaching, quality, and to ensure no customer is left behind.
            </p>
            <p class="info-text">
              <strong>Personal Inboxes:</strong> Unify the communications from everyone's direct lines into one shared,
              organized space so you can stop guessing and start working together.
            </p>
          </template>
        </team-inbox-empty-state>

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

      <!-- Simple empty state when user has inboxes but search/filter returns empty -->
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
import TeamInboxEmptyState from './teaminbox-empty-state.vue'
import TeamInboxMixin from 'src/plugins/mixins/teaminbox.mixin'
import SearchInput from 'src/components/search-input.vue'
import RefreshIcon from 'src/components/icons/refresh-icon.vue'
import { TEAMINBOXES_MENU_TITLE } from 'src/router/routes'
import {
  INBOX_TYPE_CONNECTED,
  INBOX_TYPE_PERSONAL,
  INBOX_TYPE_WATCHING,
  INBOX_TYPE_ALL,
  ALL_INBOXES_ID,
  UNTHREADED
} from 'src/store/teaminbox/teaminbox.store'
import { mapActions, mapGetters, mapState } from 'vuex'
import { getQueryString } from 'src/plugins/helpers/functions'
import { mapFields } from 'vuex-map-fields'
import { userMixin } from 'src/plugins/mixins'

export default {
  components: {
    TeamInboxNavType,
    TeamInboxEmptyState,
    SearchInput,
    RefreshIcon
  },

  mixins: [
    TeamInboxMixin,
    userMixin
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
      'showRefreshInboxesButton',
      'hasAnyInboxes'
    ]),

    ...mapState('auth', ['profile']),

    ...mapState(['isMobile', 'teams']),

    ...mapGetters('TeamInbox', ['getConnectedInboxesLength']),

    ...mapFields('settings', ['isTeamInboxNavListCollapsed']),

    ...mapFields('TeamInbox', ['activeFilters']),

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
        const {
          teams,
          call_waiting: callWaiting,
          user_ids: userIds,
          team_ids: teamIds,
          watcher_user_ids: watcherUserIds,
          watcher_team_user_ids: watcherTeamUserIds,
          watcher_team_ids: watcherTeamIds
        } = inbox

        const isConnected = userIds?.includes(this.profile.id) ||
          teamIds?.some(id => this.teamsIds.includes(id)) ||
          teams?.some(team => team.users?.some(user => user.id === this.profile.id))

        const isWatching = watcherUserIds?.includes(this.profile.id) ||
          watcherTeamUserIds?.includes(this.profile.id) ||
          watcherTeamIds?.some(id => this.teamsIds.includes(id))

        if (callWaiting && isConnected) {
          personal.push(inbox)
        } else if (!callWaiting && isConnected) {
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
      const allInboxes = [
        ...this.parsedInboxes.personal,
        ...this.parsedInboxes.connected,
        ...this.parsedInboxes.watching
      ]

      const navItems = [
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

      // Add "All Inboxes" only for demo companies
      if (this.isCompanyPartOfAlowareDemoCompanies(this.profile.company_id) && !this.search) {
        navItems.unshift({
          id: INBOX_TYPE_ALL,
          name: 'All Inboxes',
          inboxes: allInboxes.length > 0 ? [{ id: ALL_INBOXES_ID, name: 'All Inboxes' }] : []
        })
      }

      return navItems
    },

    dateFilter () {
      return `${this.activeFilters.from_date}|${this.activeFilters.to_date}`
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
      // Handle "all" inbox as a special case
      if (id === ALL_INBOXES_ID) {
        return { id: ALL_INBOXES_ID, name: 'All Inboxes' }
      }
      return this.inboxes.find(inbox => inbox.id === id)
    },

    determineInboxToSelect () {
      const defaultInboxId = this.getFirstInboxId()
      const urlInboxId = this.$route.params.inboxId
      const urlContactId = this.$route.params.id ? parseInt(this.$route.params.id, 10) : null

      // Check if URL has inbox ID and inbox exists (handle both "all" and numeric IDs)
      if (urlInboxId) {
        if (urlInboxId === ALL_INBOXES_ID) {
          return { id: urlInboxId, contactId: urlContactId, force: true }
        } else {
          const numericInboxId = parseInt(urlInboxId, 10)
          if (this.findInboxById(numericInboxId)) {
            return { id: numericInboxId, contactId: urlContactId, force: true }
          }
        }
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

      const isAllInboxes = inboxId === ALL_INBOXES_ID

      if (inboxId !== this.activeInboxId) {
        // For "all" inbox check if is filtering by a specific inbox and restrict if needed
        if (isAllInboxes) {
          const queryInboxId = this.$route.query.inboxId
          if (queryInboxId && !this.inboxes?.find(inbox => inbox.id === +queryInboxId)) {
            contactId = null
            this.$generalNotification('You don\'t have access to this inbox.', 'error')
          }
        } else if (!this.checkInboxAccess(inboxId)) {
          this.$generalNotification('You don\'t have access to this inbox.', 'error')
          this.$router.push({ name: TEAMINBOXES_MENU_TITLE })

          return
        }

        // Set the active inbox ID - for "all" use the string, for others use integer
        this.setActiveInboxId(inboxId === ALL_INBOXES_ID ? inboxId : parseInt(inboxId))
      }

      this.resetItems()
      // Pass current filters and sorting
      const filters = { ...(this.$store.state.TeamInbox.activeFilters || {}) }
      // inboxes filter only applies to All Inboxes
      if (inboxId !== ALL_INBOXES_ID) {
        delete filters.inboxes
      }
      const sort = this.$store.state.TeamInbox.activeSort || {}
      const search = this.$store.state.TeamInbox.currentSearch || null
      this.fetchItems(inboxId, search, filters, sort)

      if (!isAllInboxes && this.$route.query.inboxId) {
        // If leaving the "all inboxes" view, remove the query inboxId
        delete this.$route.query.inboxId
      }

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

      // If user has any inboxes, prioritize "All Inboxes" as the first option
      if (this.isCompanyPartOfAlowareDemoCompanies(this.profile.company_id) && !this.search) {
        const allInboxes = [
          ...this.parsedInboxes.personal,
          ...this.parsedInboxes.connected,
          ...this.parsedInboxes.watching
        ]

        if (allInboxes.length > 0) {
          return ALL_INBOXES_ID
        }
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
    },

    loadInboxesUnreadCount () {
      const inboxIds = Object.keys(this.parsedInboxes ?? {}).flatMap((parsedInbox) => this.parsedInboxes[parsedInbox].map((inbox) => inbox.id))

      if (!inboxIds.length) {
        return
      }

      // Filter out the "all" inbox ID since it's virtual
      const realInboxIds = inboxIds.filter(id => id !== ALL_INBOXES_ID)

      if (realInboxIds.length > 0) {
        this.fetchInboxesUnreadCount(realInboxIds)
      }
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
    } else {
      // restrict when no inboxes and user is trying to access all inboxes
      if (this.$route.params.inboxId === ALL_INBOXES_ID) {
        this.$router.push({ name: TEAMINBOXES_MENU_TITLE })
        return
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

    parsedInboxes () {
      this.loadInboxesUnreadCount()
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
    },

    dateFilter () {
      this.setUnreadCountLoaded(false)
      this.setInboxesUnreadCount([])
      this.loadInboxesUnreadCount()
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
