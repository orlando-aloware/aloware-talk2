import { storiesOf } from '@storybook/vue'

import InboxNavItemView from './inbox-nav-item-view.vue'

export default { title: 'default' }

const item = () => ({
  components: { InboxNavItemView },
  template: '<inbox-nav-item-view /> '
})

storiesOf('Inbox - Navigation', module)
  .add('Item', item)
