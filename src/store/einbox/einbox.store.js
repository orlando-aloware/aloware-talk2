export const CALLS_TYPE = 1
export const SMS_TYPE = 2

export default function () {
  return {
    activeInbox: null,
    newInboxEnabled: false,
    inboxes: [],
    isLoadingInboxes: false,
    currentInboxesPage: 0,
    hasMoreInboxes: true,
    communicationType: CALLS_TYPE,
    contacts: [],
    isLoadingContacts: false,
    isLoadingMoreContacts: false,
    currentContactsPage: 0,
    hasMoreContacts: true
  }
}
