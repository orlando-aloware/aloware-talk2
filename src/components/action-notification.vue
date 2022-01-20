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
           @shown="autoClose">
    <button
      class="btn btn-sm text-white text-xxs2 bg-blue-60-opaque border-rounded position-absolute call-fishing-clear-queues"
      v-if="queue && queue.length > 0"
      @click="clearNotificationQueue">
      Clear All
    </button>
    <div class="notification-body-wrapper"
         @click="onNotificationClick">
      <div class="d-flex flex-row align-items-start">
        <b-badge v-if="id === 'callFishing' && queue && queue.length > 0"
                 class="call-fishing-queue-badge d-flex justify-center align-items-center position-absolute ml-4"
                 variant="danger"
                 pill>
          {{ queue.length }}
        </b-badge>
        <div class="mr-2 notification-icon"
        @click="toInbox">
          <system-update-icon v-if="id === 'system'"/>
          <sms-icon v-if="id === 'sms'"/>
          <call-icon v-if="id === 'call'"/>
          <voicemail-icon v-if="id === 'voicemail'"/>
          <mention-icon v-if="id === 'mention'"/>
          <call-incoming-icon v-if="['incomingCall', 'callFishing'].includes(id)"/>
        </div>
        <div class="notification-details"
             :class="[(!['incomingCall','callFishing'].includes(id) ? 'w-100' : 'flex-grow-1'), (id === 'callFishing' && queue ? 'pl-2' : '')]"
             @click="toContact">
          <div class="d-flex flex-grow-1 align-items-baseline w-100">
            <!--b-img blank blank-color="#ff5555" class="mr-2" width="12" height="12"></b-img-->
            <strong class="mr-auto text-white title pr-1">
              {{ title }}
            </strong>
            <small class="mr-2 text-grey-82 time text-nowrap"
                   v-if="!['incomingCall', 'callFishing'].includes(id)">
              {{ runningDateTime }}
            </small>
          </div>
          <div class="text-grey-81 message-body text-break d-flex w-100">
            <div class="flex-grow-1 d-flex align-items-center w-100">
              <component class="message-icon mr-1"
                         :is="messageIcon"
                         v-if="messageIcon"/>
              <span v-if="!['incomingCall', 'callFishing'].includes(id) && message"
                    class="message-text"
                    v-html="$options.filters.nl2br(message, false)">
              </span>
              <div class="message-text row has-ring-group"
                   v-else-if="['incomingCall', 'callFishing'].includes(id) && campaignName && ringGroupName">
                <div class="campaign-wrapper col-5">
                  <div class="campaign-name">{{ campaignName }}</div>
                </div>
                <div class="flex-grow-1">></div>
                <div class="ring-group-wrapper col-5">
                  <div class="ring-group-name">{{ ringGroupName }}</div>
                </div>
              </div>
              <span class="message-text d-flex"
                   v-else-if="['incomingCall', 'callFishing'].includes(id) && campaignName && !ringGroupName">
                {{ campaignName }}
              </span>
            </div>
            <template v-if="id === 'sms' && attachment">
              <q-img
                :src="attachment"
                class="attachment mr-2"
                fit="cover"
              />
            </template>
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
            <ignore-call-icon v-if="id === 'callFishing'">
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
                 @click="answerCall">
            <accept-call-icon width="32" height="32"/>
          </q-btn>
        </div>
        <div class="d-flex justify-content-center align-items-center call-fishing-actions"
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
            <accept-call-icon width="32" height="32"/>
          </q-btn>

          <b-dropdown no-caret
                      right
                      variant="transparent"
                      class="m-2 b-compact-dropdown-button text-bold height-32"
                      v-if="dialer.currentStatus !== 'WRAP_UP'">
            <template #button-content>
              <accept-call-icon width="32" height="32"/>
            </template>
            <b-dropdown-item href=""
                             :disabled="dialer.parkedCall"
                             @click="answerCommunication(true, false)">
              <park-call-icon class="icon-margin"
                              width="13"
                              height="13"
                              color="#9B51E0"/>
              Park Current Call & Connect
            </b-dropdown-item>
            <b-dropdown-item href=""
                             @click="answerCommunication(false, true)">
              <hangup-icon class="icon-margin"/>
              Hangup Current Call & Connect
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
    </div>
  </b-toast>
</template>

<script>
import _ from 'lodash'
import { mapActions, mapState } from 'vuex'
import { notificationMixin } from 'src/plugins/mixins'
import CancelCallIcon from 'components/icons/cancel-call-icon'
import AcceptCallIcon from 'components/icons/accept-call-icon'
import ParkCallIcon from 'components/icons/park-call-icon'
import HangupIcon from 'components/icons/hangup-icon'
import IgnoreCallIcon from 'components/icons/ignore-call-icon'

export default {
  name: 'action-notification',
  mixins: [
    notificationMixin
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
      runningDateTimeInterval: null
    }
  },
  computed: {
    ...mapState(['notifications', 'dialer']),
    toastClass () {
      let toastClass = 'action-notification notification-border-round'

      if (!['incomingCall', 'callFishing'].includes(this.id)) {
        toastClass += ' bg-grey-80'
      }

      if (['incomingCall', 'callFishing'].includes(this.id)) {
        toastClass += ' bg-blue-60-opaque background-blur incoming-call-notification'
      }

      if (this.queue) {
        toastClass += ' has-clear-queues'
      }

      return toastClass
    },

    headerClass () {
      let headerClass = 'border-0 p-0'

      if (!['incomingCall', 'callFishing'].includes(this.id)) {
        headerClass += ' bg-grey-80'
      }

      if (['incomingCall', 'callFishing'].includes(this.id)) {
        headerClass += ' bg-blue-60-opaque background-blur'
      }

      return headerClass
    },

    queue () {
      return _.get(this.notifications, `${this.id}.queue`, null)
    },

    message () {
      let message = _.get(this.notifications[this.id], 'message', '')

      return this.$options.filters.parseMentionToView(message)
    },
    messageIcon () {
      return _.get(this.notifications[this.id], 'messageIcon', null)
    },
    title () {
      let title = _.get(this.notifications[this.id], 'title', '')

      let fixedTitle = this.$options.filters.fixPhone(title)

      if (!['sms', 'call'].includes(this.id) || !fixedTitle) {
        return title
      }

      return fixedTitle
    },
    dateTime () {
      return _.get(this.notifications[this.id], 'dateTime', '')
    },
    contactId () {
      return _.get(this.notifications[this.id], 'contactId', '')
    },
    communicationId () {
      return _.get(this.notifications[this.id], 'communicationId', '')
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
      return _.get(this.notifications[this.id], 'attachment', '')
    },
    noAutoHide () {
      return ['system', 'incomingCall', 'callFishing'].includes(this.id)
    },
    campaignId () {
      return _.get(this.notifications[this.id], 'campaignId', null)
    },
    campaignName () {
      return _.get(this.notifications[this.id], 'campaignName', null)
    },
    ringGroupId () {
      return _.get(this.notifications[this.id], 'ringGroupId', null)
    },
    ringGroupName () {
      return _.get(this.notifications[this.id], 'ringGroupName', null)
    },
    phoneNumber () {
      return _.get(this.notifications[this.id], 'phoneNumber', null)
    },
    communication () {
      return _.get(this.notifications[this.id], 'communication', null)
    },
    contact () {
      return _.get(this.notifications[this.id], 'contact', null)
    },
    isValidPhoneShowInfo () {
      let dialerCommunicationId = _.get(this.dialer, 'communication.id', null)
      return ((
        (this.id === 'incomingCall' && this.communicationId === dialerCommunicationId) ||
          (this.id === 'callFishing' && !this.dialer.call)) &&
        !this.dialer.parkedCall && !(this.queue && this.queue.length))
    }
  },
  methods: {
    ...mapActions(['setNotifications', 'setShowPhone']),
    autoClose () {
      this.runDateTimeInterval()
      if (this.id === 'incomingCall' && (['CALL_CONNECTED', 'INVITE_CANCELLED', 'READY'].includes(this.dialer.currentStatus))) {
        this.onHidden()
        this.$closeActionNotification(this.id)
        return
      }

      if (!this.noAutoHide && this.dateTime && this.dateTime.diff(this.$moment(), 'seconds') <= -30) {
        this.onHidden()
        this.$closeActionNotification(this.id)
        return
      }

      if (!this.title) {
        this.onHidden()
        this.$closeActionNotification(this.id)
        return
      }

      this.playAudio()
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

      if (this.id !== 'callFishing' || (this.id === 'callFishing' && !document.getElementById('callFishing'))) {
        this.removeFromCallFishingQueue(this.notifications[this.id].communicationId)
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
      let data = {
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
      if (this.id !== 'callFishing' || (this.id === 'callFishing' && !this.queue.length)) {
        this.closeCallNotifications(this.id, this.communicationId, true)
      }

      this.$VueEvent.fire('rejectCall')

      if (this.id === 'callFishing') {
        this.$VueEvent.fire('hidePhone')
      }

      if (this.id === 'callFishing' && this.queue.length) {
        this.switchCallFishingFromQueue()
      }
    },
    onNotificationClick (event) {
      let found = event.path.find((item) => {
        let className = _.get(item, 'className', null)
        return className && typeof className === 'string' && (className.includes('call-actions') || className.includes('call-fishing-actions'))
      })

      if (!found && this.isValidPhoneShowInfo) {
        this.showCallFishingDataInPhone({
          communication: this.communication,
          contact: this.contact
        }, this.id)
      }

      if (!found && this.id === 'system') {
        window.location.reload()
      }
    },
    clearNotificationQueue () {
      this.setNotifications({
        type: this.id,
        data: {
          queue: null
        }
      })
      this.$closeActionNotification(this.id)
    },
    toInbox () {
      if (this.isValidPhoneShowInfo) {
        return
      }

      if (this.$route.path !== `/channels/inbox/open/contacts/${this.contactId}/communications/${this.communicationId}`) {
        this.$router.push({
          path: `/channels/inbox/open/contacts/${this.contactId}/communications/${this.communicationId}`
        })
      }
    },
    toContact () {
      if (this.isValidPhoneShowInfo) {
        return
      }

      if (this.$route.path !== `/contacts/${this.contactId}`) {
        this.$router.push({
          path: `/contacts/${this.contactId}`
        })
      }
    }
  }
}
</script>
