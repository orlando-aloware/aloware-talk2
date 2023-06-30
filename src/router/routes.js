const MainLayout = () => import('layouts/MainLayout.vue')
const Login = () => import('pages/Login.vue')
const ForgotPassword = () => import('pages/ForgotPassword.vue')
const ResetPassword = () => import('pages/ResetPassword.vue')
const Inbox = () => import('pages/Inbox.vue')
const Contact = () => import('src/pages/contacts/Contact.vue')
const Contacts = () => import('src/pages/contacts/Contacts.vue')
const ContactsView = () => import('src/pages/contacts/ContactsView.vue')
const ContactsAddView = () => import('src/pages/contacts/ContactsAddView.vue')
const PowerDialer = () => import('pages/power-dialer/PowerDialer.vue')
const PowerDialerView = () => import('pages/power-dialer/PowerDialerView.vue')
const PowerDialerAddView = () => import('src/pages/power-dialer/PowerDialerAddView')
const PowerDialerSession = () => import('src/pages/power-dialer/PowerDialerSession')
const Wallboard = () => import('pages/wallboard/Wallboard.vue')
const WallboardOverview = () => import('pages/wallboard/WallboardOverview.vue')
const WallboardAgents = () => import('pages/wallboard/WallboardAgents.vue')
const WallboardCalls = () => import('pages/wallboard/WallboardCalls.vue')
const Calendar = () => import('src/pages/calendar/Calendar.vue')
const Stats = () => import('pages/stats/Stats.vue')
const Settings = () => import('pages/Settings.vue')
const Account = () => import('pages/Account.vue')
const Communication = () => import('pages/Communication.vue')
const Phone = () => import('pages/Phone.vue')
const Error404 = () => import('pages/Error404.vue')
const Suspended = () => import('pages/Suspended.vue')
const Messenger = () => import('pages/Messenger.vue')
const DMSEquity = () => import('pages/DMSEquity.vue')
const DigitalLeadWar = () => import('pages/DigitalLeadWar.vue')
const EmailBlast = () => import('pages/EmailBlast.vue')

const routes = [
  {
    path: '/',
    component: MainLayout,
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
        path: '',
        name: 'Inbox',
        component: Inbox,
        meta: {
          title: 'Communications'
        },
        children: [
          {
            path: 'channels/:channel/:status/contacts/:id',
            name: 'Inbox Contact Task',
            component: Contact,
            meta: {
              title: 'Communications'
            }
          },
          {
            path: 'channels/:channel/:status',
            name: 'Inbox Channel Task Status',
            component: Contact,
            meta: {
              title: 'Communications'
            }
          },
          {
            path: 'channels/:channel/contacts/:id/communications/:communicationId',
            name: 'Inbox Contact',
            component: Contact,
            meta: {
              title: 'Communications'
            }
          },
          {
            path: 'channels/:channel/:status/contacts/:id/communications/:communicationId',
            name: 'Inbox Contact Communication',
            component: Contact,
            meta: {
              title: 'Communications'
            }
          },
          {
            path: 'channels/:channel',
            name: 'Inbox Channel',
            component: Inbox,
            meta: {
              title: 'Communications'
            }
          },
          {
            path: 'channels/view/:viewId/:status',
            name: 'Inbox View',
            component: Inbox,
            meta: {
              title: 'Communications'
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
        path: 'stats',
        name: 'Stats',
        component: Stats,
        meta: {
          title: 'Stats'
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
        path: 'ring-group-activity/:ringGroupId',
        name: 'Ring Group Activity',
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
        path: 'suspended',
        name: 'Suspended',
        component: Suspended
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
        path: 'dms-equity',
        name: 'DMS Equity',
        meta: {
          title: 'DMS Equity'
        },
        component: DMSEquity
      },
      {
        path: 'digital-lead',
        name: 'Digital Lead War',
        meta: {
          title: 'Digital Lead War'
        },
        component: DigitalLeadWar
      },
      {
        path: 'email-blast/:id',
        name: 'Email Blast',
        meta: {
          title: 'Email'
        },
        component: EmailBlast
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: Error404
  }
]

export default routes
