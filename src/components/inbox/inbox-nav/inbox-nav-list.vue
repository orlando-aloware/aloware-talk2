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
              class="nav-list-group-title d-flex align-items-center justify-content-between"
              v-if="personalFilters.length">
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
    <!--<router-link :to="`/channels/view/${view.filter_id}/open`"-->
    <!--             :key="`${view.filter.name}-${index}`"-->
    <!--             v-for="(view, index) in pinnedViews">-->
    <!--  <div>{{ view.filter.name }}</div>-->
    <!--</router-link>-->

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
                 :views="[...personalFilters, ...companyFilters]"
                 @closed="onEditViewsClosed"/>
  </div>
</template>

<script>
import NavItem from './inbox-nav-item'
import InboxViews from 'src/components/inbox/inbox-views.vue'
import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import { pick, get } from 'lodash'
import * as ChannelType from 'src/constants/inbox-channels'
import extractErrorMessage from 'src/plugins/helpers/extract-error-message'
import * as Filters from 'src/constants/filters'
import { inboxMixin } from 'src/plugins/mixins'

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
      'activeChannel',
      'selectedFilter',
      'isFilterDialogShown',
      'pinnedViews'
    ]),

    isShowActive () {
      return !this.$q.screen.lt.md || (this.$q.screen.lt.md && ['Inbox Contact Task', 'Inbox Channel Task Status', 'Inbox Contact', 'Inbox Contact Communication', 'Inbox Channel'].includes(this.$route.name))
    }
  },

  data () {
    // eslint-disable-next-line no-unused-vars
    const defaultFilterModel = {
      campaigns: Filters.DEFAULT_STATE.filter.campaigns,
      ring_groups: Filters.DEFAULT_STATE.filter.ring_groups,
      direction: Filters.DEFAULT_STATE.filter.direction,
      answer_status: Filters.DEFAULT_STATE.filter.answer_status,
      min_talk_time: Filters.DEFAULT_STATE.filter.min_talk_time,
      transfer_type: Filters.DEFAULT_STATE.filter.transfer_type,
      callback_status: Filters.DEFAULT_STATE.filter.callback_status,
      tags: Filters.DEFAULT_STATE.filter.tags,
      call_dispositions: Filters.DEFAULT_STATE.filter.call_dispositions,
      first_time_only: Filters.DEFAULT_STATE.filter.first_time_only,
      untagged_only: Filters.DEFAULT_STATE.filter.untagged_only,
      exclude_automated_communications: Filters.DEFAULT_STATE.filter.exclude_automated_communications,
      incoming_numbers: Filters.DEFAULT_STATE.filter.incoming_numbers,
      users: Filters.DEFAULT_STATE.filter.users,
      workflows: Filters.DEFAULT_STATE.filter.workflows,
      broadcasts: Filters.DEFAULT_STATE.filter.broadcasts,
      contact_owner: Filters.DEFAULT_STATE.filter.contact_owner,
      from_date: Filters.DEFAULT_STATE.filter.from_date,
      to_date: Filters.DEFAULT_STATE.filter.to_date,
      my_contact: Filters.DEFAULT_STATE.filter.my_contact,
      creator_type: Filters.DEFAULT_STATE.filter.creator_type
    }

    return {
      active: this.value,
      personalFilters: [],
      companyFilters: [],
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
      defaultFilterModel: {
        name: '',
        type: ChannelType.CHANNEL_INBOX,
        filter: defaultFilterModel,
        scope: 'user'
      },
      filter: defaultFilterModel,
      isEditingViews: false
    }
  },

  created () {
    this.getPinnedViews()
    this.getFilters()
      .then(() => {
        if (this.$route.params?.view) {
          // get filterId based on URL
          const filterId = +this.$route.params.view.replace('view-', '')
          // get filter from personal filters list
          const filter = this.personalFilters.find(personalFilter => personalFilter.id === filterId)

          this.onSelectFilter(filter, false)
        }
      })

    // listen to filter updates
    this.$VueEvent.listen('personalFiltersUpdated', (personalFilters) => {
      this.personalFilters = personalFilters
    })
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
      'setPinnedViews',
      'setInboxShowMyContacts',
      'setChannelClonedFilter',
      'setFilterDialogForView'
    ]),

    onItemClicked (nextActive) {
      // eslint-disable-next-line no-constant-condition
      // if (true) {
      //   console.log(nextActive)
      //   return
      // }
      // if (!this.activeChannel) {
      //   return
      // }

      // if (this.activeChannel.value === nextActive) {
      //   this.$emit('toInbox')
      //   return
      // }

      this.active = nextActive
      const isView = nextActive.indexOf('view') !== -1

      if (isView) {
        const viewId = nextActive.split('-')[1]
        const view = this.pinnedViews.find(view => +view.filter_id === +viewId)
        const channel = {
          label: view.filter.name,
          value: `view-${view.filter_id}`,
          icon: '',
          disabled: false
        }

        this.setActiveChannel(channel)

        this.filter = { ...view.filter.filter }
        this.setChannelClonedFilter(this.filter)
        this.resetChannelChangedFilterFields()
        this.setAppliedFilter(null)
        this.loadContactTasks()
        this.fetchTaskCounts()

        this.$router.push({
          name: 'Inbox View',
          params: {
            viewId: viewId,
            status: 'open'
          }
        }).catch(err => {
          console.log(err)
          this.$handleErrors(err.response)
        })

        return
      }

      const channel = this.items.find(item => item.value === nextActive)
      console.log(channel)
      this.setActiveChannel(channel)

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

      this.onResetFilter()

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

    isActive (value, type = 'channel') {
      if (type === 'channel') {
        return this.isShowActive && this.activeChannel && this.activeChannel.value === value
      }

      return this.selectedFilter?.id === value.id
    },

    getFilters () {
      this.isGettingFilters = true

      return talk2Api.V2.inbox.filters.get().then(response => {
        this.personalFilters = response.data.data.user || []
        this.companyFilters = response.data.data.company || []

        // // format filters like inbox items then merge
        // let views = [{
        //   label: 'Personal Views',
        //   group: true,
        //   value: '',
        //   class: 'nav-list-group-title',
        //   icon: '',
        //   disabled: false
        // }]
        // const pinnedViews = this.personalFilters.map(filter => {
        //   return {
        //     label: filter.name,
        //     value: `views-${filter.id}`,
        //     icon: '',
        //     disabled: false,
        //     active: this.isActive(filter.name),
        //     type: 'view',
        //     viewId: filter.id,
        //     viewFilter: filter.filter
        //   }
        // })
        // views = this.$jsonClone(views).concat(pinnedViews)

        // this.setInboxNavItems(this.$jsonClone(this.items).concat(views))

        this.isGettingFilters = false
      })
    },

    onSelectFilter (filter, redirect = true) {
      if (!filter || filter?.id === this.selectedFilter?.id) {
        return
      }

      this.setSelectedFilter(filter)

      // combine default filter values with the selected one
      const personalFilterObject = filter.filter
      this.filter = {
        ...this.defaultFilterModel.filter,
        ...pick(personalFilterObject, this.filterFields)
      }

      // view route name definition
      const route = `view-${filter.id}`

      this.onApply()

      if (redirect) {
        this.$router.push({
          name: 'Inbox View',
          params: {
            view: route,
            status: 'open'
          }
        })
      }
    },

    onApply () {
      this.resetChannelChangedFilterFields()
      const myContactsFilter = get(this.filter, 'my_contact', null)

      // set My Contacts toggle state
      if (myContactsFilter !== null && myContactsFilter !== (this.inboxShowMyContacts | 0)) {
        this.setInboxShowMyContacts(Boolean(myContactsFilter))
      }

      // logic for fields with boolean value
      // const props = [
      //   'first_time_only',
      //   'exclude_automated_communications',
      //   'untagged_only'
      // ]

      // for (const item in this.filter) {
      //   if (item === 'answer_status' && this.defaultFilterModel.type === ChannelType.CHANNEL_RECORDINGS) {
      //     continue
      //   }
      //   console.log({ ...this.defaultFilterModel })
      //
      //   const hasField = (this.filterFields.includes(item) && this.defaultFilterModel.filter.hasOwnProperty(item))
      //
      //   // exceptions for fields with boolean value
      //   if (props.includes(item) &&
      //     +this.filter[item] !== +this.defaultFilterModel.filter[item] &&
      //     hasField) {
      //     this.updateChannelChangedFilterFields({
      //       name: item,
      //       value: +this.filter[item]
      //     })
      //
      //     continue
      //   }
      //
      //   // exceptions for fields with boolean value
      //   if (!this.booleanFields.includes(item) &&
      //     JSON.stringify(this.filter[item]) !== JSON.stringify(this.defaultFilterModel.filter[item]) &&
      //     hasField) {
      //     this.updateChannelChangedFilterFields({
      //       name: item,
      //       value: this.filter[item]
      //     })
      //   }
      // }

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

      // add the communication type and answer_status filters
      // const communicationType = get(this.value, 'type', null)
      // const communicationAnswerStatus = get(this.value, 'answer_status', null)
      //
      // if (communicationType) {
      //   this.filter.type = communicationType
      // }
      //
      // if ([ChannelType.CHANNEL_RECORDINGS, ChannelType.CHANNEL_VOICEMAILS].includes(this.defaultFilterModel.type) &&
      //   communicationAnswerStatus) {
      //   this.filter.answer_status = communicationAnswerStatus
      // }

      this.applyFilter()
    },

    applyFilter () {
      if (!this.selectedFilter) {
        return
      }

      for (const prop in this.selectedFilter.filter) {
        this.filter[prop] = this.selectedFilter.filter[prop]
      }

      this.filter = {
        ...this.filter,
        untagged_only: +this.filter.untagged_only,
        first_time_only: +this.filter.first_time_only,
        exclude_automated_communications: +this.filter.exclude_automated_communications,
        my_contact: +this.filter.my_contact
      }

      this.loadContactTasks()
      this.fetchTaskCounts()
    },

    onEditViewsClicked () {
      this.isEditingViews = !this.isEditingViews
    },

    onEditViewsClosed () {
      this.isEditingViews = false
    },

    onResetFilter () {
      this.filter = { ...this.defaultFilterModel.filter }
      this.setChannelClonedFilter(this.filter)
      this.resetChannelChangedFilterFields()
      this.setAppliedFilter(null)
      this.loadContactTasks()
      this.fetchTaskCounts()
    },

    getPinnedViews () {
      this.$axios
        .get('/api/v2/filters/pinned')
        .then(res => {
          this.setPinnedViews([...res.data.data])
        })
        .catch(err => {
          console.log(err)
        })
    }
  },

  watch: {
    value () {
      this.active = this.value
    },

    active (val) {
      if (this.value !== undefined && this.active !== this.value) {
        let activeChannel = null

        if (val.indexOf('view') !== -1) {
          const viewId = val.split('-')[1]
          const view = this.pinnedViews.find(view => +view.filter_id === +viewId)
          activeChannel = {
            label: view.filter.name,
            value: `view-${view.filter_id}`,
            icon: '',
            disabled: false
          }
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
        if (this.$route.params?.view) {
          const currentViewRouteId = +this.$route.params.view.replace('view-', '')

          // this means that the filter was changed but the route remained
          if (currentViewRouteId !== this.selectedFilter.id) {
            this.$router.push({
              name: 'Inbox View',
              params: {
                view: 'view-' + this.selectedFilter.id,
                status: 'open'
              }
            })
          }
        }
      }
    }
  }
}
</script>
