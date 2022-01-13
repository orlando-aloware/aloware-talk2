import { mapActions, mapState } from 'vuex'
import _ from 'lodash'
import * as RingGroupRepeatContactTo from 'src/constants/ring-group-repeat-calls'
import * as AgentStatus from 'src/constants/agent-status'

export default {
  data () {
    return {
      notificationAudio: new Audio(process.env.API_URL + '/static/ivr/default-communication-notification.mp3')
    }
  },

  computed: {
    ...mapState(['enableAudio', 'notifications', 'ringGroups', 'dialer'])
  },

  methods: {
    ...mapActions(['setNotifications', 'removeFromCallFishingQueue', 'setDialerCallFishing']),

    playAudio () {
      if (!this.enableAudio) {
        return
      }

      let promise = this.notificationAudio.play()

      if (promise !== undefined) {
        promise.catch(err => {
          // Auto-play was prevented
          // Show a UI element to let the user manually start playback
          console.log(err)
        })
      }
    },

    processRemoveFromNotification (communication) {
      if (!communication) {
        return
      }

      let type = this.getType(communication.ring_group_id)
      this.closeCallNotifications(type, communication.id)
    },

    closeCallNotifications (type = null, communicationId = null, forceClose = false) {
      if (!communicationId) {
        return
      }

      // for incoming call
      let notificationCommId = _.get(this.notifications, 'incomingCall.communication.id', null)
      if (type === 'incomingCall' || notificationCommId === communicationId) {
        this.$closeActionNotification(type)
        return
      }

      // for call fishing
      notificationCommId = _.get(this.notifications, 'callFishing.communication.id', null)
      let dialerCallFishingCommId = _.get(this.dialer, 'callFishing.communication.id', null)

      if (communicationId && dialerCallFishingCommId && communicationId === dialerCallFishingCommId) {
        this.clearDialerCallFishing()
      }

      if ((notificationCommId === communicationId && type === 'callFishing') || forceClose) {
        this.$closeActionNotification(type)
        return
      }

      if (notificationCommId === communicationId && type === 'callFishing' && document.getElementById('callFishing')) {
        this.switchCallFishingFromQueue()
        return
      }

      if (type === 'callFishing' && communicationId) {
        this.removeFromCallFishingQueue(communicationId)
      }
    },

    clearDialerCallFishing () {
      // clear dialer's call fishing details
      let dialerCallFishingCommunication = _.get(this.dialer, 'callFishing.communication', null)
      let hasInprogressCall = this.dialer.call || this.dialer.parkedCall
      if (!hasInprogressCall && dialerCallFishingCommunication) {
        this.setDialerCallFishing({
          communication: null,
          contact: null
        })
      }
    },

    getType (ringGroupId) {
      const ringGroup = this.ringGroups.find(ringGroup => ringGroup.id === ringGroupId)
      return ringGroup && ringGroup.fishing_mode ? 'callFishing' : 'incomingCall'
    },

    switchCallFishingFromQueue () {
      let callFishingFirstQueue = _.first(this.notifications, 'callFishing.queue', null)

      if (!callFishingFirstQueue) {
        return
      }

      this.setNotifications({
        type: 'callFishing',
        data: {
          title: callFishingFirstQueue.title,
          message: callFishingFirstQueue.message,
          dateTime: callFishingFirstQueue.dateTime,
          contactId: callFishingFirstQueue.contactId,
          communicationId: callFishingFirstQueue.communicationId,
          campaignId: callFishingFirstQueue.campaignId,
          campaignName: callFishingFirstQueue.campaignName,
          ringGroupName: callFishingFirstQueue.ringGroupName,
          phoneNumber: callFishingFirstQueue.phoneNumber,
          queue: null
        }
      })

      this.removeFromCallFishingQueue(callFishingFirstQueue.communicationId)
    },

    processActionNotification (communication, type) {
      // if (this.is_widget) {
      //   return
      // }

      // if (this.communication_notified_in_app.includes(communication.id)) {
      //   return
      // }

      let name = ''
      let companyName = ''
      let firstAttachment = null
      let contactId = null
      let communicationId = null
      let campaignId = _.get(communication, 'campaign_id', null)
      let message = ''
      const ringGroup = this.ringGroups.find(ringGroup => ringGroup.id === communication.ring_group_id)

      if (type !== 'mention') {
        name = communication.contact.name ? communication.contact.name : this.$options.filters.fixPhone(communication.contact.phone_number)
        companyName = communication.contact.company_name
        firstAttachment = _.get(communication.attachments, '0.url', null)
      }

      let data = {}
      switch (type) {
        case 'sms':
          data = {
            title: name,
            message: communication.body,
            attachment: firstAttachment,
            type: 'sms',
            contactId: communication.contact.id,
            communicationId: communication.id,
            campaignId: campaignId
          }
          break
        case 'missed voicemail':
          data = {
            title: name,
            message: 'Missed Call with Voicemail',
            messageIcon: 'call-voicemail-icon',
            type: 'call',
            contactId: communication.contact.id,
            communicationId: communication.id,
            campaignId: campaignId
          }
          break
        case 'mention':
          name = _.get(communication, 'mentioner_user.name', '')
          contactId = _.get(communication, 'contact_id', null)
          communicationId = _.get(communication, 'mention_subject_id', null)
          message = _.get(communication, 'preview_text', '')
          data = {
            title: name,
            message: message,
            type: 'mention',
            contactId: contactId,
            communicationId: communicationId
          }
          break
        case 'missed call':
          data = {
            title: name,
            message: 'Missed Call',
            type: 'call',
            contactId: communication.contact.id,
            communicationId: communication.id
          }
          break
        case 'call':
          // don't show fishing mode notifs to other users of the ring group if the REPEAT_CONTACT_ROUTE_TO_OWNER_ONLY_STRICT option is selected
          if (ringGroup && ringGroup.fishing_mode && ringGroup.repeat_contact_route_to === RingGroupRepeatContactTo.REPEAT_CONTACT_ROUTE_TO_OWNER_ONLY_STRICT && this.user && this.user.profile && this.user.profile.id !== communication.contact.user_id) {
            break
          }

          let type = 'incomingCall'

          if (ringGroup && ringGroup.fishing_mode) {
            type = 'callFishing'
          }

          if (type === 'incomingCall' && this.profile.agentStatus !== AgentStatus.AGENT_STATUS_RINGING) {
            break
          }

          const campaignName = _.get(communication, 'campaign.name', null)
          const ringGroupName = _.get(communication, 'ring_group.name', null)
          const phoneNumber = _.get(communication, 'contact.phone_number', null)

          data = {
            title: name,
            message: companyName,
            contactId: communication.contact.id,
            communicationId: communication.id,
            campaignId: campaignId,
            campaignName: campaignName,
            ringGroupName: ringGroupName,
            phoneNumber: phoneNumber,
            communication: communication,
            contact: communication.contact,
            type: type
          }
          break
      }

      if (!_.isEmpty(data)) {
        this.$actionNotification(data)
      }

      // push the notification obj to call notifications list
      // this.notifications.push({
      //   communication_id: communication.id,
      //   notification: notification
      // })
    }
  }
}
