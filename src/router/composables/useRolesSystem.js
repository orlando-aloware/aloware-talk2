const focusedPowerDialerUserIds = [69563]
const focusedPowerDialerCompanyIds = []

export const allowedRoutes = {
  focusedPowerDialer: [
    'Power Dialer',
    'Stats',
    'Settings'
  ],
  default: [
    'Inbox',
    'Team Inbox',
    'Communications',
    'Contacts',
    'Lists',
    'Power Dialer',
    'Wallboard',
    'Calendar',
    'Tags',
    'Stats',
    'Broadcasts',
    'AloAI',
    'Settings'
  ]
}

export const setRouterType = (authModule) => {
  // TODO - MOVE TO BACKEND FLAG IF PoC IS SUCCESSFUL

  if (focusedPowerDialerUserIds.includes(authModule.state.profile.id) || focusedPowerDialerCompanyIds.includes(authModule.state.profile.company_id)) {
    authModule.commit('SET_FOCUSED_POWER_DIALER', true)
  }
}
