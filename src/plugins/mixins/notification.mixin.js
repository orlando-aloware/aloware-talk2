import { mapActions, mapState } from 'vuex'
import _ from 'lodash'

export default {
  data () {
    return {
      notificationAudio: new Audio(process.env.API_URL + '/static/ivr/default-communication-notification.mp3')
    }
  },

  computed: {
    ...mapState(['enableAudio', 'notifications', 'ringGroups'])
  },

  methods: {
    ...mapActions(['setNotifications', 'removeFromCallFishingQueue']),

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

      const ringGroup = this.ringGroups.find(ringGroup => ringGroup.id === communication.ring_group_id)
      const type = ringGroup && ringGroup.fishing_mode ? 'callFishing' : 'incomingCall'
      this.closeCallNotifications(type, communication.id, false)
    },

    closeCallNotifications (type = null, communicationId = null, closeNotification = true) {
      if (!communicationId) {
        return
      }

      // for incoming call
      let notificationCommId = !type ? _.get(this.notifications, 'incomingCall.communicationId', null) : null
      if (notificationCommId === communicationId && closeNotification) {
        this.$closeActionNotification(type)
        return
      }

      // for call fishing
      notificationCommId = !type ? _.get(this.notifications, 'callFishing.communicationId', null) : null

      if (notificationCommId === communicationId && closeNotification) {
        this.$closeActionNotification(type)
        this.switchCallFishingFromQueue()
        return
      }

      if (type && type === 'callFishing' && communicationId) {
        this.removeFromCallFishingQueue(communicationId)
      }
    },

    switchCallFishingFromQueue () {
      const callFishingFirstQueue = _.first(this.notifications, 'callFishin.queue', null)

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
