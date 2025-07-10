<template>
  <div class="contact-task-item task-item w-100 d-flex flex-row py-2 pr-2 align-items-center border-bottom position-relative"
       data-testid="inbox-tasks-item-wrapper"
       :class="inboxItemClass"
       @click="onItemClick">
    <div class="d-flex justify-content-center avatar-wrapper">
      <div class="avatar d-flex justify-content-center pb-1 position-relative"
           role="button">
        <b-badge class="contact-unread-badge d-flex justify-center align-items-center position-absolute"
                 data-testid="inbox-tasks-item-badge"
                 pill
                 v-if="totalUnreads > 0">
          <span v-if="totalUnreads < 99">{{ totalUnreads }}</span>
          <span v-else>99<sup>+</sup></span>
        </b-badge>
        <avatar width="34"
                height="34"
                data-testid="inbox-tasks-item-avatar"
                :style="avatarStyle(false)"
                :name="contactAvatar">
        </avatar>
      </div>
    </div>
    <div class="task-details flex-grow-1 pb-1 d-grid"
         role="button">
      <div class="contact-name truncated-text"
           :class="hasUnreadsClass">
        {{ contactName }}
        <q-tooltip content-class="bg-grey-light11"
                   anchor="top left"
                   self="top left"
                   data-testid="inbox-tasks-item-tooltip"
                   :offset="[0, 33]">
          {{ contactName }}
        </q-tooltip>
      </div>
      <div class="task-item-body comm-label text-grey-90 mt-1">
        {{ contact.phone_number | fixPhone('NATIONAL', true, false, true) }}
      </div>
      <div class="d-grid grid-2-col task-item-body"
           v-if="contact.last_communication">
        <div class="pr-2">
          <component height="18px"
                     width="18px"
                     data-testid="inbox-tasks-item-component"
                     :is="stateToIcon(contact.last_communication.disposition_status2, contact.last_communication.type, contact.last_communication.direction, contact.last_communication.callback_status)">
          </component>
        </div>
        <div class="comm-label text-grey-90 d-flex align-items-center">
          <div class="truncated-text"
               :class="[callStatusClass, hasUnreadsClass]"
               v-if="[CommunicationTypes.CALL, CommunicationTypes.FAX].includes(contact.last_communication.type)">
            <q-tooltip data-testid="inbox-tasks-item-tooltip">
              {{ communicationLabel }}
            </q-tooltip>
            {{ communicationLabel }}
          </div>

          <div class="truncated-text"
               :class="hasUnreadsClass"
               v-if="hasSmsBody">
            {{ smsEmptyBodyAlternativeText }}
          </div>

          <div class="truncated-text"
               :class="[appointmentReminderTextClass, hasUnreadsClass]"
               v-if="contact.last_communication.body !== null && isMention"
               v-html="parsedBody">
          </div>

          <div class="truncated-text"
               :class="[appointmentReminderTextClass, hasUnreadsClass]"
               v-else-if="contact.last_communication.body !== null">
            {{ contact.last_communication.body  }}
          </div>

        </div>
      </div>

      <div class="campaign-name text-grey-10 truncated-text"
           :class="hasUnreadsClass"
           v-if="contact.last_communication">
        {{ campaignName }}
      </div>
    </div>
    <div class="actions text-right pb-1"
         v-if="contact.last_communication || lastEngagement">
      <span class="time-passed text-grey-90 mr-2"
            role="button"
            v-if="hasRelativeTime && !isLive">
        <task-item-time :key="taskItemKey"
                        :from-time="lastEngagement"
                        :update-interval="6000"
                        data-testid="inbox-tasks-item-time">
        </task-item-time>
      </span>

      <div v-if="contact.last_communication && isLiveCall">
        <live-call-controls :communication="contact.last_communication"
                            :contact="contact" />
      </div>
    </div>

    <div class="overlay position-absolute opacity-1 text-center pt-2"
         v-if="isReopened && !isSearch">
      <avatar width="34"
              height="34"
              data-testid="item-contact-name-avatar"
              :style="avatarStyle(false)"
              :name="contactName">
      </avatar>
      <p class="text-muted _500" data-testid="item-reopened-conversation">This conversation has been reopened</p>
    </div>
  </div>
</template>

<script>
import Avatar from 'components/avatar'
import {
  avatarMixin,
  communicationInfoMixin,
  notificationMixin,
  liveCallsMixin,
  unownedContactTaskMixin,
  mentionsMixin
} from 'src/plugins/mixins'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationDirection from 'src/constants/communication-direction'
import TaskItemTime from 'components/inbox/channel-tasks/task-item-time'
import CancelCallIcon from 'components/icons/cancel-call-icon'
import AcceptCallIcon from 'components/icons/accept-call-icon'
import { mapActions, mapState } from 'vuex'
import _ from 'lodash'
import ParkedCallIcon from 'components/icons/parked-call-icon'
import HangupIcon from 'components/icons/hangup-icon'
import ParkCallIcon from 'components/icons/park-call-icon'
import IgnoreCallIcon from 'components/icons/ignore-call-icon'
import LiveCallControls from 'components/shared/live-call-controls'

export default {
  name: 'inbox-task-item',

  mixins: [
    avatarMixin,
    communicationInfoMixin,
    notificationMixin,
    liveCallsMixin,
    unownedContactTaskMixin,
    mentionsMixin
  ],

  components: {
    IgnoreCallIcon,
    ParkCallIcon,
    HangupIcon,
    ParkedCallIcon,
    AcceptCallIcon,
    CancelCallIcon,
    TaskItemTime,
    Avatar,
    LiveCallControls
  },

  props: {
    contact: {
      required: true
    },

    loadingContact: {
      type: Boolean,
      default: false
    },

    isSearch: {
      type: Boolean,
      required: false,
      default: false
    },

    forceActive: {
      type: Boolean,
      required: false
    }
  },

  computed: {
    ...mapState(['campaigns', 'dialer', 'ringGroups', 'notifications']),

    ...mapState('contacts', { contactData: 'contact' }),

    ...mapState('inbox', [
      'selectedContact',
      'liveContacts',
      'channelChangedFilterFields'
    ]),

    contactName () {
      if (this.contact && this.contact.name) {
        return _.get(this.contact, 'name', '')
      }

      if (this.contact && this.contact.first_name && this.contact.last_name) {
        return `${this.contact.first_name} ${this.contact.last_name}`
      }

      return 'No Name'
    },

    contactAvatar () {
      if (this.contact && this.contact.first_name && this.contact.last_name) {
        return `${this.contact.first_name} ${this.contact.last_name}`
      }

      return ''
    },

    isActiveItem () {
      return this.selectedContact &&
        this.selectedContact.id === this.contact.id &&
        ['Inbox Contact Task', 'Inbox View Contact Task'].includes(this.$route.name)
    },

    activeClass () {
      return this.isActiveItem || this.forceActive ? 'active' : ''
    },

    totalUnreads () {
      return this.contact.unread_texts_count + this.contact.unread_missed_calls_count + this.contact.unread_voicemails_count
    },

    campaignName () {
      if (_.isEmpty(this.campaigns) || !this.contact.last_communication.campaign_id) {
        return '-'
      }

      const campaign = this.campaigns.find(campaign => campaign.id === this.contact.last_communication.campaign_id)

      if (campaign) {
        return campaign.name
      }

      return '-'
    },

    isReopened () {
      return this.$route.params.status &&
        ['pending', 'closed'].includes(this.$route.params.status) &&
        this.$options.filters.fixTaskStatusName(this.contact.task_status).toLowerCase() === 'open' &&
        !this.loadingContact &&
        !this.isLive
    },

    isLive () {
      const inprogressStatuses = [
        CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW
      ]

      return this.contact.last_communication &&
        inprogressStatuses.includes(this.contact.last_communication.current_status2)
    },

    smsEmptyBodyAlternativeText () {
      const lastCommunication = this.contact.last_communication
      const directionText = lastCommunication.direction === CommunicationDirection.INBOUND
        ? 'Received'
        : 'Sent'
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      const lastAttachment = !_.isEmpty(lastCommunication.attachments)
        ? lastCommunication.attachments.pop()
        : null

      if (lastAttachment && ['text'].includes(lastAttachment.mime_type)) {
        return directionText + ' a text file'
      }

      if (lastAttachment && ['audio'].includes(lastAttachment.mime_type)) {
        return directionText + ' an audio file'
      }

      if (lastAttachment && ['image'].includes(lastAttachment.mime_type)) {
        return directionText + ' an image'
      }

      if (lastAttachment && ['video'].includes(lastAttachment.mime_type)) {
        return directionText + ' a video file'
      }

      return directionText + ' a file'
    },

    communication () {
      return this.contact.last_communication
    },

    lastEngagement () {
      if (this.communication) {
        return window.moment(this.contact.last_engagement_at).isAfter(this.communication.created_at)
          ? this.contact.last_engagement_at
          : this.communication.created_at
      }

      return this.contact.last_engagement_at
    },

    hasRelativeTime () {
      const isCallCompleted = this.contact?.last_communication?.type === CommunicationTypes.CALL &&
        this.contact?.last_communication?.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW
      const isNotCall = this.contact?.last_communication?.type !== CommunicationTypes.CALL

      return isCallCompleted || isNotCall || this.lastEngagement
    },

    inboxItemClass () {
      const parkedCallClass = this.isParkedCall ? 'item-call-parked' : ''
      const callConnectedClass = this.isConnectedCall ? 'item-call-connected' : ''
      const liveCallClass = this.isLiveCall ? 'item-live-call' : ''

      return [
        this.activeClass,
        parkedCallClass,
        callConnectedClass,
        liveCallClass
      ]
    },

    hasSmsBody () {
      const hasBody = this.contact.last_communication.body === null ||
        !this.contact.last_communication.body || this.contact.last_communication.body.length < 1

      return this.contact.last_communication.type === CommunicationTypes.SMS && hasBody
    },

    appointmentReminderTextClass () {
      const appointmentReminderType = [CommunicationTypes.APPOINTMENT, CommunicationTypes.REMINDER]
      const textClass = appointmentReminderType.includes(this.contact.last_communication.type)
        ? 'pt-1'
        : ''

      return [textClass]
    },

    isIncomingCall () {
      const isCallFishing = this.isCallFishingMode && this.communication.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW
      const isIncomingCall = !this.isCallFishingMode && this.isIncomingLiveCall

      return isCallFishing || isIncomingCall
    },

    callStatusClass () {
      if (this.isParkedCall) {
        return 'call-parked-label'
      }

      if (this.isConnectedCall) {
        return 'call-connected-label'
      }

      return ''
    },

    communicationLabel () {
      let label = this.$options.filters.fixCommDirection(this.contact.last_communication.direction) + ' ' + this.$options.filters.fixCommType(this.contact.last_communication.type)

      if (this.isParkedCall) {
        return `Parked ${label}`
      }

      if (this.isConnectedCall) {
        return `Connected ${label}`
      }

      return label
    },

    hasUnreadsClass () {
      return this.totalUnreads && !this.isParkedCall && !this.isConnectedCall ? 'text-black' : ''
    },

    isMention () {
      return this.contact.last_communication.type === CommunicationTypes.NOTE
    },

    parsedMention () {
      return this.parseMentionToView(this.contact.last_communication.body)
    }
  },

  data () {
    return {
      taskItemKey: 0,
      previousRoute: null,
      CommunicationTypes,
      CommunicationDispositionStatus,
      CommunicationCurrentStatus,
      CommunicationDirection
    }
  },

  methods: {
    ...mapActions(['setShowPhone']),

    getRingGroup (id) {
      return id ? this.ringGroups.find(item => item.id === id) : null
    },

    onItemClick () {
      if (this.isActiveItem && !this.isReopened) {
        return
      }

      if (this.isNotOwned(this.contact.user_id)) {
        this.$generalNotification(`Contact is inaccessible.`, 'error')
        return
      }

      this.$emit('onItemSelected', this.contact)
    }
  },

  watch: {
    $route (to, from) {
      this.previousRoute = from
    },

    isReopened: function (value) {
      if (this.isSearch || (this.previousRoute && this.previousRoute.name === 'Inbox') || !value) { return }
      setTimeout(() => {
        this.$emit('onItemRemoved', this.contact)
      }, 3000)
    },

    'contact.last_engagement_at': function () {
      this.taskItemKey++
    }
  }
}
</script>
