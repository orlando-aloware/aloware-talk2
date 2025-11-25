export default function () {
  return {
    // Contact selection
    selectedContact: {},

    // Live contacts in active calls
    liveContacts: [],

    // Contact and communication lists
    contacts: [],
    communications: [],

    // Filter-related state
    channelChangedFilterFields: [],

    // Filter preferences
    inboxShowMyContacts: true
  }
}
