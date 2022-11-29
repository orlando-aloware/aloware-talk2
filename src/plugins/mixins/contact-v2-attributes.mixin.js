import { get, isEmpty } from 'lodash'

export default {
  methods: {
    addV2ContactAttributes (contact, communication = null, contactToUpdate = null) {
      // initialize the v2 contact attributes
      const unreadCount = get(contact, 'unread_count', 0)
      const unreadMissedCallCount = get(contact, 'unread_missed_call_count', 0)
      const unreadVoicemailCount = get(contact, 'unread_voicemail_count', 0)
      let engagementDate = null

      // remove the contact from communication
      if (communication && 'contact' in communication) {
        delete communication.contact
      }

      // add the last communication
      if (communication) {
        contact.last_communication = communication
      }

      // we only declare engagement date if there is a communication
      // as we base it from there
      if (communication) {
        engagementDate = get(communication, 'created_at', null)
      }

      // assign value for contact's last engagement from
      // communication if it doesn't exist
      if (contactToUpdate && engagementDate && !('last_engagement_at' in contactToUpdate)) {
        contact.last_engagement_at = engagementDate
      }

      // assign zero value for the unreads
      contact.unread_texts_count = unreadCount
      contact.unread_missed_calls_count = unreadMissedCallCount
      contact.unread_voicemails_count = unreadVoicemailCount

      if (!isEmpty(contactToUpdate)) {
        Object.assign(contactToUpdate, contact)
        return contactToUpdate
      }

      return contact
    }
  }
}
