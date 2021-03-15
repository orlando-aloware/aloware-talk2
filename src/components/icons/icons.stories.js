import InboxIconsView from './inbox-icons-view.vue'

import { storiesOf } from '@storybook/vue'

export default { title: 'default' }

const inboxIcons = () => ({
  components: { InboxIconsView },
  template: '<inbox-icons-view />'
})

storiesOf('Icons', module)
  .add('Inbox', inboxIcons)
