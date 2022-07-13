// import dialer state in the component when using this mixin
import { CONTACTS_ACCESS_OWNED_ONLY } from 'src/constants/contact-access-types'
import { mapActions, mapState } from 'vuex'
import { CURRENT_STATUS_HOLD_NEW, CURRENT_STATUS_INPROGRESS_NEW } from 'src/constants/communication-current-status'

export default {
  data () {
    return {
      unownedContact: {
        interval: null,
        count: 0
      }
    }
  },
  computed: {
    ...mapState('inbox', ['liveContacts']),
    ...mapState(['dialer', 'parkedCalls']),
    ...mapState('auth', ['profile'])
  },
  methods: {
    addNonOwnedLiveContact (communication) {
      const liveContact = JSON.parse(JSON.stringify(communication.contact))
      liveContact.last_communication = JSON.parse(JSON.stringify(communication))

      if (this.isNotOwned(liveContact.user_id)) {
        const found = this.liveContacts.find(item => item.id === liveContact.id)

        if (found) {
          return
        }

        this.setLiveContacts([liveContact].concat(this.liveContacts))
      }
    },
    addNonOwnedParkedTask (communication) {
      if (this.isNotOwned(communication.contact.user_id)) {
        this.addParkedCall(communication)
        this.updateLiveContactLastCommCurrentStatus({
          id: communication.contact.id,
          status: CURRENT_STATUS_HOLD_NEW
        })
      }
    },
    updateUnownedContactLastCommunicationStatus () {
      this.unownedContact.interval = setInterval(() => {
        if (this.dialer.contact) {
          this.updateLiveContactLastCommCurrentStatus({
            id: this.dialer.contact.id,
            status: CURRENT_STATUS_INPROGRESS_NEW
          })
          clearInterval(this.unownedContact.interval)
        }

        this.unownedContact.count++

        if (this.unownedContact.count >= 600) {
          clearInterval(this.unownedContact.interval)
        }
      }, 100)
    },
    removeUnownedLiveContactTask () {
      const liveContactData = {
        contact: this.dialer.contact,
        call: this.dialer.call,
        communication: this.dialer.communication,
        liveContactFound: null,
        parkedCallFound: null
      }

      if (liveContactData.communication) {
        liveContactData.liveContactFound = this.liveContacts.find(contact => contact.id === liveContactData.communication.contact_id)
        liveContactData.parkedCallFound = this.parkedCalls.find(call => call.id === liveContactData.communication.id)
      }

      if (liveContactData.contact &&
        this.isNotOwned(liveContactData.contact.user_id) &&
        liveContactData.call &&
        liveContactData.liveContactFound &&
        !liveContactData.parkedCallFound) {
        this.removeLiveContact(liveContactData.contact.id)
      }
    },
    removeUnownedParkedCall (communication) {
      if (this.isNotOwned(communication.contact.user_id)) {
        this.removeParkedCall(communication)
      }
    },
    isNotOwned (userId) {
      return userId && userId !== this.profile.id && this.profile.contacts_visibility === CONTACTS_ACCESS_OWNED_ONLY
    },
    ...mapActions('inbox', [
      'setLiveContacts',
      'updateLiveContactLastCommCurrentStatus',
      'removeLiveContact'
    ]),
    ...mapActions([
      'addParkedCall',
      'removeParkedCall'
    ])
  }
}
