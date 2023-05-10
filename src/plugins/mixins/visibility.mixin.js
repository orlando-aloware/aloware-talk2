import _ from 'lodash'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import { mapState } from 'vuex'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationAccessTypes from 'src/constants/communication-access-types'
import * as ContactAccessTypes from 'src/constants/contact-access-types'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as CommunicationDirections from 'src/constants/communication-direction'

export default {
  data () {
    return {
      searchFields: ['contact.phone_number', 'contact.name']
    }
  },

  computed: {
    ...mapState('auth', [
      'profile'
    ]),
    ...mapState('inbox', [
      'inboxShowMyContacts'
    ]),
    ...mapState([
      'ringGroups'
    ])
  },

  methods: {
    checkCommunicationMatchesSearch (searchText, communication) {
      // checks if communication matches search
      if (!_.isEmpty(searchText) && this.searchText.trim().length > 0) {
        const searchField = { field: null }
        for (searchField.field of this.searchFields) {
          if (communication[searchField.field]) {
            if (communication[searchField.field].toString().indexOf(searchText) > -1) {
              return true
            }
          }
        }

        return false
      }

      return true
    },

    checkCommunicationMatchesFilters (filter, communication, forInbox = false) {
      // if answer status filter is other than all
      if (filter.answer_status !== undefined &&
        filter.answer_status !== 'all') {
        // handle live & hold as a special case
        if (['live', 'hold', 'queued'].includes(filter.answer_status) &&
          communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          return false
        }
        // check the communication disposition status matches the answer status filter
        if (filter.answer_status === 'answered' &&
          communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          return false
        }
        if (filter.answer_status === 'unanswered' &&
          ![
            CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW,
            CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW,
            CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW
          ].includes(communication.disposition_status2)) {
          return false
        }
        if (filter.answer_status === 'missed' &&
          communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW) {
          return false
        }
        if (filter.answer_status === 'abandoned' &&
          communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW) {
          return false
        }
        if (filter.answer_status === 'voicemail' &&
          ![
            CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW,
            CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW,
            CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW
          ].includes(communication.disposition_status2)) {
          return false
        }
        if (filter.answer_status === 'in-progress' &&
          communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          return false
        }
        if (filter.answer_status === 'failed' &&
          communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          return false
        }
        if (filter.answer_status === 'deadend' &&
          communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_DEADEND_NEW) {
          return false
        }
      }
      // if campaign filter is selected
      if (filter.campaigns !== undefined &&
        filter.campaigns.length > 0) {
        // check the communication campaign matches the campaign filter
        if (filter.campaigns.indexOf(communication.campaign_id) < 0) {
          return false
        }
      }
      // if workflow filter is selected
      if (filter.workflows !== undefined &&
        filter.workflows.length > 0) {
        // check the communication campaign matches the campaign filter
        if (filter.workflows.indexOf(communication.workflow_id) < 0) {
          return false
        }
      }
      // if user filter is selected
      if (filter.users !== undefined &&
        filter.users.length > 0) {
        // check the communication user matches the user filter
        if (filter.users.indexOf(communication.user_id) < 0) {
          return false
        }
      }
      // if owner filter is selected
      if (filter.owners !== undefined &&
        filter.owners.length > 0) {
        // check the communication owner matches the owner filter
        if (filter.owners.indexOf(communication.owner_id) < 0) {
          return false
        }
      }
      // if contact owner filter is selected
      if (filter.contact_owner !== undefined &&
        filter.contact_owner.length > 0 && communication.contact) {
        // check the communication's contact owner matches the contact owner filter
        if (filter.contact_owner.indexOf(communication.contact.user_id) < 0) {
          return false
        }
      }
      // if my contact or inbox's show my contacts filter is active
      if (
        ((filter.my_contact !== undefined &&
            filter.my_contact) ||
          (forInbox &&
            this.inboxShowMyContacts)) &&
        communication.contact) {
        // check the communication's contact owner matches the current user
        if (communication.contact.user_id !== this.profile.id) {
          return false
        }
      }
      // if number filter is selected
      if (filter.incoming_numbers !== undefined &&
        filter.incoming_numbers.length > 0) {
        // check the communication number matches the number filter
        if (filter.incoming_numbers.indexOf(communication.incoming_number_id) < 0) {
          return false
        }
      }
      // if ring groups filter is selected
      if (filter.ring_groups !== undefined &&
        filter.ring_groups.length > 0) {
        // check the communication ring group matches the ring group filter
        if (filter.ring_groups.indexOf(communication.ring_group_id) < 0) {
          return false
        }
      }
      // if broadcasts filter is selected
      if (filter.broadcasts !== undefined &&
        filter.broadcasts.length > 0) {
        // check the communication broadcast matches the broadcast filter
        if (filter.broadcasts.indexOf(communication.broadcast_id) < 0) {
          return false
        }
      }
      // if direction filter is selected
      if (filter.direction !== undefined &&
        filter.direction !== 'all') {
        // check the communication direction matches the direction filter
        if (filter.direction === 'inbound' &&
          communication.direction !== CommunicationDirections.INBOUND) {
          return false
        }
        if (filter.direction === 'outbound' &&
          communication.direction !== CommunicationDirections.OUTBOUND) {
          return false
        }
      }
      // checks first time conversations filter is selected and matches the communication
      if (filter.first_time_only !== undefined &&
        filter.first_time_only &&
        !communication.first_time_caller) {
        return false
      }
      // checks date range filter matches communication start time
      if (filter.from_date !== undefined &&
        filter.to_date !== undefined &&
        filter.from_date &&
        filter.to_date &&
        this.$options.filters.utcToLocalizedMoment(communication.created_at).isBetween(filter.from_date, filter.to_date)) {
        return false
      }
      // checks min talk time filter matches communication talk time
      if (filter.min_talk_time !== undefined &&
        filter.min_talk_time > communication.talk_time) {
        return false
      }
      // if type of communication filter is selected
      if (filter.type !== undefined &&
        filter.type !== 'all') {
        // check type of communication matches the type of communication filter
        if (filter.type === 'call' &&
          communication.type !== CommunicationTypes.CALL) {
          return false
        }
        if (filter.type === 'sms' &&
          communication.type !== CommunicationTypes.SMS) {
          return false
        }
        if (filter.type === 'email' &&
          communication.type !== CommunicationTypes.EMAIL) {
          return false
        }
        if (filter.type === 'fax' &&
          communication.type !== CommunicationTypes.FAX) {
          return false
        }
      }
      // checks tags filter matches communication tags
      if (filter.tags !== undefined &&
        filter.tags.length > 0 &&
        communication.tags.length <= 0) {
        return false
      }
      // checks untagged only filter matches communication tags
      if (filter.untagged_only !== undefined &&
        filter.untagged_only &&
        communication.tags.length > 0) {
        return false
      }
      // checks exclude automated communications filter and matches the communication
      return !(filter.exclude_automated_communications !== undefined &&
        filter.exclude_automated_communications &&
        communication.workflow_id)
    },

    checkCommunicationMatchesUserAccessibility (communication) {
      // check auth exists to prevent js errors
      if (!this.profile) {
        return false
      }

      // checks if accessible_campaigns is available and then looks for communication campaign_id in that array
      if (this.profile.accessible_campaigns &&
        this.profile.line_access_limit &&
        communication.campaign_id &&
        !this.profile.accessible_campaigns.includes(communication.campaign_id)) {
        return false
      }

      // checks if accessible_users is available and then looks for communication user_id in that array
      if (this.profile.accessible_users &&
        this.profile.user_access_limit &&
        communication.user_id &&
        !this.profile.accessible_users.includes(communication.user_id)) {
        return false
      }

      // checks if accessible_users is available and then looks for an intersection between accessible_users and attempting_users
      if (this.profile.accessible_users &&
        this.profile.user_access_limit &&
        communication.attempting_users &&
        [
          CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW
        ].includes(communication.current_status2) &&
        _.intersection(this.profile.accessible_users, communication.attempting_users).length === 0) {
        return false
      }

      // checks if communication matches user communication visibility
      if (this.profile.communications_visibility === CommunicationAccessTypes.COMMUNICATIONS_OWNED_ONLY &&
        communication.user_id &&
        communication.user_id !== this.profile.id) {
        return false
      }

      // focus mode
      // if (this.profile.focus_mode) {
      //   // checks if communication's contact is owned by the user
      //   if (communication.contact &&
      //     communication.contact.user_id &&
      //     communication.contact.user_id !== this.profile.id) {
      //     return false
      //   }
      //
      //   // if contact does not have an owner
      //   if (communication.contact &&
      //     !communication.contact.user_id) {
      //     return false
      //   }
      //
      //   // if contact does not exist
      //   if (!communication.contact) {
      //     return false
      //   }
      // }

      // ring group only access
      if (this.profile.contacts_visibility === ContactAccessTypes.CONTACTS_ACCESS_RING_GROUP) {
        // if user does not have unassigned access
        if (this.isUserDoesntHaveUnassignedAccess(communication, 'communication')) {
          return false
        }

        // if contact does not exist
        if (!communication.contact) {
          return false
        }

        // @todo for ring group only access (UI doesn't know that contact relationship with ring groups at this stage)
      }

      // team only access
      if (this.profile.contacts_visibility === ContactAccessTypes.CONTACTS_ACCESS_TEAM) {
        // if user does not have unassigned access
        if (this.isUserDoesntHaveUnassignedAccess(communication, 'communication')) {
          return false
        }

        // checks if user is part of the communication's ring group
        if (communication.ring_group_id && !this.profile.ring_group_ids.includes(communication.ring_group_id)) {
          return false
        }

        // checks if communication's contact is owned by the team
        if (communication.contact && communication.contact.user_id) {
          for (let ringGroupId of this.profile.ring_group_ids) {
            let ringGroup = this.getRingGroup(ringGroupId)

            if (ringGroup && ringGroup.user_ids.includes(communication.contact.user_id)) {
              return true
            }
          }
        }

        // if contact does not exist
        if (!communication.contact) {
          return false
        }
      }

      // owned only access
      if (this.profile.contacts_visibility === ContactAccessTypes.CONTACTS_ACCESS_OWNED_ONLY) {
        // if user does not have unassigned access
        if (this.isUserDoesntHaveUnassignedAccess(communication, 'communication')) {
          return false
        }

        // checks if communication's contact is owned by the user
        if (communication.contact &&
          communication.contact.user_id &&
          communication.contact.user_id !== this.profile.id) {
          return false
        }

        // if contact does not exist
        if (!communication.contact) {
          return false
        }
      }

      // jon's agents has limited access to messages and contacts
      if (this.profile.company_id === 11 &&
        this.hasRole('Company Reporter Access')) {
        // checks if communication matches contact's user visibility
        if (communication.contact.user_id &&
          communication.contact.user_id !== this.profile.id) {
          return false
        }

        // checks if communication matches user visibility
        if (communication.owner_id &&
          communication.owner_id !== this.profile.id) {
          return false
        }
      }

      return true
    },

    checkCommunicationMatchesCampaign (campaignId, communication) {
      // checks if communication belongs to this campaign
      if (campaignId) {
        if (communication.campaign_id !== campaignId) {
          return false
        }
      }

      return true
    },

    checkCommunicationMatchesWorkflow (workflowId, communication) {
      // checks if communication belongs to this workflow
      if (workflowId) {
        if (communication.workflow_id !== workflowId) {
          return false
        }
      }

      return true
    },

    checkCommunicationMatchesUser (userId, communication) {
      // checks if communication belongs to this user
      if (userId) {
        if (communication.user_id &&
          communication.user_id !== userId) {
          return false
        }
        // check if we have tried to call this user
        if (!communication.user_id &&
          communication.target_users &&
          !communication.target_users.find(targetUserId => targetUserId === userId)) {
          return false
        }
      }

      return true
    },

    checkCommunicationMatchesRingGroup (ringGroupId, communication) {
      // checks if communication belongs to this ring group
      if (ringGroupId) {
        if (communication.ring_group_id !== ringGroupId) {
          return false
        }
      }

      return true
    },

    checkCommunicationMatchesBroadcast (broadcastId, communication) {
      // checks if communication belongs to this broadcast
      if (broadcastId) {
        if (communication.broadcast_id !== broadcastId) {
          return false
        }
      }

      return true
    },

    checkAgentContactVisibility (contact) {
      // ring group only access
      if (this.profile && this.profile.contacts_visibility === ContactAccessTypes.CONTACTS_ACCESS_RING_GROUP) {
        // if user does not have unassigned access
        if (this.isUserDoesntHaveUnassignedAccess(contact, 'contact')) {
          return false
        }

        // @todo for ring group only access (UI doesn't know that contact relationship with ring groups at this stage)
      }

      // owned only access
      if (this.profile && this.profile.contacts_visibility === ContactAccessTypes.CONTACTS_ACCESS_OWNED_ONLY) {
        // if user does not have unassigned access
        if (this.isUserDoesntHaveUnassignedAccess(contact, 'contact')) {
          return false
        }

        // checks if communication's contact is owned by the user
        if (contact.user_id && contact.user_id !== this.profile.id) {
          return false
        }
      }

      return true
    },

    checkMentionMatchesUserAccessibility (mention) {
      // checks if communication matches user communication visibility
      if (this.profile.communications_visibility === CommunicationAccessTypes.COMMUNICATIONS_OWNED_ONLY &&
        mention.mentioner_user_id &&
        mention.mentioner_user_id !== this.profile.id) {
        return false
      }

      // ring group only access
      if (this.profile.contacts_visibility === ContactAccessTypes.CONTACTS_ACCESS_RING_GROUP) {
        // if contact does not exist
        if (!mention.contact) {
          return false
        }

        // if user does not have unassigned access
        if (this.isUserDoesntHaveUnassignedAccess(mention, 'mention')) {
          return false
        }

        // @todo for ring group only access (UI doesn't know that contact relationship with ring groups at this stage)
      }

      // owned only access
      if (this.profile.contacts_visibility === ContactAccessTypes.CONTACTS_ACCESS_OWNED_ONLY) {
        // if contact does not exist
        if (!mention.contact) {
          return false
        }

        // if user does not have unassigned access
        if (this.isUserDoesntHaveUnassignedAccess(mention, 'mention')) {
          return false
        }

        // checks if communication's contact is owned by the user
        if (mention.contact &&
          mention.contact.user_id &&
          mention.contact.user_id !== this.profile.id) {
          return false
        }
      }

      return true
    },

    checkContactMatchesUserAccessibility (contact) {
      // check auth exists to prevent js errors
      if (!this.profile) {
        return false
      }

      // checks if contact matches user visibility
      return contact.user_id === this.profile.id
    },

    checkCommunicationRingGroupHasCurrentUser (ringGroupId) {
      if (!ringGroupId) {
        return false
      }

      const found = this.getRingGroup(ringGroupId)

      if (!found) {
        return false
      }

      const keys = Object.keys(found.ordered_user_ids)
      for (const key of keys) {
        if (found.ordered_user_ids[key].includes(this.profile.id)) {
          return true
        }
      }

      return false
    },

    getRingGroup (id) {
      return id ? this.ringGroups.find(ringGroup => ringGroup.id === id) : null
    },

    isUserDoesntHaveUnassignedAccess (data, type) {
      if (type === 'contact') {
        return !data.user_id && !this.profile.can_view_unassigned_contacts
      }

      return data.contact &&
        !data.contact.user_id &&
        !this.profile.can_view_unassigned_contacts
    }
  }
}
