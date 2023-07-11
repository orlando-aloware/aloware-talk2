<template>
  <div class="inbox-nav-list" :class="{'inbox-nav-list--closed': closed}">
    <nav-item v-for="item in items"
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
              badge-value="20"
              badge-color="danger"
              @click="onItemClicked" />

    <hr>

    <nav-item icon=""
              value=""
              label="Views"
              :group="true"
              class="nav-list-group-title d-flex align-items-center justify-content-between">
      <template #action-icon>
          <q-btn id="edit-views-icon"
                 class="mr-3 cursor-pointer"
                 icon="edit"
                 size="xs"
                 flat
                 @click="onEditViewsClicked"/>
      </template>
    </nav-item>

    <!-- list only pinned views -->
    <nav-item icon=""
              :value="`view-${view.filter_id}`"
              :label="view.filter.name"
              :is-active="isActive(view, 'view')"
              :key="`${view.filter.name}-${index}`"
              :custom-count="view.filter?.open_count || 0"
              v-for="(view, index) in pinnedViews"
              @click="onItemClicked" />

    <inbox-views target="#edit-views-icon"
                 :show="isEditingViews"
                 :views="allInboxFilters"
                 @closed="onEditViewsClosed"/>
  </div>
</template>

<script>
import NavItem from './inbox-nav-item'
import InboxViews from 'src/components/inbox/inbox-views.vue'
import { mapActions, mapState, mapGetters } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import { pick, get } from 'lodash'
import * as ChannelType from 'src/constants/inbox-channels'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import * as Filters from 'src/constants/filters'
import { inboxMixin } from 'src/plugins/mixins'
import * as ContactTaskStatus from 'src/constants/contact-task-status'

export default {
  name: 'inbox-nav-list',

  components: {
    InboxViews,
    NavItem
  },

  mixins: [
    inboxMixin
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
      'items',
      'selectedFilter',
      'isFilterDialogShown',
      'pinnedViews',
      'inboxPersonalFilters',
      'inboxCompanyFilters'
    ]),

    ...mapGetters('inbox', [
      'allInboxFilters'
    ]),

    isShowActive () {
      return !this.$q.screen.lt.md || (this.$q.screen.lt.md && this.inboxChannelRoutes.includes(this.$route.name))
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
      filter: Filters.EXCERPT,
      isEditingViews: false
    }
  },

  created () {
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

    // listen to filter updates
    // this.$VueEvent.listen('personalFiltersUpdated', (personalFilters) => {
    //   this.personalFilters = personalFilters
    // })
  },

  mounted () {
    this.$VueEvent.listen('viewPinned', () => {
      this.getPinnedViews()
    })

    this.$VueEvent.listen('viewUnpinned', () => {
      this.getPinnedViews()
    })
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
      'setInboxCompanyFilters'
    ]),

    onItemClicked (nextActive) {
      this.active = nextActive
      const isView = nextActive.indexOf('view') !== -1

      // redirect page to Inbox View
      if (isView) {
        const viewId = nextActive.split('-')[1]
        const filter = this.allInboxFilters.find(filter => +filter.id === +viewId)

        this.currentTask = ContactTaskStatus.STATUS_OPEN
        this.onSelectView(filter)
        return
      }

      this.resetFilter()

      const channel = this.items.find(item => item.value === nextActive)
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
          status: 'open'
        }
      }).catch(err => {
        console.log(err)
        this.$handleErrors(err.response)
      })
    },

    isActive (value, type = null) {
      if (type === 'view') {
        return this.selectedFilter?.id === value.filter_id
      }

      return this.isShowActive && this.activeChannel && this.activeChannel.value === value
    },

    getFilters () {
      this.isGettingFilters = true

      // todo: get only contacts type filters
      return talk2Api.V2.inbox.filters.get({ type: ChannelType.CHANNEL_INBOX }).then(response => {
        this.setInboxPersonalFilters(response.data.data.user || [])
        this.setInboxCompanyFilters(response.data.data.company || [])

        this.isGettingFilters = false
      })
    },

    onSelectView (filter) {
      if (!filter || filter?.id === this.selectedFilter?.id) {
        return
      }

      this.setSelectedFilter(filter)

      // combine default filter values with the selected one
      const viewFilters = filter.filter
      this.filter = {
        ...this.defaultFilterModel.filter,
        ...pick(viewFilters, this.filterFields)
      }

      this.applyFilter()
    },

    applyFilter () {
      this.resetChannelChangedFilterFields()
      const myContactsFilter = get(this.filter, 'my_contact', null)

      // set My Contacts toggle state
      if (myContactsFilter !== null && myContactsFilter !== (this.inboxShowMyContacts | 0)) {
        this.setInboxShowMyContacts(Boolean(myContactsFilter))
      }

      // updating filters for user scope
      if (this.selectedFilter && this.selectedFilter.scope === 'user' && this.filterHasChanges) {
        this.isUpdatingFilter = true

        this.updateFilter(this.selectedFilter, {
          filter: this.filter,
          type: this.defaultFilterModel.type,
          name: this.selectedFilter.name,
          scope: this.selectedFilter.scope
        }).then(res => {
          this.isUpdatingFilter = false
        }).catch(error => {
          const {
            message,
            html
          } = extractErrorMessage(error)
          console.log(html)
          this.$generalNotification(message, 'error')
        })
      }

      this.setAppliedFilter(this.selectedFilter || null)

      this.loadContactTasks(false)
      this.fetchTaskCounts()

      this.$router.push({
        name: 'Inbox View',
        params: {
          viewId: this.selectedFilter.id,
          status: this.statusText,
          channel: 'views'
        }
      }).catch(err => {
        console.log(err)
        this.$handleErrors(err.response)
      })
    },

    onEditViewsClicked () {
      this.isEditingViews = !this.isEditingViews
    },

    onEditViewsClosed () {
      this.isEditingViews = false
    },

    resetFilter () {
      this.filter = { ...this.defaultFilterModel.filter }
      this.setChannelClonedFilter(this.filter)
      this.resetChannelChangedFilterFields()
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
          activeChannel = this.items.find(item => item.value === val)
        }

        this.$emit('active', activeChannel)
        this.$emit('update:value', val)
      }
    },

    isFilterDialogShown (state) {
      // when filter dialog is closed
      if (!state) {
        this.setFilterDialogForView(false)

        // fix route when user is in some view
        if (this.$route.params?.viewId) {
          const currentViewRouteId = this.$route.params.viewId

          // this means that the filter was changed but the route remained
          if (currentViewRouteId !== this.selectedFilter.id) {
            const channel = this.getPinnedViewChannel(this.selectedFilter.id)
            this.setActiveChannel(channel)

            this.$router.push({
              name: 'Inbox View',
              params: {
                viewId: this.selectedFilter.id,
                status: this.statusText,
                channel: 'views'
              }
            }).catch(err => {
              console.log(err)
              this.$handleErrors(err.response)
            })
          }
        }
      }
    }
  }
}
</script>
