import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import { isEmpty } from 'lodash'
import { mapActions, mapState } from 'vuex'

export default {
  data: () => ({
    incomingCallStatuses: [
      CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
      CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW,
      CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW
    ]
  }),

  computed: {
    ...mapState([
      'notifications',
      'callFishingQueue'
    ])
  },

  methods: {
    ...mapActions([
      'removeFromCallFishingQueue',
      'removeFromCallFishingNotificationQueue'
    ]),

    isCallNotInProgressOrIncoming (commDispStatus, commCurrStatus) {
      return commDispStatus !== CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW ||
        !this.incomingCallStatuses.includes(commCurrStatus)
    },

    removeQueuedNotification (commId, commDispStatus, commCurrStatus) {
      const isCallNotInProgressOrIncoming = this.isCallNotInProgressOrIncoming(commDispStatus, commCurrStatus)
      const isCallInCallFishingQueues = this.notifications?.callFishing?.queue?.find(queue => queue.communicationId === commId) ||
        this.isCommunicationInCallFishingQueue(commId)

      // remove call fishing notification from queues if
      // current notification's communication is not the same with
      // the event's communication so that a new notification doesn't show up
      // (brought from notification queue) when the current notification closes.
      if (this.communicationId !== commId &&
        isCallNotInProgressOrIncoming &&
        isCallInCallFishingQueues) {
        this.removeFromCallFishingQueue(commId)
        this.removeFromCallFishingNotificationQueue(commId)
      }
    },

    isCommunicationInCallFishingQueue (communicationId = null) {
      if (!communicationId) {
        communicationId = this.communicationId
      }

      const queue = this.callFishingQueue.find(queue => queue?.communicationId === communicationId)

      return !isEmpty(queue)
    }
  }
}
