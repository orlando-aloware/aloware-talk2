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
        component: () => import('pages/Inbox.vue')
      },
      {
        path: 'contacts',
        component: () => import('src/pages/contacts/Contacts.vue'),
        children: [
          {
            path: '',
            name: 'Contacts',
            component: () => import('src/pages/contacts/ContactsViewAll.vue')
          },
          {
            path: 'my-contacts',
            name: 'Contacts',
            component: () => import('src/pages/contacts/ContactsViewMy.vue')
          },
          {
            path: 'new-leads',
            name: 'Contacts',
            component: () => import('src/pages/contacts/ContactsViewNew.vue')
          },
          {
            path: 'unanswered',
            name: 'Contacts',
            component: () => import('src/pages/contacts/ContactsViewUnanswered.vue')
          },
          {
            path: 'unassigned',
            name: 'Contacts',
            component: () =>
              import('src/pages/contacts/ContactsViewUnassigned.vue')
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
          },
          {
            path: ':id(\\d+)+',
            name: 'Contacts',
            component: () => import('src/pages/contacts/Contact.vue')
          },
          {
            path: '*',
            name: 'Contacts',
            component: () => import('src/pages/contacts/ContactsNotFound.vue')
          }
        ]
      },
      {
        path: 'power-dialer',
        name: 'Power Dialer',
        component: () => import('pages/PowerDialer.vue')
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('pages/Dashboard.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('pages/Settings.vue')
      },
      {
        path: 'account',
        name: 'Account',
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
