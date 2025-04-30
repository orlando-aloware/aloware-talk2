export default {
  getNavListItems: state => [state.navListItems[0]],
  getInboxesFirstPage: state => state.inboxesFirstPage,
  getTeamInboxAnnouncementViewed: state => state.teamInboxAnnouncementViewed
}
