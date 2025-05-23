import { isProductionEnvironment } from 'src/shared/composables/useEnvironmentComposable'

const focusedPowerDialerUserIds = isProductionEnvironment
  ? []
  : [
    69563,
    76035,
    76774
  ]
// All Frank and Tito accounts
const focusedPowerDialerCompanyIds = isProductionEnvironment
  ? []
  : []

export const allowedRoutes = {
  focusedPowerDialer: [
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
    'Phone'
  ]
}

export const setRouterType = (authModule) => {
  // TODO - MOVE TO BACKEND FLAG IF PoC IS SUCCESSFUL

  if (focusedPowerDialerUserIds.includes(authModule.state.profile.id) || focusedPowerDialerCompanyIds.includes(authModule.state.profile.company_id)) {
    authModule.commit('SET_FOCUSED_POWER_DIALER', true)
  }
}
