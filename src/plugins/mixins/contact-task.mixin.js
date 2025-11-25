import { mapState } from 'vuex'
import { RELATIONS as CONTACT_RELATIONS } from 'src/constants/contacts-list-relations'
import { OPERATORS } from 'src/constants/contacts-filter-operators'
import * as InboxTaskStatus from 'src/constants/inbox-task-status'

export default {
  computed: {
    ...mapState('inbox', [
      'inboxShowMyContacts',
      'inboxShowUnreads'
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
      page: 1
    }
  },

  methods: {
    getParameters (taskId, count = false) {
      const query = !count ? { page: this.page, sort: this.sorting.sort, order: this.sorting.order } : {}

      this.reInitFilters(taskId)
      query.filter_groups = []

      // Set my_contact filter
      query.my_contact = this.inboxShowMyContacts
      if (query.my_contact) {
        this.filters = {
          ...this.filters,
          'inbox_contact_owner': [
            { value: [this.profile.id], operator: OPERATORS.IS_ANY_OF }
          ]
        }
      }

      // Set unread filter
      query.has_unread = this.inboxShowUnreads
      if (query.has_unread) {
        this.filters = {
          ...this.filters,
          'is_unanswered_contact': [
            { value: 1, operator: 1 }
          ]
        }
      }

      query.filter_groups.push({ 'filters': this.filters, 'is_conjunction': true })

      // Add relations if not counting
      if (!count) {
        const relations = ['lastCommunication']
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
