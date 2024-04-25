<template>
  <div class="inbox-nav-list h-100 overflow-x-hidden"
       :class="{'inbox-nav-list--closed': closed}">
    <nav-item badge-value="20"
              badge-color="danger"
              :key="item.name"
              :label="item.label"
              :value="item.value"
              :icon="item.icon"
              :group="item.group"
              :isActive="isActive(item.value)"
              :closed="closed"
              :badge="true"
              :openCount="openCount"
              :pending-count="pendingCount"
              :disabled="item.disabled"
              :tooltip="item.tooltip"
              v-for="item in inboxChannels"
              @click="onItemClicked" />

    <hr>

    <div v-if="isCompanyPartOfAlowareDemoCompanies(profile.company_id) || isInboxViewsEnabledCompany">
      <nav-item class="nav-list-group-title d-flex justify-content-between"
                icon=""
                value=""
                label="Views"
                :group="true">
        <template #action-icon>
            <q-btn id="edit-views-icon"
                   class="mr-3 cursor-pointer"
                   icon="edit"
                   size="xs"
                   flat
                   @click="onShowViewsList"/>
        </template>
      </nav-item>

      <!-- list only pinned views -->
      <nav-item :icon="!+view.filter?.is_on_company ? 'view' : ''"
                :value="`view-${view.filter_id}`"
                :label="view.filter.name"
                :is-active="isActive(view, 'view')"
                :key="`${view.filter.name}-${index}`"
                v-for="(view, index) in pinnedViews"
                @click="onItemClicked" />

        <div class="py-3 text-center text-13 text-word-wrap"
             v-if="pinnedViews.length < 1">
          <span>No Pinned Views</span>
        </div>

      <inbox-views target="#edit-views-icon"
                   :views="allInboxFilters"
                   @closed="onCloseViewsList"/>
    </div>
  </div>
</template>

<script>
import NavItem from './inbox-nav-item'
import InboxViews from 'src/components/inbox/inbox-views.vue'
import { mapActions, mapState, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import { get } from 'lodash'
import * as ChannelType from 'src/constants/inbox-channels'
import * as Filters from 'src/constants/filters'
import { inboxRoutesMixin, inboxMixin, userMixin } from 'src/plugins/mixins'
import * as InboxTaskStatus from 'src/constants/inbox-task-status'

export default {
  name: 'inbox-nav-list',

  components: {
    InboxViews,
    NavItem
  },

  mixins: [
    inboxRoutesMixin,
    inboxMixin,
    userMixin
  ],

  props: {
    value: {
      required: false
    },

    closed: {
      type: Boolean,
      default: false
    },

    openCount: {
      required: false,
      default: 0
    },

    pendingCount: {
      required: false,
      default: 0
    }
  },

  computed: {
    ...mapState('inbox', [
      'navListItems',
      'activeChannel',
      'selectedFilter',
      'appliedFilter',
      'isFilterDialogShown',
      'pinnedViews',
      'inboxPersonalFilters',
      'inboxCompanyFilters',
      'isEditingView',
      'isFilterDialogForView'
    ]),

    ...mapGetters('inbox', [
      'allInboxFilters'
    ]),

    ...mapGetters('auth', [
      'profile'
    ]),

    isShowActive () {
      const isMobileInboxRoutes = this.$q.screen.lt.md && this.inboxTaskAndCommRoutes.includes(this.$route.name)

      return !this.$q.screen.lt.md || isMobileInboxRoutes
    },

    inboxChannels () {
      if (this.profile?.campaign_id) {
        return this.navListItems
      }

      // hard-coded disabling my-personal-line channel
      const channels = this.navListItems
      let index = channels.findIndex(channel => channel.value === 'my-personal-line')
      channels[index].disabled = true
      channels[index].tooltip = 'No personal line has been set. Please review your user settings.'

      return channels
    }
  },

  data () {
    return {
      active: this.value,
      isGettingFilters: false,
      filterFields: [
        'campaigns',
        'ring_groups',
        'direction',
        'answer_status',
        'min_talk_time',
        'transfer_type',
        'callback_status',
        'tags',
        'call_dispositions',
        'first_time_only',
        'untagged_only',
        'exclude_automated_communications',
        'incoming_numbers',
        'users',
        'workflows',
        'contact_owner',
        'my_contact',
        'from_date',
        'to_date',
        'creator_type'
      ],
      booleanFields: [
        'first_time_only',
        'exclude_automated_communications',
        'untagged_only',
        'my_contact'
      ],
      listeners: {
        pinnedViewsEvents: null,
        openInboxViewPopup: null,
        deletedFilter: null
      }
    }
  },

  created () {
    if (this.isCompanyPartOfAlowareDemoCompanies(this.profile.company_id) || this.isInboxViewsEnabledCompany) {
      this.getFilters()
        .then(() => {
          if (this.$route.params?.viewId) {
            // get view id
            const viewId = +this.$route.params.viewId
            // get filter from all filters list
            const filter = this.allInboxFilters.find(filter => +filter.id === +viewId)

            this.setStatus()
            this.onSelectView(filter)
          }
        })
    }
  },

  mounted () {
    this.listeners.pinnedViewsEvents = () => {
      this.getPinnedViews()
    }

    this.listeners.openInboxViewPopup = () => {
      this.setShowViewsList(true)
    }

    this.listeners.deletedFilter = (filter) => {
      const view = this.pinnedViews.find(view => +view.filter_id === +filter.id)
      if (view) {
        this.unpinView(view.id)
      }
    }

    this.$VueEvent.listen('viewPinned', this.listeners.pinnedViewsEvents)
    this.$VueEvent.listen('viewUnpinned', this.listeners.pinnedViewsEvents)
    this.$VueEvent.listen('openInboxViewPopup', this.listeners.openInboxViewPopup)
    this.$VueEvent.listen('filter_deleted', this.listeners.deletedFilter)
  },

  methods: {
    ...mapActions('inbox', [
      'setActiveChannel',
      'setSelectedFilter',
      'resetChannelChangedFilterFields',
      'setAppliedFilter',
      'setInboxShowMyContacts',
      'setChannelClonedFilter',
      'setFilterDialogForView',
      'setInboxPersonalFilters',
      'setInboxCompanyFilters',
      'setShowViewsList'
    ]),

    onItemClicked (nextActive) {
      this.onCloseViewsList()
      this.resetFilter()

      this.active = nextActive
      const isView = nextActive.indexOf('view') !== -1

      // redirect page to Inbox View
      if (isView) {
        const viewId = nextActive.split('-')[1]
        const view = this.pinnedViews.find(view => +view.filter_id === +viewId)

        this.currentTask = InboxTaskStatus.DEFAULT_STATUS
        this.onSelectView(view.filter)
        return
      }

      if (!this.activeChannel) {
        return
      }

      if (this.activeChannel.value === nextActive && this.$q.screen.lt.md) {
        this.$emit('toInbox')

        return
      }

      this.active = nextActive
      const channel = this.navListItems.find(item => item.value === nextActive)
      this.setActiveChannel(channel)

      // redirect page to Channel
      if (this.active !== 'inbox') {
        this.$router.push({
          name: 'Inbox Channel',
          params: {
            channel: this.active
          }
        }).catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
        })

        return
      }

      // redirect page to Inbox
      this.$router.push({
        name: 'Inbox Channel Task Status',
        params: {
          channel: this.active,
          status: InboxTaskStatus.DEFAULT_STATUS
        }
      }).catch(err => {
        //  properly reload contacts if redirected or navigation clicked to the same "inbox" route
        if (this.$route.name === 'Inbox' || this.$route.params.channel === 'inbox') {
          this.loadContactTasks()
        }

        console.log(err)
        this.$handleErrors(err.response)
      })
    },

    isActive (value, type = null) {
      if (type === 'view' || this.$route.params?.viewId) {
        return this.$route.params?.viewId && this.appliedFilter?.id === value.filter_id
      }

      return this.isShowActive && this.activeChannel && this.activeChannel.value === value
    },

    getFilters () {
      this.isGettingFilters = true

      return talk2Api.V2.inbox.filters.get({ type: ChannelType.CHANNEL_INBOX })
        .then(response => {
          this.setInboxPersonalFilters(response.data.data.user || [])
          this.setInboxCompanyFilters(response.data.data.company || [])

          this.isGettingFilters = false
        })
    },

    onSelectView (filter) {
      if (!filter || filter?.id === this.selectedFilter?.id) {
        return
      }

      // fill in the value for the newly added filter in case it's not yet included
      // in the existing saved set to properly display in its respective select component
      if (!filter.filter.hasOwnProperty('dynamic_engagement_date_range')) {
        filter.filter.dynamic_engagement_date_range = Filters.DEFAULT_STATE.filter.dynamic_engagement_date_range
      }

      this.setSelectedFilter(filter)
      this.applyFilter()
    },

    applyFilter () {
      this.resetChannelChangedFilterFields()
      const myContactsFilter = get(this.selectedFilter.filter, 'my_contact', null)

      // set My Contacts toggle state
      if (myContactsFilter !== null && myContactsFilter !== (this.inboxShowMyContacts | 0)) {
        this.setInboxShowMyContacts(Boolean(myContactsFilter))
      }

      this.setAppliedFilter(this.selectedFilter)
      this.loadContactTasks()

      this.$router.push({
        name: 'Inbox View',
        params: {
          viewId: this.selectedFilter.id,
          status: this.statusText,
          channel: 'view'
        }
      }).catch(err => {
        console.log(err)
        this.$handleErrors(err.response)
      })
    },

    onShowViewsList () {
      this.setShowViewsList(true)
    },

    onCloseViewsList () {
      this.setShowViewsList(false)
    },

    resetFilter () {
      this.fetchInboxTaskCounts()
      this.filter = { ...this.defaultFilterModel.filter }
      this.setChannelClonedFilter(this.filter)
      this.resetChannelChangedFilterFields()
      this.setSelectedFilter(null)
      this.setAppliedFilter(null)
    }
  },

  watch: {
    value () {
      this.active = this.value
    },

    active (val) {
      // set & emit correct active channel
      if (this.value !== undefined && this.active !== this.value) {
        let activeChannel = null

        if (val.indexOf('view') !== -1) { // "e.g.. view-123"
          const viewId = val.split('-')[1]
          activeChannel = this.getPinnedViewChannel(viewId)
        } else {
          activeChannel = this.navListItems.find(item => item.value === val)
        }

        this.$emit('active', activeChannel)
        this.$emit('update:value', val)
      }
    },

    isFilterDialogShown (state) {
      if (state || !this.appliedFilter) {
        return
      }

      if (!this.$route.params.hasOwnProperty('viewId')) {
        return
      }

      // fix route when user is in some view
      const currentViewRouteId = this.$route.params.viewId

      // this means that the filter was changed but the route remained
      if (currentViewRouteId !== this.appliedFilter.id) {
        const channel = this.getPinnedViewChannel(this.appliedFilter.id)
        this.setActiveChannel(channel)

        this.$router.push({
          name: 'Inbox View',
          params: {
            viewId: this.appliedFilter.id,
            status: this.statusText,
            channel: 'view'
          }
        }).catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
        })
      }
    }
  },

  beforeDestroy () {
    this.$VueEvent.stop('viewPinned', this.listeners.pinnedViewsEvents)
    this.$VueEvent.stop('viewUnpinned', this.listeners.pinnedViewsEvents)
    this.$VueEvent.stop('openInboxViewPopup', this.listeners.openInboxViewPopup)
    this.$VueEvent.stop('filter_deleted', this.listeners.deletedFilter)
  }
}
</script>
