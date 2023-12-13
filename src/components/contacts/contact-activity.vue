<template>
  <div class="message p-3 pb-1 d-flex flex-row align-items-start"
       v-if="(communication.property !== undefined && !excluded_audits.includes(communication.property)) ||
       (communication.property === undefined)"
       :class="[ communication.direction === CommunicationDirection.INBOUND ? 'flex-row' : 'flex-row-reverse' ]">
    <div class="d-flex flex-row align-items-center position-relative"
         v-if="communication.property === undefined">
      <q-badge class="is-dot unread-dot mx-1 blue position-absolute"
               rounded
               v-if="(markable || (communication.type === CommunicationTypes.SMS ||
               (communication.type === CommunicationTypes.NOTE && communication.direction === CommunicationDirection.INBOUND)) &&
               (communication.body || communication.attachments)) && !communication.is_read">
      </q-badge>
      <avatar class="contact-avatar"
              width="34"
              height="34"
              :sequenceIcon="communication.direction === CommunicationDirection.OUTBOUND && communication.workflow_id !== null"
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
      <div class="m-b audit-separator d-flex justify-center text-center">
        <div class="contact-audit">
          <span style="white-space: pre-line;word-break: break-word;">
            {{ communication.body }}
          </span>
          <span v-if="communication.user_id && getUser(communication.user_id).name.length">
              by {{ getUser(communication.user_id).name }}
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
        </div>
      </div>
    </div>

    <div class="w-100"
         v-if="communication.property !== undefined && !excluded_audits.includes(communication.property) &&
         (generalAuditsConditions(communication) || customAuditsConditions(communication) || hasAuditNotes(communication))">
      <div class="m-b audit-separator d-flex justify-center text-center">
        <div class="contact-audit">
          <span v-if="hasAuditNotes(communication)">
            {{ communication.notes }}
          </span>
          <span v-if="generalAuditsConditions(communication)"
                v-html="generalAuditMessages(communication)">
          </span>
          <span v-if="customAuditsConditions(communication)"
                v-html="generateCustomAuditMessageWithNotes(communication)">
          </span>
          <span v-if="communication.user_id && getUser(communication.user_id).name.length && showAuthor(communication)">
            by {{ getUser(communication.user_id).name }}
          </span>
          <span v-else-if="showAuthor(communication)">
            by System
          </span>
          <q-badge class="is-dot mx-1 grey-light"
                   rounded>
          </q-badge>

          <span class="text-muted"
                v-if="communication.property">
            {{ datetimePassed }}
            <q-tooltip content-class="bg-grey-light11"
                       anchor="top middle"
                       self="center middle">
              {{ relativeDatetime }}
            </q-tooltip>
          </span>
        </div>
      </div>
    </div>

    <div class="clear d-flex flex-column"
         :class="[ communication.direction === CommunicationDirection.INBOUND ? 'align-items-start pl-1' : 'align-items-end text-right pr-1' ]"
         v-if="communication.property === undefined">
      <div class="item d-flex flex-column"
           :class="[communication.direction === CommunicationDirection.INBOUND ? 'align-items-start' : 'align-items-end']"
           v-if="(communication.type === CommunicationTypes.SMS || (communication.type === CommunicationTypes.NOTE && communication.direction === CommunicationDirection.INBOUND))
           && (communication.body || communication.attachments)">
        <div v-if="communication.attachments && communication.attachments.length > 0">
          <div v-for="(attachment, index) in communication.attachments"
               :key="index">
            <template v-if="attachment.mime_type">
              <template v-if="isAttachmentImage(attachment.mime_type)">
                <q-img
                  class="border-rounded img-fluid d-block r-2x mb-1"
                  :src="attachment.url"
                  width="320px"
                  fit="fill"
                  native-context-menu>
                  <template v-slot:error>
                    <div class="absolute-full flex flex-center bg-negative text-white">
                      Error!
                    </div>
                  </template>
                  <template v-slot:default>
                    <download-button buttonStyle="top: 8px; left: 8px"
                                     :communication-id="communication.id"
                                     :filename="attachment.name"
                                     :file-mime-type="attachment.mime_type"
                                     :attachment-url="attachment.url"/>
                  </template>
                </q-img>
              </template>

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

              <download-button is-simple-attachment
                               :communication-id="communication.id"
                               :filename="attachment.name"
                               :file-mime-type="attachment.mime_type"
                               :attachment-url="attachment.url"
                               v-if="isAttachmentText(attachment.mime_type) || isAttachmentApplication(attachment.mime_type)">
              </download-button>
            </template>
          </div>
        </div>

        <div class="sms-activity border-rounded"
             :class="getCommunicationClass"
             v-if="communication.body">
          <span class="arrow pull-top"
                :class="[ communication.direction === CommunicationDirection.INBOUND ? 'left' : 'right' ]">
          </span>
          <div class="p-a p-y-sm handle-whitespace" style="max-width: 40em">
            <span v-linkify:options="{ target: '_blank' }" style="white-space: pre-line;word-break: break-word;">{{ communication.body }}</span>
          </div>
        </div>
      </div>

      <div class="item"
           :class="[communication.type !== CommunicationTypes.NOTE ? 'max-width-380' : '']"
           v-if="communication.type !== undefined && ![CommunicationTypes.SMS, CommunicationTypes.SYSNOTE].includes(communication.type) &&
           ((communication.direction === CommunicationDirection.INBOUND && communication.type !== CommunicationTypes.NOTE) ||
           communication.direction !== CommunicationDirection.INBOUND)">
        <div class="inline r-2x message-body text-xs effect7"
             :class="[ communication.direction === CommunicationDirection.INBOUND ? 'white' : 'white text-left' ]">
          <span class="arrow pull-top"
                :class="[ communication.direction === CommunicationDirection.INBOUND ? 'left' : 'right' ]">
          </span>

          <div class="p-y-sm"
               :class="[communication.direction === CommunicationDirection.INBOUND ? 'text-left' : 'text-right']">
            <communication-info ref="communicationInfo"
                                :communication="communication"
                                :contact="contact"
                                :activityMode="true"
                                :campaignId="campaignId">
            </communication-info>
          </div>
        </div>
      </div>

      <div class="activity-bottom-info text-xs width-500 m-b d-flex align-items-center flex-wrap"
           :class="[ communication.direction === CommunicationDirection.INBOUND ? 'justify-content-start' : 'justify-content-end' ]"
           v-if="communication.type !== undefined && communication.type !== CommunicationTypes.SYSNOTE">
        <span class="text-muted"
              v-if="communication.direction === CommunicationDirection.OUTBOUND &&
              communication.workflow_id && getWorkflow(communication.workflow_id) &&
              communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW">
            {{ getWorkflow(communication.workflow_id).name }} sequence
        </span>
        <span class="text-muted"
              v-else-if="communication.direction === CommunicationDirection.OUTBOUND &&
              communication.broadcast_id && getBroadcast(communication.broadcast_id) &&
              communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW">
            {{ getBroadcast(communication.broadcast_id).name }} broadcast
        </span>
        <span class="text-muted"
              v-else-if="communication.direction === CommunicationDirection.OUTBOUND &&
              communication.user_id && getUser(communication.user_id).name.length &&
              communication.type !== CommunicationTypes.NOTE">
            {{ !communication.campaign_id ? 'By ' : '' }}{{ getUser(communication.user_id).name }}
        </span>
        <span class="text-muted"
              v-else-if="communication.direction === CommunicationDirection.OUTBOUND &&
              communication.user_id && getUser(communication.user_id).name.length &&
              communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW &&
              communication.type === CommunicationTypes.NOTE">
          {{ getNotesBottomLabel() }}
        </span>
        <span class="text-muted"
              v-else-if="communication.direction === CommunicationDirection.OUTBOUND &&
              communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW">
          {{ currentCompany ? currentCompany.name : 'No Name' }}
        </span>

        <span class="text-muted"
              v-if="communication.direction === CommunicationDirection.INBOUND">
          <router-link
            :to="{ name: 'Communication', params: { contactId: contact.id , communicationId: communication.id }}">
            <information-circle-icon style="cursor: help;"
                                     color="#2196f3">
            </information-circle-icon>
          </router-link>
          {{ communication.type === CommunicationTypes.CALL ? 'Called' : 'Sent' }} from {{ communication.lead_number | fixPhone }}
        </span>

        <span class="text-muted"
              v-if="communication.direction === CommunicationDirection.OUTBOUND &&
              communication.campaign_id && getCampaign(communication.campaign_id) &&
              communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW">
            &nbsp; used {{ getCampaign(communication.campaign_id).name }} to {{ communication.type === CommunicationTypes.CALL ? 'call' : 'send' }}
        </span>
        <span class="text-muted"
              v-if="communication.direction === CommunicationDirection.INBOUND &&
              communication.campaign_id && getCampaign(communication.campaign_id)">
            &nbsp; to {{ getCampaign(communication.campaign_id).name }}
        </span>

        <span class="text-muted"
              v-if="communication.direction === CommunicationDirection.OUTBOUND &&
              ![CommunicationTypes.NOTE, CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER].includes(communication.type) &&
              communication.disposition_status2 !== CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW">
            &nbsp;to {{ communication.lead_number | fixPhone }}
        </span>

        <span class="text-muted"
              v-if="communication.direction === CommunicationDirection.OUTBOUND &&
              communication.creator_type && communication.creator_type !== CREATOR_TYPE_MANUAL">
          - {{ communication.creator_type | translateCreatorType }}
        </span>

        <span href="#"
           class="text-sm text-primary cursor-pointer"
           v-if="communication.direction === CommunicationDirection.OUTBOUND &&
              [CommunicationTypes.SMS].includes(communication.type) &&
              communication.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW &&
              isRetryingSendSmsEnabled"
           @click="retrySendingSms">
          {{ isRetryingSendSms ? 'Retrying...' : 'Retry?' }}
        </span>
        <span class="text-muted"
              v-if="communication.direction === CommunicationDirection.OUTBOUND &&
              [CommunicationTypes.SMS].includes(communication.type) &&
              communication.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW">
            &nbsp;Failed to {{ communication.type === CommunicationTypes.CALL ? 'call' : 'send' }} from {{ getCampaign(communication.campaign_id).name }} to {{ communication.lead_number | fixPhone }}
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
                  v-if="markable && !communication.is_read"
                  @click="markAsRead">
          Mark as read
        </b-button>

        <b-button variant="link"
                  class="pl-2 p-y-sm inline mark-as mark-read _400 d-none"
                  v-if="markable && communication.is_read"
                  @click="markAsUnread">
          Mark as unread
        </b-button>

        <template v-if="communication.direction === CommunicationDirection.OUTBOUND">
          <router-link class="activity-status text-decoration-none"
                       :to="{ name: 'Communication', params: {contactId: contactId, communicationId: communication.id }}">
            <template
              v-if="[CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW, CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW].includes(communication.disposition_status2)"
            >
              <span :class="statusClass">
                <i class="material-icons help text-danger"
                   v-if="communication.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW"
                   :title="communication.current_status2 | translateCurrentStatusText | fixName"
                >cancel</i>
                <i class="material-icons help text-danger"
                   v-else
                   :title="communication.disposition_status2 | translateDispositionStatusText | fixName"
                >cancel</i>
              </span>
            </template>
            <template v-else>
              <template v-if="![CommunicationTypes.REMINDER, CommunicationTypes.APPOINTMENT, CommunicationTypes.NOTE].includes(communication.type)">
                <template
                  v-if="[CommunicationCurrentStatus.CURRENT_STATUS_SMS_RECEIVED_NEW, CommunicationCurrentStatus.CURRENT_STATUS_SMS_DELIVERED_NEW].includes(communication.current_status2)">
                  <i class="material-icons help text-bluish"
                     :class="statusClass"
                     :title="communication.current_status2 | translateCurrentStatusText | fixName">done_all</i>
                </template>

                <i class="material-icons help text-bluish"
                   :class="statusClass"
                   :title="communication.current_status2 | translateCurrentStatusText | fixName"
                   v-if="[CommunicationCurrentStatus.CURRENT_STATUS_SMS_SENT_NEW, CommunicationCurrentStatus.CURRENT_STATUS_SMS_ACCEPTED_NEW].includes(communication.current_status2)">done</i>

                <i class="material-icons help text-blue"
                   :class="statusClass"
                   :title="communication.current_status2 | translateCurrentStatusText | fixName"
                   v-if="[CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW, CommunicationCurrentStatus.CURRENT_STATUS_SMS_QUEUED_NEW, CommunicationCurrentStatus.CURRENT_STATUS_SMS_SENDING_NEW, CommunicationCurrentStatus.CURRENT_STATUS_SMS_RECEIVING_NEW].includes(communication.current_status2)">done</i>

                <i class="material-icons help text-light-blue-4"
                   :class="statusClass"
                   :title="'sending'"
                   v-if="communication.current_status2 === undefined">access_time</i>
              </template>

              <i class="material-icons help text-danger"
                 :class="statusClass"
                 :title="communication.current_status2 | translateCurrentStatusText | fixName"
                 v-if="[CommunicationCurrentStatus.CURRENT_STATUS_SMS_UNDELIVERED_NEW, CommunicationCurrentStatus.CURRENT_STATUS_SMS_FAILED_NEW].includes(communication.current_status2)">error</i>
            </template>
          </router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
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
import * as ContactTaskStatus from 'src/constants/contact-task-status'
import CommunicationInfo from 'components/communication-info'
import Avatar from 'components/avatar'
import InformationCircleIcon from 'components/icons/information-circle-icon'
import DownloadButton from 'components/download-button'
import talk2Api from 'src/plugins/api/api'
import { CREATOR_TYPE_MANUAL } from 'src/constants/creator-types'

export default {
  mixins: [
    aclMixin,
    avatarMixin,
    userMixin
  ],

  components: {
    CommunicationInfo,
    Avatar,
    InformationCircleIcon,
    DownloadButton
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
      isRetryingSendSms: false,
      isRetryingSendSmsEnabled: false,
      datetimePassed: null,
      relativeDatetime: null,
      excluded_audits: [
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
      general_audit_properties: [
        'disposition_status_id',
        'user_id',
        'lead_source_id',
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
        'contact_task_status': {
          1: 'New',
          2: 'Open',
          3: 'Pending',
          4: 'Closed'
        }
      },
      getRelativeDateTimeInterval: null,
      getDateTimePassedInterval: null,
      CommunicationDirection,
      CommunicationDispositionStatus,
      CommunicationCurrentStatus,
      CommunicationTypes,
      CREATOR_TYPE_MANUAL
    }
  },

  computed: {
    ...mapState(['campaigns', 'workflows', 'dispositionStatuses', 'leadSources']),
    ...mapState('cache', ['currentCompany']),
    ...mapState('broadcast', ['broadcasts']),

    getCommunicationClass () {
      if (this.communication.current_status2 === undefined) {
        return 'sending text-black text-left'
      }

      if (this.communication.direction === CommunicationDirection.INBOUND) {
        return 'inbound bg-grey-50'
      }

      if (this.communication.direction === CommunicationDirection.OUTBOUND && ![CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW, CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW].includes(this.communication.disposition_status2)) {
        return 'outbound bg-primary text-grey-50 text-left'
      }

      if (this.communication.direction === CommunicationDirection.OUTBOUND && [CommunicationDispositionStatus.DISPOSITION_STATUS_FAILED_NEW, CommunicationDispositionStatus.DISPOSITION_STATUS_INVALID_NEW].includes(this.communication.disposition_status2)) {
        return 'outbound bg-primary text-grey-50 text-left'
      }

      return ''
    },
    isSender () {
      return this.communication.direction === CommunicationDirection.OUTBOUND
    },
    avatarName () {
      if (this.communication.direction === CommunicationDirection.OUTBOUND) {
        if (this.communication.workflow_id) {
          return this.getWorkflow(this.communication.workflow_id).name
        }
        if (this.communication.user_id) {
          return this.getUser(this.communication.user_id).name
        }
        return this.currentCompany ? this.currentCompany.name : 'No Name'
      }

      return this.contact.name || 'No Name'
    },

    markable () {
      // Markable if communication is SMS and the comm direction is INBOUND or
      // Markable if communication is a CALL and disposition_status2 is VOICEMAIL_NEW or MISSED_NEW
      return (this.communication.type === CommunicationTypes.SMS &&
          this.communication.direction === CommunicationDirection.INBOUND) ||
        (this.communication.type === CommunicationTypes.CALL &&
          [CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW, CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW].includes(this.communication.disposition_status2) &&
          this.communication.direction === CommunicationDirection.INBOUND)
    },

    contactId () {
      const id = { data: _.get(this.communication, 'contact.id', null) }
      id.data = _.isEmpty(id.data) ? this.communication.contact_id : id.data

      return _.isEmpty(id.data) ? _.get(this.contact, 'id', null) : id.data
    },

    statusClass () {
      return [this.communication.direction === CommunicationDirection.OUTBOUND ? 'ml-1' : 'mr-1']
    },

    isTaskStatusLogsDisabled () {
      return this.currentCompany.hasOwnProperty('task_status_logs') &&
        !this.currentCompany.task_status_logs
    }
  },

  created () {
    this.getRelativeDateTime()
    this.getRelativeDateTimeInterval = setInterval(this.getRelativeDateTime, 10000)
    this.getDateTimePassed()
    this.getDateTimePassedInterval = setInterval(this.getDateTimePassed, 10000)
    this.updateExcludedAudits()
  },

  beforeDestroy () {
    clearInterval(this.getRelativeDateTimeInterval)
    clearInterval(this.getDateTimePassedInterval)
  },

  methods: {
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
      switch (data.property) {
        case 'is_dnc':
        case 'is_blocked':
          return [0, 1].includes((data.to !== null ? parseInt(data.to) : data.to))
        case 'contact_task_status':
          const allowedStatus = [
            ContactTaskStatus.STATUS_NEW,
            ContactTaskStatus.STATUS_OPEN,
            ContactTaskStatus.STATUS_PENDING,
            ContactTaskStatus.STATUS_CLOSED
          ]
          return allowedStatus.includes((data.from !== null ? parseInt(data.from) : data.from)) ||
            allowedStatus.includes((data.to !== null ? parseInt(data.to) : data.to))
        default:
          return false
      }
    },

    hasAuditNotes (data) {
      return data.notes &&
        !this.generalAuditsConditions(data) &&
        (['tag_ids'].includes(data.property) || (!data.from && !data.to))
    },

    generalAuditMessages (data) {
      const generalMessage = { data: `Contact${(data.property !== 'disposition_status_id' ? "'s " : ' ')}` }
      const propertyReadableName = { data: data.property.replace('user_id', 'owner').replace('_id', '').replace('_', ' ') }
      propertyReadableName.data = propertyReadableName.data === 'phone number' ? `primary ${propertyReadableName.data}` : propertyReadableName.data
      generalMessage.data = `${generalMessage.data} ${propertyReadableName.data}`
      const workflowToName = { data: this.getWorkflow(data.to).name }
      workflowToName.data = !workflowToName.data ? 'Deleted' : workflowToName.data
      const workflowFromName = { data: this.getWorkflow(data.from).name }
      workflowFromName.data = !workflowFromName.data ? 'Deleted' : workflowFromName.data
      const workflowMessage = [
        `Enrolled contact into "${workflowToName.data}" sequence.`,
        `Contact finished all "${workflowFromName.data}" sequence steps.`
      ]

      if (data.from && !data.to) {
        workflowMessage[1] = `Contact was disenrolled from "${workflowFromName.data}" sequence.`
      }

      if (data.notes && data.notes.length) {
        workflowMessage[0] += ' Reason: ' + data.notes
        workflowMessage[1] += ' Reason: ' + data.notes
      }

      const fromValue = { data: '' }
      const toValue = { data: '' }

      if (data.from) {
        fromValue.data = this.getValue(data.property, data.from)
      }

      if (data.to) {
        toValue.data = this.getValue(data.property, data.to)
      }

      if (!data.from && data.to) {
        switch (data.property) {
          case 'disposition_status_id':
          case 'lead_source_id':
          case 'user_id':
            return generalMessage.data + ' has been set to "' + toValue.data + '"' + `. Reason: ${data.notes}`
          case 'workflow_id':
            return workflowMessage[0]
        }
      }

      if (data.from && data.to && data.property !== 'workflow_id') {
        const hsContactAuditProperties = ['user_id', 'disposition_status_id']
        generalMessage.data += ' has been changed from "' + fromValue.data + '" to "' + toValue.data + '"'

        // Add reason for hubspot property change
        if (data.notes && data.notes !== '' && hsContactAuditProperties.includes(data.property)) {
          generalMessage.data += '. Reason: ' + data.notes
        }

        return generalMessage.data
      }

      if (data.from && !data.to) {
        switch (data.property) {
          case 'disposition_status_id':
          case 'lead_source_id':
          case 'user_id':
            return generalMessage.data + ' has been removed from "' + fromValue.data + '"' + `. Reason: ${data.notes}`
          case 'workflow_id':
            return workflowMessage[1]
        }
      }

      return ''
    },

    getValue (property, data) {
      let value = ''
      switch (property) {
        case 'disposition_status_id':
          value = this.getContactDisposition(data).name
          break
        case 'lead_source_id':
          value = this.getLeadSource(data).name
          break
        case 'user_id':
          value = this.getUser(data).name
          break
        default:
          value = data
          break
      }
      return value
    },

    generateCustomAuditMessage (communication) {
      if (communication.property === 'contact_task_status') {
        return this.$options.filters.ucwords(communication.property.replace(/_/g, ' ')) +
          ' has been changed ' +
          (this.custom_audit_messages[communication.property][communication.from] ? `from ${this.custom_audit_messages[communication.property][communication.from]}` : '') +
          ` to ${this.custom_audit_messages[communication.property][communication.to]}`
      } else {
        return this.custom_audit_messages[communication.property][communication.to]
      }
    },

    generateCustomAuditMessageWithNotes (communication) {
      const notes = communication.notes ? ' (Reason: ' + communication.notes.replace(/\\"/g, '"') + ')' : ''
      return this.generateCustomAuditMessage(communication) + notes
    },

    getCampaign (id) {
      if (!id) {
        return null
      }

      id = parseInt(id)
      const found = this.campaigns.find(campaign => campaign.id === id)

      if (found) {
        return found
      }

      return {
        id: id,
        name: 'Unknown Line',
        incoming_number: ''
      }
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

        // if contact has no unreads anymore, refresh inbox result
        const contact = res.data.contact
        const hasUnreads = contact.unread_texts_count + contact.unread_missed_calls_count + contact.unread_voicemails_count
        if (hasUnreads < 1) {
          this.$VueEvent.fire('fetchInbox')
        }
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

        // if contact has no unreads before, refresh inbox result
        const oldTotalUnreads = this.contact.unread_texts_count + this.contact.unread_missed_calls_count + this.contact.unread_voicemails_count
        if (oldTotalUnreads < 1) {
          this.$VueEvent.fire('fetchInbox')
        }
      }).catch(err => {
        this.$handleErrors(err.response)
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
      const found = this.users.find(user => user.id === id)

      if (!_.isEmpty(found)) {
        return found
      }

      return { name: '' }
    },

    getWorkflow (id) {
      if (!id) {
        return { name: '' }
      }

      id = parseInt(id)
      const found = this.workflows.find(workflow => workflow.id === id)

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
      const found = this.broadcasts.find(broadcast => broadcast.id === id)

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
      const found = this.dispositionStatuses.find(contactDisposition => contactDisposition.id === contactDispositionId)

      if (found) {
        return found
      }

      return { name: '' }
    },

    isAttachmentMigrated (attachment) {
      return !attachment.url.includes('twilio')
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
    },

    retrySendingSms (e) {
      e.preventDefault()
      this.isRetryingSendSms = true
      return talk2Api.V1.message.send(
        {
          body: this.communication.body,
          contact_id: this.communication.contact_id,
          campaign_id: this.communication.campaign_id,
          phone_number: this.communication.lead_number,
          attachments: this.communication.attachments,
          gif: ''
        }
      ).then(response => {
        this.$generalNotification('Message sent.')
      }).catch(error => {
        console.log(error)
        this.$handleErrors(error.response)
      }).finally(() => {
        this.isRetryingSendSms = false
      })
    },

    getNotesBottomLabel () {
      const name = this.getUser(this.communication.user_id).name
      return name + (name.charAt(name.length - 1) === 's' ? `'` : `'s`) + ' note'
    },

    getLeadSource (leadSourceId) {
      if (!leadSourceId) {
        return { name: '' }
      }

      leadSourceId = parseInt(leadSourceId)
      let found = this.leadSources.find(leadSource => leadSource.id === leadSourceId)

      if (found) {
        return found
      }

      return { name: '' }
    },

    showAuthor (audit) {
      return !['text_authorized', 'is_opted_out'].includes(audit.property)
    },

    updateExcludedAudits () {
      if (this.isTaskStatusLogsDisabled) {
        this.excluded_audits.push('contact_task_status')
        return
      }

      this.removeTaskStatusFromExcludedAudits()
    },

    removeTaskStatusFromExcludedAudits () {
      const indexToRemove = this.excluded_audits.indexOf('contact_task_status')
      if (indexToRemove !== -1) {
        this.excluded_audits.splice(indexToRemove, 1)
      }
    }
  }
}
</script>
