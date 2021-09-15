<template>
  <b-toast body-class="p-0"
           solid
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
    <div class="d-flex flex-row align-items-start">
      <div class="mr-2 notification-icon">
        <system-update-icon v-if="id === 'system'"/>
        <sms-icon v-if="id === 'sms'"/>
        <call-icon v-if="id === 'call'"/>
        <voicemail-icon v-if="id === 'voicemail'"/>
        <mention-icon v-if="id === 'mention'"/>
        <call-incoming-icon v-if="id === 'incomingCall'"/>
      </div>
      <div :class="[this.id !== 'incomingCall' ? 'w-100' : 'flex-grow-1']">
        <div class="d-flex flex-grow-1 align-items-baseline w-100">
          <!--b-img blank blank-color="#ff5555" class="mr-2" width="12" height="12"></b-img-->
          <strong class="mr-auto text-white title pr-1">{{ title }}</strong>
          <small class="mr-2 text-grey-82 time text-nowrap"
                 v-if="id !== 'incomingCall'">
            {{ runningDateTime }}
          </small>
        </div>
        <div class="text-grey-81 pt-2 message-body text-break d-flex">
          <div class="flex-grow-1 d-flex align-items-center">
            <component class="message-icon mr-1"
                       :is="messageIcon"
                       v-if="messageIcon"/>
            <span class="message-text"
                  v-html="$options.filters.nl2br(message, false)">
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
      <div class="d-flex justify-content-center align-items-center"
           v-if="id === 'incomingCall'">
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
    </div>
  </b-toast>
</template>

<script>
import _ from 'lodash'
import { mapActions, mapState } from 'vuex'
import CancelCallIcon from 'components/icons/cancel-call-icon'
import AcceptCallIcon from 'components/icons/accept-call-icon'

export default {
  name: 'action-notification',
  components: { AcceptCallIcon, CancelCallIcon },
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
      toastClass: '',
      headerClass: '',
      runningDateTime: null,
      runningDateTimeInterval: null
    }
  },
  mounted () {
    this.toastClass = 'action-notification notification-border-round'
    this.headerClass = 'border-0 p-0'
    if (this.id !== 'incomingCall') {
      this.toastClass += ' bg-grey-80'
      this.headerClass += ' bg-grey-80'
    } else {
      this.toastClass += ' bg-blue-80 incoming-call-notification'
      this.headerClass += ' bg-blue-80'
    }
  },
  computed: {
    ...mapState(['notifications', 'dialer']),
    message () {
      return _.get(this.notifications[this.id], 'message', '')
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
      if (['system', 'incomingCall'].includes(this.id)) {
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
      return ['system', 'incomingCall'].includes(this.id)
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
          communicationId: ''
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
      this.$VueEvent.fire('answerCall')
    },
    rejectCall () {
      this.$VueEvent.fire('rejectCall')
    },
    ...mapActions(['setNotifications'])
  }
}
</script>
