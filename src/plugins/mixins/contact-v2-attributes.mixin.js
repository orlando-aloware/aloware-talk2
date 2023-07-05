import { get, isEmpty } from 'lodash'

export default {
  methods: {
    addV2ContactAttributes (contact, communication = null, contactToUpdate = null) {
      const oldContact = this.$jsonClone(contact)
      const newContact = this.$jsonClone(contactToUpdate)
      // initialize the v2 contact attributes
      const unreadCount = get(oldContact, 'unread_count', 0)
      const unreadMissedCallCount = get(oldContact, 'unread_missed_call_count', 0)
      const unreadVoicemailCount = get(oldContact, 'unread_voicemail_count', 0)
      let engagementDate = null

      // remove the contact from communication
      if (communication && 'contact' in communication) {
        delete communication.contact
      }

      // add the last communication
      if (communication) {
        oldContact.last_communication = communication
      }

      // we only declare engagement date if there is a communication
      // as we base it from there
      if (communication) {
        engagementDate = get(communication, 'created_at', null)
      }

      // assign value for contact's last engagement from
      // communication if it doesn't exist
      if (newContact && engagementDate && !('last_engagement_at' in newContact)) {
        oldContact.last_engagement_at = engagementDate
      }

      // assign zero value for the unreads
      oldContact.unread_texts_count = unreadCount
      oldContact.unread_missed_calls_count = unreadMissedCallCount
      oldContact.unread_voicemails_count = unreadVoicemailCount

      if (!isEmpty(newContact)) {
        Object.assign(newContact, oldContact)

        return newContact
      }

      return oldContact
    }
  }
}
