<template>
  <b-toast body-class="p-0"
           solid
           auto-hide-delay="30000"
           :toast-class="toastClass"
           :header-class="headerClass"
           :toaster="position"
           :no-auto-hide="['system', 'incomingCall'].includes(this.id)"
           :id="id"
           :to="link"
           @hidden="onHidden">
    <div class="d-flex flex-row align-items-center">
      <div class="mr-2">
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
          <strong class="mr-auto text-white title">{{ title }}</strong>
          <small class="mr-2 text-grey-82 time"
                 v-if="id !== 'incomingCall'">
            {{ dateTime | shortDateTimePassed(false) }}
          </small>
        </div>
        <div class="text-grey-81 pt-1 message-body">
          <component :is="messageIcon"
                     v-if="messageIcon"/>
          <span v-if="id === 'sms'">
            {{ message | nl2br | textTruncate(4, 39) }}
          </span>
          <span v-else>
            {{ message }}
          </span>
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
      headerClass: ''
    }
  },
  mounted () {
    this.toastClass = 'action-notification notification-border-round p-3'
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
    ...mapState(['notifications']),
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
        path: `/channels/${this.type(this.id)}/contacts/${this.contactId}/communications/${this.communicationId}`
      }
    }
  },
  methods: {
    onHidden () {
      if (this.id === 'call') {
        return
      }

      this.setNotifications({
        type: this.id,
        data: {
          title: '',
          message: '',
          messageIcon: null,
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
      this.$closeActionNotification('incomingCall')
    },
    rejectCall () {
      this.$VueEvent.fire('rejectCall')
      this.$closeActionNotification('incomingCall')
    },
    ...mapActions(['setNotifications'])
  }
}
</script>
