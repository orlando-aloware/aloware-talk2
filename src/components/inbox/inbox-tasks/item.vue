<template>
  <div class="contact-task-item task-item w-100 d-flex flex-row py-2 pr-2 align-items-center border-bottom position-relative"
       :class="[activeClass, isParkedCall ? 'item-call-parked' : '', isConnectedCall ? 'item-call-connected' : '', isLiveCall ? 'item-live-call' : '']"
       @click="onItemClick(contact)">
    <div class="d-flex justify-content-center avatar-wrapper">
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
      <div v-if="contact.last_communication"
           class="d-grid grid-2-col task-item-body">
        <div class="pr-2">
          <component :is="stateToIcon(contact.last_communication.disposition_status2, contact.last_communication.type, contact.last_communication.direction)"
                     height="18px"
                     width="18px">
          </component>
        </div>
        <div class="comm-label text-grey-90 d-flex align-items-center">
          <div class="truncated-text"
               v-if="![CommunicationTypes.SMS, CommunicationTypes.EMAIL].includes(contact.last_communication.type) && !isParkedCall && !isConnectedCall">
            {{ contact.last_communication.direction | fixCommDirection }} {{ contact.last_communication.type | fixCommType }}
          </div>
          <div class="truncated-text call-parked-label"
               v-if="isParkedCall && !isConnectedCall" >
            Parked Call
          </div>
          <div class="truncated-text call-connected-label"
               v-if="isConnectedCall && !isParkedCall">
            Connected
          </div>

          <div class="truncated-text"
               v-if="contact.last_communication.type === CommunicationTypes.SMS &&
               (contact.last_communication.body === null ||
               !contact.last_communication.body ||contact.last_communication.body.length < 1)">
            {{ smsEmptyBodyAlternativeText }}
          </div>
          <div class="truncated-text"
               v-if="contact.last_communication.body !== null">
            {{ contact.last_communication.body }}
          </div>

        </div>
      </div>
      <div v-if="contact.last_communication"
           class="campaign-name text-grey-10 truncated-text">
        {{ campaignName }}
      </div>
    </div>
    <div v-if="contact.last_communication || lastEngagement"
         class="actions text-right pb-1">
      <span class="time-passed text-grey-90 mr-2"
            role="button"
            v-if="hasRelativeTime && !isLive">
        <task-item-time :key="taskItemKey"
                        :from-time="lastEngagement"
                        :update-interval="6000">
        </task-item-time>
      </span>

      <div v-if="contact.last_communication && isLiveCall">
        <!-- Incoming Call-->
        <!-- only show this if call is incoming and is not a parked call-->
        <div class="text-grey-90 d-flex flex-row justify-center"
             v-if="shouldShowIncomingCallMenu">

          <!-- show reject button if call is not parked-->
          <div class="pl-0">
            <b-button variant="light"
                      size="sm"
                      class="bg-transparent no-border no-box-shadow p-0"
                      @click="onRejectCall">
              <!-- show remove icon for call fishing mode -->
              <ignore-call-icon v-if="isIncomingLiveCall && isCallFishingMode && isCallFishing"
                                height="24"
                                width="24" />
              <!-- only show reject button if -->
              <cancel-call-icon v-if="isIncomingLiveCall && !isCallFishing"/>
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
                      :offset="[5, 9]"
                      @hide="showIncomingCallMenu = false">
                <q-list>
                  <q-item clickable
                          v-close-popup
                          @click="onParkCurrentCallAndAnswer">
                    <q-item-section class="d-inline-flex">
                      <park-call-icon color="#9B51E0"
                                      class="park-call-icon"
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
                      :offset="[5, 9]"
                      @hide="showParkedCallMenu = false">
                <q-list>
                  <q-item clickable
                          v-close-popup
                          @click="onParkCurrentCallAndConnect">
                    <q-item-section class="d-inline-flex">
                      <park-call-icon color="#9B51E0"
                                      class="park-call-icon"
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

    <div v-if="isReopened && !isSearch"
         class="overlay position-absolute opacity-1 text-center pt-2">
      <avatar width="34"
              height="34"
              :style="avatarStyle(false)"
              :name="contactName">
      </avatar>
      <p class="text-muted _500">This conversation has been reopened</p>
    </div>
  </div>
</template>

<script>
import Avatar from 'components/avatar'
import { avatarMixin, communicationInfoMixin, notificationMixin, liveCallsMixin } from 'src/plugins/mixins'
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

  mixins: [avatarMixin, communicationInfoMixin, notificationMixin, liveCallsMixin],

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
    ...mapState('contacts', { contactData: 'contact' }),
    ...mapState('inbox', ['selectedContact', 'liveContacts', 'contacts', 'channelChangedFilterFields']),
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
        ['pending', 'closed'].includes(this.$route.params.status) &&
        this.$options.filters.fixTaskStatusName(this.contact.task_status).toLowerCase() === 'open' &&
        !this.loadingContact &&
        !this.isLive
    },
    isLive () {
      return this.contact.last_communication && [
        CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW
      ].includes(this.contact.last_communication.current_status2)
    },
    smsEmptyBodyAlternativeText () {
      const directionText = (this.contact.last_communication.direction === CommunicationDirection.INBOUND ? 'Received' : 'Sent')
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      const lastAttachment = !_.isEmpty(this.contact.last_communication.attachments) ? this.contact.last_communication.attachments.pop() : null

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
    communication () {
      return this.contact.last_communication
    },
    lastEngagement () {
      if (this.communication) {
        return window.moment(this.contact.last_engagement_at).isAfter(this.communication.created_at) ? this.contact.last_engagement_at : this.communication.created_at
      }

      return this.contact.last_engagement_at
    },
    hasRelativeTime () {
      return (this.contact.last_communication && this.contact.last_communication.type === CommunicationTypes.CALL &&
          this.contact.last_communication.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_COMPLETED_NEW) ||
        (this.contact.last_communication && this.contact.last_communication.type !== CommunicationTypes.CALL) ||
        this.lastEngagement
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
    onItemClick (contact) {
      if (this.selectedContact && this.selectedContact.id === contact.id && !this.isReopened) {
        return
      }
      this.$emit('onItemSelected', contact)
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
    'contact.last_communication.id': function () {
      this.taskItemKey++
    },
    'contactData.task_status': {
      deep: true,
      handler: function (value) {
        if (this.contactData.id === this.contact.id) {
          this.contact.task_status = this.contactData.task_status
        }
      }
    }
  }
}
</script>
