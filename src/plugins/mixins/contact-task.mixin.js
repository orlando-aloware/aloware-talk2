import { mapActions, mapState } from 'vuex'
import talk2Api from 'src/plugins/api/api'
import * as ContactTaskStatus from 'src/constants/contact-task-status'
import { isEmpty } from 'lodash'
import { RELATIONS as CONTACT_RELATIONS } from 'src/constants/contacts-list-relations'
import { OPERATORS } from 'src/constants/contacts-filter-operators'
import { DATE_OPERATORS } from 'src/constants/contacts-date-filter-operators'
import * as InboxTaskStatus from 'src/constants/inbox-task-status'
import { INBOUND, OUTBOUND } from 'src/constants/communication-direction'
import { userMixin } from 'src/plugins/mixins'

export default {
  mixins: [userMixin],

  computed: {
    ...mapState('inbox', [
      'inboxShowMyContacts',
      'inboxShowUnreads',
      'activeChannel',
      'appliedFilter',
      'channelClonedFilter'
    ]),

    ...mapState('auth', ['profile']),

    ...mapState(['currentTimezone'])
  },

  data () {
    return {
      filters: {
        search: []
      },
      sorting: {
        sort: 'last_engagement_at',
        order: 'desc'
      },
      page: 1,
      searchText: ''
    }
  },

  methods: {
    ...mapActions('inbox', [
      'setOpenTaskCount',
      'setPendingTaskCount',
      'setInboxOpenTaskCount',
      'setInboxPendingTaskCount',
      'setLoadingOpenTaskCount',
      'setLoadingPendingTaskCount'
    ]),

    fetchTaskCounts () {
      this.setLoadingPendingTaskCount(true)
      this.getContactsCountByTaskStatus(ContactTaskStatus.STATUS_PENDING)
      this.setLoadingOpenTaskCount(true)
      this.getContactsCountByTaskStatus(ContactTaskStatus.STATUS_OPEN)
    },

    getContactsCountByTaskStatus (taskId, forInbox = false, params = null) {
      params = forInbox && !isEmpty(params) ? params : this.getParameters(taskId, true)

      return talk2Api.V2.contacts.counts(params)
        .then(response => {
          switch (taskId) {
            case ContactTaskStatus.STATUS_OPEN:
              if (response) {
                if (!forInbox) {
                  this.setOpenTaskCount(+response.data.count)
                }

                if (!this.activeChannel || this.activeChannel.value === 'inbox' || forInbox) {
                  this.setInboxOpenTaskCount(+response.data.count)
                }
              }

              this.setLoadingOpenTaskCount(false)
              break

            case ContactTaskStatus.STATUS_PENDING:
              if (response) {
                if (!forInbox) {
                  this.setPendingTaskCount(+response.data.count)
                }

                if (!this.activeChannel || this.activeChannel.value === 'inbox' || forInbox) {
                  this.setInboxPendingTaskCount(+response.data.count)
                }
              }

              this.setLoadingPendingTaskCount(false)
              break
          }
        })
    },

    getParameters (taskId, count = false, filters = null) {
      const query = !count ? { page: this.page, sort: this.sorting.sort, order: this.sorting.order } : {}
      let relations = []

      this.reInitFilters(taskId)
      query.filter_groups = []

      if (this.searchText && this.searchText.trim() && this.searchText.length >= 3) {
        this.filters.search = [{
          value: this.searchText
        }]

        delete this.filters.contact_task_status
      } else {
        this.filters.contact_task_status[0].value = taskId === InboxTaskStatus.STATUS_ALL
          ? InboxTaskStatus.STATUS_ALL_IDS
          : [taskId]
      }

      const filter = filters ?? this.appliedFilter?.filter ?? this.channelClonedFilter ?? null

      // Using new communication filters for beta companies
      // @TODO: There are a lot of code duplication here,
      // but this will be removed once the old filters are removed
      if (this.isCompanyPartOfNewInboxFilters(this.profile.company_id)) {
        // add the line filter if there is
        if (filter && !isEmpty(filter?.campaigns)) {
          this.filters.communication_lines = [
            { value: filter.campaigns, operator: OPERATORS.IS_ANY_OF }
          ]
        }

        if (filter && filter?.ring_groups && filter.ring_groups.length) {
          this.filters = {
            ...this.filters,
            'communication_ring_groups': [
              { value: filter.ring_groups, operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        if (filter && filter?.users && filter.users.length) {
          this.filters = {
            ...this.filters,
            'communication_users': [
              { value: filter.users, operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        if (filter && filter?.contact_owner && filter.contact_owner.length && !this.inboxShowMyContacts) {
          this.filters = {
            ...this.filters,
            'inbox_contact_owner': [
              { value: filter.contact_owner, operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        query.my_contact = this.inboxShowMyContacts

        if (query.my_contact) {
          this.filters = {
            ...this.filters,
            'inbox_contact_owner': [
              { value: [this.profile.id], operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        if (filter && filter?.from_date && filter?.to_date && filter.from_date && filter.to_date) {
          this.filters = {
            ...this.filters,
            'communication_created_at': [
              { value: [filter.from_date, filter.to_date], operator: DATE_OPERATORS.IS_BETWEEN }
            ]
          }
        }

        if (filter && !isEmpty(filter.tags)) {
          this.filters = {
            ...this.filters,
            'communication_tags': [
              { value: filter.tags, operator: OPERATORS.IS_ANY_OF }
            ]
          }
          relations.push('tags')
        }

        // New filters from all communications
        if (filter && !isEmpty(filter.direction) && filter.direction !== 'all') {
          this.filters = {
            ...this.filters,
            'direction': [
              { value: [filter.direction === 'inbound' ? INBOUND : OUTBOUND], operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        if (filter && !isEmpty(filter.answer_status) && filter.answer_status !== 'all') {
          this.filters = {
            ...this.filters,
            'answer_status': [
              { value: [filter.answer_status], operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        const otherFiltersList = [
          'callback_status',
          'broadcasts',
          'call_dispositions',
          'callback_status',
          'incoming_numbers',
          'creator_type',
          'workflows',
          'transfer_type',
          'min_talk_time',
          'untagged_only',
          'exclude_automated_communications',
          'first_time_only'
        ]

        otherFiltersList.forEach(key => {
          if (filter && (!isEmpty(filter[key]) || filter[key] > 0)) {
            this.filters = {
              ...this.filters,
              [key]: [
                {
                  value: Array.isArray(filter[key]) ? filter[key] : [filter[key]],
                  operator: OPERATORS.IS_ANY_OF
                }
              ]
            }
          }
        })
      } else {
        // Using old filters for non-beta companies
        if (filter && !isEmpty(filter?.campaigns)) {
          this.filters.lines = [
            { value: filter.campaigns, operator: OPERATORS.IS_ANY_OF }
          ]
        }

        if (filter && filter?.ring_groups && filter.ring_groups.length) {
          this.filters = {
            ...this.filters,
            'ring_groups': [
              { value: filter.ring_groups, operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        if (filter && filter?.users && filter.users.length) {
          this.filters = {
            ...this.filters,
            'users': [
              { value: filter.users, operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        if (filter && filter?.contact_owner && filter.contact_owner.length && !this.inboxShowMyContacts) {
          this.filters = {
            ...this.filters,
            'inbox_contact_owner': [
              { value: filter.contact_owner, operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        query.my_contact = this.inboxShowMyContacts

        if (query.my_contact) {
          this.filters = {
            ...this.filters,
            'inbox_contact_owner': [
              { value: [this.profile.id], operator: OPERATORS.IS_ANY_OF }
            ]
          }
        }

        if (filter && filter?.from_date && filter?.to_date && filter.from_date && filter.to_date) {
          this.filters = {
            ...this.filters,
            'last_engagement_at': [
              { value: [filter.from_date, filter.to_date], operator: DATE_OPERATORS.IS_BETWEEN }
            ]
          }
        }

        if (filter && !isEmpty(filter.tags)) {
          this.filters = {
            ...this.filters,
            'tags': [
              { value: filter.tags, operator: OPERATORS.IS_ANY_OF }
            ]
          }
          relations.push('tags')
        }
      }

      // apply only if filter is not "All Time"
      if (filter && filter.dynamic_engagement_date_range > 0) {
        this.filters = {
          ...this.filters,
          'dynamic_engagement_date_range': [
            { value: filter.dynamic_engagement_date_range, operator: 1 }
          ]
        }
      }

      query.has_unread = this.inboxShowUnreads

      if ((filter && !!+filter.has_unread) || (query.has_unread && this.inboxShowUnreads)) {
        this.filters = {
          ...this.filters,
          'is_unanswered_contact': [
            { value: 1, operator: 1 }
          ]
        }
      }

      query.filter_groups.push({ 'filters': this.filters, 'is_conjunction': true })

      if (!count) {
        relations.push('lastCommunication')
      }

      if (!isEmpty(relations)) {
        query.relations = relations.filter(relation => CONTACT_RELATIONS.includes(relation))
      }

      query.timezone = window.timezone

      return query
    },

    reInitFilters (taskId) {
      this.filters = {
        contact_task_status: [
          {
            value: taskId === InboxTaskStatus.STATUS_ALL ? InboxTaskStatus.STATUS_ALL_IDS : [taskId],
            operator: OPERATORS.IS_ANY_OF
          }
        ],
        search: []
      }
    }
  }
}
