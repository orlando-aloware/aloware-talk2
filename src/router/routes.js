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
          title: 'Communications'
        },
        children: [
          {
            path: 'channels/:channel/:status/contacts/:id',
            name: 'Inbox Contact Task',
            component: () => import('src/pages/contacts/Contact.vue'),
            meta: {
              title: 'Communications'
            }
          },
          {
            path: 'channels/:channel/:status',
            name: 'Inbox Channel Task Status',
            component: () => import('src/pages/contacts/Contact.vue'),
            meta: {
              title: 'Communications'
            }
          },
          {
            path: 'channels/:channel/contacts/:id/communications/:communicationId',
            name: 'Inbox Contact',
            component: () => import('src/pages/contacts/Contact.vue'),
            meta: {
              title: 'Communications'
            }
          },
          {
            path: 'channels/:channel/:status/contacts/:id/communications/:communicationId',
            name: 'Inbox Contact Mention Communication',
            component: () => import('src/pages/contacts/Contact.vue'),
            meta: {
              title: 'Communications'
            }
          },
          {
            path: 'channels/:channel',
            name: 'Inbox Channel',
            component: () => import('src/pages/Inbox.vue'),
            meta: {
              title: 'Communications'
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
            path: '/contacts',
            meta: {
              title: 'Contacts',
              page: 'Contacts'
            },
            component: () => import('src/pages/contacts/ContactsViewList.vue')
          },
          {
            name: 'Contacts',
            path: 'list/:id(my-contacts|new-leads|unanswered|unassigned)+',
            meta: {
              title: 'Contacts',
              page: 'Default Contacts List'
            },
            component: () => import('src/pages/contacts/ContactsViewList.vue')
          },
          {
            name: 'Contacts',
            path: 'list/:id(\\d+)+',
            meta: {
              title: 'Contacts',
              page: 'Contacts List'
            },
            component: () => import('src/pages/contacts/ContactsViewList.vue')
          },
          {
            name: 'Contacts List Public',
            path: 'list/public/:id(\\d+)+',
            component: () => import('src/pages/contacts/ContactsViewList.vue'),
            meta: {
              title: 'Contacts',
              page: 'Public Contacts List'
            }
          },
          {
            name: 'Contacts',
            path: 'list/:id(\\d+)+/add',
            meta: { title: 'Contacts' },
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
            component: () => import('src/pages/power-dialer/PowerDialerBase')
          },
          {
            name: 'Power Dialer',
            meta: {
              title: 'Power Dialer',
              id: 'power-dialer-queue-filter'
            },
            path: ':id(in-queue|called|failed|scheduled|all)+',
            component: () => import('src/pages/power-dialer/PowerDialerBase')
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
            component: () => import('src/pages/power-dialer/PowerDialerBase'),
            children: [
              {
                name: 'Power Dialer',
                meta: {
                  title: 'Power Dialer',
                  id: 'power-dialer-list-filter'
                },
                path: ':filter(in-queue|called|failed|scheduled|all)+',
                component: () => import('src/pages/power-dialer/PowerDialerBase')
              }
            ]
          },
          {
            name: 'Power Dialer',
            meta: {
              title: 'Power Dialer Add-list',
              id: 'power-dialer-add-list'
            },
            path: 'list/:id(\\d+)+/add',
            component: () => import('src/pages/power-dialer/PowerDialerAddView')
          },
          {
            name: 'Power Dialer',
            meta: {
              title: 'Power Dialer Add-list',
              id: 'power-dialer-add-queue-list'
            },
            path: 'list/add',
            component: () => import('src/pages/power-dialer/PowerDialerAddView')
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
        component: () => import('src/pages/power-dialer/PowerDialerSession')
      },
      // {
      //   path: 'power-dialer/:id',
      //   name: 'Power Dialer',
      //   component: () => import('src/pages/power-dialer/PowerDialerIndividual2.vue'),
      //   meta: {
      //     title: 'Power Dialer'
      //   }
      // },
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
