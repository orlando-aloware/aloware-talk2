import InboxIconsView from './inbox-icons-view.vue'

import { storiesOf } from '@storybook/vue'

const inboxIcons = () => ({
  components: { InboxIconsView },
  template: '<inbox-icons-view />'
})

storiesOf('Icons', module)
  .add('Inbox', inboxIcons)
