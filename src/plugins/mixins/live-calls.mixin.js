import _, { isEmpty } from 'lodash'
import * as CommunicationSourceCallTypes from 'src/constants/communication-call-source-types'
import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationDirection from 'src/constants/communication-direction'
import * as CommunicationDispositionStatus from 'src/constants/communication-disposition-status'
import * as CommunicationTypes from 'src/constants/communication-types'
import { mapActions, mapGetters, mapState } from 'vuex'
import { agentMixin, notificationMixin, userMixin } from 'src/plugins/mixins/index'
import talk2Api from '../api/api'
export default {
  mixins: [
    agentMixin,
    notificationMixin,
    userMixin
  ],

  data () {
    return {
      showIncomingCallMenu: false,
      showParkedCallMenu: false,
      isRejecting: false,
      isHangingUp: false,
      isParking: false,
      isAnsweringCall: false
    }
  },

  computed: {
    ...mapState([
      'dialer',
      'notifications',
      'ringGroups',
      'callFishingQueue',
      'parkedCalls',
      'showIncomingCallNotification'
    ]),

    ...mapState('auth', ['profile']),

    ...mapState('inbox', ['liveContacts']),

    ...mapGetters('wallboard', {
      liveCalls: 'getLiveCalls'
    }),

    shouldShowIncomingCallMenu () {
      if (this.isActionNotification) {
        // Always show the call buttons when the action notification shows up
        return true
      }

      if (this.isIncomingLiveCall &&
        this.isCallFishing &&
        !this.isCallFishingMode &&
        this.communication.current_status2 !== CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW) {
        return false
      }

      // show call buttons when the incoming call notification shows up
      if (!this.showIncomingCallNotification) {
        return false
      }

      const ringGroup = this.getRingGroup(this.communication.ring_group_id)

      // don't show call buttons if not a fishing mode call and dialer does not have communication yet
      if (ringGroup &&
        (
          (ringGroup.should_queue && !ringGroup.fishing_mode) ||
          (!ringGroup.should_queue)
        ) &&
        (
          !this.dialer.communication ||
          this.dialer.communication.id !== this.communication.id
        )
      ) {
        return false
      }

      if (!ringGroup &&
        (
          !this.dialer.communication ||
          this.dialer.communication.id !== this.communication.id
        )) {
        return false
      }

      // only show the buttons (answer/reject) when there's an active call notification on a ring group w/o fishing mode
      if (ringGroup &&
        (
          (ringGroup.should_queue && !ringGroup.fishing_mode) ||
          (!ringGroup.should_queue)
        ) &&
        this.dialer.communication &&
        this.dialer.communication.id !== this.communication.id
      ) {
        return false
      }

      if (!this.communication) {
        return false
      }

      return (
        (this.isIncomingLiveCall && this.isCallFishing && (this.isCallFishingMode || this.communication.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW)) ||
        (this.isIncomingLiveCall && this.dialer.call && this.dialer.call.state === 'pending')
      ) && !this.isParkedCall &&
        !this.isConnectedCall
    },
    shouldShowAnsweredCallMenu () {
      return this.isActiveCall && !this.isParkedCall && !this.shouldShowIncomingCallMenu
    },
    shouldShowParkedCallMenu () {
      return this.isParkedCall
    },
    isActiveCallOwner () {
      return this.dialer && this.dialer.state === 'open' &&
        this.dialer.communication &&
        this.dialer.communication.id === this.communication.id
    },
    isParkedCall () {
      if (!this.communication) {
        return false
      }

      const found = this.parkedCalls.find(parkedCall => parkedCall.id === this.communication.id)
      return !_.isEmpty(found)
    },

    isActiveCall () {
      if (!this.communication) {
        return false
      }

      return this.dialer.call && this.dialer.call.state === 'open' &&
        this.dialer.communication && this.dialer.communication.id === this.communication.id
    },

    isConnectedCall () {
      if (!this.communication) {
        return false
      }

      // make sure that comms has the correct status and is already included in live contacts
      return this.communication.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW &&
      this.communication.disposition_status2 === CommunicationDispositionStatus.DISPOSITION_STATUS_INPROGRESS_NEW &&
      this.liveContacts.findIndex(item => item.id === this.contact.id) >= 0
    },

    isCallFishing () {
      if (!this.communication || !this.communication.ring_group_id) {
        return false
      }

      const ringGroup = this.getRingGroup(this.communication.ring_group_id)

      return ringGroup && ringGroup.should_queue && ringGroup.fishing_mode
    },
    isCallFishingMode () {
      if (!this.communication || !this.callFishingQueue) {
        return false
      }

      return this.callFishingQueue.findIndex(item => item.communicationId === this.communication.id) >= 0
    },

    isIgnored () {
      if (!this.communication || _.isEmpty(this.callFishingQueue)) {
        return true
      }

      const found = this.callFishingQueue.find(item => item.communicationId === this.communication.id)
      return _.isEmpty(found)
    },

    isIncomingLiveCall () {
      if (!this.communication) {
        return false
      }

      return this.communication.type === CommunicationTypes.CALL &&
        this.communication.direction === CommunicationDirection.INBOUND &&
        this.incomingCallStatuses.includes(this.communication.current_status2)
    },

    isDialerAvailable () {
      return !this.dialer.call
    },

    isDialerConnected () {
      return this.dialer.call && this.dialer.call.state === 'open'
    },

    isLiveCall () {
      if (!this.communication) {
        return false
      }

      if (this.communication.type !== CommunicationTypes.CALL) {
        return false
      }

      return this.liveCallStatuses.includes(this.communication.current_status2)
    },

    incomingCallStatuses () {
      return [
        CommunicationCurrentStatus.CURRENT_STATUS_RINGALL_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_RINGING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_GREETING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_TRANSFERRING_NEW,
        CommunicationCurrentStatus.CURRENT_STATUS_QUEUED_NEW, // call fishing
        CommunicationCurrentStatus.CURRENT_STATUS_HOLD_NEW // parked
      ]
    },

    liveCallStatuses () {
      return [...this.incomingCallStatuses, ...[CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW]]
    },

    isShowIgnoreCallIcon () {
      return this.isIncomingLiveCall && this.isCallFishingMode && this.isCallFishing && !this.isIgnored
    },

    isShowCancelCallIcon () {
      return this.isIncomingLiveCall && !this.isCallFishing
    },

    isDialerOrAgentOnCall () {
      return this.isDialerConnected || this.isAgentOnCall
    },

    isCallWaiting () {
      if (isEmpty(this.communication)) {
        return false
      }

      return this.communication.last_call_source === CommunicationSourceCallTypes.SOURCE_CALL_WAITING
    },

    isPersonalInbox () {
      return this.communication.campaign?.is_personal_inbox && this.hasCompanyTeamInboxEnabled
    }
  },

  methods: {
    ...mapActions([
      'setShowPhone',
      'removeFromCallFishingQueue',
      'setDialerParkedCall',
      'setShowIncomingCallNotification',
      'setDialerCommunication'
    ]),
    ...mapActions('inbox', ['setLiveContacts']),
    ...mapActions('wallboard', ['fetchLiveCalls']),

    getRingGroup (id) {
      return id ? this.ringGroups.find(item => item.id === id) : null
    },
    onAcceptCall (e) {
      if ((this.dialer.call && this.dialer.currentStatus === 'CALL_CONNECTED') || this.isAgentOnCall) {
        this.showIncomingCallMenu = true
        e.stopImmediatePropagation()
        return
      }

      this.isAnsweringCall = true
      const communication = {
        id: this.communication.id,
        campaignId: this.communication.campaign_id,
        contactName: this.contact.name,
        companyName: this.contact.company_name,
        contactId: this.contact.id,
        phoneNumber: this.contact.phone_number
      }

      if (this.communication.ring_group_id) {
        const ringGroup = this.getRingGroup(this.communication.ring_group_id)

        if (ringGroup && ringGroup.should_queue && ringGroup.fishing_mode) {
          const data = {
            communication: communication,
            shouldPark: false,
            shouldHangup: false
          }

          if (this.dialer.call && this.dialer.currentStatus === 'WRAP_UP') {
            this.$VueEvent.fire('endWrapUp')
          }

          this.$VueEvent.fire('answerCallFishing', data)
          this.setShowPhone(true)
          this.isAnsweringCall = false

          e.stopImmediatePropagation()
          return
        }
      }

      if (this.dialer.communication && this.dialer.communication.id === communication.id) {
        this.$VueEvent.fire('answerCall')
      } else {
        this.$VueEvent.fire('answerCall', communication)
      }
      this.isAnsweringCall = false
      this.setShowPhone(true)
      e.stopImmediatePropagation()
    },
    onRejectCall (e) {
      if (!this.communication) {
        return
      }

      this.isRejecting = true
      if (this.isCallFishingMode && this.isCallFishing) {
        this.removeFromCallFishingQueue(this.communication.id)
        this.isRejecting = false
        this.processRemoveFromNotification(this.communication)
        this.ignoreFishing()
        e.stopImmediatePropagation()
        return
      }

      // handle active call
      if (this.dialer && this.dialer.state === 'open') {
        this.$VueEvent.fire('hangupCall')
        this.isRejecting = false
        return
      }

      this.$VueEvent.fire('rejectCall')
      this.isRejecting = false
      this.processRemoveFromNotification(this.communication)
      e.stopImmediatePropagation()
    },
    async ignoreFishing () {
      if (this.communication?.campaign?.call_waiting_ring_group_id && this.hasCompanyTeamInboxEnabled) {
        try {
          await talk2Api.V1.communication.agentForceTerminate(this.communication.id, { reject: true })
        } catch (error) {
          console.error('Failed to force terminate communication:', error)
        }
      }

      this.$closeActionNotification('callFishing')
      this.closeCallNotifications(this.id, this.communicationId)
    },
    onHangUpCall (e) {
      this.$VueEvent.fire('hangupCall')
      e.stopImmediatePropagation()
    },
    onUnparkCall (e) {
      if ((this.dialer.call && this.dialer.currentStatus === 'CALL_CONNECTED') || this.isAgentOnCall) {
        this.showParkedCallMenu = true
        e.stopImmediatePropagation()
        return
      }

      if (this.dialer.call && this.dialer.currentStatus === 'WRAP_UP') {
        this.$VueEvent.fire('endWrapUp')
      }

      this.$VueEvent.fire('unparkCall', this.communication)
      this.$VueEvent.fire('togglePhone')
      e.stopImmediatePropagation()
    },

    onParkCurrentCallAndConnect () {
      this.showParkedCallMenu = false

      if (_.isEmpty(this.dialer.parkedCall)) {
        this.setDialerParkedCall(this.communication)
      }

      this.answerCommunication(true, true)
    },
    onHangupCurrentCallAndConnect () {
      this.showParkedCallMenu = false

      if (_.isEmpty(this.dialer.parkedCall)) {
        this.setDialerParkedCall(this.communication)
      }

      this.answerCommunication(false, true)
    },
    onParkCurrentCallAndAnswer () {
      this.showIncomingCallMenu = false
      this.answerCommunication(true, false)
    },
    onHangUpCurrentCallAndAnswer () {
      this.showIncomingCallMenu = false
      this.answerCommunication(false, true)
    },
    async answerCommunication (shouldPark = false, shouldHangup = false) {
      const data = {
        communication: {
          id: this.communication.id,
          campaignId: this.communication.campaign_id,
          contactName: this.contact.name,
          companyName: this.contact.company_name,
          contactId: this.contact.id,
          phoneNumber: this.contact.phone_number,
          isCallWaiting: this.isCallWaiting
        },
        shouldPark: shouldPark,
        shouldHangup: shouldHangup
      }

      await this.fetchCurrentCommunicationIfNeeded(data)

      this.$VueEvent.fire('answerCallFishing', data)
      this.setShowPhone(true)
    },

    async fetchCurrentCommunicationIfNeeded (data = {}) {
      // Check if we need to fetch current communication
      const needsCurrentCommunication = !this.dialer.call && this.isAgentOnCall
      if (needsCurrentCommunication) {
        try {
          const response = await this.$axios.post('/api/v1/profile/get-live-calls')
          const currentCommunication = response.data.find(call => {
            return call.current_status2 === CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW
          })

          if (!currentCommunication) {
            console.log('No live calls found for this agent')
            return data
          }

          console.log('Setting dialer communication from live-calls.mixin', currentCommunication)
          this.setDialerCommunication(currentCommunication)

          data['parkFromAnotherTab'] = true

          return data
        } catch (err) {
          console.log(err)
        }
      }

      return data
    }
  }
}
