const focusedPowerDialerUserIds = process.env.NODE_ENV === 'production' ? [69563] : [69563, 76585]
const focusedPowerDialerCompanyIds = process.env.NODE_ENV === 'production' ? [] : []

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
