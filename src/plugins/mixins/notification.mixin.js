import { mapActions, mapState } from 'vuex'
import _ from 'lodash'

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
      this.closeCallNotifications(type, communication.id, false)
    },

    closeCallNotifications (type = null, communicationId = null, closeNotification = true) {
      if (!communicationId) {
        return
      }

      // for incoming call
      let notificationCommId = !type ? _.get(this.notifications, 'incomingCall.communication.id', null) : null
      if (notificationCommId === communicationId && closeNotification) {
        this.$closeActionNotification(type)
        return
      }

      // for call fishing
      notificationCommId = !type ? _.get(this.notifications, 'callFishing.communication.id', null) : null

      if ((type && type === 'callFishing') || notificationCommId) {
        this.clearDialerCallFishing()
      }

      if ((notificationCommId === communicationId || (type && type === 'callFishing')) && closeNotification) {
        this.$closeActionNotification(type)
        this.switchCallFishingFromQueue()
        return
      }

      if (type && type === 'callFishing' && communicationId) {
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
      let callFishingFirstQueue = _.first(this.notifications, 'callFishin.queue', null)

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
    }
  }
}
