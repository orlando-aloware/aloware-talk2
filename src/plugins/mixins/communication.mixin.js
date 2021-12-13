import _ from 'lodash'
import * as CommunicationCurrentStatus from '../../constants/communication-current-status'
import * as ContactAccessTypes from '../../constants/contact-access-types'
import * as CommunicationAccessTypes from '../../constants/communication-access-types'
import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters('auth', ['profile'])
  },
  methods: {
    checkCommunicationMatchesUserAccessibility (communication) {
      // check auth exists to prevent js errors
      if (!this.auth || !this.auth.profile) {
        return false
      }

      // checks if accessible_campaigns is available and then looks for communication campaign_id in that array
      if (this.auth.profile.accessible_campaigns && this.auth.profile.line_access_limit && communication.campaign_id && !this.auth.profile.accessible_campaigns.includes(communication.campaign_id)) {
        return false
      }

      // checks if accessible_users is available and then looks for communication user_id in that array
      if (this.auth.profile.accessible_users && this.auth.profile.user_access_limit && communication.user_id && !this.auth.profile.accessible_users.includes(communication.user_id)) {
        return false
      }

      // checks if accessible_users is available and then looks for an intersection between accessible_users and attempting_users
      if (this.auth.profile.accessible_users && this.auth.profile.user_access_limit && communication.attempting_users && [CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW, CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW].includes(communication.current_status2) && _.intersection(this.auth.profile.accessible_users, communication.attempting_users).length === 0) {
        return false
      }

      // checks if communication matches user communication visibility
      if (this.auth.profile.communications_visibility === CommunicationAccessTypes.COMMUNICATIONS_OWNED_ONLY && communication.used_id && communication.used_id !== this.auth.profile.id) {
        return false
      }

      // focus mode
      if (this.auth.profile.focus_mode) {
        // checks if communication's contact is owned by the user
        if (communication.contact && communication.contact.user_id && communication.contact.user_id !== this.auth.profile.id) {
          return false
        }

        // if contact does not have an owner
        if (communication.contact && !communication.contact.user_id) {
          return false
        }

        // if contact does not exist
        if (!communication.contact) {
          return false
        }
      }

      // ring group only access
      if (this.auth.profile.contacts_visibility === ContactAccessTypes.CONTACTS_ACCESS_RING_GROUP) {
        // if user does not have unassigned access
        if (communication.contact && !communication.contact.user_id && !this.auth.profile.can_view_unassigned_contacts) {
          return false
        }

        // if contact does not exist
        if (!communication.contact) {
          return false
        }

        // @todo for ring group only access (UI doesn't know that contact relationship with ring groups at this stage)
      }

      // owned only access
      if (this.auth.profile.contacts_visibility === ContactAccessTypes.CONTACTS_ACCESS_OWNED_ONLY) {
        // if user does not have unassigned access
        if (communication.contact && !communication.contact.user_id && !this.auth.profile.can_view_unassigned_contacts) {
          return false
        }

        // checks if communication's contact is owned by the user
        if (communication.contact && communication.contact.user_id && communication.contact.user_id !== this.auth.profile.id) {
          return false
        }

        // if contact does not exist
        if (!communication.contact) {
          return false
        }
      }

      // jon's agents has limited access to messages and contacts
      if (this.auth.user.profile.company_id === 11 && this.hasRole('Company Reporter Access')) {
        // checks if communication matches contact's user visibility
        if (communication.contact.user_id && communication.contact.user_id !== this.auth.user.profile.id) {
          return false
        }

        // checks if communication matches user visibility
        if (communication.owner_id && communication.owner_id !== this.auth.user.profile.id) {
          return false
        }
      }

      return true
    },

    checkContactMatchesUserAccessibility (contact) {
      // check auth exists to prevent js errors
      if (!this.auth || !this.auth.profile) {
        return false
      }

      // checks if contact matches user visibility
      if (contact.user_id !== this.auth.profile.id) {
        return false
      }

      return true
    }
  }
}
