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
            component: () => import('src/pages/contacts/ContactIndex.vue')
          },
          {
            path: 'my-contacts',
            name: 'Contacts',
            component: () => import('src/pages/contacts/MyContacts.vue')
          },
          {
            path: 'newleads',
            name: 'Contacts',
            component: () => import('src/pages/contacts/NewLeads.vue')
          },
          {
            path: 'unanswered',
            name: 'Contacts',
            component: () => import('src/pages/contacts/UnansweredContacts.vue')
          },
          {
            path: 'unassigned',
            name: 'Contacts',
            component: () => import('src/pages/contacts/UnassignedContacts.vue')
          },
          {
            path: 'list/:id',
            name: 'Contacts',
            component: () => import('src/pages/contacts/PinnedContacts.vue')
          },
          {
            path: ':id',
            name: 'Contacts',
            component: () => import('src/pages/contacts/Contact.vue')
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
