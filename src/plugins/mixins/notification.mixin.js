import { mapActions, mapState } from 'vuex'
import _ from 'lodash'
import * as RingGroupRepeatContactTo from 'src/constants/ring-group-repeat-calls'

export default {
  data () {
    return {
      dialerCallFishingInterval: null
    }
  },

  computed: {
    ...mapState([
      'enableAudio',
      'notifications',
      'ringGroups',
      'dialer',
      'communicationNotifiedDesktop',
      'voicemailNotifiedDesktop',
      'contactNotifiedDesktop',
      'appointmentNotifiedDesktop',
      'reminderNotifiedDesktop',
      'notificationAudio'
    ])
  },

  methods: {
    ...mapActions([
      'setNotifications',
      'removeFromCallFishingNotificationQueue',
      'removeFromCallFishingQueue',
      'setDialerCallFishing',
      'addCommunicationNotifiedDesktop',
      'addVoicemailNotifiedDesktop',
      'addContactNotifiedDesktop',
      'addAppointmentNotifiedDesktop',
      'addReminderNotifiedDesktop',
      'removeCommunicationNotifiedDesktop',
      'removeVoicemailNotifiedDesktop',
      'removeContactNotifiedDesktop',
      'removeAppointmentNotifiedDesktop',
      'removeReminderNotifiedDesktop',
      'setShowIncomingCallNotification'
    ]),

    playAudio (fishingMode = false) {
      if (!this.enableAudio) {
        return
      }

      let promise
      if (fishingMode) {
        promise = this.fishinModeNotificationAudio.play()
      } else {
        promise = this.notificationAudio.play()
      }

      if (promise !== undefined) {
        promise.catch(err => {
          // Auto-play was prevented
          // Show a UI element to let the user manually start playback
          console.log(err)
        })
      }
    },

    stopAudio () {
      if (!this.enableAudio) {
        return
      }

      this.fishinModeNotificationAudio.pause()
    },

    processRemoveFromNotification (communication) {
      if (!communication) {
        return
      }

      this.closeCallNotifications(this.getNotificationType(communication.ring_group_id), communication.id)
    },

    closeCallNotifications (type = 'incomingCall', communicationId = null, forceClose = false) {
      if (!communicationId ||
        !['incomingCall', 'callFishing'].includes(type)) {
        return
      }

      // for incoming call
      const notificationCommId = { data: _.get(this.notifications, 'incomingCall.communication.id', null) }

      if (type === 'incomingCall' &&
        notificationCommId.data === communicationId &&
        this.dialer.currentStatus !== 'RECEIVED_CALL_INVITE') {
        this.$closeActionNotification(type)
        this.closeDesktopNotification(communicationId, 'communication')
        return
      }

      // for call fishing
      notificationCommId.data = _.get(this.notifications, 'callFishing.communicationId', null)
      const dialerCallFishingCommId = _.get(this.dialer, 'callFishing.communication.id', null)

      if (communicationId &&
        dialerCallFishingCommId &&
        communicationId === dialerCallFishingCommId) {
        this.clearDialerCallFishing()
      }

      const callFishingQueue = { data: _.get(this.notifications, 'callFishing.queue', null) }
      callFishingQueue.data = callFishingQueue.data && callFishingQueue.data.constructor === Array && callFishingQueue.data.length

      if (type === 'callFishing') {
        this.stopAudio()
      }

      if (
        (notificationCommId.data === communicationId &&
          type === 'callFishing' &&
          !callFishingQueue.data) ||
        forceClose) {
        this.$closeActionNotification(type)
        this.closeDesktopNotification(communicationId, 'communication')
        return
      }

      if (notificationCommId.data === communicationId &&
        type === 'callFishing' &&
        document.getElementById('callFishing')) {
        this.switchCallFishingFromQueue()
        this.closeDesktopNotification(communicationId, 'communication')
        return
      }

      if (type === 'callFishing' &&
        communicationId) {
        this.removeFromCallFishingNotificationQueue(communicationId)
        this.removeFromCallFishingQueue(communicationId)
        this.closeDesktopNotification(communicationId, 'communication')
      }
    },

    closeDesktopNotification (communicationId, type) {
      const notification = this.communicationNotifiedDesktop.find(notification => notification.id === communicationId)

      if (notification) {
        notification.close()
        this[`remove${this.$options.filters.capitalize(type)}NotifiedDesktop`](communicationId)
      }
    },

    clearDialerCallFishing () {
      // clear dialer's call fishing details
      const dialerCallFishingCommunication = _.get(this.dialer, 'callFishing.communication', null)

      if (dialerCallFishingCommunication) {
        this.setDialerCallFishing({
          communication: null,
          contact: null
        })
      }
    },

    getNotificationType (ringGroupId) {
      const ringGroup = this.ringGroups.find(ringGroup => ringGroup.id === ringGroupId)
      return ringGroup &&
      ringGroup.should_queue &&
      ringGroup.fishing_mode ? 'callFishing' : 'incomingCall'
    },

    switchCallFishingFromQueue () {
      const callFishingFirstQueue = { data: _.get(this.notifications, 'callFishing.queue', []) }
      callFishingFirstQueue.data = callFishingFirstQueue.data && callFishingFirstQueue.data.length > 0 ? callFishingFirstQueue.data.shift() : callFishingFirstQueue.data

      if (!callFishingFirstQueue) {
        return
      }

      const currentCommunicationId = this.notifications.callFishing.communicationId

      this.setNotifications({
        type: 'callFishing',
        data: {
          title: callFishingFirstQueue.data.title,
          message: callFishingFirstQueue.data.message,
          dateTime: callFishingFirstQueue.data.dateTime,
          contactId: callFishingFirstQueue.data.contactId,
          communicationId: callFishingFirstQueue.data.communicationId,
          campaignId: callFishingFirstQueue.data.campaignId,
          campaignName: callFishingFirstQueue.data.campaignName,
          ringGroupName: callFishingFirstQueue.data.ringGroupName,
          phoneNumber: callFishingFirstQueue.data.phoneNumber
        }
      })

      this.removeFromCallFishingNotificationQueue(currentCommunicationId)
      this.removeFromCallFishingQueue(currentCommunicationId)
    },

    processActionNotification (communication, type) {
      const name = { data: '' }
      const companyName = { data: '' }
      const firstAttachment = { data: null }
      const contactId = { data: null }
      const communicationId = { data: null }
      const campaignId = { data: _.get(communication, 'campaign_id', null) }
      const message = { data: '' }
      const ringGroup = this.ringGroups.find(ringGroup => ringGroup.id === communication.ring_group_id)

      if (type !== 'mention') {
        name.data = communication.contact.name ? communication.contact.name : this.$options.filters.fixPhone(communication.contact.phone_number)
        companyName.data = communication.contact.company_name
        firstAttachment.data = _.get(communication.attachments, '0.url', null)
      }

      const params = { data: {} }
      switch (type) {
        case 'sms':
          params.data = {
            title: name.data,
            message: communication.body,
            attachment: firstAttachment.data,
            type: 'sms',
            contactId: communication.contact.id,
            communicationId: communication.id,
            campaignId: campaignId.data
          }
          break
        case 'missed voicemail':
          params.data = {
            title: name.data,
            message: 'Missed Call with Voicemail',
            messageIcon: 'call-voicemail-icon',
            type: 'call',
            contactId: communication.contact.id,
            communicationId: communication.id,
            campaignId: campaignId.data
          }
          break
        case 'mention':
          name.data = _.get(communication, 'mentioner_user.name', '')
          contactId.data = _.get(communication, 'contact_id', null)
          communicationId.data = _.get(communication, 'mention_subject_id', null)
          message.data = _.get(communication, 'preview_text', '')
          params.data = {
            title: name.data,
            message: message.data,
            type: 'mention',
            contactId: contactId.data,
            communicationId: communicationId.data
          }
          break
        case 'missed call':
          params.data = {
            title: name.data,
            message: 'Missed Call',
            type: 'call',
            contactId: communication.contact.id,
            communicationId: communication.id
          }
          break
        case 'call':
          // don't show fishing mode notifs to other users of the ring group if the REPEAT_CONTACT_ROUTE_TO_OWNER_ONLY_STRICT option is selected
          if (ringGroup &&
            ringGroup.should_queue &&
            ringGroup.fishing_mode &&
            ringGroup.repeat_contact_route_to === RingGroupRepeatContactTo.REPEAT_CONTACT_ROUTE_TO_OWNER_ONLY_STRICT &&
            this.user &&
            this.user.profile &&
            this.user.profile.id !== communication.contact.user_id) {
            break
          }

          const callType = (ringGroup && ringGroup.should_queue && ringGroup.fishing_mode) || communication.is_call_waiting ? 'callFishing' : 'incomingCall'
          const campaignName = _.get(communication, 'campaign.name', null)
          const ringGroupName = _.get(communication, 'ring_group.name', null)
          const phoneNumber = _.get(communication, 'contact.phone_number', null)

          params.data = {
            title: name.data,
            message: companyName.data,
            contactId: communication.contact.id,
            communicationId: communication.id,
            campaignId: campaignId.data,
            campaignName: campaignName,
            ringGroupName: ringGroupName,
            phoneNumber: phoneNumber,
            communication: communication,
            contact: communication.contact,
            type: callType
          }
          break
      }

      if (!_.isEmpty(params.data)) {
        if (['callFishing', 'incomingCall'].includes(params.data.type)) {
          this.setShowIncomingCallNotification(true)
        }

        this.$actionNotification(params.data)
      }
    },

    showCallFishingDataInPhone (data, type = 'callFishing') {
      this.$VueEvent.fire('showPhone')

      if (type !== 'callFishing') {
        this.$closeActionNotification(type)
        return
      }

      const queue = _.get(this.notifications, 'callFishing.queue', [])

      if (!queue ||
        (queue && queue.length === 0)) {
        this.$closeActionNotification(type)
      }

      if (queue && queue.length > 0) {
        this.setDialerCallFishing(data)
        this.switchCallFishingFromQueue()
        return
      }

      const counter = { data: 0 }

      if (!queue ||
        (queue && queue.length === 0)) {
        this.dialerCallFishingInterval = setInterval(() => {
          if (!document.getElementById(type)) {
            this.setDialerCallFishing(data)
            clearInterval(this.dialerCallFishingInterval)
          }

          counter.data++

          if (counter.data > 120) {
            clearInterval(this.dialerCallFishingInterval)
          }
        }, 500)
      }
    }
  },

  beforeDestroy () {
    clearInterval(this.dialerCallFishingInterval)
  }
}
