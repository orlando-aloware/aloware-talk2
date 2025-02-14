export default {
  // isEInboxEnabled: state => state.newInboxEnabled,
  getNavListItems: state => [state.navListItems[0]],
  getInboxesFirstPage: state => state.inboxesFirstPage
}
