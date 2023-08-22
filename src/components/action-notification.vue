<template>
  <b-toast solid
           auto-hide-delay="30000"
           :toast-class="toastClass"
           :header-class="headerClass"
           :toaster="position"
           :no-auto-hide="noAutoHide"
           :id="id"
           :to="link"
           v-show="title.length > 0"
           @hide="clearDateTimeInterval"
           @hidden="onHidden"
           @show="onShow"
           @shown="autoClose">
    <button class="btn btn-sm text-white text-xxs2 bg-blue-60-opaque border-full-rounded position-absolute call-fishing-clear-queues"
            v-if="queueCount > 1"
            @click="clearNotificationQueue">
      Clear All
    </button>
    <div class="notification-body-wrapper"
         @click="onNotificationClick">
      <div class="d-flex flex-row align-items-center">
        <b-badge v-if="id === 'callFishing' && queueCount > 1"
                 class="call-fishing-queue-badge d-flex justify-center align-items-center position-absolute ml-4"
                 variant="danger"
                 pill>
          {{ queueCount }}
        </b-badge>
        <div class="mr-2 notification-icon"
             :class="notificationIconClasses"
             @click="toInbox">
          <system-update-icon v-if="id === 'system'"/>
          <sms-icon v-if="id === 'sms'"/>
          <call-icon v-if="id === 'call'"/>
          <voicemail-icon v-if="id === 'voicemail'"/>
          <mention-icon v-if="id === 'mention'"/>
          <call-incoming-icon v-if="isCall"/>
        </div>
        <div class="notification-details"
             :class="[(!['incomingCall','callFishing'].includes(id) ? 'w-100' : 'flex-grow-1'), (id === 'callFishing' && queue ? 'pl-2' : '')]"
             @click="toInbox">
          <div class="d-flex flex-grow-1 align-items-baseline w-100"
               v-if="getSource">
            <span class="mr-auto text-white pr-1 text-sm">
              {{ getSource }}
            </span>
          </div>
          <div class="d-flex flex-grow-1 align-items-baseline w-100">
            <!--b-img blank blank-color="#ff5555" class="mr-2" width="12" height="12"></b-img-->
            <strong class="mr-auto text-white title pr-1">
              {{ title }}
            </strong>
            <small class="mr-2 text-grey-82 time text-nowrap"
                   v-if="!isCall">
              {{ runningDateTime }}
            </small>
          </div>

          <!-- caller location -->
          <div class="d-flex flex-grow-1 align-items-baseline w-100"
               v-if="location">
            <span class="mr-auto text-white pr-1 text-sm">
              {{ location }}
            </span>
          </div>

          <div class="text-grey-81 message-body text-break d-flex w-100">
            <div class="flex-grow-1 d-flex align-items-center w-100">
              <component class="message-icon mr-1"
                         :is="messageIcon"
                         v-if="messageIcon"/>
              <span v-if="!isCall && message"
                    class="message-text"
                    v-html="$options.filters.nl2br(message, false)">
              </span>
              <span v-if="id === 'sms' && attachment && !message"
                    class="message-text">
                Inbound MMS
              </span>
              <div class="message-text row has-ring-group"
                   v-else-if="isCall && campaignName && ringGroupName">
                <div class="campaign-wrapper col-5">
                  <div class="campaign-name">{{ campaignName }}</div>
                </div>
                <div class="flex-grow-1">></div>
                <div class="ring-group-wrapper col-5">
                  <div class="ring-group-name">{{ ringGroupName }}</div>
                </div>
              </div>
              <span class="message-text d-flex"
                    v-else-if="isCall && campaignName && !ringGroupName">
                {{ campaignName }}
              </span>
            </div>
          </div>
        </div>

        <div class="d-flex justify-content-center align-items-center call-actions"
             v-if="id === 'incomingCall' || (id === 'callFishing' && dialer && !dialer.call)">
          <q-btn class="height-32 mr-2"
                 ripple
                 round
                 no-caps
                 @click="rejectCall">
            <cancel-call-icon width="32"
                              height="32"
                              v-if="id === 'incomingCall'"/>
            <ignore-call-icon v-if="id === 'callFishing'"/>
            <q-tooltip anchor="top middle"
                       self="center middle">
              {{ id === 'incomingCall' ? 'Decline' : 'Ignore' }}
            </q-tooltip>
          </q-btn>
          <q-btn class="height-32"
                 ripple
                 round
                 no-caps
                 @click="answerCall">
            <q-tooltip anchor="top middle"
                       self="center middle">
              Answer
            </q-tooltip>
            <accept-call-icon width="32" height="32"/>
          </q-btn>
        </div>
        <div class="d-flex justify-content-center align-items-center call-fishing-actions"
             :class="id === 'callFishing' && getSource ? 'mt-2' : ''"
             v-if="id === 'callFishing' && dialer && dialer.call">
          <q-btn class="height-32 mr-2"
                 ripple
                 round
                 no-caps
                 @click="ignoreFishing">
            <ignore-call-icon>
              <q-tooltip anchor="top middle"
                         self="center middle">
                Ignore
              </q-tooltip>
            </ignore-call-icon>
          </q-btn>

          <q-btn class="height-32"
                 ripple
                 round
                 no-caps
                 @click="answerCall"
                 v-if="dialer.currentStatus === 'WRAP_UP'">
            <q-tooltip anchor="top middle"
                       self="center middle">
              Answer
            </q-tooltip>
            <accept-call-icon width="32" height="32"/>
          </q-btn>

          <b-dropdown no-caret
                      :right="$q.screen.lt.lg"
                      :dropright="!$q.screen.lt.lg"
                      variant="transparent"
                      class="m-2 b-compact-dropdown-button text-bold height-32"
                      v-if="dialer.currentStatus !== 'WRAP_UP'">
            <template #button-content>
              <accept-call-icon width="32" height="32"/>
            </template>
            <b-dropdown-item href=""
                             link-class="d-flex align-items-center"
                             @click="answerCommunication(true, false)">
              <park-call-icon class="icon-margin"
                              width="13"
                              height="13"
                              color="#9B51E0"/>Park Current Call & Connect
            </b-dropdown-item>
            <b-dropdown-item href=""
                             @click="answerCommunication(false, true)">
              <hangup-icon class="icon-margin" width="13"/>Hangup Current Call & Connect
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
    </div>
  </b-toast>
</template>

<script>
import { get, isEmpty } from 'lodash'
import { mapActions, mapState } from 'vuex'
import {
  mentionsMixin,
  notificationMixin,
  visibilityMixin,
  aclMixin
} from 'src/plugins/mixins'
import CancelCallIcon from 'components/icons/cancel-call-icon'
import AcceptCallIcon from 'components/icons/accept-call-icon'
import ParkCallIcon from 'components/icons/park-call-icon'
import HangupIcon from 'components/icons/hangup-icon'
import IgnoreCallIcon from 'components/icons/ignore-call-icon'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationSourceCallTypes from 'src/constants/communication-call-source-types'

export default {
  name: 'action-notification',

  mixins: [
    notificationMixin,
    mentionsMixin,
    visibilityMixin,
    aclMixin
  ],

  components: {
    IgnoreCallIcon,
    HangupIcon,
    AcceptCallIcon,
    CancelCallIcon,
    ParkCallIcon
  },

  props: {
    id: {
      required: false,
      type: String,
      default: 'system'
    },

    position: {
      required: false,
      type: String,
      default: 'b-toaster-bottom-right'
    }
  },

  data () {
    return {
      runningDateTime: null,
      runningDateTimeInterval: null,
      isValidNotification: false
    }
  },

  computed: {
    ...mapState(['notifications', 'dialer', 'callFishingQueue', 'users']),
    ...mapState('cache', ['currentCompany']),

    isCall () {
      return ['incomingCall', 'callFishing'].includes(this.id)
    },

    toastClass () {
      const toastClass = { data: 'action-notification notification-border-round' }

      if (!this.isCall) {
        toastClass.data += ' bg-grey-80'
      }

      if (this.isCall) {
        toastClass.data += ' bg-blue-60-opaque position-relative background-blur incoming-call-notification'
      }

      if (this.queue) {
        toastClass.data += ' has-clear-queues'
      }

      if (!this.isValidNotification) {
        toastClass.data += ' hide'
      }

      return toastClass.data
    },

    headerClass () {
      const headerClass = { data: 'border-0 p-0' }

      if (!this.isCall) {
        headerClass.data += ' bg-grey-80'
      }

      if (this.isCall) {
        headerClass.data += ' bg-blue-60-opaque'
      }

      return headerClass.data
    },

    queue () {
      return get(this.notifications, `${this.id}.queue`, null)
    },

    message () {
      const message = get(this.notifications[this.id], 'message', '')

      return this.parseMentionToView(message)
    },

    messageIcon () {
      return get(this.notifications[this.id], 'messageIcon', null)
    },

    title () {
      const title = get(this.notifications[this.id], 'title', '')

      const fixedTitle = this.$options.filters.fixPhone(title)

      if (!['sms', 'call'].includes(this.id) || !fixedTitle) {
        return title
      }

      return fixedTitle
    },

    dateTime () {
      return get(this.notifications[this.id], 'dateTime', '')
    },

    contactId () {
      return get(this.notifications[this.id], 'contactId', '')
    },

    communicationId () {
      return get(this.notifications[this.id], 'communicationId', '')
    },

    link () {
      if (['system', 'incomingCall', 'callFishing'].includes(this.id)) {
        return null
      }

      return {
        path: `/channels/inbox/open/contacts/${this.contactId}/communications/${this.communicationId}`
      }
    },

    attachment () {
      return get(this.notifications[this.id], 'attachment', '')
    },

    noAutoHide () {
      return ['system', 'incomingCall', 'callFishing'].includes(this.id)
    },

    campaignId () {
      return get(this.notifications[this.id], 'campaignId', null)
    },

    campaignName () {
      return get(this.notifications[this.id], 'campaignName', null)
    },

    ringGroupId () {
      return get(this.notifications[this.id], 'ringGroupId', null)
    },

    ringGroupName () {
      return get(this.notifications[this.id], 'ringGroupName', null)
    },

    phoneNumber () {
      return get(this.notifications[this.id], 'phoneNumber', null)
    },

    communication () {
      return get(this.notifications[this.id], 'communication', null)
    },

    contact () {
      return get(this.notifications[this.id], 'contact', null)
    },

    isValidPhoneShowInfo () {
      const dialerCommunicationId = get(this.dialer, 'communication.id', null)
      const callFishingCommunicationId = get(this.dialer, 'callFishing.communication', null)

      return (
        (this.id === 'incomingCall' && this.communicationId === dialerCommunicationId) || (this.id === 'callFishing' && !this.dialer.call && !callFishingCommunicationId)) &&
        !this.dialer.parkedCall
    },

    queueCount () {
      if (isEmpty(this.queue)) {
        return 1
      }

      return this.queue.length + 1
    },

    isCommunicationInCallFishingQueue () {
      return !isEmpty(this.callFishingQueue.find(queue => get(queue, 'communicationId', null) === this.communicationId))
    },

    getSource () {
      if (!this.communication) {
        return ''
      }

      if (this.isColdTransferUser) {
        return 'Transfer to User'
      }

      if (this.isColdTransferRg) {
        return 'Transfer to Ring Group'
      }

      if (this.isIntroduceToUser) {
        return 'Introduce to User'
      }

      if (this.isIntroduceToRg) {
        return 'Introduce to Ring Group'
      }

      if (this.isAddToUser) {
        return 'Add to User'
      }

      if (this.isAddToRg) {
        return 'Add to Ring Group'
      }

      if (this.isSequence) {
        return 'Call from Sequence'
      }

      if (this.isCallWaiting) {
        return 'Call Waiting'
      }

      return 'New Inbound Call'
    },

    isSequence () {
      if (isEmpty(this.communication)) {
        return false
      }

      return this.communication.workflow_id
    },

    isIntroduceToRg () {
      if (isEmpty(this.communication)) {
        return false
      }

      return this.callIsIntroduced && this.communication.last_call_source === CommunicationSourceCallTypes.SOURCE_ADD_RG
    },

    isIntroduceToUser () {
      if (isEmpty(this.communication)) {
        return false
      }

      return this.callIsIntroduced && this.communication.last_call_source === CommunicationSourceCallTypes.SOURCE_ADD_USER
    },

    isAddToRg () {
      if (isEmpty(this.communication)) {
        return false
      }

      return !this.callIsIntroduced && this.communication.last_call_source === CommunicationSourceCallTypes.SOURCE_ADD_RG
    },

    isAddToUser () {
      if (isEmpty(this.communication)) {
        return false
      }

      return !this.callIsIntroduced && this.communication.last_call_source === CommunicationSourceCallTypes.SOURCE_ADD_USER
    },

    callIsIntroduced () {
      if (isEmpty(this.communication)) {
        return false
      }

      return this.communication.is_introduce
    },

    isColdTransferRg () {
      if (isEmpty(this.communication)) {
        return false
      }

      return this.communication.last_call_source === CommunicationSourceCallTypes.SOURCE_COLD_RG
    },

    isColdTransferUser () {
      if (isEmpty(this.communication)) {
        return false
      }

      return this.communication.last_call_source === CommunicationSourceCallTypes.SOURCE_COLD_USER
    },

    isCallWaiting () {
      if (isEmpty(this.communication)) {
        return false
      }

      return this.communication.last_call_source === CommunicationSourceCallTypes.SOURCE_CALL_WAITING
    },

    notificationIconClasses () {
      return [
        this.id === 'system' ? 'system-update' : ''
      ]
    },

    location () {
      if (!this.communication || !this.contact) {
        return false
      }

      let city = this.communication.city || this.contact.cnam_city || null
      const state = this.communication.state || this.contact.cnam_state || null
      const country = this.communication.country || this.contact.cnam_country || null

      if (!city && !state && !country) {
        return 'Unknown Location'
      }

      return `${city || ''}${city && state ? ', ' : ''}${state || ''}${state && country ? ' - ' : ''} ${country || ''}`
    }
  },

  created () {
    this.$VueEvent.listen('update_communication', (data) => {
      if (!this.checkCommunicationMatchesUserAccessibility(data)) {
        return
      }

      if (![
        CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW
      ].includes(data.current_status2) && this.isCommunicationInCallFishingQueue) {
        this.removeFromCallFishingQueue(data.id)
      }
    })
  },

  methods: {
    ...mapActions([
      'setNotifications',
      'setShowPhone',
      'clearCallFishingQueue',
      'removeFromCallFishingQueue'
      // 'setShowIncomingCallNotification'
    ]),

    onShow () {
      this.isValidNotification = false
    },

    autoClose () {
      this.runDateTimeInterval()

      if ((this.id === 'callFishing' && document.getElementById('callFishing') &&
          !this.isCommunicationInCallFishingQueue) ||
        (this.id === 'incomingCall' && document.getElementById('incomingCall') &&
          isEmpty(this.dialer.call))
      ) {
        this.processRemoveFromNotification(this.communication)
        return
      }

      if (this.id === 'incomingCall' &&
        (['CALL_CONNECTED', 'INVITE_CANCELLED', 'READY'].includes(this.dialer.currentStatus))) {
        this.onHidden()
        this.$closeActionNotification(this.id)
        return
      }

      if (!this.noAutoHide &&
        this.dateTime &&
        this.dateTime.diff(this.$moment(), 'seconds') <= -30) {
        this.onHidden()
        this.$closeActionNotification(this.id)
        return
      }

      if (!this.title) {
        this.onHidden()
        this.$closeActionNotification(this.id)
        return
      }

      this.isValidNotification = true
      const shouldPlayFishingNotificationSound = this.id === 'callFishing' && this.currentCompany.fishing_mode_notification_sound
      this.playAudio(shouldPlayFishingNotificationSound)
    },

    runDateTimeInterval () {
      if (this.dateTime) {
        this.runningDateTime = this.$options.filters.shortDateTimePassed(this.dateTime, false)
        this.runningDateTimeInterval = setInterval(() => {
          this.runningDateTime = this.$options.filters.shortDateTimePassed(this.dateTime, false)
        }, 60000)
      }
    },

    clearDateTimeInterval () {
      clearInterval(this.runningDateTimeInterval)
    },

    onHidden () {
      if (this.id === 'call') {
        return
      }

      this.clearDateTimeInterval()

      if (this.id !== 'callFishing' ||
        (this.id === 'callFishing' &&
          !document.getElementById('callFishing'))
      ) {
        this.removeFromCallFishingNotificationQueue(this.notifications[this.id].communicationId)
        this.setNotifications({
          type: this.id,
          data: {
            title: '',
            message: '',
            messageIcon: null,
            attachment: null,
            dateTime: null,
            contactId: '',
            communicationId: '',
            campaignId: '',
            campaignName: '',
            ringGroupName: '',
            phoneNumber: '',
            communication: null,
            contact: null,
            queue: null
          }
        })
      }
    },

    type () {
      switch (this.id) {
        case 'sms':
          return 'messages'
        case 'call':
        case 'callVoicemail':
          return 'calls'
        case 'voicemail':
          return 'voicemails'
        case 'mention':
          return 'mentions'
      }
      return 'sms'
    },

    answerCall () {
      if (this.dialer.currentStatus === 'WRAP_UP') {
        this.$VueEvent.fire('endWrapUp')
      }

      if (this.id === 'callFishing') {
        this.answerCommunication()
        return
      }

      this.$VueEvent.fire('answerCall')
      this.setShowPhone(true)
    },

    ignoreFishing () {
      this.$closeActionNotification('callFishing')
      this.closeCallNotifications(this.id, this.communicationId)
    },

    answerCommunication (shouldPark = false, shouldHangup = false) {
      const data = {
        communication: {
          id: this.communicationId,
          campaignId: this.campaignId,
          contactName: this.title,
          companyName: this.message,
          contactId: this.contactId,
          phoneNumber: this.phoneNumber
        },
        shouldPark: shouldPark,
        shouldHangup: shouldHangup
      }
      this.$VueEvent.fire('answerCallFishing', data)
      this.$closeActionNotification('callFishing')
      this.setShowPhone(true)
    },

    rejectCall () {
      if (this.id !== 'callFishing' ||
        (this.id === 'callFishing' &&
          (!this.queue ||
            (this.queue && !this.queue.length))
        )
      ) {
        this.closeCallNotifications(this.id, this.communicationId, true)
      }

      this.$VueEvent.fire('rejectCall')

      if (this.id === 'callFishing') {
        this.$VueEvent.fire('hidePhone')
      }

      if (this.id === 'callFishing') {
        if (this.queue && this.queue.length) {
          this.switchCallFishingFromQueue()
        } else {
          this.removeFromCallFishingQueue(this.communicationId)
        }
      }
    },

    onNotificationClick (event) {
      // check if there are call buttons in the notification
      let found = document.querySelector('.notification-body-wrapper .call-actions')
      found = !found ? document.querySelector('.notification-body-wrapper .call-fishing-actions') : found

      // 07/12/2022 - Removed for now
      // if (!found &&
      //   this.isValidPhoneShowInfo) {
      //   this.setShowIncomingCallNotification(false)
      //   this.showCallFishingDataInPhone({
      //     communication: this.communication,
      //     contact: this.contact
      //   }, this.id)
      // }

      if (!found &&
        this.id === 'system') {
        this.$closeActionNotification(this.id)

        setTimeout(() => {
          window.location.reload()
        }, 500)
      }
    },

    clearNotificationQueue () {
      this.setNotifications({
        type: this.id,
        data: {
          queue: null
        }
      })

      this.clearCallFishingQueue()
      this.$closeActionNotification(this.id)
    },

    toInbox (event) {
      if (this.isValidPhoneShowInfo) {
        return
      }

      let found = document.querySelector('.notification-body-wrapper .notification-icon:not(.system-update)')

      if (!found) {
        return
      }

      if (this.$route.path !== `/channels/inbox/open/contacts/${this.contactId}/communications/${this.communicationId}`) {
        this.$router.push({
          path: `/channels/inbox/open/contacts/${this.contactId}/communications/${this.communicationId}`
        })
      }
    },

    toContact () {
      if (!this.isCall) {
        return
      }

      if (this.isValidPhoneShowInfo) {
        return
      }

      const className = { data: null }
      const found = event.path.find((item) => {
        className.data = get(item, 'className', null)
        return className.data && typeof className.data === 'string' && (className.data.includes('notification-details'))
      })

      if (!found) {
        return
      }

      if (this.$route.path !== `/contacts/${this.contactId}`) {
        this.$router.push({
          path: `/contacts/${this.contactId}`
        })
      }
    }
  },

  beforeDestroy () {
    this.clearDateTimeInterval()
  }
}
</script>
