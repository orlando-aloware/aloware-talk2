import { storiesOf } from '@storybook/vue'

import InboxNavItemView from './inbox-nav-item-view.vue'
import InboxNavIcon from './inbox-nav-icon.vue'
import InboxNavBadge from './inbox-nav-badge.vue'

export default { title: 'default' }

const item = () => ({
  components: { InboxNavItemView },
  template: '<inbox-nav-item-view /> '
})

const icon = () => ({
  components: { InboxNavIcon },
  template: '<div><inbox-nav-icon icon="phone" /><inbox-nav-icon icon="phone" :isActive="true" /></div>'
})

const badge = () => ({
  components: { InboxNavBadge },
  template: '<div><inbox-nav-badge value="10" /> <inbox-nav-badge color="danger" value="10" /></div>'
})

storiesOf('Inbox - Navigation', module)
  .add('Item', item)
  .add('Icon', icon)
  .add('Badge', badge)
