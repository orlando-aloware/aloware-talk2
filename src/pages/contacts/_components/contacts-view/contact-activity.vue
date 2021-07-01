<template>
  <div class="message">

  </div>
</template>

<script>
import auth from '../../../../boot/auth'
import {
  aclMixin,
  avatarMixin,
  userMixin
} from 'src/plugins/mixins'
import { mapState } from 'vuex'
import * as CommunicationDirection from '../../../../constants/communication-direction'
import * as CommunicationDispositionStatus from '../../../../constants/communication-disposition-status'
import * as CommunicationCurrentStatus from '../../../../constants/communication-current-status'
import * as CommunicationTypes from '../../../../constants/communication-types'
import * as ContactThreadStatusTypes from '../../../../constants/contact-thread-status-types'

export default {
  mixins: [
    aclMixin,
    avatarMixin,
    userMixin
  ],

  props: {
    communication: {
      required: true
    },
    contact: {
      required: true
    },
    is_widget: {
      default: false,
      type: Boolean,
      required: false
    }
  },

  data () {
    return {
      auth: auth,
      relative_datetime: null,
      excluded_audits: [
        'thread_status',
        'email',
        'first_name',
        'last_name',
        'company_name',
        'address',
        'website',
        'lead_source',
        'date_of_birth',
        'cnam_country',
        'cnam_state',
        'cnam_city'
      ],
      general_audit_properties: [
        'disposition_status_id',
        'user_id',
        'workflow_id',
        'phone_number',
        'email',
        'first_name',
        'last_name',
        'company_name',
        'address',
        'website',
        'lead_source',
        'date_of_birth',
        'cnam_country',
        'cnam_state',
        'cnam_city'
      ],
      custom_audit_messages: {
        'is_dnc': [
          'Contact has been removed from the DNC list',
          'Contact has been set to DNC.'
        ],
        'is_blocked': [
          'Contact has been unblocked',
          'Contact has been blocked'
        ],
        'thread_status': [
          'Open',
          'Pending',
          'Closed',
          'Live'
        ]
      },
      CommunicationDirection,
      CommunicationDispositionStatus,
      CommunicationCurrentStatus,
      CommunicationTypes,
      ContactThreadStatusTypes
    }
  },

  computed: {
    ...mapState(['campaigns', 'workflows', 'broadcasts', 'dispositionStatuses', 'callDispositions', 'currentCompany']),

    getCommunicationClass () {
      if (this.communication.direction === CommunicationDirection.INBOUND) {
        return 'dker'
      }

      if (this.communication.direction === CommunicationDirection.OUTBOUND && ![CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW, CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW].includes(this.communication.disposition_status2)) {
        return 'blue-800 text-left'
      }

      if (this.communication.direction === CommunicationDirection.OUTBOUND && [CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW, CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW].includes(this.communication.disposition_status2)) {
        return 'red-500 text-left'
      }

      return ''
    }
  },

  created () {
    this.getRelativeDateTime()
    setInterval(this.getRelativeDateTime, 10000)
  },

  destroyed () {
    clearInterval(this.getRelativeDateTime)
  },

  methods: {
    markable (communication) {
      // Markable if communication is SMS and the comm direction is INBOUND
      let smsRule = communication.type === CommunicationTypes.SMS &&
        communication.direction === CommunicationDirection.INBOUND
      // Markable if communication is a CALL and disposition_status2 is VOICEMAIL_NEW or MISSED_NEW
      let callRule = communication.type === CommunicationTypes.CALL &&
        [CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW, CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW].includes(communication.disposition_status2)

      return smsRule || callRule
    },

    generalAuditsConditions (data) {
      // skip if not a property of contact audits
      if (!this.general_audit_properties.includes(data.property)) {
        return false
      }
      return (!data.from && data.to && data.property !== 'phone_number') ||
        (data.from && data.to && data.property !== 'workflow_id') ||
        (data.from && !data.to && data.property !== 'phone_number')
    },

    customAuditsConditions (data) {
      let allowedData = null
      let property = data.property
      let propertyValue = data.to !== null ? parseInt(data.to) : data.to
      switch (property) {
        case 'is_dnc':
        case 'is_blocked':
          allowedData = [0, 1]
          return allowedData.includes(propertyValue)
        case 'thread_status':
          allowedData = [
            ContactThreadStatusTypes.THREAD_STATUS_OPEN,
            ContactThreadStatusTypes.THREAD_STATUS_PENDING,
            ContactThreadStatusTypes.THREAD_STATUS_CLOSED,
            ContactThreadStatusTypes.THREAD_STATUS_LIVE
          ]
          propertyValue = [
            (data.from !== null ? parseInt(data.from) : data.from),
            (data.to !== null ? parseInt(data.to) : data.to)
          ]
          return allowedData.includes(propertyValue[0]) ||
            allowedData.includes(propertyValue[1])
        default:
          return false
      }
    },

    hasAuditNotes (data) {
      let allowed = [
        'tag_ids'
      ]
      return data.notes &&
        !this.generalAuditsConditions(data) &&
        (allowed.includes(data.property) || (!data.from && !data.to))
    },

    generalAuditMessages (data) {
      let generalMessage = 'Contact' + (data.property !== 'disposition_status_id' ? "'s " : ' ')
      let propertyReadableName = data.property.replace('user_id', 'owner').replace('_id', '').replace('_', ' ')
      propertyReadableName = propertyReadableName === 'phone number' ? 'primary ' + propertyReadableName : propertyReadableName
      generalMessage += ' ' + propertyReadableName
      let workflowMessage = [
        'Enrolled contact into "' + this.getWorkflow(data.to).name + '" sequence.',
        'Contact finished all "' + this.getWorkflow(data.from).name + '" sequence steps.'
      ]

      if (data.from && !data.to) {
        workflowMessage[1] = 'Contact was disenrolled from "' + this.getWorkflow(data.from).name + '" sequence.'
      }

      if (data.notes && data.notes.length) {
        workflowMessage[0] += ' Reason: ' + data.notes
        workflowMessage[1] += ' Reason: ' + data.notes
      }

      let fromValue = ''
      let toValue = ''
      if (data.from) {
        fromValue = data.property === 'disposition_status_id' ? this.getContactDisposition(data.from).name : ''
        fromValue = data.property === 'user_id' ? this.getUser(data.from).name : fromValue
        fromValue = !['disposition_status_id', 'user_id'].includes(data.property) ? data.from : fromValue
      }
      if (data.to) {
        toValue = data.property === 'disposition_status_id' ? this.getContactDisposition(data.to).name : ''
        toValue = data.property === 'user_id' ? this.getUser(data.to).name : toValue
        toValue = !['disposition_status_id', 'user_id'].includes(data.property) ? data.to : toValue
      }
      if (!data.from && data.to) {
        switch (data.property) {
          case 'disposition_status_id':
          case 'user_id':
            return generalMessage + ' has been set to "' + toValue + '"'
          case 'workflow_id':
            return workflowMessage[0]
        }
      }
      if (data.from && data.to && data.property !== 'workflow_id') {
        return generalMessage + ' has been changed from "' + fromValue + '" to "' + toValue + '"'
      }
      if (data.from && !data.to) {
        switch (data.property) {
          case 'disposition_status_id':
          case 'user_id':
            return generalMessage + ' has been removed from "' + fromValue + '"'
          case 'workflow_id':
            return workflowMessage[1]
        }
      }
      return ''
    },

    generateCustomAuditMessage (communication) {
      if (['thread_status'].includes(communication.property)) {
        return this.$options.filters.ucwords(communication.property.replace(/_/g, ' ')) +
          ' has been changed ' +
          (this.custom_audit_messages[communication.property][communication.from] ? 'from ' + this.custom_audit_messages[communication.property][communication.from] : '') +
          ' to ' + this.custom_audit_messages[communication.property][communication.to]
      } else {
        return this.custom_audit_messages[communication.property][communication.to]
      }
    },

    getCampaign (id) {
      if (!id) {
        return null
      }
      id = parseInt(id)
      let found = this.campaigns.find(campaign => campaign.id === id)
      if (found) {
        return found
      }

      return null
    },

    getRelativeDateTime () {
      this.relative_datetime = this.$options.filters.fixFullDateUTCRelative(this.communication.created_at)
    },

    markAsRead () {
      this.$axios.patch('/api/v1/communication/' + this.communication.id, {
        is_read: true
      }).then(res => {
        this.$VueEvent.fire('contact_updated', res.data.contact)
        this.communication.is_read = true
      }).catch(err => {
        this.$handleErrors(err.response)
      })
    },

    markAsUnread () {
      this.$axios.patch('/api/v1/communication/' + this.communication.id, {
        is_read: false
      }).then(res => {
        this.$VueEvent.fire('contact_updated', res.data.contact)
        this.communication.is_read = false
      }).catch(err => {
        this.$root.$handleErrors(err.response)
      })
    },

    stateToClass: function (state) {
      if (state === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW) {
        return 'b-indigo-500'
      } else if (state === CommunicationDispositionStatus.DISPOSITION_STATUS_COMPLETED_NEW) {
        return 'b-green-500'
      } else if (state === CommunicationDispositionStatus.DISPOSITION_STATUS_ABANDONED_NEW) {
        return 'b-purple-500'
      } else if (state === CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW) {
        return 'b-red-500'
      } else if (state === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW) {
        return 'b-red-500'
      } else if (state === CommunicationDispositionStatus.DISPOSITION_STATUS_DEADEND_NEW) {
        return 'b-orange-500'
      } else if (state === CommunicationDispositionStatus.DISPOSITION_STATUS_PLACED_NEW) {
        return 'b-lime-500'
      }
    },

    getUser (id) {
      if (!id) {
        return { name: '' }
      }
      id = parseInt(id)
      let found = this.users.find(user => user.id === id)
      if (found) {
        return found
      }
      return { name: '' }
    },

    getWorkflow (id) {
      if (!id) {
        return { name: '' }
      }

      id = parseInt(id)
      let found = this.workflows.find(workflow => workflow.id === id)

      if (found) {
        return found
      }

      return { name: '' }
    },

    getBroadcast (id) {
      if (!id) {
        return { name: '' }
      }
      id = parseInt(id)
      let found = this.broadcasts.find(broadcast => broadcast.id === id)
      if (found) {
        return found
      }

      return { name: '' }
    },

    getContactDisposition (contactDispositionId) {
      if (!contactDispositionId) {
        return { name: '' }
      }
      contactDispositionId = parseInt(contactDispositionId)
      let found = this.dispositionStatuses.find(contactDisposition => contactDisposition.id === contactDispositionId)
      if (found) {
        return found
      }

      return { name: '' }
    },

    isAttachmentImage (mimeType) {
      return mimeType.includes('image/')
    },

    isAttachmentVideo (mimeType) {
      return mimeType.includes('video/')
    },

    isAttachmentAudio (mimeType) {
      return mimeType.includes('audio/')
    },

    isAttachmentText (mimeType) {
      return mimeType.includes('text/')
    },

    isAttachmentApplication (mimeType) {
      return mimeType.includes('application/')
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'src/css/variables.scss';
.bg-grey-light11 {
  background: $grey-light11;
}
.audit-separator {
  .contact-audit {
    transform: translateY(-12px);
  }
}
</style>
