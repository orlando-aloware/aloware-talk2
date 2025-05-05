const MainLayout = () => import('layouts/MainLayout.vue')
const Login = () => import('pages/Login.vue')
const ForgotPassword = () => import('pages/ForgotPassword.vue')
const ResetPassword = () => import('pages/ResetPassword.vue')
const Inbox = () => import('pages/Inbox.vue')
const TeamInbox = () => import('pages/TeamInbox.vue')
const CommunicationsView = () => import('src/pages/CommunicationsView.vue')
const Contact = () => import('src/pages/contacts/Contact.vue')
const Contacts = () => import('src/pages/contacts/Contacts.vue')
const ContactsView = () => import('src/pages/contacts/ContactsView.vue')
const ContactsAddView = () => import('src/pages/contacts/ContactsAddView.vue')
const Dialer = () => import('pages/widgets/Dialer.vue')
const Lists = () => import('pages/lists/Lists.vue')
const PowerDialer = () => import('pages/power-dialer/PowerDialer.vue')
const PowerDialerView = () => import('pages/power-dialer/PowerDialerView.vue')
const PowerDialerAddView = () => import('src/pages/power-dialer/PowerDialerAddView')
const PowerDialerSession = () => import('src/pages/power-dialer/PowerDialerSession')
const Wallboard = () => import('pages/wallboard/Wallboard.vue')
const WallboardOverview = () => import('pages/wallboard/WallboardOverview.vue')
const WallboardAgents = () => import('pages/wallboard/WallboardAgents.vue')
const WallboardCalls = () => import('pages/wallboard/WallboardCalls.vue')
const Calendar = () => import('src/pages/calendar/Calendar.vue')
const Tags = () => import('pages/tags/Tags.vue')
const Stats = () => import('pages/stats/Stats.vue')
const Settings = () => import('pages/Settings.vue')
const Account = () => import('pages/Account.vue')
const Communication = () => import('pages/Communication.vue')
const Phone = () => import('pages/Phone.vue')
const Error404 = () => import('pages/Error404.vue')
const Messenger = () => import('pages/Messenger.vue')
const Broadcasts = () => import('pages/broadcast/Broadcasts.vue')
const BroadcastAdd = () => import('pages/broadcast/BroadcastAdd.vue')
const AccountRegistration = () => import('pages/account-registration/AccountRegistration.vue')
const HubSpotMessageWidgetError = () => import('pages/widgets/HubSpotMessageWidgetError.vue')
const SalesforceSoftPhone = () => import('pages/widgets/SalesforceSoftPhone.vue')
const AloAi = () => import('pages/AloAi.vue')
const Apps = () => import('pages/Apps.vue')

export const COMMUNICATIONS_BASE_PATH = 'communications'
export const DEFAULT_COMMUNICATIONS_CHANNEL = 'all'
export const CALLS_CHANNEL = 'calls'
export const VOICEMAILS_CHANNEL = 'voicemails'
export const RECORDINGS_CHANNEL = 'recordings'
export const MESSAGES_CHANNEL = 'messages'

export const DEFAULT_COMMUNICATIONS_ROUTE_PATH = `/${COMMUNICATIONS_BASE_PATH}/${DEFAULT_COMMUNICATIONS_CHANNEL}`

export const DEFAULT_COMMUNICATIONS_ROUTE_NAME = 'Communications'
export const COMMUNICATIONS_VIEWS_ROUTE_NAME = 'Communications View'
export const COMMUNICATIONS_CHANNELS_ROUTE_NAME = 'Communications Channel'
export const COMUNICATIONS_CHANNELS_TASKS_STATUS_ROUTE_NAME = 'Communications Channel Task Status'

// Update the constants at the top
export const INBOXES_MENU_TITLE = 'Inboxes'
export const TEAMINBOXES_MENU_TITLE = 'Team Inboxes'
export const TEAMINBOXES_MENU_ITEMS_TITLE = 'Team Inboxes Items'
export const TEAMINBOXES_MENU_COMMUNICATIONS_TITLE = 'Team Inboxes Communications'
export const NEW_INBOX_MENU_TITLE = 'New Inbox'
export const COMMUNICATIONS_MENU_TITLE = 'Communications'
export const COMMUNICATIONS_MENU_TITLE_MOBILE = 'Comms.'

export const navigationErrorHandler = (err) => {
  if (err.name !== 'NavigationDuplicated') {
    // ignore NavigationDuplicated errors when updating query params
    console.error(err)
  }
}

const routes = [
  {
    path: '/',
    component: MainLayout,
    props: true,
    children: [
      {
        path: 'login',
        name: 'Login',
        meta: {
          isGuest: true,
          title: 'Login'
        },
        component: Login
      },
      {
        path: 'forgot-password',
        name: 'Forgot Password',
        meta: {
          isGuest: true
        },
        component: ForgotPassword
      },
      {
        path: 'reset/:token',
        name: 'Reset Password',
        meta: {
          isGuest: true
        },
        component: ResetPassword
      },
      {
        path: 'team-inboxes',
        name: TEAMINBOXES_MENU_TITLE,
        component: TeamInbox,
        meta: {
          title: TEAMINBOXES_MENU_TITLE,
          isInbox: true
        },
        children: [
          {
            path: ':inboxId',
            name: TEAMINBOXES_MENU_ITEMS_TITLE,
            component: TeamInbox,
            meta: {
              title: TEAMINBOXES_MENU_TITLE,
              isInbox: true
            }
          },
          {
            path: ':inboxId/contacts/:id/communications',
            name: TEAMINBOXES_MENU_COMMUNICATIONS_TITLE,
            component: Contact,
            meta: {
              title: TEAMINBOXES_MENU_TITLE,
              isInbox: true
            }
          }
        ]
      },
      {
        path: '',
        name: 'Inbox',
        component: Inbox,
        meta: {
          title: INBOXES_MENU_TITLE,
          isInbox: true
        },
        children: [
          {
            path: 'channels/:channel/:status/contacts/:id',
            name: 'Inbox Contact Task',
            component: Contact,
            meta: {
              title: INBOXES_MENU_TITLE,
              isInbox: true
            }
          },
          {
            path: 'channels/:channel/:status',
            name: 'Inbox Channel Task Status',
            component: Contact,
            meta: {
              title: INBOXES_MENU_TITLE,
              isInbox: true
            }
          },
          {
            path: 'channels/:channel/contacts/:id/communications/:communicationId',
            name: 'Inbox Contact',
            component: Contact,
            meta: {
              title: INBOXES_MENU_TITLE,
              isInbox: true
            }
          },
          {
            path: 'channels/:channel/:status/contacts/:id/communications/:communicationId',
            name: 'Inbox Contact Communication',
            component: Contact,
            meta: {
              title: INBOXES_MENU_TITLE,
              isInbox: true
            }
          },
          {
            path: 'channels/:channel',
            name: 'Inbox Channel',
            component: Inbox,
            meta: {
              title: INBOXES_MENU_TITLE,
              isInbox: true
            }
          },
          {
            path: 'channels/view/:viewId/:status',
            name: 'Inbox View',
            component: Inbox,
            meta: {
              title: INBOXES_MENU_TITLE,
              isInbox: true
            }
          },
          {
            path: 'channels/view/:viewId/:status/contacts/:id',
            name: 'Inbox View Contact Task',
            component: Contact,
            meta: {
              title: INBOXES_MENU_TITLE,
              isInbox: true
            }
          }
        ]
      },
      {
        path: COMMUNICATIONS_BASE_PATH,
        name: DEFAULT_COMMUNICATIONS_ROUTE_NAME,
        component: CommunicationsView,
        meta: {
          title: COMMUNICATIONS_MENU_TITLE
        },
        children: [
          {
            path: ':channel',
            name: COMMUNICATIONS_CHANNELS_ROUTE_NAME,
            component: CommunicationsView,
            meta: {
              title: COMMUNICATIONS_MENU_TITLE
            }
          },
          {
            path: 'view/:viewId/:status',
            name: COMMUNICATIONS_VIEWS_ROUTE_NAME,
            component: CommunicationsView,
            meta: {
              title: COMMUNICATIONS_MENU_TITLE
            }
          },
          {
            path: ':channel/:status',
            name: COMUNICATIONS_CHANNELS_TASKS_STATUS_ROUTE_NAME,
            component: Contact,
            meta: {
              title: COMMUNICATIONS_MENU_TITLE
            }
          }
        ]
      },
      {
        path: 'contacts',
        component: Contacts,
        meta: {
          title: 'Contacts'
        },
        children: [
          {
            name: 'Contacts',
            path: '/',
            meta: {
              title: 'Contacts',
              page: 'Contacts'
            },
            component: ContactsView
          },
          {
            name: 'Contacts',
            path: 'list/:id(my-contacts|new-leads|unanswered|unassigned|unsaved)+',
            meta: {
              title: 'Contacts',
              page: 'Default Contacts List'
            },
            component: ContactsView
          },
          {
            name: 'Contacts',
            path: 'list/:id(\\d+)+',
            meta: {
              title: 'Contacts',
              page: 'Contacts List'
            },
            component: ContactsView
          },
          {
            name: 'Contacts List Public',
            path: 'list/public/:id(\\d+)+',
            component: ContactsView,
            meta: {
              title: 'Contacts',
              page: 'Public Contacts List'
            }
          },
          {
            name: 'Contacts',
            path: 'list/:id(\\d+)+/add',
            meta: { title: 'Contacts' },
            component: ContactsAddView
          }
        ]
      },
      {
        path: 'contacts/:id',
        name: 'Contact',
        component: Contacts,
        meta: {
          title: 'Contact'
        }
      },
      {
        path: 'lists-management',
        name: 'Lists',
        component: Lists,
        meta: {
          title: 'Lists Management Utility',
          id: 'lists'
        },
        children: [
          {
            path: ':type(public|user)+',
            name: 'Lists',
            component: Lists,
            meta: {
              title: 'Lists Management Utility',
              id: 'lists'
            }
          },
          {
            path: ':type(user)+/:userId(\\d+)+',
            name: 'Lists',
            component: Lists,
            meta: {
              title: 'Lists Management Utility',
              id: 'lists'
            }
          },
          {
            path: ':type(user)+/:userId(\\d+)+/folder/:folderId(\\d+)+',
            name: 'Lists',
            component: Lists,
            meta: {
              title: 'Lists Management Utility',
              id: 'lists'
            }
          },
          {
            path: ':type(user)+/folder/:folderId(\\d+)+',
            name: 'Lists',
            component: Lists,
            meta: {
              title: 'Lists Management Utility',
              id: 'lists'
            }
          }
        ]
      },
      {
        path: 'lists',
        component: Contacts,
        meta: {
          title: 'Contacts'
        },
        children: [
          {
            name: 'Contacts',
            path: 'user/:userId(\\d+)+/list/:id(\\d+)+',
            meta: {
              title: 'Contacts',
              page: 'Contacts List',
              isFromListsManagement: true
            },
            component: ContactsView
          },
          {
            name: 'Contacts',
            path: 'user/:userId(\\d+)+/folder/:folderId(\\d+)+/list/:id(\\d+)+',
            meta: {
              title: 'Contacts',
              page: 'Contacts List',
              isFromListsManagement: true
            },
            component: ContactsView
          },
          {
            name: 'Contacts',
            path: ':type(public)+/list/:id(\\d+)+',
            meta: {
              title: 'Contacts',
              page: 'Contacts List',
              isFromListsManagement: true
            },
            component: ContactsView
          }
        ]
      },
      {
        path: 'power-dialer',
        component: PowerDialer,
        meta: {
          title: 'Power Dialer',
          id: 'power-dialer'
        },
        children: [
          {
            name: 'Power Dialer',
            meta: {
              title: 'Power Dialer',
              id: 'power-dialer'
            },
            path: '',
            redirect: {
              path: 'in-queue'
            },
            component: PowerDialerView
          },
          {
            name: 'Power Dialer',
            meta: {
              title: 'Power Dialer',
              id: 'power-dialer-queue-filter'
            },
            path: ':id(in-queue|called|failed|scheduled|all)+',
            component: PowerDialerView
          },
          {
            name: 'Power Dialer',
            meta: {
              title: 'Power Dialer Sessions',
              id: 'power-dialer-session'
            },
            path: 'list/:id(\\d+)+/sessions',
            component: () => import('src/pages/power-dialer/PowerDialerSession')
          },
          {
            name: 'Power Dialer',
            meta: {
              title: 'Power Dialer List',
              id: 'power-dialer-list'
            },
            path: 'list/:id(\\d+)+',
            redirect: {
              path: 'list/:id(\\d+)+/in-queue'
            },
            component: PowerDialerView,
            children: [
              {
                name: 'Power Dialer',
                meta: {
                  title: 'Power Dialer',
                  id: 'power-dialer-list-filter'
                },
                path: ':filter(in-queue|called|failed|scheduled|all)+',
                component: PowerDialerView
              }
            ]
          },
          {
            name: 'Power Dialer',
            meta: {
              title: 'Add Contacts to PD List',
              id: 'power-dialer-add-list'
            },
            path: 'list/:id(\\d+)+/add',
            component: PowerDialerAddView
          },
          {
            name: 'Power Dialer',
            meta: {
              title: 'Add Contacts to My Queue',
              id: 'power-dialer-add-queue-list'
            },
            path: 'list/add',
            component: PowerDialerAddView
          }
        ]
      },
      {
        name: 'Power Dialer Session',
        meta: {
          title: 'Power Dialer Session',
          id: 'power-dialer-session'
        },
        path: 'power-dialer/session',
        component: PowerDialerSession
      },
      {
        name: 'Wallboard',
        path: 'wallboard',
        component: Wallboard,
        meta: {
          title: 'Wallboard',
          id: 'wallboard'
        },
        redirect: {
          path: 'wallboard/overview'
        },
        children: [
          {
            name: 'Wallboard',
            meta: {
              title: 'Wallboard',
              id: 'wallboard-overview'
            },
            path: 'overview',
            component: WallboardOverview
          },
          {
            name: 'Wallboard Agents',
            meta: {
              title: 'Wallboard',
              id: 'wallboard-agents'
            },
            path: 'agents',
            component: WallboardAgents
          },
          {
            name: 'Wallboard Calls',
            meta: {
              title: 'Wallboard',
              id: 'wallboard-calls'
            },
            path: ':id(queued|live|parked)+-calls',
            component: WallboardCalls
          }
        ]
      },
      {
        path: 'calendar',
        name: 'Calendar',
        component: Calendar,
        meta: {
          title: 'Calendar'
        }
      },
      {
        path: 'tags',
        name: 'Tags',
        component: Tags,
        meta: {
          title: 'Tags'
        }
      },
      {
        path: 'stats',
        name: 'Stats',
        component: Stats,
        meta: {
          title: 'Stats'
        }
      },
      {
        path: 'broadcasts',
        name: 'Broadcasts',
        component: Broadcasts,
        meta: {
          title: 'Broadcasts'
        }
      },
      {
        name: 'Broadcasts',
        meta: {
          id: 'broadcasts-add',
          title: 'Broadcasts'
        },
        path: 'broadcasts/new',
        component: BroadcastAdd
      },
      {
        path: 'aloai',
        name: 'AloAi',
        component: AloAi,
        meta: {
          title: 'AloAi'
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: Settings,
        meta: {
          title: 'Settings'
        },
        children: [
          {
            path: '/settings/:tab',
            name: 'Settings Tab',
            component: Settings,
            meta: {
              title: 'Settings'
            }
          }
        ]
      },
      {
        path: 'account',
        name: 'Account',
        component: Account
      },
      {
        path: 'user-activity/:userId',
        name: 'User Activity',
        component: Account
      },
      {
        path: 'line-activity/:campaignId',
        name: 'Line Activity',
        component: Account
      },
      {
        path: 'sequence-activity/:sequenceId',
        name: 'Sequence Activity',
        component: Account
      },
      {
        path: 'broadcast-activity/:broadcastId',
        name: 'Broadcast Activity',
        component: Account
      },
      {
        path: '/contacts/:contactId/communications/:communicationId',
        name: 'Communication',
        component: Communication,
        meta: {
          title: 'Communication'
        }
      },
      {
        name: 'Communication',
        path: 'communication/:communicationId',
        meta: {
          title: 'Communication'
        },
        component: Communication
      },
      {
        path: 'phone',
        name: 'Phone',
        component: Phone
      },
      {
        path: 'messenger',
        name: 'Messenger',
        meta: {
          title: 'Messenger'
        },
        component: Messenger
      },
      {
        path: '/account-registration/:verification_token?',
        name: 'Account Registration',
        meta: {
          title: 'Account Registration',
          isGuest: true
        },
        component: AccountRegistration
      },
      {
        name: 'Texting Widget (known-user)',
        path: '/widgets/texting/api_key/:api_key/contact/:id',
        props: true,
        meta: {
          isWidget: true
        },
        component: Contact
      },
      {
        name: 'Texting Widget (unknown-user)',
        path: '/widgets/texting/contact/:id',
        props: true,
        meta: {
          isWidget: true
        },
        component: Contact
      },
      {
        name: 'HubSpot Widget Error',
        path: '/errors/hubspot',
        props: true,
        meta: {
          isWidget: true
        },
        component: HubSpotMessageWidgetError
      }
    ]
  },
  // Dialer Widget (Browser / Apps)
  {
    name: 'Dialer Widget (API)',
    path: '/widgets/dialer/api_key/:apiKey',
    props: true,
    component: Dialer
  },
  {
    name: 'Dialer Widget',
    path: '/widgets/dialer',
    props: true,
    component: Dialer
  },
  {
    name: 'HubSpot Call Extension',
    path: '/widgets/hubspot-call-extension',
    props: true,
    component: Dialer
  },
  {
    name: 'Salesforce Softphone',
    path: '/salesforce/softphone',
    props: true,
    component: SalesforceSoftPhone
  },
  // deep link handlers
  // Apps handlers to open custom protocol
  //
  {
    name: 'Desktop App',
    path: '/apps',
    props: (route) => {
      // Backward compatibility with old deep links from CtC extension
      if (route.query.action && route.query.phone && !route.query.phone_number) {
        return { action: route.query.action, phoneNumber: route.query.phone }
      }

      // New deep links from CtC extension
      return { action: route.query.action, phoneNumber: route.query.phone_number, firstName: route.query.first_name, lastName: route.query.last_name, isCompany: route.query.is_company }
    },
    component: Apps,
    meta: {
      title: 'Open with the desktop app...'
    }
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: Error404
  }
]

export default routes
