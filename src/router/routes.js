const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('pages/Login.vue')
      },
      {
        path: 'forgot-password',
        name: 'Forgot Password',
        component: () => import('pages/ForgotPassword.vue')
      },
      {
        path: 'reset/:token',
        name: 'Reset Password',
        component: () => import('pages/ResetPassword.vue')
      },
      {
        path: '',
        name: 'Inbox',
        component: () => import('pages/Inbox.vue'),
        meta: {
          title: 'Inbox'
        }
      },
      {
        path: 'contacts',
        component: () => import('src/pages/contacts/Contacts.vue'),
        meta: {
          title: 'Contacts'
        },
        children: [
          {
            path: '',
            name: 'Contacts',
            component: () => import('src/pages/contacts/ContactsViewAll.vue')
          },
          {
            path: ':id',
            name: 'Contact',
            component: () => import('src/pages/contacts/Contact.vue'),
            meta: {
              title: 'Contact'
            }
          },
          {
            path: 'list/:id(my-contacts|new-leads|unanswered|unassigned)+',
            name: 'Contacts',
            component: () => import('src/pages/contacts/ContactsViewAll.vue')
          },
          {
            path: 'list/:id(\\d+)+',
            name: 'Contacts',
            component: () => import('src/pages/contacts/ContactsViewList.vue')
          },
          {
            path: 'list/:id(\\d+)+/add',
            name: 'Contacts',
            component: () => import('src/pages/contacts/ContactsAddView.vue')
          }
        ]
      },
      {
        path: 'power-dialer',
        name: 'Power Dialer',
        component: () => import('pages/PowerDialer.vue'),
        meta: {
          title: 'Power Dialer'
        }
      },
      {
        path: 'stats',
        name: 'Stats',
        component: () => import('pages/Stats.vue'),
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
        }
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
