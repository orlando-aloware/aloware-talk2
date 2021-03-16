import InboxIconsView from './inbox-icons-view.vue'
import CallsIconsView from './calls-icons-view.vue'

import { storiesOf } from '@storybook/vue'

const inboxIcons = () => ({
  components: { InboxIconsView },
  template: '<inbox-icons-view />'
})

const callsIcons = () => ({
  components: { CallsIconsView },
  template: '<calls-icons-view />'
})

storiesOf('Icons', module)
  .add('Inbox', inboxIcons)
  .add('Calls', callsIcons)
