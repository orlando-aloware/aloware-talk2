import store from 'src/store/auth/auth.store'

function guardMyRoute (to, from, next) {
  if (store.authenticated) {
    next()
  } else {
    next('/login')
  }
}

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
        beforeEnter: guardMyRoute,
        meta: {
          title: 'Inbox'
        },
        children: [
          {
            path: ':channel/contacts/:id/communications/:communicationId',
            name: 'Inbox Contact',
            component: () => import('src/pages/contacts/Contact.vue'),
            meta: {
              title: 'Inbox'
            }
          },
          {
            path: '/:channel',
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
        beforeEnter: guardMyRoute,
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
        beforeEnter: guardMyRoute,
        meta: {
          title: 'Contact'
        }
      },
      {
        path: 'power-dialer',
        name: 'Power Dialer',
        component: () => import('pages/PowerDialer.vue'),
        beforeEnter: guardMyRoute,
        meta: {
          title: 'Power Dialer'
        }
      },
      {
        path: 'stats',
        name: 'Stats',
        component: () => import('pages/Stats.vue'),
        beforeEnter: guardMyRoute,
        meta: {
          title: 'Stats'
        }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('pages/Settings.vue'),
        beforeEnter: guardMyRoute,
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
        component: () => import('pages/Account.vue'),
        beforeEnter: guardMyRoute
      },
      {
        path: 'communication/:communicationId',
        name: 'Communication',
        component: () => import('pages/Account.vue'),
        beforeEnter: guardMyRoute
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
