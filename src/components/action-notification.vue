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
    <div class="notification-body-wrapper"
         @click="onNotificationClick">
      <div class="d-flex flex-row align-items-start">
        <b-badge v-if="this.id === 'callFishing' && notifications[this.id].queue > 1 && this.dialer && this.dialer.communication"
                 class="contact-unread-badge d-flex justify-center align-items-center position-absolute"
                 variant="danger"
                 pill>
          {{ notifications[this.id].queue }}
        </b-badge>
        <div class="mr-2 notification-icon">
          <system-update-icon v-if="id === 'system'"/>
          <sms-icon v-if="id === 'sms'"/>
          <call-icon v-if="id === 'call'"/>
          <voicemail-icon v-if="id === 'voicemail'"/>
          <mention-icon v-if="id === 'mention'"/>
          <call-incoming-icon v-if="['incomingCall', 'callFishing'].includes(id)"/>
        </div>
        <div :class="[!['incomingCall', 'callFishing'].includes(this.id) ? 'w-100' : 'flex-grow-1']">
          <div class="d-flex flex-grow-1 align-items-baseline w-100">
            <!--b-img blank blank-color="#ff5555" class="mr-2" width="12" height="12"></b-img-->
            <strong class="mr-auto text-white title pr-1">
              {{ title }}
            </strong>
            <small class="mr-2 text-grey-82 time text-nowrap"
                   v-if="!['incomingCall', 'callFishing'].includes(this.id)">
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
                <div class="flex-grow-1 col-1">></div>
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
             v-if="id === 'incomingCall' || (id === 'callFishing' && this.dialer && !this.dialer.communication)">
          <q-btn class="height-32"
                 ripple
                 round
                 no-caps
                 @click="rejectCall">
            <cancel-call-icon width="32" height="32" class="mr-2"/>
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
             v-if="id === 'callFishing' && this.dialer && this.dialer.communication">
          <q-btn class="height-32"
                 ripple
                 round
                 no-caps
                 @click="ignoreFishing">
            <cancel-call-icon width="32" height="32" class="mr-2"/>
          </q-btn>

          <b-dropdown no-caret
                      right
                      variant="transparent"
                      class="m-2 b-compact-dropdown-button text-bold height-32">
            <template #button-content>
              <accept-call-icon width="32" height="32"/>
            </template>
            <b-dropdown-item href=""
                             @click="answerCommunication(true, true)">
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
import CancelCallIcon from 'components/icons/cancel-call-icon'
import AcceptCallIcon from 'components/icons/accept-call-icon'
import ParkCallIcon from 'components/icons/park-call-icon'
import HangupIcon from 'components/icons/hangup-icon'

export default {
  name: 'action-notification',
  components: {
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

    message () {
      const message = _.get(this.notifications[this.id], 'message', '')
      return this.$options.filters.parseMentionToView(message)
    },
    messageIcon () {
      return _.get(this.notifications[this.id], 'messageIcon', null)
    },
    title () {
      const title = _.get(this.notifications[this.id], 'title', '')
      const fixedTitle = this.$options.filters.fixPhone(title)

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
    campaignName () {
      return _.get(this.notifications[this.id], 'campaignName', null)
    },
    ringGroupName () {
      return _.get(this.notifications[this.id], 'ringGroupName', null)
    }
  },
  methods: {
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
      }
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
      if (!this.noAutoHide) {
        clearInterval(this.runningDateTimeInterval)
      }
    },
    onHidden () {
      if (this.id === 'call') {
        return
      }

      this.clearDateTimeInterval()
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
          queue: this.notifications[this.id].queue
        }
      })
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
      if (this.id === 'callFishing') {
        this.answerCommunication()
        return
      }

      this.$VueEvent.fire('answerCall')
    },
    ignoreFishing () {
      this.$closeActionNotification('callFishing')
    },
    answerCommunication (shouldPark = false, shouldHangup = false) {
      const data = {
        communication: {
          id: this.notifications[this.id].communicationId,
          campaign_id: this.notifications[this.id].campaignId,
          contactName: this.title,
          companyName: this.message,
          contactId: this.notifications[this.id].contactId
        },
        shouldPark: shouldPark,
        shouldHangup: shouldHangup
      }
      this.$VueEvent.fire('answerCallFishing', data)
      this.$closeActionNotification('callFishing')
    },
    rejectCall () {
      this.$VueEvent.fire('rejectCall')
    },
    onNotificationClick (event) {
      const found = event.path.find((item) => {
        const className = _.get(item, 'className', null)
        return className && typeof className === 'string' && (className.includes('call-actions') || className.includes('call-fishing-actions'))
      })
      if (!found && this.id === 'callFishing') {
        console.log('IN!!')
      }
      if (!found && this.id === 'system') {
        window.location.reload()
      }
    },
    ...mapActions(['setNotifications', 'setNotificatioNQueue'])
  }
}
</script>
