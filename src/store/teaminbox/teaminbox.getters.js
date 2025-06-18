export default {
  getNavListItems: state => [state.navListItems[0]],
  getInboxesFirstPage: state => state.inboxesFirstPage,
  getConnectedInboxesLength: state => state.inboxes.length,
  getInboxAnnouncementViewed: state => state.inboxAnnouncementViewed,
  getUnreadCountLoaded: state => state.unreadCountLoaded,

  // Check if team inboxes have been loaded (not currently loading)
  isTeamInboxesLoaded: state => {
    // We consider inboxes loaded when:
    // 1. We're not currently loading inboxes
    // 2. We've received a response (even if empty)
    return !state.isLoadingInboxes && state.inboxes !== null
  },

  // Check if user has any team inboxes attached
  hasTeamInboxes: state => {
    return state.inboxes && state.inboxes.length > 0
  },

  // Get the campaign ids for the active inbox
  activeInboxCampaignIds: state => {
    const callWaitingIds = Array.isArray(state.activeInbox?.campaign_ids_as_call_waiting_ring_group)
      ? state.activeInbox.campaign_ids_as_call_waiting_ring_group
      : state.activeInbox?.campaign_ids_as_call_waiting_ring_group
        ? [state.activeInbox.campaign_ids_as_call_waiting_ring_group]
        : []

    return state.activeInbox?.campaign_ids
      ? [...state.activeInbox.campaign_ids, ...callWaitingIds]
      : callWaitingIds
  }
}
