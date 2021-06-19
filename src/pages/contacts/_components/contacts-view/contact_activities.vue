<template>
  <div class="contact-activities"
       v-if="contactId">
    <div class="container has-text-centered"
         v-if="(pagination && pagination.current_page < pagination.last_page && communications.length > 0) || paginationLoading">
      <b-button type="is-link"
                :loading="paginationLoading"
                @click="nextPage">
        Load More
      </b-button>
    </div>
    <div class="contact-activity has-margin-bottom-10"
         v-for="(communication, key) in communications"
         :key="communication.id">
      <template v-if="key > 0 && getDateDiff(communications[key], communications[key - 1])">
        <div class="is-divider"
             :data-content="getDate(communications[key])">
        </div>
      </template>
      <contact-activity
                :ref="(communication.type !== undefined ? 'communication-' : 'contact-audit-') + communication.id"
                :communication="communication"
                :contact="selected_contact">
      </contact-activity>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import auth from '../../../../boot/auth'
import { aclMixin, communicationMixin, dateMixin } from '../../../../boot/mixins'
import ContactActivity from './contact-activity'
import * as Filters from '../../../../plugins/filters'
import * as CommunicationTypes from '../../../../constants/communication-types'
import * as CommunicationDirections from '../../../../constants/communication-direction'
import * as CommunicationCurrentStatus from '../../../../constants/communication-current-status'
import * as CommunicationDispositionStatus from '../../../../constants/communication-disposition-status'

export default {
  name: 'contact-activities',

  mixins: [ aclMixin, dateMixin, communicationMixin ],

  components: { ContactActivity },

  props: {
    contactId: {
      required: true
    },

    filterType: {
      required: true
    },

    campaignId: {
      required: false
    }
  },

  data: function () {
    return {
      auth: auth,
      loading: false,
      CancelToken: null,
      source: null,
      pagination: {
        type: Object,
        required: true
      },
      paginationLoading: false,
      pageNumbers: [],
      communications: [],
      filter: null,
      searchText: '',
      searchFields: [],
      CommunicationTypes,
      CommunicationDirections,
      CommunicationCurrentStatus,
      CommunicationDispositionStatus
    }
  },

  created () {
    this.CancelToken = this.$axios.CancelToken
    this.source = this.CancelToken.source()

    this.$VueEvent.listen('new_communication', (data) => {
      // sanity check
      if (this.contactId !== data.contact_id) {
        return
      }
      // check data loaded
      if (this.pagination.current_page && this.pagination.current_page === 1) {
        // check new communication exists in the old list
        let found = this.communications.filter(communication => {
          return communication.id === data.id
        })
        if (!found.length) {
          if (this.checkCommunicationMatchesSearch(data) && this.checkCommunicationMatchesFilters(data) && this.checkCommunicationMatchesUserAccessibility(data) && this.checkCommunicationMatchesCampaign(data) && this.checkCommunicationMatchesWorkflow(data) && this.checkCommunicationMatchesUser(data)) {
            this.pagination.total += 1
            // push new data to top of array
            this.communications.push(data)
            this.$emit('loaded')

            if (this.communications.length > this.filter.per_page) {
              // push out last data from bottom of array
              this.communications.shift()
            }
          }
        }
      }
    })

    this.$VueEvent.listen('update_communication', (data) => {
      // sanity check
      if (this.contactId !== data.contact_id) {
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
          if (this.checkCommunicationMatchesSearch(data) && this.checkCommunicationMatchesFilters(data) && this.checkCommunicationMatchesUserAccessibility(data) && this.checkCommunicationMatchesCampaign(data) && this.checkCommunicationMatchesWorkflow(data) && this.checkCommunicationMatchesUser(data)) {
            this.$set(this.communications, this.communications.indexOf(found[0]), data)
          } else {
            this.communications = this.communications.filter(communication => {
              return communication.id !== data.id
            })
            this.pagination.total -= 1
          }
        } else {
          // add the communication if it's not already there and if it matches the criteria
          if (this.checkCommunicationMatchesSearch(data) && this.checkCommunicationMatchesFilters(data) && this.checkCommunicationMatchesUserAccessibility(data) && this.checkCommunicationMatchesCampaign(data) && this.checkCommunicationMatchesWorkflow(data) && this.checkCommunicationMatchesUser(data) && this.pagination.current_page === 1 && this.communications.length > 0 && data.id > this.communications[0].id) {
            this.pagination.total += 1
            // push new data to top of array
            this.communications.push(data)

            if (this.communications.length > this.filter.per_page) {
              // push out last data from bottom of array
              this.communications.shift()
            }
          }
        }
      }
    })

    this.$VueEvent.listen('delete_communication', (data) => {
      // sanity check
      if (this.contactId !== data.contact_id) {
        return
      }

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

    this.resetFilters()
    this.getCommunications().then(() => {
      this.$emit('loaded')
    })
  },

  methods: {
    getCommunications: function () {
      if (!this.hasPermissionTo('list communication')) {
        return
      }

      this.source.cancel('Operation canceled by the user.')
      this.source = this.CancelToken.source()
      this.loading = true

      return this.$axios.get('/api/v1/reports/communications', {
        params: this.filter,
        cancelToken: this.source.token
      }).then(res => {
        this.pagination = res.data
        this.pageNumbers = this.getPageNumbers()
        let communications = res.data.data
        communications.map((o) => {
          o.tag_ids = o.tags.map((a) => a.id)
        })
        for (let communication of communications) {
          this.communications.unshift(communication)
        }
        this.loading = false

        return Promise.resolve(res)
      }).catch(err => {
        if (this.$axios.isCancel(err)) {
          console.log('Request canceled', err.message)
        } else {
          console.log(err)
          this.loading = false
        }

        return Promise.reject(err)
      })
    },

    getDateDiff (newCommunication, oldCommunication) {
      if (!newCommunication || !oldCommunication) {
        return false
      }

      let newDate = this.utcToLocalizedMoment(newCommunication.created_at).startOf('day')
      let oldDate = this.utcToLocalizedMoment(oldCommunication.created_at).startOf('day')

      return newDate.diff(oldDate, 'days')
    },

    getDate (communication) {
      return this.$options.filters.fixFullDateUTC(communication.created_at)
    },

    checkCommunicationMatchesFilters (communication) {
      // if answer status filter is other than all
      if (this.filter.answer_status !== 'all') {
        // handle live & hold as a special case
        if (['live', 'hold', 'queued'].includes(this.filter.answer_status) && communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          return false
        }
        // check the communication disposition status matches the answer status filter
        if (this.filter.answer_status === 'answered' && communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          return false
        }
        if (this.filter.answer_status === 'unanswered' && ![CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW, CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW].includes(communication.disposition_status2)) {
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

    checkCommunicationMatchesCampaign (communication) {
      // checks if communication belongs to this campaign
      if (this.campaign_id) {
        if (communication.campaign_id !== this.campaign_id) {
          return false
        }
      }

      return true
    },

    checkCommunicationMatchesUser (communication) {
      // checks if communication belongs to this user
      if (this.user_id) {
        if (communication.user_id && communication.user_id !== this.user_id) {
          return false
        }
        // check if we have tried to call this user
        if (!communication.user_id && communication.target_users && !communication.target_users.find(userId => userId === this.user_id)) {
          return false
        }
      }

      return true
    },

    checkCommunicationMatchesWorkflow (communication) {
      // checks if communication belongs to this workflow
      if (this.workflow_id) {
        if (communication.workflow_id !== this.workflow_id) {
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
            if (communication[searchField].toString().indexOf(this.search_text) > -1) {
              return true
            }
          }
        }

        return false
      }

      return true
    },

    getPageNumbers () {
      if (!this.pagination || !this.pagination.to) {
        return []
      }
      let pagesArray = []
      for (let page = 1; page <= this.pagination.last_page; page++) {
        pagesArray.push(page)
      }
      return pagesArray
    },

    changePage (page) {
      if (this.paginationLoading) {
        return
      }

      let oldPage = this.pagination.current_page
      this.pagination.current_page = page
      this.filter.page = page
      this.paginationLoading = true
      this.getCommunications().then(res => {
        this.$emit('paginate')
        this.paginationLoading = false
      }).catch(err => {
        console.log(err)
        this.paginationLoading = false
        this.pagination.current_page = oldPage
        this.filter.page = oldPage
        this.getCommunications()
      })
    },

    nextPage () {
      if (this.paginationLoading) {
        return
      }

      if (this.pagination.current_page === this.pagination.last_page) {
        return
      }

      let oldPage = this.pagination.current_page
      this.pagination.current_page = oldPage + 1
      this.filter.page = this.pagination.current_page
      this.paginationLoading = true
      this.getCommunications().then(res => {
        this.$emit('paginate')
        this.paginationLoading = false
      }).catch(err => {
        console.log(err)
        this.paginationLoading = false
        this.pagination.current_page = oldPage
        this.filter.page = oldPage
      })
    },

    resetFilters () {
      this.communications = []
      this.filter = _.clone(Filters.DEFAULT_STATE.filter)
      this.filter.search_fields = this.searchFields
      this.filter.contact_id = this.contactId
      if (this.campaignId) {
        this.filter.campaign_id = this.campaignId
      }
      this.filter.type = this.filterType
      this.filter.page = 1
    }
  },

  watch: {
    contactId () {
      this.$emit('filterLoading')
      this.resetFilters()
      this.getCommunications().then(() => {
        this.$emit('loaded')
      }).finally(() => {
        this.$emit('filterLoaded')
      })
    },

    filterType () {
      this.$emit('filterLoading')
      this.resetFilters()
      this.getCommunications().then(() => {
        this.$emit('loaded')
      }).finally(() => {
        this.$emit('filterLoaded')
      })
    },

    campaignId () {
      this.$emit('filterLoading')
      this.resetFilters()
      this.getCommunications().then(() => {
        this.$emit('loaded')
      }).finally(() => {
        this.$emit('filterLoaded')
      })
    },

    searchText () {
      this.$emit('filterLoading')
      this.resetFilters()
      this.getCommunications().then(() => {
        this.$emit('loaded')
      }).finally(() => {
        this.$emit('filterLoaded')
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.contact-activities {
  & .contact-activity:last-child {
    margin-bottom: 0 !important;
  }
}
</style>
