<template>
  <div :class="`task-item w-100 d-flex flex-row py-2 align-items-center border-bottom ${activeClass}`"
       v-if="communication.contact_id"
       @click="onItemClick(communication)">
    <div class="avatar d-flex justify-content-center pb-1 position-relative"
         role="button">
      <i v-if="(markable(communication) || (communication.type === CommunicationTypes.SMS || (communication.type === CommunicationTypes.NOTE && communication.direction === CommunicationDirection.INBOUND)) && (communication.body || communication.attachments)) && !communication.is_read"
         class="fa fa-circle"
         style="color: rgb(64, 158, 255); font-size: 50%; position: absolute; left: 4px;">
      </i>
      <avatar width="34"
              height="34"
              :sequenceIcon="communication.direction === CommunicationDirection.OUTBOUND && communication.workflow_id !== null"
              :style="avatarStyle(false)"
              :name="contactName">
      </avatar>
    </div>
    <div class="task-details flex-grow-1 pb-1"
         role="button">
      <div class="contact-name">
        {{ contactName | truncate(20) }}
        <q-tooltip content-class="bg-grey-light11"
                   anchor="top left"
                   self="top left"
                   :offset="[0, 33]">
          {{ contactName }}
        </q-tooltip>
      </div>
      <div class="d-flex flex-row">
        <div class="pr-2">
          <component :is="stateToIcon(communication.disposition_status2, communication.type, communication.direction, channelAnswerStatus)"
                     height="18px"
                     width="18px">
          </component>
        </div>
        <div class="comm-label text-grey-90 d-flex align-items-center">
          <span v-if="communication.type !== CommunicationTypes.SMS">
            {{ communication.direction | fixCommDirection }} {{ communication.type | fixCommType }}
            <record-icon v-if="communication.type === CommunicationTypes.CALL && channelAnswerStatus === 'recorded'"
                         class="item-identifier-icon"
                         height="10"
                         width="10"
                         color="#62666E">
            </record-icon>
            <voicemail-icon v-if="communication.type === CommunicationTypes.CALL && channelAnswerStatus === 'voicemail'"
                            class="item-identifier-icon"
                         height="16"
                         width="16"
                         color="#62666E">
            </voicemail-icon>
          </span>
          <span v-if="communication.type === CommunicationTypes.SMS && (communication.body === null || !communication.body ||communication.body.length < 1)">
            {{ smsEmptyBodyAlternativeText }}
          </span>
          <span v-if="communication.body !== null">
            {{ communication.body | truncate(22) }}
          </span>
        </div>
      </div>
      <div class="campaign-name text-grey-10">
        {{ campaignName }}
      </div>
    </div>
    <div class="actions text-right pb-1">
      <span class="time-passed text-grey-90 mr-2"
            role="button"
            v-if="(communication.type === CommunicationTypes.CALL && communication.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW) || communication.type !== CommunicationTypes.CALL">
        <task-item-time :from-time="communication.created_at" :update-interval="6000"></task-item-time>
      </span>
      <div class="time-passed text-grey-90 d-flex flex-row justify-center"
           v-else-if="communication.direction === CommunicationDirection.INBOUND && communication.type === CommunicationTypes.CALL && [CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW, CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW].includes(communication.current_status2)">
        <div class="px-2">
          <cancel-call-icon role="button"/>
        </div>
        <div class="px-2">
          <accept-call-icon role="button"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { avatarMixin, communicationInfoMixin } from 'src/plugins/mixins'
import Avatar from 'components/avatar'
import { mapActions, mapState } from 'vuex'
import CancelCallIcon from 'components/icons/cancel-call-icon'
import AcceptCallIcon from 'components/icons/accept-call-icon'
import * as CommunicationDirection from 'src/constants/communication-direction'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationTypes from 'src/constants/communication-types'
import TaskItemTime from 'components/inbox/channel-tasks/task-item-time'
import RecordIcon from 'components/icons/inbox/record-icon'
import VoicemailIcon from 'components/icons/inbox/voicemail-icon'

export default {
  name: 'task-item',

  mixins: [
    avatarMixin,
    communicationInfoMixin
  ],

  components: {
    RecordIcon,
    VoicemailIcon,
    TaskItemTime,
    AcceptCallIcon,
    CancelCallIcon,
    Avatar
  },

  props: {
    communication: {
      required: true
    },

    channel: {
      type: String,
      required: false,
      default: 'calls'
    },

    answerStatus: {
      type: String,
      required: false,
      default: 'all'
    }
  },

  data () {
    return {
      CommunicationDirection,
      CommunicationDispositionStatus,
      CommunicationCurrentStatus,
      CommunicationTypes
    }
  },

  computed: {
    ...mapState(['campaigns']),
    ...mapState('inbox', ['selectedCommunication', 'activeChannel']),

    contactName () {
      if (this.communication && this.communication.contact) {
        return this.communication.contact.name || 'No Name'
      }

      if (this.communication) {
        return this.$options.filters.fixPhone(this.communication.lead_number)
      }

      return 'No Name'
    },

    campaignName () {
      if (_.isEmpty(this.campaigns) || !this.communication.campaign_id) {
        return '-'
      }
      const campaign = this.campaigns.find(campaign => campaign.id === this.communication.campaign_id)
      if (campaign) {
        return campaign.name
      }
      return '-'
    },

    activeClass () {
      return this.selectedCommunication && this.communication.id === this.selectedCommunication.id ? 'active' : ''
    },

    channelAnswerStatus () {
      return this.activeChannel.answerStatus || ''
    },

    smsEmptyBodyAlternativeText () {
      let directionText = (this.communication.direction === CommunicationDirection.INBOUND ? 'Received' : 'Sent')
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      let lastAttachment = this.communication.attachments.pop()

      switch (true) {
        case ['text'].includes(lastAttachment.mime_type):
          return directionText + ' a text file'
        case ['audio'].includes(lastAttachment.mime_type):
          return directionText + ' an audio file'
        case ['image'].includes(lastAttachment.mime_type):
          return directionText + ' an image'
        case ['video'].includes(lastAttachment.mime_type):
          return directionText + ' a video file'
        case ['application'].includes(lastAttachment.mime_type):
        default:
          return directionText + ' a file'
      }
    }
  },

  methods: {
    markable (communication) {
      // Markable if communication is SMS and the comm direction is INBOUND
      let smsRule = communication.type === CommunicationTypes.SMS &&
        communication.direction === CommunicationDirection.INBOUND
      // Markable if communication is a CALL and disposition_status2 is VOICEMAIL_NEW or MISSED_NEW
      let callRule = communication.type === CommunicationTypes.CALL &&
        [CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW, CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW].includes(communication.disposition_status2) &&
        communication.direction === CommunicationDirection.INBOUND

      return smsRule || callRule
    },

    setContact (id) {
      this.setContactId(id)
    },

    onItemClick (communication) {
      this.setSelectedCommunication(communication)
      this.$router.push({
        name: 'Inbox Contact',
        params: {
          id: communication.contact_id.toString(),
          communicationId: communication.id,
          channel: this.channel
        }
      }).catch(err => {
        console.log(err)
      })
    },

    ...mapActions('inbox', ['setContactId', 'setSelectedCommunication', 'setActiveChannel'])
  }
}
</script>
