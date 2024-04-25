import _ from 'lodash'
import * as Roles from '../../constants/roles'
import goBackMixin from './goback.mixin'
import { mapActions, mapState } from 'vuex'
import * as storage from 'src/plugins/helpers/storage'

export default _.merge({
  methods: {
    ...mapActions('auth', ['logout']),

    ...mapActions(['resetVuex']),

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
        source = this.profile
      } else {
        source = _.get(source, 'profile', null)
      }

      // if user is logged out of the system when session expires
      if (!source) {
        return false
      }

      // if user doesn't have permissions
      if (!source.user_permissions) {
        return false
      }

      if (Array.isArray(permissions)) {
        const permission = { index: null }
        for (permission.index of permissions) {
          if (!source.user_permissions.includes(permission.index)) {
            return false
          }
        }
        return true
      } else {
        return source.user_permissions.includes(permissions)
      }
    },

    hasRole (roles, source = null) {
      // this has been added to provide us with a way to check roles in beforeRouteEnter
      if (!source) {
        source = this.profile
      } else {
        source = _.get(source, 'profile', null)
      }

      // if user is logged out of the system when session expires
      if (!source) {
        return false
      }

      // if user doesn't have roles
      if (!source.user_roles) {
        return false
      }

      if (Array.isArray(roles)) {
        const role = { data: null }
        for (role.data of roles) {
          if (source.user_roles.includes(role.data)) {
            return true
          }
        }
        return false
      } else {
        return source.user_roles.includes(roles)
      }
    },

    isBlockedFrom (permissions) {
      let blockedAccess = []

      switch (this.usage?.plan?.use_case) {
        case 'iPro':
          blockedAccess = [
            'barge & whisper'
          ]
          break
        case 'uPro':
          // @todo
          blockedAccess = [
          ]
          break
        case 'xPro':
          // @todo
          blockedAccess = [
          ]
          break
      }

      if (Array.isArray(permissions)) {
        for (let permission of permissions) {
          if (blockedAccess.includes(permission)) {
            return true
          }
        }
        return false
      } else {
        return blockedAccess.includes(permissions)
      }
    },

    shouldShowUpgradeNow () {
      return !this.isSimpSocial()
    },

    hideMenu () {
      if (this.$refs && this.$refs.menu) {
          this.$refs.menu.hide()
      }
    },

    logoutAction () {
      try {
          this.hideMenu()
          const isImpersonating = storage.local.getItem('impersonate') === 'true'
          this.logout()
              .then(() => {
                  this.resetVuex(['all'])
                  if (isImpersonating) {
                      window.location.href = this.classicLogOutUrl
                  }
                  if (!isImpersonating) {
                      this.$router.push({ name: 'Login' })
                  }
              })
      } catch (err) {
          console.error(err)
      }
    }
  },
  computed: {
    ...mapState('auth', ['profile']),
    ...mapState('cache', ['currentCompany']),
    ...mapState(['usage']),

    hasReporterAccess () {
      return this.profile && this.profile.read_only_access
    },

    isAgent () {
      return this.hasRole(Roles.COMPANY_AGENT)
    },

    isAdmin () {
      return this.hasRole(Roles.COMPANY_ADMIN)
    },

    isSupervisor () {
      return this.hasRole(Roles.COMPANY_SUPERVISOR)
    },

    isAdminOrSupervisor () {
      return this.hasRole(Roles.COMPANY_ADMIN) || this.hasRole(Roles.COMPANY_SUPERVISOR)
    },
    /**
     * Decides if the Broadcast should be shown.
     *
     * @return {boolean}
     */
    shouldShowBroadcast () {
      if (this.currentCompany.bulk_sms_enabled || this.currentCompany.bulk_rvm_enabled) {
        return true
      }

      return false
    },

    /**
     * Decides if the Sequences should be shown.
     *
     * @return {boolean}
     */
    shouldShowSequences () {
      if (this.currentCompany.automation_enabled) {
        return true
      }

      return false
    },

    shouldSeeSequences () {
      if (!this.hasPermissionTo('view workflow')) {
        return false
      }

      if (!this.hasRole('Company Admin')) {
        return false
      }

      if (this.hasReporterAccess) {
        return false
      }

      if (this.currentCompany && this.currentCompany.reseller_id === 357 && !this.hasRole('Billing Admin')) {
        return false
      }

      return true
    },

    /**
     * Decides if the Calendar should be shown.
     *
     * @return {boolean}
     */
    shouldShowCalendar () {
      if (this.currentCompany.calendar_enabled) {
        return true
      }

      return false
    },

    /**
     * Decides if the PowerDialer should be shown.
     *
     * @return {boolean}
     */
    shouldShowPowerDialer () {
      if (this.currentCompany.auto_dialer_enabled) {
        return true
      }

      return false
    },

    logoutLabel() {
      return localStorage.getItem('impersonate') === 'true' ? 'Stop Impersonating' : 'Logout'
    },

    classicLogOutUrl () {
      return process.env.API_URL + '?from_talk_2=1&logout=1'
    },
  }
}, goBackMixin)
