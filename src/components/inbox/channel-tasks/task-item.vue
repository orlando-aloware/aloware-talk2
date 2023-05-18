<template>
  <div :class="`task-item w-100 d-flex flex-row py-2 align-items-center border-bottom ${activeClass}`"
       @click="onItemClick(communication)">
    <div class="d-flex justify-content-center avatar-wrapper">
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
                :name="contactAvatar">
        </avatar>
      </div>
    </div>
    <div class="task-details flex-grow-1 pb-1 d-grid"
         role="button">
      <div class="contact-name truncated-text">
        {{ contactName }}
        <q-tooltip content-class="bg-grey-light11"
                   anchor="top left"
                   self="top left"
                   :offset="[0, 33]">
          {{ contactName }}
        </q-tooltip>
      </div>
      <div class="d-flex flex-row truncated-text">
        <div class="pr-2">
          <component :is="stateToIcon(communication.disposition_status2, communication.type, communication.direction, channelAnswerStatus, communication.callback_status)"
                     height="18px"
                     width="18px">
          </component>
        </div>
        <div class="comm-label text-grey-90 d-flex align-items-center">
          <div class="truncated-text"
               v-if="communication.type !== CommunicationTypes.SMS && !isParkedCall && !isConnectedCall">
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
          </div>

          <div class="call-parked-label truncated-text"
               v-if="communication.type === CommunicationTypes.CALL && isParkedCall && !isConnectedCall">
            Parked Call
          </div>

          <div class="truncated-text call-connected-label"
                v-if="communication.type === CommunicationTypes.CALL && isConnectedCall && !isParkedCall" >
            Connected
          </div>

          <div class="truncated-text"
               v-if="communicationBody">
            {{ communicationBody }}
          </div>
        </div>
      </div>
      <div class="campaign-name text-grey-10 truncated-text">
        {{ campaignName }}
      </div>
    </div>
    <div class="actions text-right pb-1">
      <span class="time-passed text-grey-90 mr-2"
            role="button">
        <task-item-time :from-time="communication.created_at"
                        :update-interval="6000">
        </task-item-time>
      </span>
      <div v-if="isLiveCall">
        <!-- Incoming Call-->
        <!-- only show this if call is incoming and is not a parked call-->
        <div class="text-grey-90 d-flex flex-row justify-center"
             v-if="shouldShowIncomingCallMenu">

          <!-- show reject button if call is not parked-->
          <div class="pl-0">
            <b-button variant="light"
                      size="sm"
                      class="bg-transparent no-border no-box-shadow p-0"
                      v-if="isShowIgnoreCallIcon || isShowCancelCallIcon"
                      @click="onRejectCall">
              <!-- show remove icon for call fishing mode -->
              <ignore-call-icon v-if="isShowIgnoreCallIcon"
                                height="24"
                                width="24" />
              <!-- only show reject button if -->
              <cancel-call-icon v-if="isShowCancelCallIcon"/>
            </b-button>
          </div>
          <div v-if="(isCallFishingMode && this.communication.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW) || (!isCallFishingMode && isIncomingLiveCall)"
               class="pl-1 pr-0" >
            <b-button variant="light"
                      size="sm"
                      class="bg-transparent no-border no-box-shadow p-0"
                      @click="onAcceptCall">
              <accept-call-icon/>
              <q-menu v-if="isDialerConnected"
                      fit
                      content-class="live-call-options"
                      anchor="top right"
                      self="top left"
                      v-model="showIncomingCallMenu"
                      @hide="showIncomingCallMenu = false">
                <q-list>
                  <q-item clickable
                          v-close-popup
                          @click="onParkCurrentCallAndAnswer">
                    <q-item-section class="d-inline-flex">
                      <park-call-icon color="#9B51E0"
                                      width="11.7"
                                      height="12.35">
                      </park-call-icon>
                      <span>Park Current Call &amp; Answer</span>
                    </q-item-section>
                  </q-item>
                  <q-item clickable
                          v-close-popup
                          @click="onHangUpCurrentCallAndAnswer">
                    <q-item-section>
                      <hangup-icon  width="16"
                                    height="16"
                                    class="hangup-icon"></hangup-icon>
                      <span>Hang up Current Call &amp; Answer</span>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </b-button>
          </div>
        </div>

        <!-- Answered / In Progress Call-->
        <div class="text-grey-90 d-flex flex-row justify-center"
             v-if="shouldShowAnsweredCallMenu">
          <div class="pl-0">
            <b-button variant="light"
                      size="sm"
                      class="bg-transparent no-border no-box-shadow p-0"
                      @click="onHangUpCall">
              <cancel-call-icon/>
            </b-button>
          </div>
        </div>

        <!-- Parked Call-->
        <div class="text-grey-90 d-flex flex-row justify-center"
             v-if="shouldShowParkedCallMenu">
          <div class="pl-0">
            <b-button variant="light"
                      size="sm"
                      class="bg-transparent no-border no-box-shadow p-0"
                      @click="onUnparkCall">
              <parked-call-icon/>
              <q-menu v-if="isDialerConnected"
                      fit
                      content-class="live-call-options"
                      anchor="top right"
                      self="top left"
                      v-model="showParkedCallMenu"
                      @hide="showParkedCallMenu = false">
                <q-list>
                  <q-item clickable
                          v-close-popup
                          @click="onParkCurrentCallAndConnect">
                    <q-item-section class="d-inline-flex">
                      <park-call-icon color="#9B51E0"
                                      width="11.7"
                                      height="12.35">
                      </park-call-icon>
                      <span>Park Current Call &amp; Connect</span>
                    </q-item-section>
                  </q-item>
                  <q-item clickable
                          v-close-popup
                          @click="onHangupCurrentCallAndConnect">
                    <q-item-section>
                      <hangup-icon  width="16"
                                    height="16"
                                    class="hangup-icon"></hangup-icon>
                      <span>Hang up Current Call &amp; Connect</span>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </b-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import {
  avatarMixin,
  communicationInfoMixin,
  liveCallsMixin
} from 'src/plugins/mixins'
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
import IgnoreCallIcon from 'components/icons/ignore-call-icon'
import HangupIcon from 'components/icons/hangup-icon'
import ParkCallIcon from 'components/icons/park-call-icon'
import ParkedCallIcon from 'components/icons/parked-call-icon'

export default {
  name: 'task-item',

  mixins: [
    avatarMixin,
    communicationInfoMixin,
    liveCallsMixin
  ],

  components: {
    ParkedCallIcon,
    ParkCallIcon,
    HangupIcon,
    IgnoreCallIcon,
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
    ...mapState(['campaigns', 'dialer']),

    ...mapState('inbox', [
      'selectedCommunication',
      'activeChannel',
      'liveContacts'
    ]),

    contactName () {
      if (this.communication.contact && this.communication.contact.name) {
        return this.communication.contact.name
      }

      if (this.communication && (this.communication.lead_number || this.communication.lead_number.trim().length > 0)) {
        return this.$options.filters.fixPhone(this.communication.lead_number)
      }

      return 'No Name'
    },

    contactAvatar () {
      if (this.communication.contact && this.communication.contact.name) {
        return this.communication.contact.name
      }

      return ''
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
      return (this.selectedCommunication && this.communication.id === this.selectedCommunication.id) ||
      (this.$route.params.communicationId && this.$route.params.communicationId === this.communication.id.toString())
        ? 'active' : ''
    },

    channelAnswerStatus () {
      return this.activeChannel.answerStatus || ''
    },

    smsEmptyBodyAlternativeText () {
      const directionText = (this.communication.direction === CommunicationDirection.INBOUND ? 'Received' : 'Sent')
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      const lastAttachment = !_.isEmpty(this.communication.attachments) ? this.communication.attachments.pop() : null
      if (lastAttachment) {
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

      return ''
    },
    contact () {
      return this.communication.contact
    },
    communicationBody () {
      if (this.communication.type === CommunicationTypes.SMS && (this.communication.body === null || !this.communication.body || this.communication.body.length < 1)) {
        return this.smsEmptyBodyAlternativeText
      }

      if (this.communication.body !== null) {
        return this.communication.body
      }

      return null
    }
  },

  methods: {
    ...mapActions('inbox', ['setContactId', 'setSelectedCommunication', 'setActiveChannel']),

    ...mapActions(['setShowPhone']),

    ...mapActions('contacts', ['setShowContactResourceUnavailable']),

    markable (communication) {
      // Markable if communication is SMS and the comm direction is INBOUND
      const smsRule = communication.type === CommunicationTypes.SMS &&
        communication.direction === CommunicationDirection.INBOUND
      // Markable if communication is a CALL and disposition_status2 is VOICEMAIL_NEW or MISSED_NEW
      const callRule = communication.type === CommunicationTypes.CALL &&
        [CommunicationDispositionStatus.DISPOSITION_STATUS_MISSED_NEW, CommunicationDispositionStatus.DISPOSITION_STATUS_VOICEMAIL_NEW].includes(communication.disposition_status2) &&
        communication.direction === CommunicationDirection.INBOUND

      return smsRule || callRule
    },

    setContact (id) {
      this.setContactId(id)
    },

    onItemClick (communication) {
      this.setShowContactResourceUnavailable(false)

      if (!communication.contact_id) {
        this.$generalNotification(`Unable to find contact associated with this communication.`, 'error')
        return
      }

      this.setSelectedCommunication(communication)

      // comm with non-existing contact
      if (!this.communication.contact) {
        const communicationInfo = this.$router.resolve({
          path: `/communication/${communication.id}`
        })

        window.open(communicationInfo.href, '_blank')
      }

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
    }
  }
}
</script>
