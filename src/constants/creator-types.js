// Communication that initiated manually
export const CREATOR_TYPE_MANUAL = 1
// Communication that initiated from API
export const CREATOR_TYPE_API = 2
// Communication that initiated from Aloware workflows
export const CREATOR_TYPE_WORKFLOW = 3
// Communication that initiated from Aloware broadcasts
export const CREATOR_TYPE_BROADCAST = 4
// Communication that initiated from Aloware power dialer
export const CREATOR_TYPE_POWER_DIALER = 5
// Communication that initiated from appointments sms reminders
export const CREATOR_TYPE_SMS_REMINDER = 6
// Communication that initiated from app notifications
export const CREATOR_TYPE_APP_NOTIFICATIONS = 7
// Communication that initiated from HubSpot
export const CREATOR_TYPE_HUBSPOT = 8
// Communication that initiated from Zapier
export const CREATOR_TYPE_ZAPIER = 9
// Communication that initiated from AlohaBot
export const CREATOR_TYPE_ALOHABOT = 10
// Communication that initiated from GoHighLevel
export const CREATOR_TYPE_GOHIGHLEVEL = 11
export const CREATOR_TYPE_ALOAI = 12

export const ALL_CREATOR_TYPES = [
  {
    id: CREATOR_TYPE_MANUAL,
    label: 'Manual'
  },
  {
    id: CREATOR_TYPE_API,
    label: 'API'
  },
  {
    id: CREATOR_TYPE_WORKFLOW,
    label: 'Sequence'
  },
  {
    id: CREATOR_TYPE_BROADCAST,
    label: 'Broadcast'
  },
  {
    id: CREATOR_TYPE_POWER_DIALER,
    label: 'Power Dialer'
  },
  {
    id: CREATOR_TYPE_SMS_REMINDER,
    label: 'SMS Reminder'
  },
  {
    id: CREATOR_TYPE_APP_NOTIFICATIONS,
    label: 'App Notifications'
  },
  {
    id: CREATOR_TYPE_HUBSPOT,
    label: 'HubSpot Workflow'
  },
  {
    id: CREATOR_TYPE_ZAPIER,
    label: 'Zapier'
  },
  {
    id: CREATOR_TYPE_ALOHABOT,
    label: 'AlohaBot'
  },
  {
    id: CREATOR_TYPE_GOHIGHLEVEL,
    label: 'GoHighLevel'
  },
  {
    id: CREATOR_TYPE_ALOAI,
    label: 'AloAi'
  }
]
