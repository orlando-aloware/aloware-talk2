import CallsHeader from './calls-header.vue'
import CallsListItem from './calls-list-item.vue'

import { storiesOf } from '@storybook/vue'

const labels = () => ({
  components: { CallsHeader },
  template: '<calls-header label="Inbound Calls"/>'
})

const callListItem = () => ({
  components: { CallsListItem },
  template: '<calls-list-item />'
})

const callListItemAvatar = () => ({
  components: { CallsListItem },
  template: '<calls-list-item avatar="https://randomuser.me/api/portraits/women/44.jpg" name="Mariah Carey" number="(222) 111-3333" />'
})

storiesOf('Inbox - Calls', module)
  .add('Header', labels)
  .add('Call Item', callListItem)
  .add('Call Item with Avatar', callListItemAvatar)
