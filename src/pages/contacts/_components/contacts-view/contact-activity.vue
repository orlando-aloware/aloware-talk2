<template>
  <div class="message mb-3 pb-1 d-flex flex-row align-items-start"
       :class="[ communication.direction === CommunicationDirection.INBOUND ? 'flex-row' : 'flex-row-reverse' ]">
    <div class="d-flex flex-row align-items-center">
      <q-badge class="is-dot mx-1 blue"
               rounded
               v-if="communication.direction === CommunicationDirection.INBOUND && !communication.is_read">
      </q-badge>
      <avatar class="contact-avatar"
              width="34"
              height="34"
              :style="avatarStyle(isSender)"
              :class="[ communication.direction === CommunicationDirection.INBOUND ? 'mr-2' : 'ml-2' ]"
              v-if="communication.type !== undefined && communication.type !== CommunicationTypes.SYSNOTE"
              :name="avatarName">
        <q-tooltip content-class="bg-grey-light11"
                   anchor="top middle" self="center middle">
          {{ avatarName }}
        </q-tooltip>
      </avatar>
    </div>

    <div class="w-100"
         v-if="communication.type === CommunicationTypes.SYSNOTE && communication.body">
      <div class="pt-3 pb-3 m-b audit-separator d-flex justify-center text-center">
        <div class="contact-audit text-xxs">
          <span>
            {{ communication.body }}
          </span>
          <span v-if="communication.user_id && getUser(communication.user_id).name.length">
              by {{ getUser(communication.user_id).name }}
          </span>
          <span>
          </span>
          <span class="text-muted"
                v-html="datetimeTimePassed"/>
        </div>
      </div>
    </div>

    <div class="w-100"
         v-if="communication.property !== undefined && !excluded_audits.includes(communication.property) && (generalAuditsConditions(communication) || customAuditsConditions(communication) || hasAuditNotes(communication))">
      <div class="pt-3 pb-3 m-b audit-separator d-flex justify-center text-center">
        <div class="contact-audit text-xxs">
          <span v-if="hasAuditNotes(communication)">
            {{ communication.notes }}
          </span>
          <span v-if="generalAuditsConditions(communication)">
            {{ generalAuditMessages(communication) }}
          </span>
          <span v-if="customAuditsConditions(communication)">
            {{ generateCustomAuditMessage(communication) + (communication.notes ? ' (Reason: ' + communication.notes + ')' : '') }}
          </span>
          <span v-if="communication.user_id && getUser(communication.user_id).name.length">
            by {{ getUser(communication.user_id).name }}
          </span>
          <span v-else>
            by System
          </span>
          <span>
          </span>
          <span v-if="communication.property"
                class="text-muted"
                v-html="datetimePassed" />
        </div>
      </div>
    </div>
    <div class="clear d-flex flex-column"
         :class="[ communication.direction === CommunicationDirection.INBOUND ? 'align-items-start pl-1' : 'align-items-end text-right pr-1' ]"
         v-else>
      <div class="item d-flex flex-column"
           :class="[communication.direction === CommunicationDirection.INBOUND ? 'align-items-start' : 'align-items-end']"
           v-if="(communication.type === CommunicationTypes.SMS || (communication.type === CommunicationTypes.NOTE && communication.direction === CommunicationDirection.INBOUND)) && (communication.body || communication.attachments)">
        <div class=""
             v-if="communication.attachments && communication.attachments.length > 0">
          <div class="px-2"
               v-for="(attachment, index) in communication.attachments"
               :key="index">
            <q-img
              class="border-rounded img-fluid d-block r-2x width-380"
              :src="attachment.url"
              :class="index > 0 ? 'mb-1' : ''"
            >
              <template v-slot:error>
                <div class="absolute-full flex flex-center bg-negative text-white">
                  Error!
                </div>
              </template>
            </q-img>

            <div v-if="isAttachmentAudio(attachment.mime_type)">
              <audio style="height: 25px;width: 300px;margin-top: 10px;"
                     controls>
                <source :src="attachment.url"
                        :type="attachment.mime_type">
                Your browser does not support the audio element.
              </audio>
            </div>

            <div v-if="isAttachmentVideo(attachment.mime_type)">
              <video width="320"
                     class="border-rounded"
                     controls>
                <source :src="attachment.url"
                        :type="attachment.mime_type">
                Your browser does not support the video tag.
              </video>
            </div>

            <a :href="attachment.url"
               target="_blank">
              <div class="py-2 text-right"
                   v-if="isAttachmentText(attachment.mime_type) || isAttachmentApplication(attachment.mime_type)">
                <file-icon width="100" height="100" />
                <p class="mb-0 mt-2"
                   style="font-size:.7rem;word-break: break-all;">
                  {{ attachment.name }}
                </p>
              </div>
            </a>
          </div>
        </div>

        <div class="sms-activity border-rounded"
             :class="getCommunicationClass"
             v-if="communication.body">
          <span class="arrow pull-top"
                :class="[ communication.direction === CommunicationDirection.INBOUND ? 'arrow-dker left' : 'arrow-dker right' ]">
          </span>
          <div class="p-a p-y-sm handle-whitespace">
            <span v-linkify:options="{ target: '_blank' }">{{ communication.body }}</span>
          </div>
        </div>
      </div>

      <div class="item width-380"
           v-if="communication.type !== undefined && ![CommunicationTypes.SMS, CommunicationTypes.SYSNOTE].includes(communication.type) && ((communication.direction === CommunicationDirection.INBOUND && communication.type !== CommunicationTypes.NOTE) || communication.direction !== CommunicationDirection.INBOUND)">
        <div class="inline r-2x message-body text-xs effect7"
             :class="[ communication.direction === CommunicationDirection.INBOUND ? 'white' : 'white text-left' ]">
          <span class="arrow pull-top"
                :class="[ communication.direction === CommunicationDirection.INBOUND ? 'arrow-dker left' : 'arrow-dker right' ]">
          </span>

          <div class="p-y-sm"
               :class="[communication.direction === CommunicationDirection.INBOUND ? 'text-left' : 'text-right']">
            <communication-info :communication="communication"
                                :contact="contact"
                                :activityMode="true"
                                :campaignId="campaignId">
            </communication-info>
          </div>
        </div>
      </div>

      <div class="activity-bottom-info text-xxs mt-2 width-500 m-b d-flex align-items-center"
           v-if="communication.type !== undefined && communication.type !== CommunicationTypes.SYSNOTE">
        <span class="text-muted"
              v-if="communication.direction === CommunicationDirection.OUTBOUND && communication.workflow_id && getWorkflow(communication.workflow_id)">
            {{ getWorkflow(communication.workflow_id).name }} sequence
        </span>
        <span class="text-muted"
              v-else-if="communication.direction === CommunicationDirection.OUTBOUND && communication.broadcast_id && getBroadcast(communication.broadcast_id)">
            {{ getBroadcast(communication.broadcast_id).name }} broadcast
        </span>
        <span class="text-muted"
              v-else-if="communication.direction === CommunicationDirection.OUTBOUND && communication.user_id && getUser(communication.user_id).name.length">
            {{ getUser(communication.user_id).name }}
        </span>

        <span class="text-muted"
              v-if="communication.direction === CommunicationDirection.INBOUND">
            Sent from {{ communication.lead_number | fixPhone }}
        </span>

        <span class="text-muted"
              v-if="communication.direction === CommunicationDirection.OUTBOUND && communication.campaign_id && getCampaign(communication.campaign_id)">
            &nbsp;used {{ getCampaign(communication.campaign_id).name }} to send
        </span>
        <span class="text-muted"
              v-if="communication.direction === CommunicationDirection.INBOUND && communication.campaign_id && getCampaign(communication.campaign_id)">
            &nbsp;to {{ getCampaign(communication.campaign_id).name }}
        </span>

        <span class="text-muted"
              v-if="communication.direction === CommunicationDirection.OUTBOUND">
            &nbsp;to {{ communication.lead_number | fixPhone }}
        </span>

        <q-badge class="is-dot mx-1 grey-light"
                 rounded>
        </q-badge>

        <span class="text-muted">
          {{ datetimePassed }}
          <q-tooltip content-class="bg-grey-light11"
                     anchor="top middle" self="center middle">
            {{ relativeDatetime }}
          </q-tooltip>
        </span>

        <b-button variant="link"
                  class="pl-2 p-y-sm inline mark-as mark-read _400 d-none"
                  v-if="markable(communication) && !communication.is_read"
                  @click="markAsRead">
          Mark as read
        </b-button>

        <b-button variant="link"
                  class="pl-2 p-y-sm inline mark-as mark-read _400 d-none"
                  v-if="markable(communication) && communication.is_read"
                  @click="markAsUnread">
          Mark as unread
        </b-button>

        <template v-if="communication.direction === CommunicationDirection.OUTBOUND">
          <router-link :to="{ name: 'Communication', params: {communication_id: communication.id }}"
                       :class="[communication.direction === CommunicationDirection.OUTBOUND ? 'ml-1' : 'mr-1']">
            <template
              v-if="communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW">
              <template
                v-if="[CommunicationCurrentStatus.CURRENT_STATUS_SMS_RECEIVED_NEW, CommunicationCurrentStatus.CURRENT_STATUS_SMS_DELIVERED_NEW].includes(communication.current_status2)">
                <i class="material-icons help text-bluish"
                   :title="communication.current_status2 | translateCurrentStatusText | fixName">done_all</i>
              </template>

              <i class="material-icons help text-bluish"
                 :title="communication.current_status2 | translateCurrentStatusText | fixName"
                 v-if="[CommunicationCurrentStatus.CURRENT_STATUS_SMS_SENT_NEW, CommunicationCurrentStatus.CURRENT_STATUS_SMS_ACCEPTED_NEW].includes(communication.current_status2)">done</i>

              <i class="material-icons help text-blue"
                 :title="communication.current_status2 | translateCurrentStatusText | fixName"
                 v-if="[CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW, CommunicationCurrentStatus.CURRENT_STATUS_SMS_QUEUED_NEW, CommunicationCurrentStatus.CURRENT_STATUS_SMS_SENDING_NEW, CommunicationCurrentStatus.CURRENT_STATUS_SMS_RECEIVING_NEW].includes(communication.current_status2)">done</i>

              <i class="material-icons help text-red-500"
                 :title="communication.current_status2 | translateCurrentStatusText | fixName"
                 v-if="[CommunicationCurrentStatus.CURRENT_STATUS_SMS_UNDELIVERED_NEW, CommunicationCurrentStatus.CURRENT_STATUS_SMS_FAILED_NEW].includes(communication.current_status2)">error</i>
            </template>

            <i class="material-icons help text-red-500"
               :title="communication.disposition_status2 | translateDispositionStatusText | fixName"
               v-else>error</i>
          </router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import {
  aclMixin,
  avatarMixin,
  userMixin
} from 'src/plugins/mixins'
import { mapState } from 'vuex'
import * as CommunicationDirection from 'src/constants/communication-direction'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as ContactThreadStatusTypes from 'src/constants/contact-thread-status-types'
import CommunicationInfo from 'src/pages/contacts/_components/communication-info'
import Avatar from 'src/components/avatar/avatar.vue'
import FileIcon from 'components/icons/contact-activity/file-icon'

export default {
  mixins: [
    aclMixin,
    avatarMixin,
    userMixin
  ],

  components: {
    FileIcon,
    CommunicationInfo,
    Avatar
  },

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
    },
    campaignId: {
      required: false
    }
  },

  data () {
    return {
      datetimePassed: null,
      relativeDatetime: null,
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
        return 'inbound dker'
      }

      if (this.communication.direction === CommunicationDirection.OUTBOUND && ![CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW, CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW].includes(this.communication.disposition_status2)) {
        return 'outbound blue-800 text-left'
      }

      if (this.communication.direction === CommunicationDirection.OUTBOUND && [CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW, CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW].includes(this.communication.disposition_status2)) {
        return 'outbound red-500 text-left'
      }

      return ''
    },
    isSender () {
      return this.communication.direction === CommunicationDirection.OUTBOUND
    },
    avatarName () {
      return this.communication.direction === CommunicationDirection.OUTBOUND && this.currentCompany
        ? this.currentCompany.name : this.contact.name
    }
  },

  created () {
    this.getRelativeDateTime()
    setInterval(this.getRelativeDateTime, 10000)
    this.getDateTimePassed()
    setInterval(this.getDateTimePassed, 10000)
  },

  destroyed () {
    clearInterval(this.getRelativeDateTime)
    clearInterval(this.getDateTimePassed)
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
      this.relativeDatetime = this.$options.filters.fixRelativeDatetimeFormat(this.communication.created_at)
    },

    getDateTimePassed () {
      this.datetimePassed = this.$options.filters.dateTimePassed(this.communication.created_at)
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
</style>
