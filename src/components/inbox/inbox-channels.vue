<template>
  <div @scroll="handleScroll">
    <b-overlay :show="isGettingTasksList"
               class="h-100"
               rounded="sm"
               variant="white">
      <task-list :communications="communications"
                 :answer-status="answerStatus"
                 :channel="channel"
                 v-if="!isGettingTasksList">
      </task-list>
      <div class="relative py-4">
        <b-overlay :show="isLoadingMore && !isGettingTasksList"
                   rounded="sm">
          <template #overlay>
            <q-spinner-bars color="primary"/>
          </template>
        </b-overlay>
      </div>
      <template #overlay>
        <div class="text-center">
          <q-spinner-bars
            color="primary"
            size="2em"
          />
        </div>
      </template>
    </b-overlay>
  </div>
</template>

<script>
import _ from 'lodash'
import { mapActions, mapState } from 'vuex'
import { aclMixin, communicationMixin } from 'src/plugins/mixins'
import talk2Api from 'src/plugins/api/api'
import TaskList from 'components/inbox/channel-tasks/task-list'
import * as Filters from 'src/constants/filters'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as CommunicationDirections from 'src/constants/communication-direction'

let scrollTimeout
export default {
  name: 'inbox-channels',

  mixins: [ aclMixin, communicationMixin ],

  components: { TaskList },

  props: {
    filterType: {
      type: String,
      required: false,
      default: 'call'
    },

    channel: {
      type: String,
      required: false,
      default: 'calls'
    },

    answerStatus: {
      type: String,
      required: false,
      default: 'all'
    },

    searchText: {
      type: String,
      default: ''
    },

    sort: {
      type: String,
      default: 'newest'
    },

    campaignId: {
      required: false
    },

    ringGroupId: {
      required: false
    },

    userId: {
      required: false
    },

    workflowId: {
      required: false
    }
  },

  computed: {
    ...mapState('inbox', ['isGettingTasksList', 'activeChannel', 'communications']),

    nextPage () {
      return this.currentPage + 1
    }
  },

  data () {
    return {
      filter: null,
      searchFields: ['contact.name', 'contact.phone_number'],
      currentPage: 0,
      hasMore: false,
      isLoadingMore: false,
      isLoaded: true,
      pagination: {
        type: Object,
        required: true
      }
    }
  },

  created () {
    this.resetFilters()

    this.$VueEvent.listen('new_communication', (data) => {
      // disable live dashboard for end clients
      if (this.hasRole('Company Reporter Access')) {
        return
      }
      // check data loaded
      if (this.pagination.current_page && this.pagination.current_page === 1) {
        // check new communication exists in the old list
        let found = this.communications.filter(communication => {
          return communication.id === data.id
        })
        if (!found.length) {
          if (this.checkCommunicationMatchesSearch(data) &&
            this.checkCommunicationMatchesFilters(data) &&
            this.checkCommunicationMatchesUserAccessibility(data) &&
            this.checkCommunicationMatchesCampaign(data) &&
            this.checkCommunicationMatchesWorkflow(data) &&
            this.checkCommunicationMatchesUser(data) &&
            this.checkCommunicationMatchesRingGroup(data)) {
            this.pagination.total += 1
            // push new data to top of array
            this.communications.unshift(data)

            if (this.communications.length > this.filter.per_page) {
              // push out last data from bottom of array
              this.communications.pop()
            }
          }
        }
      }
    })

    this.$VueEvent.listen('update_communication', (data) => {
      // disable live dashboard for end clients
      if (this.hasRole('Company Reporter Access')) {
        return
      }
      // check data loaded
      if (this.pagination.current_page) {
        // check new communication exists in the old list
        let found = this.communications.filter(communication => {
          return communication.id === data.id
        })
        if (found.length) {
          // update communication
          data = _.extend({}, found[0], data)
          if (this.checkCommunicationMatchesSearch(data) &&
            this.checkCommunicationMatchesFilters(data) &&
            this.checkCommunicationMatchesUserAccessibility(data) &&
            this.checkCommunicationMatchesCampaign(data) &&
            this.checkCommunicationMatchesWorkflow(data) &&
            this.checkCommunicationMatchesUser(data) &&
            this.checkCommunicationMatchesRingGroup(data)) {
            this.$set(this.communications, this.communications.indexOf(found[0]), data)
          } else {
            this.communications = this.communications.filter(communication => {
              return communication.id !== data.id
            })
            this.pagination.total -= 1
          }
        } else {
          // add the communication if it's not already there and if it matches the criteria
          if (this.checkCommunicationMatchesSearch(data) &&
            this.checkCommunicationMatchesFilters(data) &&
            this.checkCommunicationMatchesUserAccessibility(data) &&
            this.checkCommunicationMatchesCampaign(data) &&
            this.checkCommunicationMatchesWorkflow(data) &&
            this.checkCommunicationMatchesUser(data) &&
            this.pagination.current_page === 1 &&
            this.communications.length > 0 &&
            data.id > this.communications[0].id) {
            this.pagination.total += 1
            // push new data to top of array
            this.communications.unshift(data)

            if (this.communications.length > this.filter.per_page) {
              // push out last data from bottom of array
              this.communications.pop()
            }
          }
        }
      }
    })

    this.$VueEvent.listen('delete_communication', (data) => {
      // check data loaded
      if (this.pagination.current_page) {
        // try to find the communication
        let found = this.communications.find(communication => communication.id === data.id)
        if (found) {
          // remove it from the list
          this.communications.splice(this.communications.indexOf(found), 1)
          this.pagination.total -= 1
        }
      }
    })

    this.$VueEvent.listen('mark_contact_communications_all_as_read', (data) => {
      // get current contact's communications
      let contactCommunications = this.communications.filter(communication => communication.contact.id === data.id)

      // iterate through and update is_read value
      contactCommunications.forEach((communication) => {
        let index = this.communications.findIndex(item => item.id === communication.id)
        this.communications[index].is_read = true
      })

      // set updated communications
      this.setCommunications(this.communications)
    })

    let _this = this
    if (['Inbox Channel', 'Inbox Contact'].includes(this.$route.name)) {
      this.getCommunications(this.filter).then(function () {
        if (_this.$route.name === 'Inbox Contact') {
          let communication = _this.communications.find(item => item.id.toString() === _this.$route.params.communicationId.toString())
          if (communication) {
            _this.setSelectedCommunication(communication)
          }
        }
      })
    }
  },

  methods: {
    resetFilters () {
      this.filter = _.clone(Filters.DEFAULT_STATE.filter)
      this.filter.search_text = this.searchText
      this.filter.search_fields = this.searchFields
      this.filter.per_page = 20
      this.filter.page = 1

      if (this.campaignId) {
        this.filter.campaign_id = this.campaignId
      }
      if (this.ringGroupId) {
        this.filter.ring_group_id = this.ringGroupId
      }
      if (this.userId) {
        this.filter.user_id = this.userId
      }
      if (this.workflowId) {
        this.filter.workflow_id = this.workflowId
      }

      this.filter.type = this.filterType
      this.filter.answer_status = this.answerStatus
      this.setCommunications([])
    },

    checkCommunicationMatchesFilters (communication) {
      // if answer status filter is other than all
      if (this.filter.answer_status !== 'all') {
        // handle live & hold as a special case
        if (['live', 'hold', 'queued'].includes(this.filter.answer_status) &&
          communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          return false
        }
        // check the communication disposition status matches the answer status filter
        if (this.filter.answer_status === 'answered' && communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          return false
        }
        if (this.filter.answer_status === 'unanswered' &&
          ![CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW,
            CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW].includes(communication.disposition_status2)) {
          return false
        }
        if (this.filter.answer_status === 'missed' && communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW) {
          return false
        }
        if (this.filter.answer_status === 'abandoned' && communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW) {
          return false
        }
        if (this.filter.answer_status === 'in-progress' && communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          return false
        }
        if (this.filter.answer_status === 'failed' && communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          return false
        }
        if (this.filter.answer_status === 'deadend' && communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_DEADEND_NEW) {
          return false
        }
      }
      // if campaign filter is selected
      if (this.filter.campaigns.length > 0) {
        // check the communication campaign matches the campaign filter
        if (this.filter.campaigns.indexOf(communication.campaign_id) < 0) {
          return false
        }
      }
      // if workflow filter is selected
      if (this.filter.workflows.length > 0) {
        // check the communication campaign matches the campaign filter
        if (this.filter.workflows.indexOf(communication.workflow_id) < 0) {
          return false
        }
      }
      // if user filter is selected
      if (this.filter.users.length > 0) {
        // check the communication user matches the user filter
        if (this.filter.users.indexOf(communication.user_id) < 0) {
          return false
        }
      }
      // if user filter is selected
      if (this.filter.users.length > 0) {
        // check the communication user matches the user filter
        if (this.filter.users.indexOf(communication.owner_id) < 0) {
          return false
        }
      }
      // if number filter is selected
      if (this.filter.incoming_numbers.length > 0) {
        // check the communication number matches the number filter
        if (this.filter.incoming_numbers.indexOf(communication.incoming_number_id) < 0) {
          return false
        }
      }
      // if ring groups filter is selected
      if (this.filter.ring_groups.length > 0) {
        // check the communication ring group matches the ring group filter
        if (this.filter.ring_groups.indexOf(communication.ring_group_id) < 0) {
          return false
        }
      }
      // if direction filter is selected
      if (this.filter.direction !== 'all') {
        // check the communication direction matches the direction filter
        if (this.filter.direction === 'inbound' && communication.direction !== CommunicationDirections.INBOUND) {
          return false
        } else if (this.filter.direction === 'outbound' && communication.direction !== CommunicationDirections.OUTBOUND) {
          return false
        }
      }
      // checks first time conversations filter is selected and matches the communication
      if (this.filter.first_time_only && !communication.first_time_caller) {
        return false
      }
      // checks date range filter matches communication start time
      if (this.filter.from_date && this.filter.to_date && !this.utcToLocalizedMoment(communication.created_at).isBetween(this.filter.from_date, this.filter.to_date)) {
        return false
      }
      // checks min talk time filter matches communication talk time
      if (this.filter.min_talk_time > communication.talk_time) {
        return false
      }
      // if type of communication filter is selected
      if (this.filter.type !== 'all') {
        // check type of communication matches the type of communication filter
        if (this.filter.type === 'call' && communication.type !== CommunicationTypes.CALL) {
          return false
        } else if (this.filter.type === 'sms' && communication.type !== CommunicationTypes.SMS) {
          return false
        }
      }
      // checks tags filter matches communication tags
      if (this.filter.tags.length > 0 && communication.tags.length <= 0) {
        return false
      }
      // checks untagged only filter matches communication tags
      if (this.filter.untagged_only && communication.tags.length > 0) {
        return false
      }
      return true
    },

    checkCommunicationMatchesRingGroup (communication) {
      // checks if communication belongs to this ring group
      if (this.ringGroupId) {
        if (communication.ring_group_id !== this.ringGroupId) {
          return false
        }
      }

      return true
    },

    checkCommunicationMatchesCampaign (communication) {
      // checks if communication belongs to this campaign
      if (this.campaignId) {
        if (communication.campaign_id !== this.campaignId) {
          return false
        }
      }

      return true
    },

    checkCommunicationMatchesUser (communication) {
      // checks if communication belongs to this user
      if (this.userId) {
        if (communication.user_id && communication.user_id !== this.userId) {
          return false
        }
        // check if we have tried to call this user
        if (!communication.user_id && communication.target_users && !communication.target_users.find(userId => userId === this.userId)) {
          return false
        }
      }

      return true
    },

    checkCommunicationMatchesWorkflow (communication) {
      // checks if communication belongs to this workflow
      if (this.workflowId) {
        if (communication.workflow_id !== this.workflowId) {
          return false
        }
      }

      return true
    },

    checkCommunicationMatchesSearch (communication) {
      // checks if communication matches search
      if (this.searchText !== '') {
        for (let searchField of this.searchFields) {
          if (communication[searchField]) {
            if (communication[searchField].toString().indexOf(this.searchText) > -1) {
              return true
            }
          }
        }

        return false
      }

      return true
    },

    getCommunications (params) {
      this.gettingTasksList(true)
      return talk2Api.V1.reports.communications
        .get({ params: params })
        .then(response => {
          this.setCommunications(response.data.data)
          this.currentPage = response.data.current_page
          this.hasMore = response.data.next_page_url

          this.pagination = _.clone(response.data)
          delete this.pagination.data
          this.gettingTasksList(false)
        })
    },

    loadMoreCommunications (params) {
      this.isLoadingMore = true
      this.isLoaded = false
      talk2Api.V1.reports.communications
        .get({ params: params })
        .then(response => {
          this.setCommunications([...this.communications, ...response.data.data])
          this.currentPage = response.data.current_page
          this.hasMore = response.data.next_page_url
          this.isLoadingMore = false
          this.isLoaded = true

          this.pagination = _.clone(response.data)
          delete this.pagination.data
        })
    },

    handleScroll (el) {
      if ((el.target.offsetHeight + el.target.scrollTop) >= (el.target.scrollHeight - 70)) {
        this.onTaskListBottomScroll()
      }
    },

    onTaskListBottomScroll () {
      clearTimeout(scrollTimeout)
      // Set a timeout to run after scrolling ends
      scrollTimeout = setTimeout(() => {
        // Run the callback
        if (this.hasMore && this.isLoaded) {
          this.filter.page = this.nextPage
          this.loadMoreCommunications(this.filter)
        }
      }, 66)
    },

    ...mapActions('inbox', ['gettingTasksList', 'setCommunications', 'setSelectedCommunication'])
  },

  watch: {
    'activeChannel': function (value) {
      if (this.$route.name === 'Inbox Channel') {
        this.resetFilters()
        this.getCommunications(this.filter)
      }
    },
    'searchText': function (value) {
      this.filter.search_text = value
      this.getCommunications(this.filter)
    },
    'sort': function (value) {
      this.filter.sort = value
      this.getCommunications(this.filter)
    },
    '$route.name': function (value) {
      if (value === 'Inbox Contact') {
        let communication = this.communications.find(item => item.id === this.$route.params.communicationId)
        this.setSelectedCommunication(communication)
      }
    }
  }
}
</script>
