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
          <span v-if="isParkedCall" class="call-parked-label">
            Parked Call
          </span>

          <span v-if="isConnectedCall" class="call-connected-label">
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
      <div class="text-grey-90 d-flex flex-row justify-center"
           v-if="contact.last_communication.direction === CommunicationDirection.INBOUND &&
             contact.last_communication.type === CommunicationTypes.CALL &&
             [CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
             CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
             CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
             CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW].includes(contact.last_communication.current_status2) && dialer.call">
        <div class="pl-0">
          <b-button variant="light"
                    size="sm"
                    class="bg-transparent no-border no-box-shadow p-0"
                    @click="onRejectCall">
            <ignore-call-icon v-if="isCallFishing" />
            <cancel-call-icon v-else/>
          </b-button>

        </div>
        <div v-if="!isActiveCallOwner"
             class="pl-1 pr-0" >
          <b-button variant="light"
                    size="sm"
                    class="bg-transparent no-border no-box-shadow p-0"
                    @click="onAcceptCall">
            <accept-call-icon/>
            <q-menu
                    fit
                    content-class="live-call-options"
                    anchor="top right"
                    self="top left">
              <q-list>
                <q-item clickable
                        v-close-popup
                        @click="onParkCurrentCallAndConnect">
                  <q-item-section class="d-inline-flex">
                    <park-call-icon color="#9B51E0"
                                      width="11.7"
                                      height="12.35"></park-call-icon>
                    <span>Park Current Call &amp; Answer</span>
                  </q-item-section>
                </q-item>
                <q-item clickable
                        v-close-popup
                        @click="onHangupCurrentCallAndConnect">
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
      <div class="text-grey-90 d-flex flex-row justify-center"
           v-if="contact.last_communication.direction === CommunicationDirection.INBOUND &&
             contact.last_communication.type === CommunicationTypes.CALL &&
             [CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW].includes(contact.last_communication.current_status2) && dialer.call">
        <div class="pl-0">
          <b-button variant="light"
                    size="sm"
                    class="bg-transparent no-border no-box-shadow p-0"
                    @click="onHangUpCall">
            <cancel-call-icon/>
          </b-button>
        </div>
      </div>
      <div class="text-grey-90 d-flex flex-row justify-center"
           v-if="contact.last_communication.direction === CommunicationDirection.INBOUND &&
           contact.last_communication.type === CommunicationTypes.CALL &&
           [CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW].includes(contact.last_communication.current_status2) && dialer.call || isParkedCall"
          >
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
                    self="top left">
              <q-list>
                <q-item clickable
                        v-close-popup
                        @click="onParkCurrentCallAndAnswer">
                  <q-item-section class="d-inline-flex">
                    <parked-call-icon color="#9B51E0"
                                    width="11.7"
                                    height="12.35"></parked-call-icon>
                    <span>Park Current Call &amp; Connect</span>
                  </q-item-section>
                </q-item>
                <q-item clickable
                        v-close-popup
                        @click="onHangUpCurrentCallAndAnswer">
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
import { avatarMixin, communicationInfoMixin } from 'src/plugins/mixins'
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

  mixins: [avatarMixin, communicationInfoMixin],

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
    ...mapState(['campaigns', 'dialer', 'ringGroups']),
    ...mapState('inbox', ['selectedContact']),
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
      return [CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW].includes(this.contact.last_communication.current_status2)
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
    }
  },

  data () {
    return {
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
    onItemClick (contact) {
      if (this.selectedContact && this.selectedContact.id === contact.id && !this.isReopened) {
        return
      }
      this.$emit('onItemSelected', contact)
    },
    onAcceptCall (e) {
      let communication = this.contact.last_communication

      if (communication.ring_group_id) {
        const ringGroup = this.getRingGroup(communication.ring_group_id)

        if (ringGroup && ringGroup.fishing_mode) {
          console.log('Accepting call on fishing mode from task item..')
          const data = {
            communication: {
              id: communication.id,
              campaign_id: communication.campaign_id,
              contactName: this.contact.name,
              companyName: this.contact.company_name,
              contactId: this.contact.id
            },
            shouldPark: false,
            shouldHangup: false
          }
          this.$VueEvent.fire('answerCallFishing', data)
          this.setShowPhone(true)
          return
        }
      }

      console.log('Accepting call from task item..')

      this.$VueEvent.fire('answerCall')
      this.setShowPhone(true)
      e.stopImmediatePropagation()
    },
    onRejectCall (e) {
      if (this.dialer.currentStatus === 'CALL_CONNECTED') {
        console.log('Hangup call from task item..')
        this.$VueEvent.fire('hangupCall')
        return
      }

      console.log('Reject call from task item..')
      this.$VueEvent.fire('rejectCall')
      e.stopImmediatePropagation()
    },
    onHangUpCall (e) {
      this.$VueEvent.fire('hangupCall')
      e.stopImmediatePropagation()
    },
    onUnparkCall (e) {
      this.$VueEvent.fire('unparkCall')
      this.$VueEvent.fire('togglePhone')
      e.stopImmediatePropagation()
    },

    onParkCurrentCallAndConnect () {
      this.answerCommunication(true, false)

      // park current call and unpark this call communication
      // this.$VueEvent.fire('parkCall')
      // this.$VueEvent.fire('unparkCall')
    },
    onHangupCurrentCallAndConnect () {
      this.answerCommunication(true, true)

      // hangup current call and unpark this call communication
      // this.$VueEvent.fire('hangupCall')
      // this.$VueEvent.fire('unparkCall')
    },
    onParkCurrentCallAndAnswer () {
      this.answerCommunication(true, false)
      // park current call and answer communication
    },
    onHangUpCurrentCallAndAnswer () {
      this.answerCommunication(false, true)
      // hangup current call and answer
    },
    answerCommunication (shouldPark = false, shouldHangup = false) {
      const data = {
        communication: {
          id: this.contact.last_communication.id,
          campaign_id: this.contact.last_communication.campaign_id,
          contactName: this.contact.name,
          companyName: this.contact.company_name,
          contactId: this.contact.id
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
