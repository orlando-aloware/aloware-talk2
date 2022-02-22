import * as CommunicationCurrentStatus from 'src/constants/communication-current-status'
import * as CommunicationTypes from 'src/constants/communication-types'
import * as CommunicationDirection from 'src/constants/communication-direction'
import { mapActions, mapState } from 'vuex'
import _ from 'lodash'

export default {
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
    ...mapState(['dialer', 'notifications', 'ringGroups', 'callFishingQueue']),

    shouldShowIncomingCallMenu () {
      if (this.isIncomingLiveCall && this.isCallFishing && !this.isCallFishingMode) {
        return false
      }
      return ((this.isIncomingLiveCall && this.isCallFishing && this.isCallFishingMode) || (this.isIncomingLiveCall && this.dialer.call && this.dialer.call.state === 'pending')) && !this.isParkedCall && !this.isConnectedCall
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
      return this.dialer.parkedCall && this.dialer.parkedCall.id === this.communication.id
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
      return [CommunicationCurrentStatus.CURRENT_STATUS_INPROGRESS_NEW].includes(this.communication.current_status2)
    },
    isCallFishing () {
      if (!this.communication.ring_group_id) {
        return false
      }

      const ringGroup = this.getRingGroup(this.communication.ring_group_id)

      return ringGroup && ringGroup.fishing_mode
    },
    isCallFishingMode () {
      if (this.callFishingQueue) {
        return this.callFishingQueue.findIndex(item => item.communicationId === this.communication.id) >= 0
      }

      return false
    },

    isIncomingLiveCall () {
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
    }
  },

  methods: {
    ...mapActions(['setShowPhone', 'removeFromCallFishingQueue']),
    ...mapActions('inbox', ['setContacts', 'setLiveContacts']),
    getRingGroup (id) {
      return id ? this.ringGroups.find(item => item.id === id) : null
    },
    onAcceptCall (e) {
      if (this.dialer.call && this.dialer.currentStatus === 'CALL_CONNECTED') {
        this.showIncomingCallMenu = true
        e.stopImmediatePropagation()
        return
      }

      this.isAnsweringCall = true

      if (this.communication.ring_group_id) {
        const ringGroup = this.getRingGroup(this.communication.ring_group_id)

        if (ringGroup && ringGroup.fishing_mode) {
          const data = {
            communication: {
              id: this.communication.id,
              campaignId: this.communication.campaign_id,
              contactName: this.contact.name,
              companyName: this.contact.company_name,
              contactId: this.contact.id,
              phoneNumber: this.contact.phone_number
            },
            shouldPark: false,
            shouldHangup: false
          }
          this.$VueEvent.fire('answerCallFishing', data)
          this.setShowPhone(true)
          this.isAnsweringCall = false

          e.stopImmediatePropagation()
          return
        }
      }

      this.$VueEvent.fire('answerCall')
      this.isAnsweringCall = false
      this.setShowPhone(true)
      e.stopImmediatePropagation()
    },
    onRejectCall (e) {
      this.isRejecting = true
      if (this.isCallFishingMode) {
        this.removeFromCallFishingQueue(this.communication.id)
        const liveContacts = _.cloneDeep(this.liveContacts)
        if (this.liveContacts.find(item => item.id === this.contact.id)) {
          liveContacts.splice(this.liveContacts.findIndex(item => item.id === this.contact.id), 1)
          this.setLiveContacts(liveContacts)
        }
        const contacts = _.cloneDeep(this.contacts)
        if (!this.contacts.find(item => item.id === this.contact.id)) {
          contacts.unshift(this.contact)
          this.setContacts(contacts)
        }

        this.isRejecting = false
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
      e.stopImmediatePropagation()
    },
    onHangUpCall (e) {
      this.$VueEvent.fire('hangupCall')
      e.stopImmediatePropagation()
    },
    onUnparkCall (e) {
      if (this.dialer.call && this.dialer.currentStatus === 'CALL_CONNECTED') {
        this.showParkedCallMenu = true
        e.stopImmediatePropagation()
        return
      }

      this.$VueEvent.fire('unparkCall')
      this.$VueEvent.fire('togglePhone')
      e.stopImmediatePropagation()
    },

    onParkCurrentCallAndConnect () {
      this.showParkedCallMenu = false
      this.answerCommunication(true, true)
    },
    onHangupCurrentCallAndConnect () {
      this.showParkedCallMenu = false
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
    answerCommunication (shouldPark = false, shouldHangup = false) {
      const data = {
        communication: {
          id: this.communication.id,
          campaignId: this.communication.campaign_id,
          contactName: this.contact.name,
          companyName: this.contact.company_name,
          contactId: this.contact.id,
          phoneNumber: this.contact.phone_number
        },
        shouldPark: shouldPark,
        shouldHangup: shouldHangup
      }
      this.$VueEvent.fire('answerCallFishing', data)
      this.setShowPhone(true)
    },
    onShowPhone (e) {
      this.showCallMenu = false
      if (!this.isActiveCall && !this.isIncomingLiveCall && !this.isCallFishingMode) {
        e.stopImmediatePropagation()
        return
      }

      this.showCallFishingDataInPhone({
        communication: this.communication,
        contact: this.contact
      })

      e.stopImmediatePropagation()
    }
  }
}
