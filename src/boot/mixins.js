import _ from 'lodash'
import randomColor from 'randomcolor'
import { Platform } from 'quasar'
import auth from './auth'
import { mapActions, mapState } from 'vuex'
import * as Carriers from '../constants/carriers'
import * as Roles from '../constants/roles'
import * as AgentStatus from '../constants/agent-status'
import * as CommunicationDirections from '../constants/communication-direction'
import * as CommunicationCurrentStatus from '../constants/communication-current-status'
import * as CommunicationDispositionStatus from '../constants/communication-disposition-status'
import * as CommunicationTypes from '../constants/communication-types'

export const dateMixin = {
  methods: {
    thirtyDaysAgo () {
      if (window.timezone) {
        return this.$moment.utc().tz(window.timezone).subtract(30, 'days').startOf('day')
      } else {
        return this.$moment.utc().local().subtract(30, 'days').startOf('day')
      }
    },

    localizedMoment (dt, format) {
      if (dt) {
        if (window.timezone) {
          return this.$moment(dt, format).utc().tz(window.timezone)
        } else {
          return this.$moment(dt, format).utc().local()
        }
      } else {
        if (window.timezone) {
          return this.$moment.tz(window.timezone)
        } else {
          return this.$moment.local()
        }
      }
    },

    utcToLocalizedMoment (dt) {
      if (dt) {
        if (window.timezone) {
          return this.$moment.utc(dt).tz(window.timezone)
        } else {
          return this.$moment.utc(dt).local()
        }
      } else {
        if (window.timezone) {
          return this.$moment.utc().tz(window.timezone)
        } else {
          return this.$moment.utc().local()
        }
      }
    }
  }
}

export const goBackMixin = {
  computed: {
    canGoBack () {
      return window.history.length > 1
    }
  },

  methods: {
    goBack: function () {
      if (this.canGoBack) {
        this.$router.go(-1)
      }
    }
  }
}

export const avatarMixin = {
  methods: {
    avatarStyle (name) {
      if (!name) {
        return
      }

      let bg = this.intToRGB(this.hashCode(name))
      return {
        backgroundColor: bg,
        color: this.overlayColor(bg)
      }
    },

    gradientGenerator (name) {
      if (!name) {
        return
      }

      let initials = this.getInitials(name)
      let color1 = randomColor({
        seed: initials[0].charCodeAt(0)
      })
      let color2 = randomColor({
        seed: initials[1].charCodeAt(0)
      })
      return {
        backgroundImage: `linear-gradient(to bottom, ${color1}, ${color2})`,
        color: this.overlayColor(color1)
      }
    },

    getInitials (name) {
      let initials = name.match(/\b\w/g) || []
      return ((initials.shift() || '') + (initials.pop() || '')).toUpperCase()
    },

    intToRGB (i) {
      let c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase()

      return '#' + '00000'.substring(0, 6 - c.length) + c
    },

    hashCode (str) {
      let hash = 0
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
      }
      return hash
    },

    overlayColor (color) {
      // if only first half of color is defined, repeat it
      if (color.length < 5) {
        color += color.slice(1)
      }
      return (color.replace('#', '0x')) > (0xffffff / 2) ? '#333' : '#fff'
    }
  }
}

export const webrtcMixin = {
  computed: {
    supportsWebrtc () {
      const browser = window.Bowser.getParser(window.navigator.userAgent)
      if (_.get(auth, 'user.profile.carrier_name') === Carriers.TWILIO) {
        return browser.satisfies({
          chrome: '>=56',
          firefox: '>=51',
          msedge: '>=38',
          safari: '>=11'
        })
      }
      return false
    }
  }
}

export const communicationMixin = {
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

export const htmlMixin = {
  methods: {
    sanitizeText (string) {
      if (string) {
        let entityMap = {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          '\'': '&#39;',
          '/': '&#x2F;',
          '`': '&#x60;',
          '=': '&#x3D;'
        }
        return String(string).replace(/[&<>"'`=/]/g, function (s) {
          return entityMap[s]
        })
      }
      return ''
    }
  }
}

export const communicationInfoMixin = {
  methods: {
    stateToTextColor: function (dispositionStatus, type) {
      let color = ''
      if (type === CommunicationTypes.CALL) {
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          color = 'has-text-info'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          color = 'has-text-success'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW) {
          color = 'has-text-primary'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW) {
          color = 'has-text-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          color = 'has-text-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          color = 'has-text-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_DEADEND_NEW) {
          color = 'has-text-warn'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW) {
          color = 'has-text-danger'
        }
      } else if (type === CommunicationTypes.SMS) {
        // if type is sms
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          color = 'has-text-info'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          color = 'has-text-success'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          color = 'has-text-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          color = 'has-text-danger'
        }
      } else {
        // if type is voicemail
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          color = 'has-text-info'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          color = 'has-text-success'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          color = 'has-text-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          color = 'has-text-danger'
        }
      }

      return color
    },

    stateToColor: function (dispositionStatus, type) {
      let color = ''
      if (type === CommunicationTypes.CALL) {
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          color = 'is-info'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          color = 'is-success'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW) {
          color = 'is-primary'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW) {
          color = 'is-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          color = 'is-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          color = 'is-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_DEADEND_NEW) {
          color = 'is-warn'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW) {
          color = 'is-danger'
        }
      } else if (type === CommunicationTypes.SMS) {
        // if type is sms
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          color = 'is-info'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          color = 'is-success'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          color = 'is-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          color = 'is-danger'
        }
      } else {
        // if type is voicemail
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          color = 'is-info'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          color = 'is-success'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          color = 'is-danger'
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          color = 'is-danger'
        }
      }

      return color
    },

    stateToIcon: function (dispositionStatus, type, direction = null) {
      let icon = ''
      if (type === CommunicationTypes.CALL) {
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          icon += `<i class="mdi mdi-phone-in-talk"></i>`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          icon += `<i class="mdi mdi-phone-hangup"></i>`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW) {
          icon += `<i class="mdi mdi-phone-missed"></i>`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW) {
          icon += `<i class="mdi mdi-phone-missed"></i>`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          icon += `<i class="mdi mdi-phone-locked"></i>`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          icon += `<i class="mdi mdi-phone-locked"></i>`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_DEADEND_NEW) {
          icon += `<i class="mdi mdi-block-helper"></i>`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW) {
          icon += `<i class="mdi mdi-voicemail"></i>`
        } else {
          icon += dispositionStatus
        }
      } else if (type === CommunicationTypes.SMS) {
        // if type is sms
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          icon += `<i class="mdi mdi-message-text-outline"></i>`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          icon += `<i class="mdi mdi-message-text-outline"></i>`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          icon += `<i class="mdi mdi-message-text-outline"></i>`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          icon += `<i class="mdi mdi-message-text-outline"></i>`
        } else {
          icon += dispositionStatus
        }
      } else {
        // if type is voicemail
        if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
          icon += `<i class="mdi mdi-voicemail"></i>`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
          icon += `<i class="mdi mdi-voicemail"></i>`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
          icon += `<i class="mdi mdi-voicemail"></i>`
        } else if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW) {
          icon += `<i class="mdi mdi-voicemail"></i>`
        } else {
          icon += dispositionStatus
        }
      }

      if (direction && direction === CommunicationDirections.INBOUND) {
        icon += `<i class="mdi mdi-call-received"></i>`
      }

      if (direction && direction === CommunicationDirections.OUTBOUND) {
        icon += `<i class="mdi mdi-call-made"></i>`
      }

      return icon
    },

    rejectionToIcon: function (rejectionReason) {
      switch (rejectionReason) {
        case this.REJECTION_REASON_BLOCKED:
          return '<i class="mdi mdi-phone-locked"></i>'
        case this.REJECTION_REASON_CREDITS:
          return '<i class="mdi currency-usd-off"></i>'
        case this.REJECTION_REASON_OTHER:
          return '<i class="mdi alert"></i>'
        case this.REJECTION_REASON_USER_NOT_FOUND:
          return '<i class="mdi alert-circle"></i>'
        case this.REJECTION_REASON_FAILED:
          return '<i class="mdi alert-circle"></i>'
      }
    },

    rejectionTooltipData (rejectionReason) {
      switch (rejectionReason) {
        case this.REJECTION_REASON_BLOCKED:
          return 'Could not route: the contact is blocked, if you want to take the call please unblock the contact from either the contacts section or from blocked contacts tab in company page.'
        case this.REJECTION_REASON_CREDITS:
          return 'Could not route: account doesn\'t have enough credits, please recharge your account or contact support.'
        case this.REJECTION_REASON_OTHER:
          return 'Could not route: please contact support.'
        case this.REJECTION_REASON_USER_NOT_FOUND:
          return 'Could not route: no eligible users can be found, please check your line\'s routing settings. Check notes for more information.'
        case this.REJECTION_REASON_FAILED:
          return 'Could not route: our carrier could not route this communication, please make sure the phone number is in service'
      }
    },

    getAttemptingClass (attemptingUser, dispositionStatus, userId) {
      if (userId && userId === attemptingUser && dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED) {
        return 'text-dark-greenish'
      } else if (userId && userId !== attemptingUser && dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED) {
        return 'text-muted'
      } else if (userId && userId !== attemptingUser && dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS) {
        return 'text-muted'
      } else if (userId && userId === attemptingUser && dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS) {
        return 'text-indigo-500'
      } else {
        return 'text-danger'
      }
    },

    dispositionTooltipData (dispositionStatus, type, direction = null) {
      if (dispositionStatus === CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW && direction === CommunicationDirections.INBOUND) {
        return 'Voicemail'
      }
      if (type === CommunicationTypes.RVM && direction === CommunicationDirections.OUTBOUND) {
        return 'RVM'
      }
      return this.$options.filters.capitalize(this.$options.filters.replaceDash(this.$options.filters.translateDispositionStatusText(dispositionStatus))) + ' ' + this.$options.filters.fixCommDirection(direction) + ' ' + this.$options.filters.fixCommType(type)
    }
  }
}

let _aclMixin = {
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
      if (!source.user || !source.user.profile || !source.user.profile.user_permissions) {
        return false
      }

      if (Array.isArray(permissions)) {
        for (let permission of permissions) {
          if (!source.user.profile.user_permissions.includes(permission)) {
            return false
          }
        }
        return true
      } else {
        return source.user.profile.user_permissions.includes(permissions)
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
      if (!source.user || !source.user.profile || !source.user.profile.user_roles) {
        return false
      }

      if (Array.isArray(roles)) {
        for (let role of roles) {
          if (!source.user.profile.user_roles.includes(role)) {
            return false
          }
        }
        return true
      } else {
        return source.user.profile.user_roles.includes(roles)
      }
    }
  },
  computed: {
    isAdmin () {
      return this.hasRole(Roles.COMPANY_ADMIN)
    }
  }
}

_aclMixin = _.merge(_aclMixin, goBackMixin)
export const aclMixin = _aclMixin

export const agentMixin = {
  data () {
    return {
      agentStatus: auth.user.profile.agent_status,
      loadingAgentStatus: false,
      AgentStatus
    }
  },

  computed: {
    ...mapState(['oldAgentStatus']),

    color () {
      switch (this.auth.user.profile.agent_status) {
        case AgentStatus.AGENT_STATUS_OFFLINE:
          return 'blue-grey-6'
        case AgentStatus.AGENT_STATUS_ACCEPTING_CALLS:
          return 'green-6'
        case AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS:
          return 'red-6'
        case AgentStatus.AGENT_STATUS_ON_BREAK:
          return 'orange-6'
        case AgentStatus.AGENT_STATUS_ON_CALL:
          return 'light-blue-6'
        case AgentStatus.AGENT_STATUS_ON_WRAP_UP:
          return 'yellow-6'
        case AgentStatus.AGENT_STATUS_RINGING:
          return 'lime-13'
        case AgentStatus.AGENT_STATUS_AUTO_DIAL:
          return 'white'
        case AgentStatus.AGENT_STATUS_SENTRY:
          return 'dark'
        default:
          return 'grey-6'
      }
    }
  },

  created () {
    this.$VueEvent.listen('user_updated', (user) => {
      if (this.auth && this.auth.user && this.auth.user.profile && user.id === this.auth.user.profile.id && this.auth.user.profile.agent_status !== user.agent_status) {
        this.auth.user.profile.agent_status = user.agent_status
        this.agentStatus = user.agent_status
        console.log('Changed agent status: ' + user.agent_status)
      }
    })

    this.$VueEvent.listen('change_agent_status', (agentStatus) => {
      this.changeAgentStatus(agentStatus)
    })

    if (!window.agentStatusIntervalId) {
      window.agentStatusIntervalId = setInterval(() => {
        // this is a recursive agent status check with 3 retries
        this.getAgentStatus()
      }, 60 * 1000)
    }
  },

  methods: {
    getAgentStatus (getTry = 1) {
      if (!this.auth.user.authenticated) {
        return
      }
      let deviceInfo = null
      const isMobile = Platform.is.cordova
      if (isMobile) {
        deviceInfo = {
          registration_id: localStorage.getItem('registrationId'),
          registration_type: localStorage.getItem('registrationType'),
          model: window.device.model,
          platform: window.device.platform,
          is_virtual: window.device.isVirtual,
          uuid: window.device.uuid,
          version: window.device.version,
          manufacturer: window.device.manufacturer,
          serial: window.device.serial,
          app_version: localStorage.getItem('version')
        }
      }
      this.$axios.post('/api/v1/profile/get-agent-status', {
        device_info: deviceInfo
      }).then(res => {
        this.auth.user.profile.agent_status = res.data.agent_status
        this.agentStatus = res.data.agent_status
      }).catch((err) => {
        console.log(err)
        getTry++
        // check if we could get agent status after 3 retries
        if (getTry > 3) {
          // error
          this.$Sentry.captureException(err)
        } else {
          this.getAgentStatus(getTry)
        }
      })
    },

    resetAgentStatus () {
      let agentStatus
      switch (this.oldAgentStatus) {
        case AgentStatus.AGENT_STATUS_OFFLINE:
          agentStatus = AgentStatus.AGENT_STATUS_OFFLINE
          break
        case AgentStatus.AGENT_STATUS_ON_BREAK:
          agentStatus = AgentStatus.AGENT_STATUS_ON_BREAK
          break
        case AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS:
          agentStatus = AgentStatus.AGENT_STATUS_NOT_ACCEPTING_CALLS
          break
        default:
          agentStatus = AgentStatus.AGENT_STATUS_ACCEPTING_CALLS
          break
      }
      console.log('old agent status: ' + this.oldAgentStatus)
      console.log('current agent status: ' + this.agentStatus)
      console.log('new agent status: ' + agentStatus)
      // check status
      if (this.agentStatus !== agentStatus) {
        this.changeAgentStatus(agentStatus)
      }
    },

    changeAgentStatus (val, changeAgentStatusTry = 1) {
      if (!this.auth.user.authenticated) {
        return
      }
      if (val !== undefined && ![AgentStatus.AGENT_STATUS_ON_WRAP_UP, AgentStatus.AGENT_STATUS_ON_CALL, AgentStatus.AGENT_STATUS_RINGING].includes(val)) {
        console.log('Setting old agent status: ' + val)
        this.setOldAgentStatus(val)
      }
      console.log('Changing agent status: ' + val)

      // make sure that the session is valid
      if (this.auth && this.auth.user && this.auth.user.profile) {
        this.loadingAgentStatus = true
        this.$axios.post('/api/v1/user/' + this.auth.user.profile.id + '/agent-status', {
          agent_status: val
        }).then(res => {
          this.loadingAgentStatus = false
          this.auth.user.profile.agent_status = res.data.agent_status
          this.agentStatus = res.data.agent_status
          console.log('Changed agent status: ' + res.data.agent_status)
          this.$VueEvent.fire('user_updated', res.data)
          if (this.agentStatus !== AgentStatus.AGENT_STATUS_ON_WRAP_UP) {
            this.$VueEvent.fire('endWrapUp')
          }
        }).catch(err => {
          changeAgentStatusTry++
          // error
          console.log('An error occurred while changing agent status', err)
          // check if we have found the communication after 3 retries
          if (changeAgentStatusTry > 3) {
            this.loadingAgentStatus = false
          } else {
            this.changeAgentStatus(val, changeAgentStatusTry)
          }
        })
      }
    },

    ...mapActions(['setOldAgentStatus'])
  }
}
