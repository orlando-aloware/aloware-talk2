<template>
  <div class="contact-task-item task-item w-100 d-flex flex-row py-2 pr-2 align-items-center border-bottom position-relative"
       :class="[activeClass, isParkedCall ? 'item-call-parked' : '', isConnectedCall ? 'item-call-connected' : '']"
       @click="onItemClick(contact)">
    <div class="avatar d-flex justify-content-center pb-1 position-relative"
         role="button">
      <b-badge v-if="totalUnreads > 0"
               class="contact-unread-badge d-flex justify-center align-items-center position-absolute"
               variant="danger"
               pill>
        <span v-if="totalUnreads < 99">{{ totalUnreads }}</span>
        <span v-else>99<sup>+</sup></span>
      </b-badge>
      <avatar width="34"
              height="34"
              :style="avatarStyle(false)"
              :name="contactAvatar">
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
      <div v-if="contact.last_communication"
           class="d-flex flex-row">
        <div class="pr-2">
          <component :is="stateToIcon(contact.last_communication.disposition_status2, contact.last_communication.type, contact.last_communication.direction)"
                     height="18px"
                     width="18px">
          </component>
        </div>
        <div class="comm-label text-grey-90 d-flex align-items-center">
          <span v-if="contact.last_communication.type !== CommunicationTypes.SMS && !isParkedCall && !isConnectedCall">
            {{ contact.last_communication.direction | fixCommDirection }} {{ contact.last_communication.type | fixCommType }}
          </span>
          <span v-if="isParkedCall && !isConnectedCall" class="call-parked-label">
            Parked Call
          </span>

          <span v-if="isConnectedCall && !isParkedCall" class="call-connected-label">
            Connected
          </span>

          <span v-if="contact.last_communication.type === CommunicationTypes.SMS &&
          (contact.last_communication.body === null ||
          !contact.last_communication.body ||
          contact.last_communication.body.length < 1)">
            {{ smsEmptyBodyAlternativeText }}
          </span>
          <span v-if="contact.last_communication.body !== null">
            {{ contact.last_communication.body | truncate(22) }}
          </span>

        </div>
      </div>
      <div v-if="contact.last_communication"
           class="campaign-name text-grey-10">
        {{ campaignName }}
      </div>
    </div>
    <div v-if="contact.last_communication"
         class="actions text-right pb-1">
      <span class="time-passed text-grey-90 mr-2"
            role="button"
            v-if="(contact.last_communication.type === CommunicationTypes.CALL &&
            contact.last_communication.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW) ||
            contact.last_communication.type !== CommunicationTypes.CALL">
        <task-item-time :from-time="contact.last_communication.created_at"
                        :update-interval="6000">
        </task-item-time>
      </span>

      <div v-if="isLiveCall">
        <!-- Incoming Call-->
        <!-- only show this if call is incoming and is not a parked call-->
        <div class="text-grey-90 d-flex flex-row justify-center"
             v-if="((isIncomingLiveCall && !isCallFishingMode && dialer.call) || (isIncomingLiveCall && isCallFishingMode)) && !isParkedCall && !isRejecting && !isAnsweringCall">

          <!-- show reject button if call is not parked-->
          <div class="pl-0">
            <b-button variant="light"
                      size="sm"
                      class="bg-transparent no-border no-box-shadow p-0"
                      @click="onRejectCall">
              <!-- show remove icon for call fishing mode -->
              <ignore-call-icon v-if="isIncomingLiveCall && isCallFishingMode"
                                height="24"
                                width="24" />
              <!-- only show reject button if -->
              <cancel-call-icon v-if="isIncomingLiveCall && !isCallFishingMode"/>
            </b-button>
          </div>
          <div v-if="isCallFishingMode || (!isCallFishingMode && isIncomingLiveCall)"
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
                                    height="16"></hangup-icon>
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
             v-if="isActiveCall && !isParkedCall">
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
             v-if="isParkedCall">
          <div class="pl-0">
            <b-button variant="light"
                      size="sm"
                      class="bg-transparent no-border no-box-shadow p-0"
                      @click="onUnparkCall">
              <parked-call-icon/>
              <q-menu v-if="dialer.currentStatus === 'CALL_CONNECTED'"
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
                                    height="16"></hangup-icon>
                      Hang up Current Call &amp; Connect
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </b-button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="isReopened && !isSearch"
         class="overlay position-absolute opacity-1 text-center pt-2">
      <avatar width="34"
              height="34"
              :style="avatarStyle(false)"
              :name="contactName">
      </avatar>
      <p class="text-muted _500">You reopened this conversation</p>
    </div>
  </div>
</template>

<script>
import Avatar from 'components/avatar'
import { avatarMixin, communicationInfoMixin, notificationMixin } from 'src/plugins/mixins'
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

export default {
  name: 'inbox-task-item',

  mixins: [avatarMixin, communicationInfoMixin, notificationMixin],

  components: { IgnoreCallIcon, ParkCallIcon, HangupIcon, ParkedCallIcon, AcceptCallIcon, CancelCallIcon, TaskItemTime, Avatar },

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
    }
  },

  computed: {
    ...mapState(['campaigns', 'dialer', 'ringGroups', 'notifications']),
    ...mapState('inbox', ['selectedContact', 'liveContacts', 'contacts']),
    contactName () {
      if (this.contact && this.contact.first_name && this.contact.last_name) {
        return `${this.contact.first_name} ${this.contact.last_name}`
      }

      return this.$options.filters.fixPhone(this.contact.phone_number)
    },
    contactAvatar () {
      if (this.contact && this.contact.first_name && this.contact.last_name) {
        return `${this.contact.first_name} ${this.contact.last_name}`
      }

      return ''
    },
    activeClass () {
      return this.selectedContact && this.selectedContact.id === this.contact.id ? 'active' : ''
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
        this.$route.params.status !== 'open' &&
        this.$options.filters.fixTaskStatusName(this.contact.task_status).toLowerCase() === 'open' &&
        !this.loadingContact
    },
    smsEmptyBodyAlternativeText () {
      let directionText = (this.contact.last_communication.direction === CommunicationDirection.INBOUND ? 'Received' : 'Sent')
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      let lastAttachment = this.contact.last_communication.attachments.pop()

      switch (true) {
        case lastAttachment && ['text'].includes(lastAttachment.mime_type):
          return directionText + ' a text file'
        case lastAttachment && ['audio'].includes(lastAttachment.mime_type):
          return directionText + ' an audio file'
        case lastAttachment && ['image'].includes(lastAttachment.mime_type):
          return directionText + ' an image'
        case lastAttachment && ['video'].includes(lastAttachment.mime_type):
          return directionText + ' a video file'
        case lastAttachment && ['application'].includes(lastAttachment.mime_type):
        default:
          return directionText + ' a file'
      }
    },
    isActiveCallOwner () {
      return this.dialer.currentStatus === 'CALL_CONNECTED' &&
        this.dialer.communication &&
        this.dialer.communication.id === this.contact.last_communication.id
    },
    isParkedCall () {
      if (!this.contact.last_communication) {
        return false
      }
      return this.dialer.parkedCall && this.dialer.parkedCall.id === this.contact.last_communication.id
    },

    isActiveCall () {
      if (!this.contact.last_communication) {
        return false
      }

      return this.dialer.call && this.dialer.call.state === 'open' &&
        this.dialer.communication && this.dialer.communication.id === this.contact.last_communication.id
    },

    isConnectedCall () {
      if (!this.contact.last_communication) {
        return false
      }
      return [CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW].includes(this.contact.last_communication.current_status2)
    },
    isCallFishing () {
      if (!this.contact.last_communication.ring_group_id) {
        return false
      }

      const ringGroup = this.getRingGroup(this.contact.last_communication.ring_group_id)

      return ringGroup && ringGroup.fishing_mode
    },
    isCallFishingMode () {
      if (this.notifications.callFishing.communicationId === this.contact.last_communication.id) {
        return true
      }

      if (this.notifications.callFishing.queue) {
        let index = this.notifications.callFishing.queue.findIndex(item => item.communicationId === this.contact.last_communication.id)
        return index >= 0
      }

      return false
    },

    isIncomingLiveCall () {
      return this.contact.last_communication.type === CommunicationTypes.CALL &&
        this.contact.last_communication.direction === CommunicationDirection.INBOUND &&
        this.incomingCallStatuses.includes(this.contact.last_communication.current_status2)
    },

    isRealCall () {
      return this.contact.last_communication.type === CommunicationTypes.CALL && this.contact.last_communication.direction === CommunicationDirection.INBOUND &&
        [
          CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
          CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW
        ].includes(this.contact.last_communication.current_status2)
    },

    isFishingModeCall () {
      return this.isCallFishingMode &&
        this.contact.last_communication.type === CommunicationTypes.CALL &&
        this.contact.last_communication.direction === CommunicationDirection.INBOUND &&
        [CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW].includes(this.contact.last_communication.current_status2)
    },

    isDialerAvailable () {
      return !this.dialer.call
    },

    isDialerConnected () {
      return this.dialer.call && this.dialer.call.state === 'open'
    },

    isLiveCall () {
      return this.liveCallStatuses.includes(this.contact.last_communication.current_status2)
    },

    incomingCallStatuses () {
      return [
        CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW, // call fishing
        CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW // parked
      ]
    },

    liveCallStatuses () {
      return [...this.incomingCallStatuses, ...[CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW]]
    }
  },

  data () {
    return {
      CommunicationTypes,
      CommunicationDispositionStatus,
      CommunicationCurrentStatus,
      CommunicationDirection,
      showIncomingCallMenu: false,
      showParkedCallMenu: false,
      isRejecting: false,
      isHangingUp: false,
      isParking: false,
      isAnsweringCall: false
    }
  },

  methods: {
    ...mapActions(['setShowPhone']),
    ...mapActions('inbox', ['setLiveContacts', 'setContacts']),
    getRingGroup (id) {
      return id ? this.ringGroups.find(item => item.id === id) : null
    },
    onItemClick (contact) {
      if (this.selectedContact && this.selectedContact.id === contact.id && !this.isReopened) {
        return
      }
      this.$emit('onItemSelected', contact)
    },
    onAcceptCall (e) {
      if (this.dialer.call && this.dialer.currentStatus === 'CALL_CONNECTED') {
        this.showIncomingCallMenu = true
        e.stopImmediatePropagation()
        return
      }

      this.isAnsweringCall = true

      let communication = this.contact.last_communication

      if (communication.ring_group_id) {
        const ringGroup = this.getRingGroup(communication.ring_group_id)

        if (ringGroup && ringGroup.fishing_mode) {
          console.log('Accepting call on fishing mode from task item..')
          const data = {
            communication: {
              id: communication.id,
              campaignId: communication.campaign_id,
              contactName: this.contact.name,
              companyName: this.contact.company_name,
              contactId: this.contact.id,
              phoneNumber: this.contact.phone_number
            },
            shouldPark: false,
            shouldHangup: false
          }
          this.$VueEvent.fire('answerCallFishing', data)
          this.setShowPhone(true)
          this.isAnsweringCall = false
          e.stopImmediatePropagation()
          return
        }
      }

      console.log('Accepting call from task item..')

      this.$VueEvent.fire('answerCall')
      this.isAnsweringCall = false
      this.setShowPhone(true)
      e.stopImmediatePropagation()
    },
    onRejectCall (e) {
      this.isRejecting = true
      if (this.isCallFishingMode) {
        this.processRemoveFromNotification(this.contact.last_communication)
        let isInLiveContacts = this.liveContacts.find(item => item.id === this.contact.id)
        let isInContacts = this.contacts.find(item => item.id === this.contact.id)
        let liveContacts = _.cloneDeep(this.liveContacts)
        let contact = _.cloneDeep(this.contact)
        if (isInLiveContacts) {
          let index = this.liveContacts.findIndex(item => item.id === this.contact.id)
          liveContacts.splice(index, 1)
          this.setLiveContacts(liveContacts)
        }
        let contacts = _.cloneDeep(this.contacts)
        if (!isInContacts) {
          contacts.unshift(contact)
          this.setContacts(contacts)
        }

        this.isRejecting = false
        e.stopImmediatePropagation()
        return
      }

      // handle active call
      if (this.dialer && this.dialer.state === 'open') {
        console.log('Hangup call from task item..')
        this.$VueEvent.fire('hangupCall')
        this.isRejecting = false
        return
      }

      console.log('Reject call from task item..')
      this.$VueEvent.fire('rejectCall')
      this.isRejecting = false
      e.stopImmediatePropagation()
    },
    onHangUpCall (e) {
      console.log(';hangup')
      this.$VueEvent.fire('hangupCall')
      e.stopImmediatePropagation()
    },
    onUnparkCall (e) {
      if (this.dialer.call && this.dialer.currentStatus === 'CALL_CONNECTED') {
        this.showParkedCallMenu = true
        e.stopImmediatePropagation()
        return
      }

      this.$VueEvent.fire('unparkCall')
      this.$VueEvent.fire('togglePhone')
      e.stopImmediatePropagation()
    },

    onParkCurrentCallAndConnect () {
      this.showParkedCallMenu = false
      this.answerCommunication(true, true)
    },
    onHangupCurrentCallAndConnect () {
      this.showParkedCallMenu = false
      this.answerCommunication(false, true)
    },
    onParkCurrentCallAndAnswer () {
      this.showIncomingCallMenu = false
      this.answerCommunication(true, false)
    },
    onHangUpCurrentCallAndAnswer () {
      this.showIncomingCallMenu = false
      this.answerCommunication(false, true)
    },
    answerCommunication (shouldPark = false, shouldHangup = false) {
      const data = {
        communication: {
          id: this.contact.last_communication.id,
          campaignId: this.contact.last_communication.campaign_id,
          contactName: this.contact.name,
          companyName: this.contact.company_name,
          contactId: this.contact.id,
          phoneNumber: this.contact.phone_number
        },
        shouldPark: shouldPark,
        shouldHangup: shouldHangup
      }
      this.$VueEvent.fire('answerCallFishing', data)
      this.setShowPhone(true)
    }
  }
}
</script>
