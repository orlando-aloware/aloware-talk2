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
    ...mapState(['dialer', 'notifications', 'ringGroups']),

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
      if (this.notifications.callFishing.communicationId === this.communication.id) {
        return true
      }

      if (this.notifications.callFishing.queue) {
        let index = this.notifications.callFishing.queue.findIndex(item => item.communicationId === this.communication.id)
        return index >= 0
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
    ...mapActions(['setShowPhone']),
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

      let communication = this.communication

      if (communication.ring_group_id) {
        const ringGroup = this.getRingGroup(communication.ring_group_id)

        if (ringGroup && ringGroup.fishing_mode) {
          const data = {
            communication: {
              id: communication.id,
              campaignId: communication.campaign_id,
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
        this.processRemoveFromNotification(this.communication)
        let isInLiveContacts = this.liveContacts.find(item => item.id === this.contact.id)
        let isInContacts = this.contacts.find(item => item.id === this.contact.id)
        let liveContacts = _.cloneDeep(this.liveContacts)
        let contact = _.cloneDeep(this.contact)
        if (isInLiveContacts) {
          let index = this.liveContacts.findIndex(item => item.id === this.contact.id)
          liveContacts.splice(index, 1)
          this.setLiveContacts(liveContacts)
        }
        let contacts = _.cloneDeep(this.contacts)
        if (!isInContacts) {
          contacts.unshift(contact)
          this.setContacts(contacts)
        }

        this.isRejecting = false
        e.stopImmediatePropagation()
        return
      }

      // handle active call
      if (this.dialer && this.dialer.state === 'open') {
        console.log('Hangup call from task item..')
        this.$VueEvent.fire('hangupCall')
        this.isRejecting = false
        return
      }

      console.log('Reject call from task item..')
      this.$VueEvent.fire('rejectCall')
      this.isRejecting = false
      e.stopImmediatePropagation()
    },
    onHangUpCall (e) {
      console.log(';hangup')
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
