const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        meta: {
          isGuest: true
        },
        component: () => import('pages/Login.vue')
      },
      {
        path: 'forgot-password',
        name: 'Forgot Password',
        meta: {
          isGuest: true
        },
        component: () => import('pages/ForgotPassword.vue')
      },
      {
        path: 'reset/:token',
        name: 'Reset Password',
        meta: {
          isGuest: true
        },
        component: () => import('pages/ResetPassword.vue')
      },
      {
        path: '',
        name: 'Inbox',
        component: () => import('pages/Inbox.vue'),
        meta: {
          title: 'Inbox'
        },
        children: [
          {
            path: 'channels/:channel/:status/contacts/:id',
            name: 'Inbox Contact Task',
            component: () => import('src/pages/contacts/Contact.vue'),
            meta: {
              title: 'Inbox'
            }
          },
          {
            path: 'channels/:channel/:status',
            name: 'Inbox Channel Task Status',
            component: () => import('src/pages/contacts/Contact.vue'),
            meta: {
              title: 'Inbox'
            }
          },
          {
            path: 'channels/:channel/contacts/:id/communications/:communicationId',
            name: 'Inbox Contact',
            component: () => import('src/pages/contacts/Contact.vue'),
            meta: {
              title: 'Inbox'
            }
          },
          {
            path: 'channels/:channel/:status/contacts/:id/communications/:communicationId',
            name: 'Inbox Contact Mention Communication',
            component: () => import('src/pages/contacts/Contact.vue'),
            meta: {
              title: 'Inbox'
            }
          },
          {
            path: 'channels/:channel',
            name: 'Inbox Channel',
            component: () => import('src/pages/Inbox.vue'),
            meta: {
              title: 'Inbox'
            }
          }
        ]
      },
      {
        path: 'contacts',
        component: () => import('src/pages/contacts/Contacts.vue'),
        meta: {
          title: 'Contacts'
        },
        children: [
          {
            name: 'Contacts',
            path: '',
            component: () => import('src/pages/contacts/ContactsViewAll.vue')
          },
          {
            name: 'Contacts',
            path: 'list/:id(my-contacts|new-leads|unanswered|unassigned)+',
            component: () => import('src/pages/contacts/ContactsViewAll.vue')
          },
          {
            name: 'Contacts',
            path: 'list/:id(\\d+)+',
            component: () => import('src/pages/contacts/ContactsViewList.vue')
          },
          {
            name: 'Contacts List Public',
            path: 'list/public/:id(\\d+)+',
            component: () => import('src/pages/contacts/ContactsViewList.vue'),
            meta: {
              title: 'Contacts'
            }
          },
          {
            name: 'Contacts',
            path: 'list/:id(\\d+)+/add',
            component: () => import('src/pages/contacts/ContactsAddView.vue')
          }
        ]
      },
      {
        path: 'contacts/:id',
        name: 'Contact',
        component: () => import('src/pages/contacts/Contact.vue'),
        meta: {
          title: 'Contact'
        }
      },
      {
        path: 'power-dialer',
        component: () => import('pages/power-dialer/PowerDialer.vue'),
        meta: {
          title: 'Power Dialer'
        },
        children: [
          {
            name: 'Power Dialer',
            meta: { title: 'Power Dialer' },
            path: '',
            component: () => import('src/pages/power-dialer/PowerDialerBase')
          },
          {
            name: 'Power Dialer',
            meta: { title: 'Power Dialer Base Filter' },
            path: 'list/:id(in-queue|called|failed|scheduled|all)+',
            component: () => import('src/pages/power-dialer/PowerDialerBase')
          },
          {
            name: 'Power Dialer',
            meta: { title: 'Power Dialer Individual' },
            path: 'list/:id(\\d+)+',
            component: () => import('src/pages/power-dialer/PowerDialerBase'),
            children: [
              {
                name: 'Power Dialer',
                meta: { title: 'Power Dialer Individual Advance' },
                path: ':filter(in-queue|called|failed|scheduled|all)+',
                component: () => import('src/pages/power-dialer/PowerDialerBase')
              }
            ]
          },
          {
            name: 'Power Dialer',
            meta: { title: 'Power Dialer Add-list' },
            path: 'list/:id(\\d+)+/add',
            component: () => import('src/pages/power-dialer/PowerDialerAddView')
          }
        ]
      },
      {
        name: 'Power Dialer Session',
        meta: { title: 'Power Dialer Session' },
        path: 'power-dialer/session',
        component: () => import('src/pages/power-dialer/PowerDialerSession')
      },
      {
        path: 'power-dialer/:id',
        name: 'Power Dialer',
        component: () => import('src/pages/power-dialer/PowerDialerIndividual.vue'),
        meta: {
          title: 'Power Dialer'
        }
      },
      {
        path: 'stats',
        name: 'Stats',
        component: () => import('pages/stats/Stats.vue'),
        meta: {
          title: 'Stats'
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('pages/Settings.vue'),
        meta: {
          title: 'Settings'
        },
        children: [
          {
            path: '/settings/:tab',
            name: 'Settings Tab',
            component: () => import('src/pages/Settings.vue'),
            meta: {
              title: 'Settings'
            }
          }
        ]
      },
      {
        path: 'account',
        name: 'Account',
        component: () => import('pages/Account.vue')
      },
      {
        path: 'user-activity/:userId',
        name: 'User Activity',
        component: () => import('pages/Account.vue')
      },
      {
        path: 'communication/:communicationId',
        name: 'Communication',
        component: () => import('pages/Account.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
