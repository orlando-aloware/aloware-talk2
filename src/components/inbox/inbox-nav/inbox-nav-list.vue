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
             label="Personal Views"
             :group="true"
             class="nav-list-group-title" />

    <nav-item icon=""
              :value="filter.name"
              :label="filter.name"
              :is-active="isActive(filter, 'view')"
              :key="`${filter.name}-${index}`"
              :custom-count="filter.open_count || 0"
              v-for="(filter, index) in personalFilters"
              @click="onSelectFilter(filter)" />

    <!--<nav-item icon=""-->
    <!--          value=""-->
    <!--          label="Company Views"-->
    <!--          :group="true"-->
    <!--          class="nav-list-group-title" />-->

    <!--<nav-item icon=""-->
    <!--          :value="filter.name"-->
    <!--          :label="filter.name"-->
    <!--          :isActive="isActive(filter.name)"-->
    <!--          :key="filter.name"-->
    <!--          v-for="filter in companyFilters">-->
    <!--          @click="onSelectFilter(filter)" />-->
  </div>
</template>

<script>
import NavItem from './inbox-nav-item'
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
      'selectedFilter'
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
      filter: defaultFilterModel
    }
  },

  created () {
    this.getFilters()
      .then(() => {
        if (this.$route.params?.channel && this.$route.params.channel.indexOf('views') !== -1) {
          // get filterId based on URL
          const filterId = +this.$route.params.channel.replace('views-', '')
          // get filter from personal filters list
          const filter = this.personalFilters.find(personalFilter => personalFilter.id === filterId)

          this.onSelectFilter(filter)
        }
      })
  },

  methods: {
    ...mapActions('inbox', [
      'setActiveChannel',
      'setSelectedFilter',
      'resetChannelChangedFilterFields',
      'setAppliedFilter',
      'setInboxNavItems'
    ]),

    onItemClicked (nextActive) {
      if (!this.activeChannel) {
        return
      }

      if (this.activeChannel.value === nextActive) {
        this.$q.screen.lt.md && this.$emit('toInbox')
        return
      }

      this.active = nextActive
      const channel = this.items.find(item => item.value === nextActive)
      this.setActiveChannel(channel)

      if (this.active !== 'inbox' && this.active.indexOf('views') === -1) {
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

    onSelectFilter (filter) {
      if (!filter) {
        return
      }

      this.setSelectedFilter(filter)

      // combine default filter values with the selected one
      const personalFilterObject = filter.filter
      this.filter = {
        ...this.defaultFilterModel.filter,
        ...pick(personalFilterObject, this.filterFields)
      }

      const route = `views-${filter.id}`

      this.onApply()
      this.onItemClicked(route)
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
    }
  },

  watch: {
    value () {
      this.active = this.value
    },

    active (val) {
      if (this.value !== undefined && this.active !== this.value) {
        this.$emit('active', this.items.find(item => item.value === val))
        this.$emit('update:value', val)
      }
    }
  }
}
</script>
