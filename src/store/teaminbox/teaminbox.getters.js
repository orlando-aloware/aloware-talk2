export default {
  getNavListItems: state => [state.navListItems[0]],
  getInboxesFirstPage: state => state.inboxesFirstPage,
  getConnectedInboxesLength: state => state.inboxes.length,
  getInboxAnnouncementViewed: state => state.inboxAnnouncementViewed
}
