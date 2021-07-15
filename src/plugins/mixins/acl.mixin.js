import _ from 'lodash'
import * as Roles from '../../constants/roles'
import goBackMixin from './goback.mixin'
import { mapState } from 'vuex'

export default _.merge({
  methods: {
    /*
        * Updated on 06/11/2018
        * Campaign Permissions:
        *
        * 'list campaign'
        * 'view campaign'
        * 'create campaign'
        * 'update campaign'
        * 'archive campaign'
        * 'restore campaign'
        * 'toggle active status campaign'
        * 'upload file campaign'
        * 'delete file campaign'

        * Communication Permissions:
        *
        * 'list communication'
        * 'view communication'
        * 'tag communication'
        * 'note communication'

        * Company Permissions:
        *
        * 'list company'
        * 'view company'
        * 'create company'
        * 'update company'
        * 'archive company'
        * 'restore company'
        * 'change current company'
        * 'change integration settings company'
        * 'see integration details company'

        * Contact Permissions:
        *
        * 'list contact'
        * 'view contact'
        * 'update contact'
        * 'archive contact'
        * 'restore contact'
        * 'toggle block contact'

        * Destination Number Permissions:
        *
        * 'list destination number'
        * 'view destination number'
        * 'create destination number'
        * 'update destination number'
        * 'archive destination number'
        * 'restore destination number'
        * 'toggle active destination number'

        * Filter Permissions:
        *
        * 'list filter'
        * 'view filter'
        * 'create filter'
        * 'update filter'
        * 'archive filter'
        * 'restore filter'

        * Report Permissions:
        *
        * 'list report'

        * Tag Permissions:
        *
        * 'list tag'
        * 'view tag'
        * 'create tag'
        * 'update tag'
        * 'delete tag'

        * User Permissions:
        *
        * 'list user'
        * 'view user'
        * 'create user'
        * 'update user'
        * 'archive user'
        * 'restore user'
        * 'toggle active user'

        * Telephony Permissions:
        *
        * 'send sms'
        * 'answer call'
        * 'make call'

        * Billing Permissions:
        *
        * 'add credit card'
        * 'change plan'
        * 'buy credits'
        * 'see usage page'
        * 'see chargebee portal'
         */
    hasPermissionTo (permissions, source = null) {
      // this has been added to provide us with a way to check permissions in beforeRouteEnter
      if (!source) {
        source = this.auth
      }

      // if user is logged out of the system when session expires
      if (!source) {
        return false
      }

      // if user doesn't have permissions
      if (!source.profile || !source.profile || !source.profile.user_permissions) {
        return false
      }

      if (Array.isArray(permissions)) {
        for (let permission of permissions) {
          if (!source.profile.user_permissions.includes(permission)) {
            return false
          }
        }
        return true
      } else {
        return source.profile.user_permissions.includes(permissions)
      }
    },

    hasRole (roles, source = null) {
      // this has been added to provide us with a way to check roles in beforeRouteEnter
      if (!source) {
        source = this.auth
      }

      // if user is logged out of the system when session expires
      if (!source) {
        return false
      }

      // if user doesn't have roles
      if (!source.profile || !source.profile.user_roles) {
        return false
      }

      if (Array.isArray(roles)) {
        for (let role of roles) {
          if (!source.profile.user_roles.includes(role)) {
            return false
          }
        }
        return true
      } else {
        return source.profile.user_roles.includes(roles)
      }
    }
  },
  computed: {
    ...mapState(['auth']),
    isAdmin () {
      return this.hasRole(Roles.COMPANY_ADMIN)
    }
  }
}, goBackMixin)
