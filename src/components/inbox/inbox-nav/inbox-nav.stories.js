import { storiesOf } from '@storybook/vue'

import InboxNavItemView from './inbox-nav-item-view.vue'
import InboxNavIcon from './inbox-nav-icon.vue'
import InboxNavBadge from './inbox-nav-badge.vue'
import InboxNavItems from './inbox-nav-list.vue'
import InboxNavToggleView from './inbox-nav-toggle-view.vue'

const items = () => ({
  components: { InboxNavItems },
  template: '<inbox-nav-items /> '
})

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
  template: '<div><inbox-nav-badge value="10" /> <inbox-nav-badge color="danger" value="10" /> <inbox-nav-badge color="danger" closed="1" value="10" /></div>'
})

const toggle = () => ({
  components: { InboxNavToggleView },
  template: '<inbox-nav-toggle-view /> '
})

storiesOf('Inbox - Navigation', module)
  .add('Items', items)
  .add('Item', item)
  .add('Icon', icon)
  .add('Badge', badge)
  .add('Toggle', toggle)
