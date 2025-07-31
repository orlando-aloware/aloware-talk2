export const allowedRoutes = {
  talkLite: [
    'Power Dialer',
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
    'Phone',
    'HubSpot SMS Channel Connect'
  ]
}

export const setRouterType = ({ commit, state }) => {
  const enableTalkLite = state.profile?.enable_talk_lite || false
  commit('SET_FOCUSED_POWER_DIALER', enableTalkLite)
}
