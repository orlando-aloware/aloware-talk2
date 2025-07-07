export const allowedRoutes = {
  talkLite: [
    'Power Dialer',
    'Team Inboxes',
    'Stats',
    'Settings'
  ],
  default: [
    'Inbox',
    'Team Inboxes',
    'Communications',
    'Contacts',
    'Lists',
    'Power Dialer',
    'Wallboard',
    'Calendar',
    'Tags',
    'Stats',
    'Broadcasts',
    'AloAi',
    'Settings',
    'Phone'
  ]
}

export const setRouterType = (authModule) => {
  const enableTalkLite = authModule.state.profile?.enable_talk_lite || false
  authModule.commit('SET_FOCUSED_POWER_DIALER', enableTalkLite)
}
