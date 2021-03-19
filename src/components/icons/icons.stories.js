import InboxIconsView from './inbox-icons-view.vue'
import CallsIconsView from './calls-icons-view.vue'
import CallsSmIconsView from './calls-sm/calls-sm-icons-view'
import ContactsIconView from './contacts/contacts-icons-view'

import { storiesOf } from '@storybook/vue'

const inboxIcons = () => ({
  components: { InboxIconsView },
  template: '<inbox-icons-view />'
})

const callsIcons = () => ({
  components: { CallsIconsView },
  template: '<calls-icons-view />'
})

const callsIconsSm = () => ({
  components: { CallsSmIconsView },
  template: '<calls-sm-icons-view />'
})

const contactsIconView = () => ({
  components: { ContactsIconView },
  template: '<contacts-icon-view />'
})

storiesOf('Icons', module)
  .add('Inbox', inboxIcons)
  .add('Calls', callsIcons)
  .add('Calls - Small', callsIconsSm)
  .add('Contacts', contactsIconView)
