import _ from 'lodash'
import auth from './../../boot/auth'
import * as CommunicationCurrentStatus from '../../constants/communication-current-status'

export default {
  data () {
    return {
      auth
    }
  },
  methods: {
    checkCommunicationMatchesUserAccessibility (communication) {
      // check auth exists to prevent js errors
      if (!this.auth || !this.auth.user || !this.auth.user.profile) {
        return false
      }
      // checks if accessible_campaigns is available and then looks for communication campaign_id in that array
      if (this.auth.user.profile.accessible_campaigns && communication.campaign_id && !this.auth.user.profile.accessible_campaigns.includes(communication.campaign_id)) {
        return false
      }

      // checks if accessible_users is available and then looks for communication user_id in that array
      if (this.auth.user.profile.accessible_users && communication.user_id && !this.auth.user.profile.accessible_users.includes(communication.user_id)) {
        return false
      }

      // checks if accessible_users is available and then looks for an intersection between accessible_users and attempting_users
      if (this.auth.user.profile.accessible_users && communication.attempting_users && [CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW, CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW].includes(communication.current_status2) && _.intersection(this.auth.user.profile.accessible_users, communication.attempting_users).length === 0) {
        return false
      }

      // jon's agents has limited access to messages and contacts
      if ((this.auth.user.profile.company_id === 11 && this.hasRole('Company Reporter Access'))) {
        // checks if communication matches contact's user visibility
        if (communication.contact.user_id) {
          if (communication.contact.user_id !== this.auth.user.profile.id) {
            return false
          }
        }

        // checks if communication matches user visibility
        if (communication.owner_id) {
          if (communication.owner_id !== this.auth.user.profile.id) {
            return false
          }
        }
      }

      return true
    },

    checkContactMatchesUserAccessibility (contact) {
      // check auth exists to prevent js errors
      if (!this.auth || !this.auth.user || !this.auth.user.profile) {
        return false
      }

      // checks if contact matches user visibility
      if (contact.user_id !== this.auth.user.profile.id) {
        return false
      }

      return true
    }
  }
}
