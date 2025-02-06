export default {
  isEInboxEnabled: state => state.newInboxEnabled,
  getNavListItems: state => state.newInboxEnabled ? [state.navListItems[0]] : state.navListItems,
  getInboxesFirstPage: state => state.inboxesFirstPage
}
